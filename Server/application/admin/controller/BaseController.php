<?php

namespace app\admin\controller;

use think\Controller;
use think\facade\Request;
use think\facade\Session;
use app\common\util\JwtUtil;

/**
 * 后台基础控制器
 */
class BaseController extends Controller
{
    // 管理员信息
    protected $adminInfo = [];
    
    /**
     * 初始化
     */
    protected function initialize()
    {
        parent::initialize();
        
        // 不需要验证登录的方法
        $noNeedLogin = ['login'];
        
        // 获取当前操作方法
        $action = request()->action();
        
        // 验证登录
        if (!in_array($action, $noNeedLogin)) {
            $this->checkLogin();
        }
    }
    
    /**
     * 验证登录
     */
    protected function checkLogin()
    {
        // 获取请求头中的Authorization
        $token = Request::header('Authorization', '');
        if (empty($token)) {
            // 尝试从请求参数中获取token
            $token = Request::param('token', '');
        }
        
        if (empty($token)) {
            $this->error('未登录或登录已过期', null, ['code' => 401]);
        }
        
        try {
            // 验证JWT令牌
            $userInfo = JwtUtil::verifyToken($token);
            
            // 验证用户类型
            if (empty($userInfo) || $userInfo['type'] !== 'admin') {
                $this->error('无效的登录凭证', null, ['code' => 401]);
            }
            
            $this->adminInfo = $userInfo;
        } catch (\Exception $e) {
            $this->error('登录已过期，请重新登录', null, ['code' => 401]);
        }
    }
    

} 