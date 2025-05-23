<?php
namespace app\job;

use app\api\controller\WebSocketController;
use app\cunkebao\model\Workbench;
use app\cunkebao\model\WorkbenchMomentsSync as WorkbenchMoments;
use app\api\model\WechatFriendModel as WechatFriend;
use app\api\model\WechatMomentsModel as WechatMoments;
use think\facade\Log;
use think\facade\Env;
use think\Db;
use think\queue\Job;
use think\facade\Cache;
use think\facade\Config;
use app\api\controller\MomentsController as Moments;

/**
 * 工作台朋友圈同步任务
 * Class WorkbenchMomentsJob
 * @package app\job
 */
class WorkbenchMomentsJob
{
    /**
     * 内容类型映射
     * 0：未知 1：图片 2：链接 3：视频 4：文本 5：小程序 6:图文
     */
    const CONTENT_TYPE_MAP = [
        0 => 1, // 未知 -> 文本
        1 => 2, // 图片 -> 图文
        2 => 4, // 链接 -> 链接
        3 => 3, // 视频 -> 视频
        4 => 1, // 文本 -> 文本
        5 => 1, // 小程序 -> 文本
        6 => 2, // 图文 -> 图文
    ];

    /**
     * 最大重试次数
     */
    const MAX_RETRY_ATTEMPTS = 3;

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
            $this->execute();
            $this->handleJobSuccess($job, $queueLockKey);
            return true;
        } catch (\Exception $e) {
            return $this->handleJobError($e, $job, $queueLockKey);
        }
    }

    /**
     * 执行任务
     * @throws \Exception
     */
    public function execute()
    {
        try {
            // 获取所有工作台
            $workbenches = Workbench::where(['status' => 1, 'type' => 2, 'isDel' => 0])->select();
            foreach ($workbenches as $workbench) {
                // 获取工作台配置
                $config = WorkbenchMoments::where('workbenchId', $workbench->id)->find();
                if (!$config) {
                    continue;
                }

                // 获取设备
                $devices = $this->getDevice($workbench, $config);
                if (empty($devices)) {
                    continue;
                }

                // 获取内容库
                $contentLibrary = $this->getContentLibrary($workbench, $config);
                if (empty($contentLibrary)) {
                    continue;
                }

                // 处理内容发送
                $this->handleContentSend($workbench, $config, $devices, $contentLibrary);
            }
        } catch (\Exception $e) {
            Log::error("朋友圈同步任务异常: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 处理内容发送
     * @param Workbench $workbench
     * @param WorkbenchMoments $config
     * @param array $devices
     * @param array $contentLibrary
     */
    protected function handleContentSend($workbench, $config, $devices, $contentLibrary)
    {
        // 准备评论数据
        $comment = [];
        if (!empty($contentLibrary['comment'])) {
            $comment[] = $contentLibrary['comment'];
        }

        // 准备发送数据
        $jobPublishWechatMomentsItems = [];
        foreach ($devices as $device) {
            $jobPublishWechatMomentsItems[] = [
                'comments' => $comment,
                'labels' => [],
                'wechatAccountId' => $device['wechatAccountId']
            ];
        }

        // 转换内容类型
        $momentContentType = self::CONTENT_TYPE_MAP[$contentLibrary['contentType']] ?? 1;
        $sendTime = !empty($contentLibrary['sendTime']) ? $contentLibrary['sendTime'] : time();

        // 图片url
        if($momentContentType == 2){
            $picUrlList = json_decode($contentLibrary['resUrls'], true);
        }else{
            $picUrlList = [];
        }

        // 视频url
        if($momentContentType == 3){
            $videoUrl = json_decode($contentLibrary['urls'], true);
            $videoUrl = $videoUrl[0] ?? '';
        }else{
            $videoUrl = '';
        }

        // 链接url
        if($momentContentType == 4){
            $urls = json_decode($contentLibrary['urls'],true);
            $url = $urls[0] ?? [];
            $link = [
                'desc' => $url['desc'] ?? '',
                'image' => $url['image'] ?? '',
                'url' => $url['url'] ?? ''
            ];
        }else{
            $link = ['image' => ''];
        }

        // 准备发送参数
        $data = [
            'altList' => '',
            'immediately' => false,
            'isUseLocation' => false,
            'jobPublishWechatMomentsItems' => $jobPublishWechatMomentsItems,
            'lat' => 0,
            'lng' => 0,
            'link' => $link,
            'momentContentType' => $momentContentType,
            'picUrlList' => $picUrlList,
            'poiAddress' => '',
            'poiName' => '',
            'publicMode' => '',
            'text' => $contentLibrary['content'],
            'timingTime' => date('Y-m-d H:i:s', $sendTime),
            'beginTime' => date('Y-m-d H:i:s', $sendTime),
            'endTime' => date('Y-m-d H:i:s', $sendTime + 600),
            'videoUrl' => $videoUrl,
        ];
        // 发送朋友圈
        $moments = new Moments();
        $moments->addJob($data);
        // 记录发送记录
        $this->recordSendHistory($workbench, $devices, $contentLibrary);
    }

    /**
     * 记录发送历史
     * @param Workbench $workbench
     * @param array $devices
     * @param array $contentLibrary
     */
    protected function recordSendHistory($workbench, $devices, $contentLibrary)
    {
        $now = time();
        $data = [];
        foreach ($devices as $device) {
            $data = [
                'workbenchId' => $workbench->id,
                'deviceId' => $device['deviceId'],
                'contentId' => $contentLibrary['id'],
                'wechatAccountId' => $device['wechatAccountId'],
                'createTime' => $now,
            ];
            Db::name('workbench_moments_sync_item')->insert($data);
        }
       
    }

    /**
     * 获取设备列表
     * @param Workbench $workbench 工作台
     * @param WorkbenchMoments $config 配置
     * @return array|bool
     */
    protected function getDevice($workbench, $config)
    {
        $devices = json_decode($config['devices'], true);
        if (empty($devices)) {
            return false;
        }

        $list = Db::name('device')->alias('d')
            ->join('device_wechat_login dw', 'dw.alive = 1 and dw.deviceId = d.id and dw.companyId = d.companyId')
            ->join(['s2_wechat_account' => 'wa'], 'wa.wechatId = dw.wechatId')
            ->where(['d.companyId' => $workbench->companyId, 'd.alive' => 1])
            ->whereIn('d.id', $devices)
            ->field('d.id as deviceId, d.memo as deviceName, d.companyId, dw.wechatId, wa.id as wechatAccountId')
            ->select();

        $newList = [];
        foreach ($list as $val) {
            // 检查今日发送次数
            $count = Db::name('workbench_moments_sync_item')
                ->where('workbenchId', $workbench->id)
                ->where('deviceId', $val['deviceId'])
                ->whereTime('createTime', 'between', [
                    strtotime(date('Y-m-d') . '00:00:00'),
                    strtotime(date('Y-m-d') . '23:59:59')
                ])->count();

            if ($count >= $config['syncCount']) {
                continue;
            }

            // 检查发送间隔
            $prevSend = Db::name('workbench_moments_sync_item')
                ->where('workbenchId', $workbench->id)
                ->where('deviceId', $val['deviceId'])
                ->order('createTime DESC')
                ->find();

            if (!empty($prevSend) && ($prevSend['createTime'] + $config['syncInterval'] * 60) > time()) {
                continue;
            }

            $newList[] = $val;
        }

        return $newList;
    }

    /**
     * 获取内容库
     * @param Workbench $workbench 工作台
     * @param WorkbenchMoments $config 配置
     * @return array|bool
     */
    protected function getContentLibrary($workbench, $config)
    {
        $contentids = json_decode($config['contentLibraries'], true);
        if (empty($contentids)) {
            return false;
        }

        // 基础查询
        $query = Db::name('content_library')->alias('cl')
            ->join('content_item ci', 'ci.libraryId = cl.id')
            ->join('workbench_moments_sync_item wmsi', 'wmsi.contentId = ci.id and wmsi.workbenchId = ' . $workbench->id, 'left')
            ->where(['cl.isDel' => 0, 'ci.isDel' => 0])
            ->where('ci.sendTime <= ' . (time() + 60))
            ->whereIn('cl.id', $contentids)
            ->field([
                'ci.id',
                'ci.libraryId',
                'ci.contentType',
                'ci.title',
                'ci.content',
                'ci.resUrls',
                'ci.urls',
                'ci.comment',
                'ci.sendTime'
            ]);

        // 根据accountType处理不同的发送逻辑
        if ($config['accountType'] == 1) {
            // 可以循环发送
            // 1. 优先获取未发送的内容
            $unsentContent = $query->where('wmsi.id', 'null')
                ->order('ci.sendTime desc, ci.id desc')
                ->find();

            if (!empty($unsentContent)) {
                return $unsentContent;
            }

            // 2. 如果没有未发送的内容，则获取已发送的内容中最早发送的
            $sentContent = $query->where('wmsi.id', 'not null')
                ->order('wmsi.createTime asc, ci.sendTime desc, ci.id desc')
                ->find();

            return $sentContent;
        } else {
            // 不能循环发送，只获取未发送的内容
            $list = $query->where('wmsi.id', 'null')
                ->order('ci.sendTime desc, ci.id desc')
                ->find();
            return $list;
        }
    }

    /**
     * 记录任务开始
     * @param string $jobId
     * @param string $queueLockKey
     */
    protected function logJobStart($jobId, $queueLockKey)
    {
        Log::info('开始处理工作台朋友圈同步任务: ' . json_encode([
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
        Log::info('工作台朋友圈同步任务执行成功');
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
        Log::error('工作台朋友圈同步任务异常：' . $e->getMessage());
        
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
} 