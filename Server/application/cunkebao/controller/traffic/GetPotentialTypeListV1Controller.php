<?php

namespace app\cunkebao\controller\traffic;

use app\common\model\TrafficPool as TrafficPoolModel;
use app\common\model\WechatFriendShip as WechatFriendShipModel;
use app\cunkebao\controller\BaseController;
use library\ResponseHelper;

/**
 * 流量池控制器
 */
class GetPotentialTypeListV1Controller extends BaseController
{
    protected function getTypeList(): array
    {
        return [
            [
                'id'   => 1,
                'name' => '待处理'
            ],
            [
                'id'   => 2,
                'name' => '处理中'
            ],
            [
                'id'   => 4,
                'name' => '已拒绝'
            ],
            [
                'id'   => 5,
                'name' => '已过期'
            ],
            [
                'id'   => 6,
                'name' => '已取消'
            ]
        ];
    }

    /**
     * 潜在客户的全部状态
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            return ResponseHelper::success(
                $this->getTypeList()
            );
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 