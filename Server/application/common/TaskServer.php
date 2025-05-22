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
                // TODO 专门检查添加后的情况，是否通过

                $tasks = Db::name('task_customer')
                    ->where('status', 1)
                    ->limit(100)
                    ->select();
                if ($tasks) {
                    // TODO 检查是否添加成功，是否需要再次发送，然后，更新状态为2或3 ...



                }
            } else {
                // 其他任务 -- 现在只用于处理场景获客的后置操作（处理 status = 0 的数据）；可添加其他任务进来~
                $tasks = Db::name('task_customer')
                    ->where('status', 0)
                    ->whereRaw("id % $process_count_for_status_0 = {$current_worker_id}")
                    ->limit(100)
                    ->select();
                if ($tasks) {
                    // ... 更新状态为1，然后处理，再更新为2或3 ...


                }
            }
        });


    }
}
