<?php
use think\facade\Route;

// 超级管理员认证相关路由（不需要鉴权）
Route::post('auth/login', 'app\superadmin\controller\AuthController@login');

// 需要登录认证的路由组
Route::group('', function () {
    // 菜单管理相关路由
    Route::group('menu', function () {
        Route::get('tree', 'app\\superadmin\\controller\\MenuController@getMenuTree');
        Route::get('list', 'app\\superadmin\\controller\\MenuController@getMenuList');
        Route::post('save', 'app\\superadmin\\controller\\MenuController@saveMenu');
        Route::delete('delete/:id', 'app\\superadmin\\controller\\MenuController@deleteMenu');
        Route::post('status', 'app\\superadmin\\controller\\MenuController@updateStatus');
        Route::get('toplevel', 'app\\superadmin\\controller\\MenuController@getTopLevelMenus');
    });
    
    // 管理员相关路由
    Route::group('administrator', function () {
        Route::get('list', 'app\\superadmin\\controller\\AdministratorController@getList');
        Route::get('detail/:id', 'app\\superadmin\\controller\\AdministratorController@getDetail');
        Route::post('update', 'app\\superadmin\\controller\\AdministratorController@updateAdmin');
        Route::post('add', 'app\\superadmin\\controller\\AdministratorController@addAdmin');
        Route::post('delete', 'app\\superadmin\\controller\\AdministratorController@deleteAdmin');
    });

    // 客户池管理路由
    Route::group('trafficPool', function () {
        Route::get('list', 'app\\superadmin\\controller\\TrafficPoolController@getList');       // 获取客户池列表
        Route::get('detail', 'app\\superadmin\\controller\\TrafficPoolController@getDetail');   // 获取客户详情
    });

    // 公司路由
    Route::group('company', function () {
        Route::post('create', 'app\\superadmin\\controller\\CompanyController@create');
    });
})->middleware(['app\\superadmin\\middleware\\AdminAuth']); 