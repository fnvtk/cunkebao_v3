<?php
namespace app\job;

use think\queue\Job;

class SyncContentJob
{
    public function fire(Job $job, $data)
    {
        try {
            // TODO: 在这里实现具体的同步逻辑
            // 1. 获取需要同步的数据
            // 2. 处理数据
            // 3. 更新到目标位置
            
            // 如果任务执行成功，删除任务
            $job->delete();
            
            // 记录日志
            \think\Log::info('内容库同步成功：' . json_encode($data));
            
        } catch (\Exception $e) {
            // 如果任务执行失败，记录日志
            \think\Log::error('内容库同步失败：' . $e->getMessage());
            
            // 如果任务失败次数小于3次，重新放入队列
            if ($job->attempts() < 3) {
                $job->release(60); // 延迟60秒后重试
            } else {
                $job->delete();
            }
        }
    }
} 