<?php

namespace app\command;

use think\console\Command;
use think\console\Input;
use think\console\Output;
use think\facade\Log;
use think\Queue;
use app\job\WechatFriendJob;
use think\facade\Cache;

class WechatFriendCommand extends Command
{
    protected function configure()
    {
        $this->setName('wechatFriends:list')
            ->setDescription('获微信列表，并根据分页自动处理下一页');
    }

    protected function execute(Input $input, Output $output)
    {
        $output->writeln('开始处理微信列表任务...');
        
        try {
            // 从缓存获取初始页码和上次处理的好友ID，缓存10分钟有效
            $pageIndex = Cache::get('friendsPage', 21);
            $preFriendId = Cache::get('preFriendId', 19426090);
            
            $output->writeln('从缓存获取页码：' . $pageIndex . '，上次处理的好友ID：' . ($preFriendId ?: '无'));
            
            $pageSize = 1000; // 每页获取1000条记录
            
            // 将任务添加到队列
            $this->addToQueue($pageIndex, $pageSize, $preFriendId);
            
            $output->writeln('微信列表任务已添加到队列');
        } catch (\Exception $e) {
            Log::error('微信列表任务添加失败：' . $e->getMessage());
            $output->writeln('微信列表任务添加失败：' . $e->getMessage());
            return false;
        }
        
        return true;
    }
    
    /**
     * 添加任务到队列
     * @param int $pageIndex 页码
     * @param int $pageSize 每页大小
     * @param string $preFriendId 上一个好友ID
     */
    protected function addToQueue($pageIndex, $pageSize, $preFriendId = '')
    {
        $data = [
            'pageIndex' => $pageIndex,
            'pageSize' => $pageSize,
            'preFriendId' => $preFriendId
        ];
        
        // 添加到队列，设置任务名为 wechat_friends
        Queue::push(WechatFriendJob::class, $data, 'wechat_friends');
    }
} 