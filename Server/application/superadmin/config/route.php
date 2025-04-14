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
        Route::get('toplevel', 'app\\superadmin\\controller\\Menu@getTopLevelMenus');
    });
    
    // 管理员相关路由
    Route::group('administrator', function () {
        Route::get('list', 'app\\superadmin\\controller\\Administrator@getList');
        Route::get('detail/:id', 'app\\superadmin\\controller\\Administrator@getDetail');
        Route::post('update', 'app\\superadmin\\controller\\Administrator@updateAdmin');
        Route::post('add', 'app\\superadmin\\controller\\Administrator@addAdmin');
        Route::post('delete', 'app\\superadmin\\controller\\Administrator@deleteAdmin');
    });

    // 客户池管理路由
    Route::group('trafficPool', function () {
        Route::get('list', 'app\\superadmin\\controller\\TrafficPool@getList');       // 获取客户池列表
        Route::get('detail', 'app\\superadmin\\controller\\TrafficPool@getDetail');   // 获取客户详情
    });

    // 公司路由
    Route::group('company', function () {
        Route::post('create', 'app\\superadmin\\controller\\Company@create');
    });
})->middleware(['app\\superadmin\\middleware\\AdminAuth']); 