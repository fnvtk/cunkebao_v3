<?php
// +----------------------------------------------------------------------
// | 设备管理模块路由配置
// +----------------------------------------------------------------------

use think\facade\Route;

// 定义RESTful风格的API路由 - 设备管理相关
Route::group('v1/devices', function () {
    // 设备列表和查询
    Route::get('', 'app\\devices\\controller\\Device@index');      // 获取设备列表
    Route::get('count', 'app\\devices\\controller\\Device@count'); // 获取设备总数
    Route::get(':id', 'app\\devices\\controller\\Device@read');    // 获取设备详情

    // 设备管理 
    Route::post('', 'app\\devices\\controller\\Device@save');           // 添加设备
    Route::put('refresh', 'app\\devices\\controller\\Device@refresh');  // 刷新设备状态
    Route::delete(':id', 'app\\devices\\controller\\Device@delete');    // 删除设备
})->middleware(['jwt']);