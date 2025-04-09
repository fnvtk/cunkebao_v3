<?php
// +----------------------------------------------------------------------
// | 设备管理模块路由配置
// +----------------------------------------------------------------------

use think\facade\Route;

// 定义RESTful风格的API路由
Route::group('v1/', function () {

    // 设备管理相关
    Route::group('devices', function () {
        Route::get(':id/related-accounts', 'app\\cunkebao\\controller\\Device@getRelatedAccounts');   // 设备关联微信账号路由
        Route::get(':id/handle-logs', 'app\\cunkebao\\controller\\Device@handleLogs');    // 获取设备操作记录
        Route::get('', 'app\\cunkebao\\controller\\Device@index');           // 获取设备列表
        Route::get('count', 'app\\cunkebao\\controller\\Device@count');      // 获取设备总数
        Route::get(':id', 'app\\cunkebao\\controller\\Device@read');         // 获取设备详情
        Route::post('', 'app\\cunkebao\\controller\\Device@save');           // 添加设备
        Route::put('refresh', 'app\\cunkebao\\controller\\Device@refresh');  // 刷新设备状态
        Route::delete(':id', 'app\\cunkebao\\controller\\Device@delete');    // 删除设备
        Route::post('task-config', 'app\\cunkebao\\controller\\Device@updateTaskConfig'); // 更新设备任务配置
    });

    // 设备微信相关
    Route::group('device/wechats', function () {
        Route::get('friends', 'app\\cunkebao\\controller\\DeviceWechat@getFriends'); // 获取微信好友列表
        Route::get('count', 'app\\cunkebao\\controller\\DeviceWechat@count');       // 获取在线微信账号数量
        Route::get('device-count', 'app\\cunkebao\\controller\\DeviceWechat@deviceCount'); // 获取有登录微信的设备数量
        Route::get('', 'app\\cunkebao\\controller\\DeviceWechat@index');     // 获取在线微信账号列表
        Route::get(':id', 'app\\cunkebao\\controller\\DeviceWechat@detail'); // 获取微信号详情
        Route::put('refresh', 'app\\cunkebao\\controller\\DeviceWechat@refresh');  // 刷新设备微信状态
        Route::post('transfer-friends', 'app\\cunkebao\\controller\\DeviceWechat@transferFriends'); // 微信好友转移
    });

    // 获客场景相关
    Route::group('plan/scenes', function () {
        Route::get('', 'app\\cunkebao\\controller\\Scene@index');           // 获取场景列表
    });

    // 流量标签相关
    Route::group('traffic/tags', function () {
        Route::get('', 'app\\cunkebao\\controller\\TrafficTag@index');      // 获取标签列表
    });

    // 流量池相关
    Route::group('traffic/pool', function () {
        Route::post('import', 'app\\cunkebao\\controller\\TrafficPool@importOrders');  // 导入订单标签
    });
})->middleware(['jwt']);