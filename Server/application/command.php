<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2016 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: yunwuxin <448901948@qq.com>
// +----------------------------------------------------------------------

return [
    'device:list' => 'app\command\DeviceListCommand', // 设备列表 √
    'wechatFriends:list' => 'app\command\WechatFriendCommand', // 微信好友列表 √
    'wechatChatroom:list' => 'app\command\WechatChatroomCommand', // 微信群列表 √
    'friendTask:list' => 'app\command\FriendTaskCommand', // 添加好友任务列表 √
    'wechatList:list' => 'app\command\WechatListCommand', // 微信客服列表 √
    'account:list' => 'app\command\AccountListCommand', // 公司账号列表 √
    'message:friendsList' => 'app\command\MessageFriendsListCommand', // 微信好友消息列表 √ 
    'message:chatroomList' => 'app\command\MessageChatroomListCommand', // 微信群聊消息列表 √
    'department:list' => 'app\command\DepartmentListCommand', // 部门列表 √
    'content:sync' => 'app\command\SyncContentCommand', // 同步内容库 √
    'groupFriends:list' => 'app\command\GroupFriendsCommand', // 微信群好友列表
    // 'allotFriends:run' => 'app\command\AllotFriendCommand', // 自动分配微信好友
    // 'allotChatroom:run' => 'app\command\AllotChatroomCommand', // 自动分配微信群聊
    'allotrule:list' => 'app\command\AllotRuleListCommand', // 分配规则列表 √
    'allotrule:autocreate' => 'app\command\AutoCreateAllotRulesCommand', // 自动创建分配规则 √
    'content:collect' => 'app\command\ContentCollectCommand', // 内容采集任务 √
    'moments:collect' => 'app\command\WechatMomentsCommand', // 朋友圈采集任务
    'workbench:autoLike' => 'app\command\WorkbenchAutoLikeCommand', // 工作台自动点赞任务
    'workbench:moments' => 'app\command\WorkbenchMomentsCommand', // 工作台朋友圈同步任务
    'sync:wechatData' => 'app\command\SyncWechatDataToCkbTask', // 同步微信数据到存客宝
    'sync:allFriends' => 'app\command\SyncAllFriendsCommand', // 同步所有在线好友
    'workbench:trafficDistribute' => 'app\command\WorkbenchTrafficDistributeCommand', // 工作台流量分发任务
];
