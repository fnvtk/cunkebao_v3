<?php

namespace app\admin\controller;

use think\facade\Request;
use think\facade\Session;
use app\admin\model\Administrator;
use app\common\util\JwtUtil;

/**
 * 超级管理员控制器
 */
class AdminController extends BaseController
{
    /**
     * 令牌有效期（秒）
     */
    const TOKEN_EXPIRE = 7200;
    
    /**
     * 管理员登录
     * @return \think\response\Json
     */
    public function login()
    {
        // 获取请求参数
        $account = input('account', '');
        $password = input('password', '');

        // 参数验证
        if (empty($account) || empty($password)) {
            return json(['code' => 400, 'msg' => '账号和密码不能为空']);
        }

        try {
            // 查询管理员
            $admin = Administrator::where('account', $account)->find();
            
            // 验证账号是否存在及密码是否正确
            if (empty($admin) || md5($password) != $admin['password']) {
                return errorJson('账号或密码错误',400);
            }
            
            // 验证账号状态
            if ($admin['status'] != 1) {
                return errorJson('账号已被禁用',400);
            }
            
            // 更新登录信息
            $admin->lastLoginIp = Request::ip();
            $admin->lastLoginTime = time();
            $admin->save();
            
            // 构建用户数据
            $userData = [
                'id' => $admin['id'],
                'account' => $admin['account'],
                'name' => $admin['name'],
                'type' => 'admin' // 标记用户类型为管理员
            ];
            
            // 生成JWT令牌
            $token = JwtUtil::createToken($userData, self::TOKEN_EXPIRE);
            $expireTime = time() + self::TOKEN_EXPIRE;
            
            // 缓存用户信息，方便后续验证
            Session::set('admin_auth', [
                'id' => $admin['id'],
                'account' => $admin['account'],
                'name' => $admin['name'],
                'token' => $token
            ]);
            
            // 返回登录成功数据
            return successJson([
                    'id' => $admin['id'],
                    'account' => $admin['account'],
                    'name' => $admin['name'],
                    'token' => $token,
                    'token_expired' => $expireTime,
                    'lastLoginTime' => date('Y-m-d H:i:s', $admin['lastLoginTime'])
                ]);
        } catch (\Exception $e) {
            return errorJson('登录失败：' . $e->getMessage(),500);
        }
    }
    
    /**
     * 刷新令牌
     * @return \think\response\Json
     */
    public function refreshToken()
    {
        // 获取Session中保存的管理员信息
        $adminAuth = Session::get('admin_auth');
        if (empty($adminAuth)) {
            return errorJson('未登录或登录已过期',401);
        }
        
        try {
            // 查询管理员信息
            $admin = Administrator::where('id', $adminAuth['id'])->find();
            if (empty($admin)) {
                Session::delete('admin_auth');
                return errorJson('管理员不存在',401);
            }
            
            // 构建用户数据
            $userData = [
                'id' => $admin['id'],
                'account' => $admin['account'],
                'name' => $admin['name'],
                'type' => 'admin' // 标记用户类型为管理员
            ];
            
            // 生成新令牌
            $token = JwtUtil::createToken($userData, self::TOKEN_EXPIRE);
            $expireTime = time() + self::TOKEN_EXPIRE;
            
            // 更新Session中的令牌
            $adminAuth['token'] = $token;
            
            return successJson([
                'token' => $token,
                'token_expired' => $expireTime
            ]);
        } catch (\Exception $e) {
            return errorJson('刷新令牌失败：' . $e->getMessage(),500);
        }
    }
    
    /**
     * 退出登录
     * @return \think\response\Json
     */
    public function logout()
    {
        Session::delete('admin_auth');
        return successJson('退出成功');
    }
    
    /**
     * 获取当前登录管理员信息
     * @return \think\response\Json
     */
    public function getInfo()
    {
        // 获取Session中保存的管理员信息
        $adminAuth = Session::get('admin_auth');
        if (empty($adminAuth)) {
            return errorJson('未登录或登录已过期',401);
        }
        
        // 查询管理员信息
        $admin = Administrator::where('id', $adminAuth['id'])->find();
        if (empty($admin)) {
            Session::delete('admin_auth');
            return errorJson('管理员不存在',401);
        }
        
        return successJson([
            'id' => $admin['id'],
            'account' => $admin['account'],
            'name' => $admin['name'],
            'lastLoginTime' => date('Y-m-d H:i:s', $admin['lastLoginTime']),
            'lastLoginIp' => $admin['lastLoginIp']
        ]);
    }
} 