<?php

namespace app\cunkebao\controller;

use think\Controller;
use think\Queue;
use app\job\ContentCollectJob;

class ContentCollectController extends Controller
{
    /**
     * 添加内容采集任务到队列
     * @return \think\response\Json
     */
    public function addCollectTask()
    {
        try {
            $data = [
                'libraryId' => input('libraryId/d', 0), // 0表示采集所有内容库
                'timestamp' => time()
            ];
            
            Queue::push(ContentCollectJob::class, $data, 'content_collect');
            
            return json(['code' => 200, 'msg' => '采集任务已加入队列']);
        } catch (\Exception $e) {
            return json(['code' => 500, 'msg' => '添加采集任务失败：' . $e->getMessage()]);
        }
    }
} 