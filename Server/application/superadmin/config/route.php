<?php
use think\facade\Route;

// 超级管理员认证相关路由（不需要鉴权）
Route::post('auth/login', 'app\\superadmin\\controller\\Auth@login');

// 需要登录认证的路由组
Route::group('', function () {
    // 菜单管理相关路由
    Route::group('menu', function () {
        Route::get('tree', 'app\\superadmin\\controller\\Menu@getMenuTree');
        Route::get('list', 'app\\superadmin\\controller\\Menu@getMenuList');
        Route::post('save', 'app\\superadmin\\controller\\Menu@saveMenu');
        Route::delete('delete/:id', 'app\\superadmin\\controller\\Menu@deleteMenu');
        Route::post('status', 'app\\superadmin\\controller\\Menu@updateStatus');
    });
    
    // 管理员相关路由
    Route::group('administrator', function () {
        // 获取管理员列表
        Route::get('list', 'app\\superadmin\\controller\\Administrator@getList');
        // 获取管理员详情
        Route::get('detail/:id', 'app\\superadmin\\controller\\Administrator@getDetail');
    });
    
    // 系统信息相关路由
    Route::get('system/info', 'app\\superadmin\\controller\\System@getInfo');
})->middleware(['app\\superadmin\\middleware\\AdminAuth']); 