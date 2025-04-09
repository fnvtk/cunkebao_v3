<?php

namespace app\api\controller;

use app\api\model\WechatMessageModel;
use think\facade\Request;

class MessageController extends BaseController
{

    /**
     * 获取微信好友列表
     * @return \think\response\Json
     */
    public function getFriendsList($pageIndex = '',$pageSize = '',$authorization = '',$isJob = false)
    {
        // 获取授权token
        $authorization = !empty($authorization) ? $authorization : trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'缺少授权信息']);
            }else{
                return errorJson('缺少授权信息');
            }
        }

        $fromTime = $this->request->param('fromTime', date('Y-m-d 00:00:00', strtotime('-1 days')));
        $toTime = $this->request->param('toTime', date('Y-m-d 00:00:00'));

        try {
            // 构建请求参数
            $params = [
                'chatroomKeyword' => $this->request->param('chatroomKeyword', ''),
                'friendKeyword' => $this->request->param('friendKeyword', ''),
                'friendPhoneKeyword' => $this->request->param('friendPhoneKeyword', ''),
                'friendPinYinKeyword' => $this->request->param('friendPinYinKeyword', ''),
                'friendRegionKeyword' => $this->request->param('friendRegionKeyword', ''),
                'friendRemarkKeyword' => $this->request->param('friendRemarkKeyword', ''),
                'groupId' => $this->request->param('groupId', null),
                'kefuId' => $this->request->param('kefuId', null),
                'labels' => $this->request->param('labels', []),
                'msgFrom' => $fromTime,
                'msgKeyword' => $this->request->param('msgKeyword', ''),
                'msgTo' => $toTime,
                'msgType' => $this->request->param('msgType', ''),
                'pageIndex' => !empty($pageIndex) ? $pageIndex : input('pageIndex', 0),
                'pageSize' => !empty($pageSize) ? $pageSize : input('pageSize', 20),
                'reverse' => $this->request->param('reverse', false),
                'type' => $this->request->param('type', 'friend'),
                'wechatAccountIds' => $this->request->param('wechatAccountIds', [])
            ];
      
         
            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求获取好友列表
            $result = requestCurl($this->baseUrl . 'api/WechatFriend/listWechatFriendForMsgPagination', $params, 'POST', $header, 'json');
            $response = handleApiResponse($result);
            
            // 获取同步消息标志
            $syncMessages = $this->request->param('syncMessages', true);
            
            // 如果需要同步消息，则获取每个好友的消息
            if ($syncMessages && !empty($response['results'])) {
                $from =  strtotime($fromTime) * 1000;
                $to =  strtotime($toTime) * 1000;
            

                foreach ($response['results'] as &$friend) {
                    // 构建获取消息的参数
                    $messageParams = [
                        'keyword' => '',
                        'msgType' => '',
                        'accountId' => '',
                        'count' => 100,
                        'messageId' => '',
                        'olderData' => true,
                        'wechatAccountId' => $friend['wechatAccountId'],
                        'wechatFriendId' => $friend['wechatFriendId'],
                        'from' => $from,
                        'to' => $to,
                        'searchFrom' => 'admin'
                    ];
                    
                    // 调用获取消息的接口
                    $messageResult = requestCurl($this->baseUrl . 'api/FriendMessage/searchMessage', $messageParams, 'GET', $header, 'json');
                    $messageResponse = handleApiResponse($messageResult);
                    
                    // 保存消息到数据库
                    if (!empty($messageResponse)) {
                        foreach ($messageResponse as $item) {
                            $this->saveMessage($item);
                        }
                    }
                    
                    // 将消息列表添加到好友数据中
                    $friend['messages'] = $messageResponse ?? [];
                }
                unset($friend);
            }
            if($isJob){
                return json_encode(['code'=>200,'msg'=>'获取好友列表成功','data'=>$response]);
            }else{
                return successJson($response);
            }
        } catch (\Exception $e) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'获取好友列表失败：' . $e->getMessage()]);
            }else{
                return errorJson('获取好友列表失败：' . $e->getMessage());
            }
        }
    }




    /**
     * 保存消息记录到数据库
     * @param array $item 消息记录数据
     */
    private function saveMessage($item)
    {
        // 检查消息是否已存在
        $exists = WechatMessageModel::where('id', $item['id']) ->find();
            
        // 如果消息已存在，直接返回
        if ($exists) {
            return;
        }

        // 将毫秒时间戳转换为秒级时间戳
        $createTime = isset($item['createTime']) ? strtotime($item['createTime']) : null;
        $deleteTime = !empty($item['isDeleted']) ? strtotime($item['deleteTime']) : null;
        $wechatTime = isset($item['wechatTime']) ? floor($item['wechatTime'] / 1000) : null;

        $data = [
            'id' => $item['id'],
            'type' => 1,
            'accountId' => $item['accountId'],
            'content' => $item['content'],
            'createTime' => $createTime,
            'deleteTime' => $deleteTime,
            'isDeleted' => $item['isDeleted'] ?? false,
            'isSend' => $item['isSend'] ?? true,
            'msgId' => $item['msgId'],
            'msgSubType' => $item['msgSubType'] ?? 0,
            'msgSvrId' => $item['msgSvrId'] ?? '',
            'msgType' => $item['msgType'],
            'origin' => $item['origin'] ?? 0,
            'recallId' => $item['recallId'] ?? false,
            'sendStatus' => $item['sendStatus'] ?? 0,
            'synergyAccountId' => $item['synergyAccountId'] ?? 0,
            'tenantId' => $item['tenantId'],
            'wechatAccountId' => $item['wechatAccountId'],
            'wechatFriendId' => $item['wechatFriendId'],
            'wechatTime' => $wechatTime
        ];

        // 创建新记录
        WechatMessageModel::create($data);
    }

    /**
     * 获取微信群聊列表
     * @return \think\response\Json
     */
    public function getChatroomList($pageIndex = '',$pageSize = '',$authorization = '',$isJob = false)
    {
        // 获取授权token
        $authorization = !empty($authorization) ? $authorization : trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'缺少授权信息']);
            }else{
                return errorJson('缺少授权信息');
            }
        }

        $fromTime = $this->request->param('fromTime', date('Y-m-d 00:00:00', strtotime('-1 days')));
        $toTime = $this->request->param('toTime', date('Y-m-d 00:00:00'));

        try {
            // 构建请求参数
            $params = [
                'chatroomKeyword' => $this->request->param('chatroomKeyword', ''),
                'friendKeyword' => $this->request->param('friendKeyword', ''),
                'friendInKeyword' => $this->request->param('friendInKeyword', ''),
                'friendInTimeKeyword' => $this->request->param('friendInTimeKeyword', ''),
                'friendOutKeyword' => $this->request->param('friendOutKeyword', ''),
                'friendRemarkKeyword' => $this->request->param('friendRemarkKeyword', ''),
                'groupId' => $this->request->param('groupId', null),
                'kefuId' => $this->request->param('kefuId', null),
                'labels' => $this->request->param('labels', []),
                'msgFrom' => $fromTime,
                'msgKeyword' => $this->request->param('msgKeyword', ''),
                'msgTo' => $toTime,
                'msgType' => $this->request->param('msgType', ''),
                'pageIndex' => $this->request->param('pageIndex', 0),
                'pageSize' => $this->request->param('pageSize', 100),
                'reverse' => $this->request->param('reverse', false),
                'type' => $this->request->param('type', 'chatroom'),
                'wechatAccountIds' => $this->request->param('wechatAccountIds', [])
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求获取群聊列表
            $result = requestCurl($this->baseUrl . 'api/WechatChatroom/listWechatChatroomForMsgPagination', $params, 'POST', $header, 'json');
            $response = handleApiResponse($result);
            
            // 获取同步消息标志
            $syncMessages = $this->request->param('syncMessages', true);
            
            // 如果需要同步消息，则获取每个群的消息
            if ($syncMessages && !empty($response)) {
                $from =  strtotime($fromTime) * 1000;
                $to =  strtotime($toTime) * 1000;
                foreach ($response['results'] as &$chatroom) {

                    // 构建获取消息的参数
                    $messageParams = [
                        'keyword' => '',
                        'msgType' =>'',
                        'accountId' => '',
                        'count' => 100,
                        'messageId' => '',
                        'olderData' => true,
                        'wechatId' => '',
                        'wechatAccountId' => $chatroom['wechatAccountId'],
                        'wechatChatroomId' => $chatroom['wechatChatroomId'],
                        'from' => $from,
                        'to' => $to,
                        'searchFrom' => 'admin'
                    ];
                 
                    // 调用获取消息的接口
                    $messageResult = requestCurl($this->baseUrl . 'api/ChatroomMessage/searchMessage', $messageParams, 'GET', $header, 'json');
                    $messageResponse = handleApiResponse($messageResult);
                    
                    // 保存消息到数据库
                    if (!empty($messageResponse)) {
                        foreach ($messageResponse as $item) {
                            $this->saveChatroomMessage($item);
                        }
                    }
                    
                    // 将消息列表添加到群聊数据中
                    $chatroom['messages'] = $messageResponse ?? [];
                }
                unset($chatroom);
            }
            if($isJob){
                return json_encode(['code'=>200,'msg'=>'获取群聊列表成功','data'=>$response]);
            }else{
                return successJson($response);
            }
        } catch (\Exception $e) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'获取群聊列表失败：' . $e->getMessage()]);
            }else{
                return errorJson('获取群聊列表失败：' . $e->getMessage());
            }
        }
    }


  

    /**
     * 保存群聊消息记录到数据库
     * @param array $item 消息记录数据
     */
    private function saveChatroomMessage($item)
    {
        

        // 检查消息是否已存在
        $exists = WechatMessageModel::where('id', $item['id']) ->find();
                    
        // 如果消息已存在，直接返回
        if ($exists) {
            return;
        }

        // 处理发送者信息
        $sender = $item['sender'] ?? [];
        
        // 处理消息内容，提取真正的消息内容
        $originalContent = $item['content'] ?? '';
        $processedContent = $this->processMessageContent($originalContent);

        // 将毫秒时间戳转换为秒级时间戳
        $createTime = isset($item['createTime']) ? strtotime($item['createTime']) : null;
        $deleteTime = !empty($item['isDeleted']) ? strtotime($item['deleteTime']) : null;
        $wechatTime = isset($item['wechatTime']) ? floor($item['wechatTime'] / 1000) : null;

        $data = [
            'id' => $item['id'],
            'type' => 2,
            'wechatChatroomId' => $item['wechatChatroomId'],
            // sender信息，添加sender前缀
            'senderNickname' => $sender['nickname'] ?? '',
            'senderWechatId' => $sender['wechatId'] ?? '',
            'senderIsAdmin' => $sender['isAdmin'] ?? false,
            'senderIsDeleted' => $sender['isDeleted'] ?? false,
            'senderChatroomNickname' => $sender['chatroomNickname'] ?? '',
            'senderWechatAccountId' => $sender['wechatAccountId'] ?? '',
            // 其他字段
            'wechatAccountId' => $item['wechatAccountId'],
            'tenantId' => $item['tenantId'],
            'accountId' => $item['accountId'],
            'synergyAccountId' => $item['synergyAccountId'] ?? 0,
            'content' => $processedContent, // 使用处理后的内容
            'originalContent' => $originalContent, // 保存原始内容
            'msgType' => $item['msgType'],
            'msgSubType' => $item['msgSubType'] ?? 0,
            'msgSvrId' => $item['msgSvrId'] ?? '',
            'isSend' => $item['isSend'] ?? true,
            'createTime' => $createTime,
            'isDeleted' => $item['isDeleted'] ?? false,
            'deleteTime' => $deleteTime,
            'sendStatus' => $item['sendStatus'] ?? 0,
            'wechatTime' => $wechatTime,
            'origin' => $item['origin'] ?? 0,
            'msgId' => $item['msgId'],
            'recallId' => $item['recallId'] ?? false
        ];

        // 创建新记录
        WechatMessageModel::create($data);
    }

    /**
     * 处理消息内容，提取真正的消息内容
     * @param string $content 原始内容
     * @return string 处理后的内容
     */
    private function processMessageContent($content)
    {
        if (empty($content)) {
            return '';
        }

        // 处理普通消息格式：wxid_vr2qafb1vg0d22:\n安德玛儿童
        if (preg_match('/^[^:]+:\n(.+)$/s', $content, $matches)) {
            return trim($matches[1]);
        }
        
        // 如果没有匹配到格式，则返回原始内容
        return $content;
    }


      /**
     * 用户聊天记录
     * @return \think\response\Json
     */
    public function getMessageList()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 构建请求参数
            $params = [
                'keyword' => $this->request->param('keyword', ''),
                'msgType' => $this->request->param('msgType', ''),
                'accountId' => $this->request->param('accountId', ''),
                'count' => $this->request->param('count', 100),
                'messageId' => $this->request->param('messageId', ''),
                'olderData' => $this->request->param('olderData', true),
                'wechatAccountId' => $this->request->param('wechatAccountId', ''),
                'wechatFriendId' => $this->request->param('wechatFriendId', ''),
                'from' => $this->request->param('from', ''),
                'to' => $this->request->param('to', ''),
                'searchFrom' => $this->request->param('searchFrom', 'admin')
            ];

            // 参数验证
            if (empty($params['wechatAccountId'])) {
                return errorJson('微信账号ID不能为空');
            }
            if (empty($params['wechatFriendId'])) {
                return errorJson('好友ID不能为空');
            }

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求获取聊天记录
            $result = requestCurl($this->baseUrl . 'api/FriendMessage/searchMessage', $params, 'GET', $header, 'json');
            $response = handleApiResponse($result);

            // 保存数据到数据库
            if (!empty($response)) {
                foreach ($response as $item) {
                    $this->saveMessage($item);
                }
            }

            return successJson($response);
        } catch (\Exception $e) {
            return errorJson('获取聊天记录失败：' . $e->getMessage());
        }
    }



    /**
     * 获取群聊消息列表
     * @return \think\response\Json
     */
    public function getChatroomMessages()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 构建请求参数
            $params = [
                'keyword' => $this->request->param('keyword', ''),
                'msgType' => $this->request->param('msgType', ''),
                'accountId' => $this->request->param('accountId', ''),
                'count' => $this->request->param('count', 100),
                'messageId' => $this->request->param('messageId', ''),
                'olderData' => $this->request->param('olderData', true),
                'wechatId' => $this->request->param('wechatId', ''),
                'wechatAccountId' => $this->request->param('wechatAccountId', ''),
                'wechatChatroomId' => $this->request->param('wechatChatroomId', ''),
                'from' => $this->request->param('from', strtotime(date('Y-m-d 00:00:00', strtotime('-1 days')))),
                'to' => $this->request->param('to', strtotime(date('Y-m-d 00:00:00'))),
                'searchFrom' => $this->request->param('searchFrom', 'admin')
            ];

            // 参数验证
            if (empty($params['wechatAccountId'])) {
                return errorJson('微信账号ID不能为空');
            }
            if (empty($params['wechatChatroomId'])) {
                return errorJson('群聊ID不能为空');
            }

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求获取群聊消息
            $result = requestCurl($this->baseUrl . 'api/ChatroomMessage/searchMessage', $params, 'GET', $header, 'json');
            $response = handleApiResponse($result);

            // 保存数据到数据库
            if (!empty($response)) {
                foreach ($response as $item) {
                   $res = $this->saveChatroomMessage($item);
                   if(!$res){
                    return errorJson('保存群聊消息失败');
                   }
                }
            }

            return successJson($response);
        } catch (\Exception $e) {
            return errorJson('获取群聊消息失败：' . $e->getMessage());
        }
    }

} 