<?php
// +----------------------------------------------------------------------
// | 设备管理模块路由配置
// +----------------------------------------------------------------------

use think\facade\Route;

// 定义RESTful风格的API路由
Route::group('v1/', function () {

    // 设备管理相关
    Route::group('devices', function () {
        Route::get(':id/related-accounts', 'app\\devices\\controller\\Device@getRelatedAccounts');   // 设备关联微信账号路由
        Route::get('', 'app\\devices\\controller\\Device@index');           // 获取设备列表
        Route::get('count', 'app\\devices\\controller\\Device@count');      // 获取设备总数
        Route::get(':id', 'app\\devices\\controller\\Device@read');         // 获取设备详情
        Route::post('', 'app\\devices\\controller\\Device@save');           // 添加设备
        Route::put('refresh', 'app\\devices\\controller\\Device@refresh');  // 刷新设备状态
        Route::delete(':id', 'app\\devices\\controller\\Device@delete');    // 删除设备
        Route::post('task-config', 'app\\devices\\controller\\Device@updateTaskConfig'); // 更新设备任务配置
    });

    // 设备微信相关
    Route::group('device/wechats', function () {
        Route::get('count', 'app\\devices\\controller\\DeviceWechat@count');       // 获取在线微信账号数量
        Route::get('device-count', 'app\\devices\\controller\\DeviceWechat@deviceCount'); // 获取有登录微信的设备数量
        Route::get('', 'app\\devices\\controller\\DeviceWechat@index');     // 获取在线微信账号列表
        Route::get(':id', 'app\\devices\\controller\\DeviceWechat@detail'); // 获取微信号详情
        Route::put('refresh', 'app\\devices\\controller\\DeviceWechat@refresh');  // 刷新设备微信状态
        Route::post('transfer-friends', 'app\\devices\\controller\\DeviceWechat@transferFriends'); // 微信好友转移
    });


})->middleware(['jwt']);