<?php
// +----------------------------------------------------------------------
// | 计划模块路由配置
// +----------------------------------------------------------------------

use think\facade\Route;

// 定义RESTful风格的API路由
Route::group('v1/', function () {
    // 获客场景相关
    Route::group('plan/scenes', function () {
        Route::get('', 'app\\plan\\controller\\Scene@index');           // 获取场景列表
        Route::get(':id', 'app\\plan\\controller\\Scene@read');         // 获取场景详情
    });
})->middleware(['jwt']); 