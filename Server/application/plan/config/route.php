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
    });
    
    // 流量标签相关
    Route::group('traffic/tags', function () {
        Route::get('', 'app\\plan\\controller\\TrafficTag@index');      // 获取标签列表
    });

    // 流量池相关
    Route::group('traffic/pool', function () {
        Route::post('import', 'app\\plan\\controller\\TrafficPool@importOrders');  // 导入订单标签
    });
})->middleware(['jwt']); 