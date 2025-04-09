<?php
use think\facade\Route;

// 超级管理员认证相关路由
Route::post('auth/login', 'app\\superadmin\\controller\\Auth@login');

// 菜单管理相关路由
Route::group('menu', function () {
    Route::get('tree', 'app\\superadmin\\controller\\Menu@getMenuTree');
    Route::get('list', 'app\\superadmin\\controller\\Menu@getMenuList');
});

// 管理员相关路由
Route::group('administrator', function () {
    // 获取管理员列表
    Route::get('list', 'app\\superadmin\\controller\\Administrator@getList');
    // 获取管理员详情
    Route::get('detail/:id', 'app\\superadmin\\controller\\Administrator@getDetail');
}); 