<?php
// +----------------------------------------------------------------------
// | 设备管理模块路由配置
// +----------------------------------------------------------------------

use think\facade\Route;

// 定义RESTful风格的API路由
Route::group('v1/', function () {
    // 设备管理相关
    Route::group('devices', function () {
        Route::get('add-results', 'app\cunkebao\controller\device\GetAddResultedV1Controller@index');
        Route::get(':id/related-accounts', 'app\cunkebao\controller\device\GetRelatedAccountsV1Controller@index');
        Route::get(':id/handle-logs', 'app\cunkebao\controller\device\GetDeviceHandleLogsV1Controller@index');
        Route::get('', 'app\cunkebao\controller\device\GetDeviceListV1Controller@index');
        Route::get(':id', 'app\cunkebao\controller\device\GetDeviceDetailV1Controller@index');
        Route::post('', 'app\cunkebao\controller\device\PostAddDeviceV1Controller@index');
        Route::put('refresh', 'app\cunkebao\controller\device\RefreshDeviceDetailV1Controller@index');
        Route::delete(':id', 'app\cunkebao\controller\device\DeleteDeviceV1Controller@index');
        Route::post('task-config', 'app\cunkebao\controller\device\UpdateDeviceTaskConfigV1Controller@index');
    });

    // 设备微信相关
    Route::group('wechats', function () {
        Route::get('', 'app\cunkebao\controller\wechat\GetWechatsOnDevicesV1Controller@index');
        Route::get(':id/summary', 'app\cunkebao\controller\wechat\GetWechatOnDeviceSummarizeV1Controller@index');
        Route::get(':id/friends', 'app\cunkebao\controller\wechat\GetWechatOnDeviceFriendsV1Controller@index');
        Route::get(':id/friend/:aId', 'app\cunkebao\controller\wechat\GetWechatOnDeviceFriendProfileV1Controller@index');

        Route::get('count', 'app\cunkebao\controller\DeviceWechat@count');
        Route::get('device-count', 'app\cunkebao\controller\DeviceWechat@deviceCount'); // 获取有登录微信的设备数量
        Route::put('refresh', 'app\cunkebao\controller\DeviceWechat@refresh');  // 刷新设备微信状态
        Route::post('transfer-friends', 'app\cunkebao\controller\DeviceWechat@transferFriends'); // 微信好友转移
    });

    // 获客场景相关
    Route::group('plan/scenes', function () {
        Route::get('', 'app\cunkebao\controller\Scene@index');           // 获取场景列表
        Route::post('create', 'app\cunkebao\controller\Plan@index');     // 获取场景列表
    });

    // 流量池相关
    Route::group('traffic/pool', function () {
        Route::get('', 'app\cunkebao\controller\traffic\GetPotentialListWithInCompanyV1Controller@index');
        Route::get('types', 'app\cunkebao\controller\traffic\GetPotentialTypeSectionV1Controller@index');
        Route::get('sources', 'app\cunkebao\controller\traffic\GetTrafficSourceSectionV1Controller@index');
    });

    // 工作台相关
    Route::group('workbench', function () {
        Route::post('create', 'app\cunkebao\controller\WorkbenchController@create'); // 创建工作台
        Route::get('list', 'app\cunkebao\controller\WorkbenchController@getList'); // 获取工作台列表
        Route::post('update-status', 'app\cunkebao\controller\WorkbenchController@updateStatus'); // 更新工作台状态
        Route::delete('delete', 'app\cunkebao\controller\WorkbenchController@delete'); // 删除工作台
        Route::post('copy', 'app\cunkebao\controller\WorkbenchController@copy'); // 拷贝工作台
        Route::get('detail', 'app\cunkebao\controller\WorkbenchController@detail'); // 获取工作台详情
        Route::post('update', 'app\cunkebao\controller\WorkbenchController@update'); // 更新工作台
    });

    // 内容库相关
    Route::group('content/library', function () {
        Route::post('create', 'app\cunkebao\controller\ContentLibraryController@create'); // 创建内容库
        Route::get('list', 'app\cunkebao\controller\ContentLibraryController@getList'); // 获取内容库列表
        Route::post('update', 'app\cunkebao\controller\ContentLibraryController@update'); // 更新内容库
        Route::delete('delete', 'app\cunkebao\controller\ContentLibraryController@delete'); // 删除内容库
        Route::get('detail', 'app\cunkebao\controller\ContentLibraryController@detail'); // 获取内容库详情
        Route::get('collectMoments', 'app\cunkebao\controller\ContentLibraryController@collectMoments'); // 采集朋友圈
        Route::get('item-list', 'app\cunkebao\controller\ContentLibraryController@getItemList'); // 获取内容库素材列表
        Route::post('add-item', 'app\cunkebao\controller\ContentLibraryController@addItem'); // 添加内容库素材
        Route::delete('delete-item', 'app\cunkebao\controller\ContentLibraryController@deleteItem'); // 删除内容库素材
        Route::get('get-item-detail', 'app\cunkebao\controller\ContentLibraryController@getItemDetail'); // 获取内容库素材详情
    });

    // 好友相关
    Route::group('friend', function () {
        Route::get('', 'app\cunkebao\controller\friend\GetFriendListV1Controller@index'); // 获取好友列表
    });

    //群相关
    Route::group('chatroom', function () {
        Route::get('', 'app\cunkebao\controller\chatroom\GetChatroomListV1Controller@index'); // 获取群列表
        Route::get('getMemberList', 'app\cunkebao\controller\chatroom\GetChatroomListV1Controller@getMemberList'); // 获取群详情
        
    });

    // 计划任务相关路由
    Route::group('plan', function () {
        // 添加计划任务
        Route::post('add', 'app\cunkebao\controller\Plan@index');
        // 获取计划任务列表
        Route::get('list', 'app\cunkebao\controller\Plan@getList');
    });

})->middleware(['jwt']);

return [];