<?php

namespace app\cunkebao\controller\device;

use app\cunkebao\controller\BaseController;

/**
 * 设备管理控制器
 */
class RefreshDeviceDetailV1Controller extends BaseController
{
    /**
     * 刷新设备
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            // TODO: 实现实际刷新设备状态的功能

            return json([
                'code' => 200,
                'msg' => '刷新成功',
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => $e->getCode(),
                'msg' => $e->getMessage()
            ]);
        }
    }
} 