<?php
// common模块路由配置

use think\facade\Route;

// 添加测试路由
Route::get('api/test', function() {
    return json([
        'code' => 200,
        'msg' => '路由测试成功',
        'data' => [
            'time' => date('Y-m-d H:i:s'),
            'module' => 'common'
        ]
    ]);
});

// 定义RESTful风格的API路由
Route::post('api/auth/login', 'app\\common\\controller\\Auth@login'); // 登录接口

// 需要JWT认证的接口
Route::get('api/auth/info', 'app\\common\\controller\\Auth@info')->middleware(['jwt']); // 获取用户信息
Route::post('api/auth/refresh', 'app\\common\\controller\\Auth@refresh')->middleware(['jwt']); // 刷新令牌

return []; 