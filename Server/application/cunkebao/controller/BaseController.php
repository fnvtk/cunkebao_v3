<?php

namespace app\cunkebao\controller;

use think\Controller;

/**
 * 设备管理控制器
 */
class BaseController extends Controller
{
    /**
     * 用户信息
     * @var object
     */
    protected $user;

    /**
     * 初始化
     */
    protected function initialize()
    {
        parent::initialize();

        date_default_timezone_set('Asia/Shanghai');

        $this->user = request()->userInfo;;
    }

    /**
     * 获取用户信息
     *
     * @param string $column
     * @return mixed
     * @throws \Exception
     */
    protected function getUserInfo(string $column = '')
    {
        if (!$this->user) {
            throw new \Exception('未授权访问，缺少有效的身份凭证', 401);
        }

        return $column ? $this->user[$column] : $this->user;
    }
} 