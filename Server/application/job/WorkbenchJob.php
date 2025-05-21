<?php

namespace app\job;

use think\queue\Job;
use think\facade\Log;
use think\Queue;
use think\facade\Config;
use think\facade\Cache;
use think\facade\Env;
use app\cunkebao\model\Workbench;
use app\cunkebao\model\WorkbenchAutoLike;
use app\cunkebao\model\WorkbenchMomentsSync;
use app\cunkebao\model\WorkbenchGroupPush;
use app\cunkebao\model\WorkbenchGroupCreate;
use think\Db;
use app\api\controller\WebSocketController;
use app\api\controller\AutomaticAssign;
use app\api\controller\WechatFriendController;

class WorkbenchJob
{
    /************************************
     * 常量定义
     ************************************/
    
    /**
     * 工作台类型定义
     */
    const TYPE_AUTO_LIKE = 1;      // 自动点赞
    const TYPE_MOMENTS_SYNC = 2;    // 朋友圈同步
    const TYPE_GROUP_PUSH = 3;      // 群消息推送
    const TYPE_GROUP_CREATE = 4;    // 自动建群

    /**
     * 最大重试次数
     */
    const MAX_RETRY_ATTEMPTS = 3;

    /************************************
     * 核心队列处理
     ************************************/
    
    /**
     * 队列任务处理
     * @param Job $job 队列任务
     * @param array $data 任务数据
     * @return bool
     */
    public function fire(Job $job, $data)
    {
        $jobId = $data['jobId'] ?? '';
        $queueLockKey = $data['queueLockKey'] ?? '';
        try {
            $this->logJobStart($jobId, $queueLockKey);
            $workbenches = $this->getActiveWorkbenches();
            if (empty($workbenches)) {
                $this->handleEmptyWorkbenches($job, $queueLockKey);
                return true;
            }
            $this->processWorkbenches($workbenches);
            $this->handleJobSuccess($job, $queueLockKey);
            return true;
            
        } catch (\Exception $e) {
            return $this->handleJobError($e, $job, $queueLockKey);
        }
    }

    /************************************
     * 工作台基础功能
     ************************************/
    
    /**
     * 获取活跃的工作台
     * @return \think\Collection
     */
    protected function getActiveWorkbenches()
    {
        return Workbench::where([
            ['status', '=', 1],
            ['isDel', '=', 0]
        ])->order('id DESC')->select();
    }

    /**
     * 处理工作台列表
     * @param \think\Collection $workbenches
     */
    protected function processWorkbenches($workbenches)
    {
        foreach ($workbenches as $workbench) {
            try {
                $this->processSingleWorkbench($workbench);
            } catch (\Exception $e) {
                Log::error("处理工作台 {$workbench->id} 失败: " . $e->getMessage());
            }
        }
    }

    /**
     * 处理单个工作台
     * @param Workbench $workbench
     */
    protected function processSingleWorkbench($workbench)
    {
        $config = $this->getWorkbenchConfig($workbench);
        if (!$config) {
            Log::error("工作台 {$workbench->id} 配置获取失败");
            return;
        }

        $handler = $this->getWorkbenchHandler($workbench->type);
        if ($handler) {
            $handler($workbench, $config);
        }
    }

    /**
     * 获取工作台处理器
     * @param int $type
     * @return callable|null
     */
    protected function getWorkbenchHandler($type)
    {
        $handlers = [
            self::TYPE_AUTO_LIKE => [$this, 'handleAutoLike'],
            self::TYPE_MOMENTS_SYNC => [$this, 'handleMomentsSync'],
            self::TYPE_GROUP_PUSH => [$this, 'handleGroupPush'],
            self::TYPE_GROUP_CREATE => [$this, 'handleGroupCreate']
        ];

        return $handlers[$type] ?? null;
    }
    
    /**
     * 获取工作台配置
     * @param Workbench $workbench 工作台实例
     * @return mixed
     */
    protected function getWorkbenchConfig($workbench)
    {
        switch ($workbench->type) {
            case self::TYPE_AUTO_LIKE:
                return WorkbenchAutoLike::where('workbenchId', $workbench->id)->find();
                
            case self::TYPE_MOMENTS_SYNC:
                return WorkbenchMomentsSync::where('workbenchId', $workbench->id)->find();
                
            case self::TYPE_GROUP_PUSH:
                return WorkbenchGroupPush::where('workbenchId', $workbench->id)->find();
                
            case self::TYPE_GROUP_CREATE:
                return WorkbenchGroupCreate::where('workbenchId', $workbench->id)->find();
                
            default:
                return null;
        }
    }

    /************************************
     * 自动点赞功能
     ************************************/
    
