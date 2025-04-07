<?php
// +----------------------------------------------------------------------
// | 获客计划模块路由
// +----------------------------------------------------------------------

use think\facade\Route;

// API路由组
Route::group('api/plan', function () {
    // 任务相关路由
    Route::resource('tasks', 'plan/Task');
    Route::get('tasks/:id/execute', 'plan/Task/execute');
    Route::get('tasks/:id/start', 'plan/Task/start');
    Route::get('tasks/:id/stop', 'plan/Task/stop');
    Route::get('cron', 'plan/Task/cron');
    
    // 流量相关路由
    Route::resource('traffic', 'plan/Traffic');
    Route::get('traffic/stats', 'plan/Traffic/sourceStats');
    Route::post('traffic/import', 'plan/Traffic/importTraffic');
    Route::post('traffic/external', 'plan/Traffic/handleExternalTraffic');
    
    // 标签相关路由
    Route::resource('tags', 'plan/Tag');
    Route::post('tags/batch', 'plan/Tag/batchCreate');
    Route::get('tags/names', 'plan/Tag/getNames');
});

// 返回空数组，避免路由注册冲突
return []; 