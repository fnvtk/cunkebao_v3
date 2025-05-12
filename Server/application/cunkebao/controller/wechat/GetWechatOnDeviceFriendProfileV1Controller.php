<?php

namespace app\cunkebao\controller\wechat;

use library\ResponseHelper;

/**
 * 设备微信控制器
 */
class GetWechatOnDeviceFriendProfileV1Controller extends BaseController
{

    protected function getWechatAccountProfileById()
    {


    }

    /**
     * 获取微信好友详情
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $id = $this->request->param('id/d');

        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 