    /**
     * 处理自动点赞任务
     * @param Workbench $workbench
     * @param WorkbenchAutoLike $config
     */
    protected function handleAutoLike($workbench, $config)
    {
        if (!$this->validateAutoLikeConfig($workbench, $config)) {
            return;
        }

        // 验证是否在点赞时间范围内
        if (!$this->isWithinLikeTimeRange($config)) {
            return;
        }   

        // 处理分页获取好友列表
        $this->processAllFriends($workbench, $config);
    }

    /**
     * 处理所有好友分页
     * @param Workbench $workbench
     * @param WorkbenchAutoLike $config
     * @param int $page 当前页码
     * @param int $pageSize 每页大小
     */
    protected function processAllFriends($workbench, $config, $page = 1, $pageSize = 100)
    {
        $friendList = $this->getFriendList($config, $page, $pageSize);
        if (empty($friendList)) {
            return;
        }

        // 将好友列表分成10组
        $friendGroups = array_chunk($friendList, 10);
        $processes = [];

        foreach ($friendGroups as $groupIndex => $friendGroup) {
            // 创建子进程
            $pid = pcntl_fork();
            
            if ($pid == -1) {
                // 创建进程失败
                Log::error("工作台 {$workbench->id} 创建进程失败");
                continue;
            } else if ($pid) {
                // 父进程
                $processes[] = $pid;
            } else {
                // 子进程
                try {
                    // 重置数据库连接
                    Db::close();
                    Db::init();
                    
                    foreach ($friendGroup as $friend) {
                        // 验证是否达到点赞次数上限
                        $likeCount = $this->getTodayLikeCount($workbench, $config, $friend['deviceId']);
                        if ($likeCount >= $config['maxLikes']) {
                            Log::info("工作台 {$workbench->id} 点赞次数已达上限");
                            continue;
                        }

                        // 验证是否达到好友点赞次数上限
                        $friendMaxLikes = Db::name('workbench_auto_like_item')
                            ->where('workbenchId', $workbench->id)
                            ->where('wechatFriendId', $friend['friendId'])
                            ->count();
                        
                        if ($friendMaxLikes < $config['friendMaxLikes']) {
                            $this->processFriendMoments($workbench, $config, $friend);
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("工作台 {$workbench->id} 子进程异常: " . $e->getMessage());
                } finally {
                    // 确保关闭数据库连接
                    Db::close();
                }
                
                // 子进程执行完毕后退出
                exit(0);
            }
        }

        // 等待所有子进程完成
        foreach ($processes as $pid) {
            pcntl_waitpid($pid, $status);
        }

        // 如果当前页数据量等于页大小，说明可能还有更多数据，继续处理下一页
        if (count($friendList) == $pageSize) {
            $this->processAllFriends($workbench, $config, $page + 1, $pageSize);
        }
    }

    /**
     * 获取好友列表
     * @param WorkbenchAutoLike $config 配置
     * @param int $page 页码
     * @param int $pageSize 每页大小
     * @return array
     */
    protected function getFriendList($config, $page = 1, $pageSize = 100)
    {
        $friends = json_decode($config['friends'], true);
        $devices = json_decode($config['devices'], true);

        $list = Db::table('s2_company_account')
            ->alias('ca')
            ->join(['s2_wechat_account' => 'wa'], 'ca.id = wa.deviceAccountId')
            ->join(['s2_wechat_friend' => 'wf'], 'ca.id = wf.accountId AND wf.wechatAccountId = wa.id')
            ->join('workbench_auto_like_item wali', 'wali.wechatFriendId = wf.id AND wali.workbenchId = ' . $config['workbenchId'], 'left')
            ->where([
                'ca.status' => 0,
                'wf.isDeleted' => 0,
                'wa.deviceAlive' => 1,
                'wa.wechatAlive' => 1
            ])
            ->whereIn('wa.currentDeviceId', $devices)
            ->field([
                'ca.id as accountId',
                'ca.userName',
                'wf.id as friendId',
                'wf.wechatId',
                'wf.wechatAccountId',
                'wa.wechatId as wechatAccountWechatId',
                'wa.currentDeviceId as deviceId',
                'COUNT(wali.id) as like_count'
            ]);

        if (!empty($friends) && is_array($friends) && count($friends) > 0) {
            $list = $list->whereIn('wf.id', $friends);
        }
  
        $list = $list->group('wf.wechatId')
                     ->having('like_count < ' . $config['friendMaxLikes'])
                     ->order('wf.id DESC')
                     ->page($page, $pageSize)
                     ->select();
                     
        return $list;
    }

    /**
     * 处理好友朋友圈
     * @param Workbench $workbench
     * @param WorkbenchAutoLike $config
     * @param array $friend
     */
    protected function processFriendMoments($workbench, $config, $friend)
    {
        $toAccountId = '';
        $username = Env::get('api.username', '');
        $password = Env::get('api.password', '');
        if (!empty($username) || !empty($password)) {
            $toAccountId = Db::name('users')->where('account',$username)->value('s2_accountId');
        }

        try {
            // 执行切换好友命令
            $automaticAssign = new AutomaticAssign();
            $automaticAssign->allotWechatFriend(['wechatFriendId' => $friend['friendId'], 'toAccountId' => $toAccountId], true);
            
            // 执行采集朋友圈命令
            $webSocket = new WebSocketController(['userName' => $username, 'password' => $password, 'accountId' => $toAccountId]);
            $webSocket->getMoments(['wechatFriendId' => $friend['friendId'], 'wechatAccountId' => $friend['wechatAccountId']]);
     
            // 查询未点赞的朋友圈
            $moments = $this->getUnlikedMoments($friend['friendId']);
            if (empty($moments)) {
                Log::info("好友 {$friend['friendId']} 没有需要点赞的朋友圈");
                // 处理完毕切换回原账号
                $automaticAssign->allotWechatFriend(['wechatFriendId' => $friend['friendId'], 'toAccountId' => $friend['accountId']], true);
                return;
            }

            foreach ($moments as $moment) {
                // 点赞朋友圈
                $this->likeMoment($workbench, $config, $friend, $moment, $webSocket);
                
                if(!empty($config['enableFriendTags']) && !empty($config['friendTags'])){
                    // 修改好友标签
                    $labels = $this->getFriendLabels($friend);
                    $labels[] = $config['friendTags'];
                    $webSocket->modifyFriendLabel(['wechatFriendId' => $friend['friendId'], 'wechatAccountId' => $friend['wechatAccountId'], 'labels' => $labels]);
                }

                // 每个好友只点赞一条朋友圈，然后退出
                break;
            }

            // 处理完毕切换回原账号
            $automaticAssign->allotWechatFriend(['wechatFriendId' => $friend['friendId'], 'toAccountId' => $friend['accountId']], true);
        } catch (\Exception $e) {
            // 异常情况下也要确保切换回原账号
            $automaticAssign->allotWechatFriend(['wechatFriendId' => $friend['friendId'], 'toAccountId' => $friend['accountId']], true);
            
            Log::error("处理好友 {$friend['friendId']} 朋友圈失败: " . $e->getMessage());
        }
    }

    /**
     * 获取未点赞的朋友圈
     * @param int $friendId
     * @return \think\Collection
     */
    protected function getUnlikedMoments($friendId)
    {
        return Db::table('s2_wechat_moments')
            ->alias('wm')
            ->join('workbench_auto_like_item wali', 'wali.momentsId = wm.id', 'left')
            ->where([
                ['wm.wechatFriendId', '=', $friendId],
                ['wali.id', 'null', null]
            ])
            ->field('wm.id, wm.snsId')
            ->group('wali.wechatFriendId')
            ->order('wm.createTime DESC')
            ->select();
    }

    /**
     * 点赞朋友圈
     * @param Workbench $workbench
     * @param WorkbenchAutoLike $config
     * @param array $friend
     * @param array $moment
     * @param WebSocketController $webSocket
     */
    protected function likeMoment($workbench, $config, $friend, $moment, $webSocket)
    {
        try {
            $result = $webSocket->momentInteract([
                'snsId' => $moment['snsId'],
                'wechatAccountId' => $friend['wechatAccountId'],
            ]);

            $result = json_decode($result, true);
            
            if ($result['code'] == 200) {
                $this->recordLike($workbench, $moment, $friend);
                
                // 添加间隔时间
                if (!empty($config['interval'])) {
                    sleep($config['interval']);
                }
            } else {
                Log::error("工作台 {$workbench->id} 点赞失败: " . ($result['msg'] ?? '未知错误'));
            }
        } catch (\Exception $e) {
            Log::error("工作台 {$workbench->id} 点赞异常: " . $e->getMessage());
        }
    }

    /**
     * 记录点赞
     * @param Workbench $workbench
     * @param array $moment
     * @param array $friend
     */
    protected function recordLike($workbench, $moment, $friend)
    {
        Db::name('workbench_auto_like_item')->insert([
            'workbenchId' => $workbench->id,
            'deviceId' => $friend['deviceId'],
            'momentsId' => $moment['id'],
            'snsId' => $moment['snsId'],
            'wechatAccountId' => $friend['wechatAccountId'],
            'wechatFriendId' => $friend['friendId'],
            'createTime' => time()
        ]);
        Log::info("工作台 {$workbench->id} 点赞成功: {$moment['snsId']}");
    }

    /**
     * 获取好友标签
     * @param array $friend
     * @return array
     */
    protected function getFriendLabels($friend)
    {
        $wechatFriendController = new WechatFriendController();
        $result = $wechatFriendController->getlist([
            'friendKeyword' => $friend['wechatId'],
            'wechatAccountKeyword' => $friend['wechatAccountWechatId']
        ], true);
        
        $result = json_decode($result, true);
        $labels = [];
        
        if(!empty($result['data'])){
            foreach($result['data'] as $item){
                $labels = array_merge($labels, $item['labels']);
            }
        }
        
        return $labels;
    }

    /**
     * 验证自动点赞配置
     * @param Workbench $workbench
     * @param WorkbenchAutoLike $config
     * @return bool
     */
    protected function validateAutoLikeConfig($workbench, $config)
    {
        $requiredFields = ['contentTypes', 'interval', 'maxLikes', 'startTime', 'endTime'];
        foreach ($requiredFields as $field) {
            if (empty($config[$field])) {
                Log::error("工作台 {$workbench->id} 配置字段 {$field} 为空");
                return false;
            }
        }
        return true;
    }

    /**
     * 获取今日点赞次数
     * @param Workbench $workbench
     * @param WorkbenchAutoLike $config
     * @return int
     */
    protected function getTodayLikeCount($workbench, $config, $deviceId)
    {
        return Db::name('workbench_auto_like_item')
            ->where('workbenchId', $workbench->id)
            ->where('deviceId', $deviceId)
            ->whereTime('createTime', 'between', [
                strtotime(date('Y-m-d') . ' ' . $config['startTime'] . ':00'),
                strtotime(date('Y-m-d') . ' ' . $config['endTime'] . ':00')
            ])
            ->count();
    }

    /**
     * 检查是否在点赞时间范围内
     * @param WorkbenchAutoLike $config
     * @return bool
     */
    protected function isWithinLikeTimeRange($config)
    {
        $currentTime = date('H:i');
        if ($currentTime < $config['startTime'] || $currentTime > $config['endTime']) {
            Log::info("当前时间 {$currentTime} 不在点赞时间范围内 ({$config['startTime']} - {$config['endTime']})");
            return false;
        }
        return true;
    }

    /************************************
     * 朋友圈同步功能
     ************************************/
    
    /**
     * 处理朋友圈同步任务
     * @param Workbench $workbench 工作台实例
     * @param WorkbenchMomentsSync $config 配置实例
     */
    protected function handleMomentsSync($workbench, $config)
    {
        // TODO: 实现朋友圈同步逻辑
        Log::info("处理朋友圈同步任务: {$workbench->id}");
    }
    
    /************************************
     * 群消息推送功能
     ************************************/
    
    /**
     * 处理群消息推送任务
     * @param Workbench $workbench 工作台实例
     * @param WorkbenchGroupPush $config 配置实例
     */
    protected function handleGroupPush($workbench, $config)
    {
        // TODO: 实现群消息推送逻辑
        Log::info("处理群消息推送任务: {$workbench->id}");
    }
    
    /************************************
     * 自动建群功能
     ************************************/
    
    /**
     * 处理自动建群任务
     * @param Workbench $workbench 工作台实例
     * @param WorkbenchGroupCreate $config 配置实例
     */
    protected function handleGroupCreate($workbench, $config)
    {
        // TODO: 实现自动建群逻辑
        Log::info("处理自动建群任务: {$workbench->id}");
    }

    /************************************
     * 任务处理辅助方法
     ************************************/
    
    /**
     * 记录任务开始
     * @param string $jobId
     * @param string $queueLockKey
     */
    protected function logJobStart($jobId, $queueLockKey)
    {
        Log::info('开始处理工作台任务: ' . json_encode([
            'jobId' => $jobId,
            'queueLockKey' => $queueLockKey
        ]));
    }

    /**
     * 处理任务成功
     * @param Job $job
     * @param string $queueLockKey
     */
    protected function handleJobSuccess($job, $queueLockKey)
    {
        $job->delete();
        Cache::rm($queueLockKey);
        Log::info('工作台任务执行成功');
    }

    /**
     * 处理任务错误
     * @param \Exception $e
     * @param Job $job
     * @param string $queueLockKey
     * @return bool
     */
    protected function handleJobError(\Exception $e, $job, $queueLockKey)
    {
        Log::error('工作台任务异常：' . $e->getMessage());
        
        if (!empty($queueLockKey)) {
            Cache::rm($queueLockKey);
            Log::info("由于异常释放队列锁: {$queueLockKey}");
        }
        
        if ($job->attempts() > self::MAX_RETRY_ATTEMPTS) {
            $job->delete();
        } else {
            $job->release(Config::get('queue.failed_delay', 10));
        }
        
        return false;
    }

    /**
     * 处理空工作台情况
     * @param Job $job
     * @param string $queueLockKey
     */
    protected function handleEmptyWorkbenches(Job $job, $queueLockKey)
    {
        Log::info('没有需要处理的工作台任务');
        $job->delete();
        Cache::rm($queueLockKey);
    }
} 