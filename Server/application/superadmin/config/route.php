<?php

use think\facade\Route;

// 超级管理员认证相关路由（不需要鉴权）
Route::post('auth/login', 'app\superadmin\controller\auth\AuthLoginController@index');

// 需要登录认证的路由组
Route::group('', function () {
    // 仪表盘概述
    Route::group('dashboard', function () {
        Route::get('base', 'app\superadmin\controller\dashboard\GetBasestatisticsController@index');
    });

    // 菜单管理相关路由
    Route::group('menu', function () {
        Route::get('tree', 'app\superadmin\controller\MenuController@getMenuTree');
        Route::get('list', 'app\superadmin\controller\MenuController@getMenuList');
        Route::post('save', 'app\superadmin\controller\MenuController@saveMenu');
        Route::delete('delete/:id', 'app\superadmin\controller\MenuController@deleteMenu');
        Route::post('status', 'app\superadmin\controller\MenuController@updateStatus');
        Route::get('toplevel', 'app\superadmin\controller\MenuController@getTopLevelMenus');
    });

    // 管理员相关路由
    Route::group('administrator', function () {
        Route::get('list', 'app\superadmin\controller\administrator\GetAdministratorListController@index');
        Route::get('detail/:id', 'app\superadmin\controller\administrator\GetAdministratorDetailController@index');
        Route::post('update', 'app\superadmin\controller\administrator\UpdateAdministratorController@index');
        Route::post('add', 'app\superadmin\controller\administrator\AddAdministratorController@index');
        Route::post('delete', 'app\superadmin\controller\administrator\DeleteAdministratorController@index');
    });

    // 客户池管理路由
    Route::group('trafficPool', function () {
        Route::get('list', 'app\superadmin\controller\TrafficPoolController@getList');
        Route::get('detail', 'app\superadmin\controller\TrafficPoolController@getDetail');
    });

    // 公司路由
    Route::group('company', function () {
        Route::post('create', 'app\superadmin\controller\company\CreateCompanyController@index');
        Route::post('update', 'app\superadmin\controller\company\UpdateCompanyController@index');
        Route::post('delete', 'app\superadmin\controller\company\DeleteCompanyController@index');
        Route::get('list', 'app\superadmin\controller\company\GetCompanyListController@index');
        Route::get('detail/:id', 'app\superadmin\controller\company\GetCompanyDetailForUpdateController@index');
    });
})->middleware(['app\superadmin\middleware\AdminAuth']);