<?php

namespace app\common;

use think\Db;
use think\facade\Log;
use Workerman\Lib\Timer;
use think\worker\Server;
use WeChatDeviceApi\Adapters\ChuKeBao\Adapter as ChuKeBaoAdapter;

class TaskServer extends Server
{

    const PROCESS_COUNT = 4;

    protected $socket = 'text://0.0.0.0:2980';

    protected $option = [
        'count'   => self::PROCESS_COUNT,
        'name'    => 'ckb_task_server'
    ];

    /**
     * 当客户端的连接上发生错误时触发
     * @param $connection
     * @param $code
     * @param $msg
     */
    public function onError($connection, $code, $msg)
    {
        Log::record("error $code $msg");
    }

    public function onMessage($connection, $data) {}

    public function onClose($connection) {}

    public function onConnect($connection) {}

    public function onWorkerStart($worker)
    {

        $current_worker_id = $worker->id;

        $process_count_for_status_0 = self::PROCESS_COUNT - 1;

        $adapter = new ChuKeBaoAdapter();


        // 只在一个进程里开这个定时器，处理指定任务
        if ($current_worker_id == self::PROCESS_COUNT - 1) {

            // todo 封装为 handleFriendAddTaskWithStatusIsCreated() ； 重复代码进一步抽象
            Timer::add(60, function () use($adapter) {

                $tasks = Db::name('task_customer')
                    ->where('status', 1)
                    ->limit(50)
                    ->select();


                if ($tasks) {
                    foreach ($tasks as $task) {

                        $task_id = $task['task_id'];

                        $task_info = $adapter->getCustomerAcquisitionTask($task_id);

                        if (empty($task_info['status']) || empty($task_info['reqConf']) || empty($task_info['reqConf']['devices'])) {
                            continue;
                        }

                        if (empty($task['processed_wechat_ids'])) {
                            continue;
                        }

                        $weChatIds = explode(',', $task['processed_wechat_ids']);

                        $passedWeChatId = '';

                        foreach ($weChatIds as $wechatId) {

                            // 先是否是好友，如果不是好友，先查询执行状态，看是否还能以及需要换账号继续添加，还是直接更新状态为3
                            // 如果添加成功，先更新为2，然后去发消息（先判断有无消息设置，发消息的log记录？）
                            if ($adapter->checkIfIsWeChatFriendByPhone($wechatId, $task['phone'])) {
                                $passedWeChatId = $wechatId;
                                break;
                            }

                        }

                        if ($passedWeChatId && !empty($task_info['msgConf'])) {

                            // 直接发消息，同时更新状态为 4（已通过-已发消息）
                            $wechatFriendRecord = $adapter->getWeChatAccoutIdAndFriendIdByWeChatIdAndFriendPhone($passedWeChatId, $task['phone']);
                            
                            $msgConf =  is_string($task_info['msgConf']) ? json_decode($task_info['msgConf'], 1) : $task_info['msgConf'];

                            $wechatFriendRecord && $adapter->sendMsgToFriend($wechatFriendRecord['id'], $wechatFriendRecord['wechatAccountId'], $msgConf);


                            Db::name('task_customer')
                                ->where('id', $task['id'])
                                ->update(['status' => 4, 'updated_at' => time()]);

                        } else {

                            foreach ($weChatIds as $wechatId) {

                                // 查询执行状态
                                $latestFriendTask = $adapter->getLatestFriendTaskByPhoneAndWeChatId($task['phone'], $wechatId);
                                if (empty($latestFriendTask)) {
                                    continue;
                                }


                                // 已经执行成功的话，直接break，同时更新对应task_customer的状态为2（添加成功）
                                if (isset($latestFriendTask['status']) && $latestFriendTask['status'] == 1) {
                                    Db::name('task_customer')
                                        ->where('id', $task['id'])
                                        ->update(['status' => 2, 'updated_at' => time()]);
                                    break;
                                }

                                // todo 判断处理执行失败的情况 status=2，根据 extra 的描述去处理；-- 可以先直接更新为失败，然后 extra =》fail_reason -- 因为有专门的任务会处理失败的
                                if (isset($latestFriendTask['status']) && $latestFriendTask['status'] == 2) {
                                    Db::name('task_customer')
                                        ->where('id', $task['id'])
                                        ->update(['status' => 3, 'fail_reason' => $latestFriendTask['extra'] ?? '未知原因', 'updated_at' => time()]);
                                    break;
                                }

                                
                            }

                        }

                        
                    }
                }
            });
        }

        if ($current_worker_id < self::PROCESS_COUNT - 1) {

            Timer::add(1, function () use ($current_worker_id, $process_count_for_status_0, $adapter) {

                $tasks = Db::name('task_customer')
                    ->where('status', 0)
                    ->whereRaw("id % $process_count_for_status_0 = {$current_worker_id}")
                    ->limit(50)
                    ->select();
                if ($tasks) {

                    foreach ($tasks as $task) {

                        $task_id = $task['task_id'];

                        $task_info = $adapter->getCustomerAcquisitionTask($task_id);

                        if (empty($task_info['status']) || empty($task_info['reqConf']) || empty($task_info['reqConf']['devices'])) {
                            continue;
                        }

       
                        $wechatIdAccountIdMap = $adapter->getWeChatIdsAccountIdsMapByDeviceIds($task_info['reqConf']['devices']);
                        if (empty($wechatIdAccountIdMap)) {
                            continue;
                        }

                        $friendAddTaskCreated = false;

                        foreach ($wechatIdAccountIdMap as $wechatId => $accountId) {


                            // 是否已经是好友的判断，如果已经是好友，直接break; 但状态还是维持1，让另外一个进程处理发消息的逻辑
                            if ($adapter->checkIfIsWeChatFriendByPhone($wechatId, $task['phone'])) {
                                $task['processed_wechat_ids'] = $task['processed_wechat_ids'] . ',' . $wechatId; // 处理失败任务用，用于过滤已处理的微信号
                                break;
                            }

                            // 判断时间间隔\时间段和最后一次的状态
                            $canCreateFriendAddTask = $adapter->checkIfCanCreateFriendAddTask($wechatId, $task_info['reqConf']);
                            if (empty($canCreateFriendAddTask)) {
                                continue;
                            }

                            // 判断24h内加的好友数量，friend_task  先固定10个人 getLast24hAddedFriendsCount
                            $last24hAddedFriendsCount = $adapter->getLast24hAddedFriendsCount($wechatId);
                            if ($last24hAddedFriendsCount >= 10) {
                                continue;
                            }

                            // 采取乐观尝试的策略，假设第一个可以添加的人可以添加成功的; 回头再另外一个任务进程去判断

                            // 创建好友添加任务， 对接触客宝
                            $conf = array_merge($task_info['reqConf'], ['task_name' => $task_info['name']]);
                            $adapter->createFriendAddTask($accountId, $task['phone'], $conf);
                            $friendAddTaskCreated = true;
                            $task['processed_wechat_ids'] = $task['processed_wechat_ids'] . ',' . $wechatId; // 处理失败任务用，用于过滤已处理的微信号

                            break;
                        }

                        Db::name('task_customer')
                            ->where('id', $task['id'])
                            ->update(['status' => $friendAddTaskCreated ? 1 : 3, 'fail_reason' => $friendAddTaskCreated ? '' : '所有账号不可添加', 'updated_at' => time()]); // ~~不用管，回头再添加再判断即可~~
                        // 失败一定是另一个进程/定时器在检查的

                    }
                }
            });
        }
      
    }
}
