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

    protected function yyyyyyy()
    {

    }


    /**
     * 添加计划任务
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $params = $this->request->only(['name', 'sceneId', 'status', 'reqConf', 'msgConf', 'tagConf']);


            dd(

                json_decode($params['reqConf']),
                json_decode($params['tagConf']),
                json_decode($params['msgConf'])

            );



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

            // 插入数据库 customer_acquisition_task
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

        /**
     * 验证JSON格式是否正确
     *
     * @param string $string
     * @return bool
     */
    private function validateJson($string)
    {
        if (empty($string)) {
            return true;
        }
        
        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
    }
} 