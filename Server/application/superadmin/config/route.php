<?php
use think\facade\Route;

// 超级管理员认证相关路由
Route::post('auth/login', 'app\\superadmin\\controller\\Auth@login');

// 菜单管理相关路由
Route::group('menu', function () {
    Route::get('tree', 'app\\superadmin\\controller\\Menu@getMenuTree');
    Route::get('list', 'app\\superadmin\\controller\\Menu@getMenuList');
    Route::post('save', 'app\\superadmin\\controller\\Menu@saveMenu');
    Route::delete('delete/:id', 'app\\superadmin\\controller\\Menu@deleteMenu');
    Route::post('status', 'app\\superadmin\\controller\\Menu@updateStatus');
}); 