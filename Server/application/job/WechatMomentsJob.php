<?php

namespace app\job;

use think\queue\Job;
use think\facade\Log;
use think\facade\Cache;
use think\Db;
use app\command\WechatMomentsCommand;
use app\api\controller\WebSocketController;

class WechatMomentsJob
{
    protected $maxPages = 10; // 最大页数
    protected $pageSize = 10; // 每页大小

    public function fire(Job $job, $data)
    {
        try {
            $jobId = $data['jobId'] ?? '';
            $queueLockKey = $data['queueLockKey'] ?? '';
            
            Log::info("开始处理朋友圈采集任务，任务ID：{$jobId}");
            
            // 获取需要采集的账号列表
            $accounts = $this->getAccounts();
            if (empty($accounts)) {
                Log::info("没有需要采集的账号");
                Cache::rm($queueLockKey);
                return;
            }
            foreach ($accounts as $account) {
                try {
                    Log::info("开始采集账号 {$account['userName']} 的朋友圈");
                    
                    // 初始化WebSocket连接
                    $wsController = new WebSocketController([
                        'userName' => $account['userName'],
                        'password' => $account['password'],
                        'accountId' => $account['id']
                    ]);
                    

                    // 获取好友列表
                    $friends = $this->getFriends($account['id'],$account['wechatAccountId']);
                    if (empty($friends)) {
                        Log::info("账号 {$account['userName']} 没有好友数据");
                        continue;
                    }
                    
                    // 遍历好友采集朋友圈
                    foreach ($friends as $friend) {
                        try {
                            $this->collectMoments($wsController, $account['wechatAccountId'], $friend['id']);
                        } catch (\Exception $e) {
                            Log::error("采集好友 {$friend['id']} 的朋友圈失败：" . $e->getMessage());
                            continue;
                        }
                    }
                    
                } catch (\Exception $e) {
                    Log::error("处理账号 {$account['wechatAccountId']} 失败：" . $e->getMessage());
                    continue;
                }
            }
            
            // 任务完成，释放队列锁
            Cache::rm($queueLockKey);
            Log::info("朋友圈采集任务完成");
            
        } catch (\Exception $e) {
            Log::error("朋友圈采集任务异常：" . $e->getMessage());
            Cache::rm($queueLockKey);
        }
        
        $job->delete();
    }
    
    /**
     * 获取需要采集的账号列表
     * @return array
     */
    private function getAccounts()
    {
        $accounts = Db::table('s2_company_account')
            ->alias('ca')
            ->join(['s2_wechat_account' => 'wa'], 'ca.id = wa.deviceAccountId')
            ->join(['s2_wechat_friend' => 'wf'], 'ca.id = wf.accountId')
            ->where('ca.passwordLocal', '<>', '')
            ->where(['ca.status' => 0,'wf.isDeleted' => 0,'wa.deviceAlive' => 1,'wa.wechatAlive' => 1])
            ->field([
                'ca.id',
                'ca.userName',
                'ca.passwordLocal',
                'wf.wechatAccountId'
            ])
            ->group('wf.wechatAccountId DESC')
            ->order('ca.id DESC')
            ->select();

            foreach ($accounts as &$value) {
                $value['password'] = localDecrypt($value['passwordLocal']);
                unset($value['passwordLocal']);
            }
            unset($value);

            return $accounts;


    }
    
    /**
     * 获取账号的好友列表
     * @param int $accountId 账号ID
     * @return array
     */
    private function getFriends($accountId,$wechatAccountId)
    {
        return Db::table('s2_wechat_friend')
            ->where('wechatAccountId', $wechatAccountId)
            ->where('accountId', $accountId)
            ->where('isDeleted', 0)
            ->field(['id', 'wechatId','wechatAccountId','alias'])
            ->order('id DESC')
            ->select();
    }
    
    /**
     * 采集指定好友的朋友圈
     * @param WebSocketController $wsController WebSocket控制器
     * @param int $accountId 账号ID
     * @param string $friendId 好友ID
     */
    private function collectMoments($wsController, $accountId, $friendId)
    {
        $prevSnsId = 0;
        $currentPage = 1;
        
        do {
            $data = [
                'wechatAccountId' => $accountId,
                'wechatFriendId' => $friendId,
                'count' => $this->pageSize,
                'prevSnsId' => $prevSnsId
            ];
            
            $result = $wsController->getMoments($data);
            $result = json_decode($result, true);
            
            if ($result['code'] != 200 || empty($result['data']['list'])) {
                break;
            }
            
            // 更新最后一条数据的snsId
            $lastMoment = end($result['data']['list']);
            if (isset($lastMoment['snsId'])) {
                $prevSnsId = $lastMoment['snsId'];
            }
            
            $currentPage++;
            
            // 如果已经达到最大页数，退出循环
            if ($currentPage > $this->maxPages) {
                break;
            }
            
            // 如果返回的数据少于请求的数量，说明没有更多数据了
            if (count($result['data']['list']) < $this->pageSize) {
                break;
            }
            
        } while (true);
        
        Log::info("完成采集好友 {$friendId} 的朋友圈，共 {$currentPage} 页");
    }
} 