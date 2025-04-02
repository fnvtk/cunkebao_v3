<?php
// store模块路由配置

use think\facade\Route;

// 定义RESTful风格的API路由
Route::group('v1/store', function () {
    // 流量套餐相关路由
    Route::group('flow-packages', function () {
        Route::get('', 'app\\store\\controller\\FlowPackageController@getList');  // 获取流量套餐列表
        Route::get('remaining-flow', 'app\\store\\controller\\FlowPackageController@remainingFlow'); // 获取用户剩余流量
        Route::get(':id', 'app\\store\\controller\\FlowPackageController@detail'); // 获取流量套餐详情
        Route::post('order', 'app\\store\\controller\\FlowPackageController@createOrder'); // 创建流量采购订单
    });
    
    // 流量订单相关路由
    Route::group('flow-orders', function () {
        Route::get('list', 'app\\store\\controller\\FlowPackageController@getOrderList'); // 获取订单列表
        Route::get(':orderNo', 'app\\store\\controller\\FlowPackageController@getOrderDetail'); // 获取订单详情
    });

    // 客户相关路由
    Route::group('customers', function () {
        Route::get('list', 'app\\store\\controller\\CustomerController@getList'); // 获取客户列表
    });


    // 系统配置相关路由
    Route::group('system-config', function () {
        Route::get('switch-status', 'app\\store\\controller\\SystemConfigController@getSwitchStatus'); // 获取系统开关状态
        Route::post('update-switch-status', 'app\\store\\controller\\SystemConfigController@updateSwitchStatus'); // 更新系统开关状态
    });
})->middleware(['jwt']);