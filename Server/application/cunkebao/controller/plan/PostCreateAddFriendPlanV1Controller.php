<?php

namespace app\cunkebao\controller\plan;

use library\ResponseHelper;
use think\Controller;
use think\Db;
use think\facade\Request;

/**
 * 获客场景控制器
 */
class PostCreateAddFriendPlanV1Controller extends Controller
{
    /**
     * 添加计划任务
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            // 获取表单数据
            $data = [
                'name'       => Request::post('name', ''),
                'sceneId'    => Request::post('sceneId', 0),
                'status'     => Request::post('status', 0),
                'reqConf'    => Request::post('reqConf', ''),
                'msgConf'    => Request::post('msgConf', ''),
                'tagConf'    => Request::post('tagConf', ''),
                'createTime' => time(),
                'updateTime' => time()
            ];

            // 验证必填字段
            if (empty($data['name'])) {
                return ResponseHelper::error('计划名称不能为空', 400);
            }

            if (empty($data['sceneId'])) {
                return ResponseHelper::error('场景ID不能为空', 400);
            }

            // 验证数据格式
            if (!$this->validateJson($data['reqConf'])) {
                return ResponseHelper::error('好友申请设置格式不正确', 400);
            }

            if (!$this->validateJson($data['msgConf'])) {
                return ResponseHelper::error('消息设置格式不正确', 400);
            }

            if (!$this->validateJson($data['tagConf'])) {
                return ResponseHelper::error('标签设置格式不正确', 400);
            }

            // 插入数据库
            $result = Db::name('friend_plan')->insert($data);

            if ($result) {
                return ResponseHelper::success([], '添加计划任务成功');
            } else {
                return ResponseHelper::error('添加计划任务失败', 500);
            }
        } catch (\Exception $e) {
            return ResponseHelper::error('系统错误: ' . $e->getMessage(), 500);
        }
    }
} 