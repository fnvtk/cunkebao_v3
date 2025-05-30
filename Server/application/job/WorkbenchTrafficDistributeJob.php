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
        $account = Db::table('s2_company_account')
            ->where(['departmentId' => $workbench->companyId, 'status' => 0])
            ->whereNotLike('userName', '%_offline%')
            ->whereNotLike('userName', '%_delete%')
            ->field('id,userName,realName')
            ->select();
        $accountNum = count($account);
        if($accountNum < 2){
            Log::info("流量分发工作台 {$workbench->id} 账号少于3个");
            return;
        }
     
        // 默认第一页，每页20条
        $friends = $this->getFriendsByLabels($workbench,$config, $page, $pageSize);
        if(empty($friends) || count($friends) == 0){
            Log::info("流量分发工作台 {$workbench->id} 没有可分配的好友");
            return;
        }


        print_r($friends);
        exit;

        switch ($config->distributeType) {
            case 1:
                // 平均分配
                break;
            case 2:
                // 按客服优先等级
                break;
            case 3:
                // 比例分配
                break;
        }




        print_r($accountNum);
        exit;
        // 例如：分配好友/客户到设备、客服、流量池等
        Log::info("流量分发工作台 {$workbench->id} 执行分发逻辑");
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
     * @param array $workbench 标签数组 
     * @param array $config 标签数组
     * @param int $page 页码
     * @param int $pageSize 每页数量
     * @return array
     */
    protected function getFriendsByLabels($workbench,$config, $page = 1, $pageSize = 20)
    {
        $labels = json_decode($config['pools'],true);
        $device = json_decode($config['devices'],true);
      
        
        $query = Db::table('s2_wechat_friend')->alias('wf')
        ->join(['s2_company_account'=>'sa'],'sa.id = wf.accountId','left')
        ->join(['s2_wechat_account'=>'wa'],'wa.id = wf.wechatAccountId','left')
        ->join('workbench_traffic_config_item wtci', 'wtci.wechatFriendId = wf.id AND wtci.workbenchId = '. $config['workbenchId'], 'left')
        ->where([
            ['wf.isDeleted','=',0],
            ['sa.departmentId' ,'=', $workbench->companyId],
            ['wtci.id', 'null', null]
        ])
        ->whereIn('wa.currentDeviceId',$device)
        ->field('wf.id,wf.wechatAccountId,wf.wechatId,wf.labels,sa.userName,wa.currentDeviceId as deviceId');
        $query->where(function($q) use ($labels) {
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