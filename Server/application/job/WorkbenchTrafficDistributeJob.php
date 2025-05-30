<?php

namespace app\job;

use think\queue\Job;
use think\facade\Log;
use think\Queue;
use think\facade\Config;
use think\facade\Cache;
use app\cunkebao\model\Workbench;
use app\cunkebao\model\WorkbenchTrafficConfig;
use think\Db;

class WorkbenchTrafficDistributeJob
{
    const MAX_RETRY_ATTEMPTS = 3;

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

    protected function getActiveWorkbenches()
    {
        return Workbench::where([
            ['status', '=', 1],
            ['isDel', '=', 0],
            ['type', '=', 5]
        ])->order('id DESC')->select();
    }

    protected function processWorkbenches($workbenches)
    {
        foreach ($workbenches as $workbench) {
            try {
                $this->processSingleWorkbench($workbench);
            } catch (\Exception $e) {
                Log::error("处理流量分发工作台 {$workbench->id} 失败: " . $e->getMessage());
            }
        }
    }

    protected function processSingleWorkbench($workbench)
    {
        $page = 1;
        $pageSize = 20;
        $config = WorkbenchTrafficConfig::where('workbenchId', $workbench->id)->find();
        if (!$config) {
            Log::error("流量分发工作台 {$workbench->id} 配置获取失败");
            return;
        }

        // 验证是否在流量分发时间范围内
        if (!$this->isTimeRange($config) && $config['timeType'] == 2) {
            return;
        }

        // 获取账号，userName不包含offline和delete
        $accounts = Db::table('s2_company_account')
            ->where(['departmentId' => $workbench->companyId, 'status' => 0])
            ->whereNotLike('userName', '%_offline%')
            ->whereNotLike('userName', '%_delete%')
            ->field('id,userName,realName')
            ->select();
        $accountNum = count($accounts);
        if ($accountNum < 2) {
            Log::info("流量分发工作台 {$workbench->id} 账号少于3个");
            return;
        }

        // 获取可分配好友
        $friends = $this->getFriendsByLabels($workbench, $config, $page, $pageSize);
        if (empty($friends) || count($friends) == 0) {
            Log::info("流量分发工作台 {$workbench->id} 没有可分配的好友");
            return;
        }

        // TODO: 在这里实现分发逻辑
        print_r($friends);
        exit;
    }

    /**
     * 检查是否在流量分发时间范围内
     * @param WorkbenchAutoLike $config
     * @return bool
     */
    protected function isTimeRange($config)
    {
        $currentTime = date('H:i');
        if ($currentTime < $config['startTime'] || $currentTime > $config['endTime']) {
            Log::info("当前时间 {$currentTime} 不在流量分发时间范围内 ({$config['startTime']} - {$config['endTime']})");
            return false;
        }
        return true;
    }

    /**
     * 一次性查出所有包含指定标签数组的好友（支持分页）
     * @param object $workbench 工作台对象
     * @param object $config 配置对象
     * @param int $page 页码
     * @param int $pageSize 每页数量
     * @return array
     */
    protected function getFriendsByLabels($workbench, $config, $page = 1, $pageSize = 20)
    {
        $labels = [];
        if (!empty($config['pools'])) {
            $labels = is_array($config['pools']) ? $config['pools'] : json_decode($config['pools'], true);
        }
        $devices = [];
        if (!empty($config['devices'])) {
            $devices = is_array($config['devices']) ? $config['devices'] : json_decode($config['devices'], true);
        }
        if (empty($labels) || empty($devices)) {
            return [];
        }
        $query = Db::table('s2_wechat_friend')->alias('wf')
            ->join(['s2_company_account' => 'sa'], 'sa.id = wf.accountId', 'left')
            ->join(['s2_wechat_account' => 'wa'], 'wa.id = wf.wechatAccountId', 'left')
            ->join('workbench_traffic_config_item wtci', 'wtci.wechatFriendId = wf.id AND wtci.workbenchId = ' . $config['workbenchId'], 'left')
            ->where([
                ['wf.isDeleted', '=', 0],
                ['sa.departmentId', '=', $workbench->companyId],
                ['wtci.id', 'null', null]
            ])
            ->whereIn('wa.currentDeviceId', $devices)
            ->field('wf.id,wf.wechatAccountId,wf.wechatId,wf.labels,sa.userName,wa.currentDeviceId as deviceId');
        $query->where(function ($q) use ($labels) {
            foreach ($labels as $label) {
                $q->whereOrRaw("JSON_CONTAINS(wf.labels, '\"{$label}\"')");
            }
        });
        $list = $query->page($page, $pageSize)->select();
        return $list;
    }

    protected function logJobStart($jobId, $queueLockKey)
    {
        Log::info('开始处理流量分发任务: ' . json_encode([
            'jobId' => $jobId,
            'queueLockKey' => $queueLockKey
        ]));
    }

    protected function handleJobSuccess($job, $queueLockKey)
    {
        $job->delete();
        Cache::rm($queueLockKey);
        Log::info('流量分发任务执行成功');
    }

    protected function handleJobError(\Exception $e, $job, $queueLockKey)
    {
        Log::error('流量分发任务异常：' . $e->getMessage());
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

    protected function handleEmptyWorkbenches(Job $job, $queueLockKey)
    {
        Log::info('没有需要处理的流量分发任务');
        $job->delete();
        Cache::rm($queueLockKey);
    }
} 