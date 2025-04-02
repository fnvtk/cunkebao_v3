<?php

use think\facade\Route;

// 定义RESTful风格的API路由
Route::group('v1/cozeai', function () {
      // 工作区管理
      Route::get('workspaceList', 'cozeai/WorkspaceController/list');
      Route::get('botsList', 'cozeai/WorkspaceController/getBotsList');

      // 会话管理
      Route::group('conversation', function () {
        Route::get('list', 'cozeai/ConversationController/list');
        Route::post('create', 'cozeai/ConversationController/create');
    });
});