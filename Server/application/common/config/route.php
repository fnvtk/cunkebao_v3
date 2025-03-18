<?php
// common模块路由配置

use think\facade\Route;

// 定义RESTful风格的API路由 - 认证相关
Route::group('v1/auth', function () {
    // 无需认证的接口
    Route::post('login', 'app\\common\\controller\\Auth@login'); // 账号密码登录
    Route::post('mobile-login', 'app\\common\\controller\\Auth@mobileLogin'); // 手机号验证码登录
    Route::post('code', 'app\\common\\controller\\Auth@sendCode'); // 发送验证码
    
    // 需要JWT认证的接口
    Route::get('info', 'app\\common\\controller\\Auth@info')->middleware(['jwt']); // 获取用户信息
    Route::post('refresh', 'app\\common\\controller\\Auth@refresh')->middleware(['jwt']); // 刷新令牌
});