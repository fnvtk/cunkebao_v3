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
];
