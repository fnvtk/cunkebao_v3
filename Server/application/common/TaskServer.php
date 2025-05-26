<?php

namespace app\common;

use think\Db;
use think\facade\Log;
use Workerman\Lib\Timer;
use think\worker\Server;

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

        // echo "current_worker_id: $current_worker_id\n";

        $process_count_for_status_0 = self::PROCESS_COUNT - 1;


        // todo 临时测试，回头封装到类里调用，每个任务一个类
        Timer::add(5, function () use ($current_worker_id, $process_count_for_status_0) {
            if ($current_worker_id == self::PROCESS_COUNT - 1) {
                // TODO 专门检查添加后的情况，是否通过 ； 使用独立的进程和定时器处理，周期改为1min

                $tasks = Db::name('task_customer')
                    ->where('status', 1)
                    ->limit(50)
                    ->select();
                if ($tasks) {
                    // TODO 检查是否添加成功，是否需要再次发送，然后，更新状态为2或3 ...



                }
            } else {
                // 其他任务 -- 现在只用于处理场景获客的后置操作（处理 status = 0 的数据）；可添加其他任务进来~
                $tasks = Db::name('task_customer')
                    ->where('status', 0)
                    ->whereRaw("id % $process_count_for_status_0 = {$current_worker_id}")
                    ->limit(50)
                    ->select();
                if ($tasks) {
                    // ... 更新状态为1，然后处理，~~再更新为2或3~~ ...
                    foreach ($tasks as $task) {

                        // 查找 ck_customer_acquisition_task 表，是否存在该任务；然后拿到任务配置详情；童谣的任务id需要缓存信息不要重复查询
                        $task_id = $task['task_id'];
                        // 先读取缓存
                        $task_info = cache('task_info_' . $task_id);
                        if (!$task_info) {
                            $task_info = Db::name('customer_acquisition_task')
                                ->where('id', $task_id)
                                ->find();

                            if ($task_info) {
                                cache('task_info_' . $task['task_id'], $task_info);
                            } else {
                                continue;
                            }
                        }

                        if (empty($task_info['status']) || empty($task_info['reqConf'])) {
                            continue;
                        }

                        // 先更新状态为1
                        Db::name('task_customer')
                        ->where('id', $task['id'])
                        ->update(['status' => 1]);


                        // todo 基于 $task['phone'] 和 $task_info['reqConf'] 进行处理
                        //通过conpany_id拿到设备/微信，判断这些微信的状态（是否在线，是否能加人）


                        // ~~// 更新状态为1 || 4~~
                        // // 更新状态为2
                        // Db::name('task_customer')
                        //     ->where('id', $task['id'])
                        //     ->update(['status' => 1]);

                        // 之后可能会更新为~~失败~~或者不处理   -- 失败一定是另一个进程/定时器在检查的
                        


                    }
                }
            }
        });
    }
}
