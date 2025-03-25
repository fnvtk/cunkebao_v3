<?php
// store模块路由配置

use think\facade\Route;

// 定义RESTful风格的API路由
Route::group('v1/store', function () {
    // 流量套餐相关路由
    Route::group('flow-packages', function () {
        Route::get('', 'app\\store\\controller\\FlowPackageController@getList');  // 获取流量套餐列表
        Route::get(':id', 'app\\store\\controller\\FlowPackageController@detail'); // 获取流量套餐详情
        Route::get('remaining-flow', 'app\\store\\controller\\FlowPackageController@remainingFlow'); // 获取用户剩余流量
    });
})/*->middleware(['jwt'])*/;