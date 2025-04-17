<?php


namespace app\api\controller;


use think\cache\driver\Redis;
use think\Db;
use think\Log;
use WebSocket\Client;

class WebSocketController extends BaseController
{
    protected $authorized;
    protected $accountId;
    protected $client;

    public function __construct()
    {
        parent::__construct();
        $this->authorized = $this->request->header('authorization', $this->authorization);
        $this->accountId = $this->request->param('accountId', '');
        if (empty($this->authorized) || empty($this->accountId)) {
            $data['authorized'] = $this->authorized;
            $data['accountId'] = $this->accountId;
            $this->error('缺失关键参数', $data);
        }

        //证书
        $context = stream_context_create();
        stream_context_set_option($context, 'ssl', 'verify_peer', false);
        stream_context_set_option($context, 'ssl', 'verify_peer_name', false);
        //开启WS链接
        $result = [
            "accessToken" => $this->authorized,
            "accountId" => $this->accountId,
            "client" => "kefu-client",
            "cmdType" => "CmdSignIn",
            "seq" => 1,
        ];
        $content = json_encode($result);
        $this->client = new Client("wss://kf.quwanzhi.com:9993",
            [
                'filter' => ['text', 'binary', 'ping', 'pong', 'close','receive', 'send'],
                'context' => $context,
                'headers' => [
                    'Sec-WebSocket-Protocol' => 'soap',
                    'origin' => 'localhost',
                ],
                'timeout' => 86400,
            ]
        );
        $this->client->send($content);
    }


   /**
     * 朋友圈点赞
     */
    public function momentInteract()
    {
        if ($this->request->isPost()) {
            $data = $this->request->param();

            if (empty($data)) {
                $this->error('参数缺失');
            }
            $dataArray = $data;
            if (!is_array($dataArray)) {
                $this->error('数据格式错误');
            }

            //过滤消息
            if (empty($dataArray['snsId'])) {
                $this->error('snsId不能为空');
            }
            if (empty($dataArray['wechatAccountId'])) {
                $this->error('微信id不能为空');
            }
            
            
            $result = [
                "cmdType" => "CmdMomentInteract",
                "momentInteractType" => 1,
                "seq" => time(),
                "snsId" => $dataArray['snsId'],
                "wechatAccountId" => $dataArray['wechatAccountId'],
                "wechatFriendId" => 0,
            ];

            $result = json_encode($result);
            $this->client->send($result);
            $message = $this->client->receive();
            $message = json_decode($message, 1);
            //关闭WS链接
            $this->client->close();
            //Log::write('WS个人消息发送');
            successJson($message, '点赞成功');
        } else {
            errorJson('非法请求');
        }
    }


      /**
     * 朋友圈取消点赞
     */
    public function momentCancelInteract()
    {
        if ($this->request->isPost()) {
            $data = $this->request->param();

            if (empty($data)) {
                $this->error('参数缺失');
            }
            $dataArray = $data;
            if (!is_array($dataArray)) {
                $this->error('数据格式错误');
            }

            //过滤消息
            if (empty($dataArray['snsId'])) {
                $this->error('snsId不能为空');
            }
            if (empty($dataArray['wechatAccountId'])) {
                $this->error('微信id不能为空');
            }
            
            
            $result = [
                "CommentId2" => '',
                "CommentTime" => 0,
                "cmdType" => "CmdMomentCancelInteract",
                "optType" => 1,
                "seq" => time(),
                "snsId" => $dataArray['snsId'],
                "wechatAccountId" => $dataArray['wechatAccountId'],
                "wechatFriendId" => 0,
            ];

            $result = json_encode($result);
            $this->client->send($result);
            $message = $this->client->receive();
            $message = json_decode($message, 1);
            //关闭WS链接
            $this->client->close();
            //Log::write('WS个人消息发送');
            successJson($message, '取消点赞成功');
        } else {
            errorJson('非法请求');
        }
    }







    /**
     * 个人消息发送
     */
    public function sendPersonal()
    {
        if ($this->request->isPost()) {
            $data = $this->request->param();

            if (empty($data)) {
                $this->error('参数缺失');
            }
            $dataArray = $data;
            if (!is_array($dataArray)) {
                $this->error('数据格式错误');
            }

            //过滤消息
            if (empty($dataArray['content'])) {
                $this->error('内容缺失');
            }
            if (empty($dataArray['wechatAccountId'])) {
                $this->error('微信id不能为空');
            }
            if (empty($dataArray['wechatFriendId'])) {
                $this->error('接收人不能为空');
            }

            if (empty($dataArray['msgType'])) {
                $this->error('类型缺失');
            }

            //消息拼接  msgType(1:文本 3:图片 43:视频 47:动图表情包 49:小程序)
            $result = [
                "cmdType" => "CmdSendMessage",
                "content" => $dataArray['content'],
                "msgSubType" => 0,
                "msgType" => $dataArray['msgType'],
                "seq" => time(),
                "wechatAccountId" => $dataArray['wechatAccountId'],
                "wechatChatroomId" => 0,
                "wechatFriendId" => $dataArray['wechatFriendId'],
            ];

            $result = json_encode($result);
            $this->client->send($result);
            $message = $this->client->receive();
            $message = json_decode($message, 1);
            //关闭WS链接
            $this->client->close();
            //Log::write('WS个人消息发送');
            successJson($message, '消息成功发送');
        } else {
            errorJson('非法请求');
        }
    }


    /**
     * 发送群消息
     */
    public function sendCommunity()
    {
        if ($this->request->isPost()) {
            $data = $this->request->post();
            if (empty($data)) {
                $this->error('参数缺失');
            }
            $dataArray = $data;
            if (!is_array($dataArray)) {
                $this->error('数据格式错误');
            }

            //过滤消息
            if (empty($dataArray['content'])) {
                $this->error('内容缺失');
            }
            if (empty($dataArray['wechatAccountId'])) {
                $this->error('微信id不能为空');
            }

            if (empty($dataArray['msgType'])) {
                $this->error('类型缺失');
            }
            if (empty($dataArray['wechatChatroomId'])) {
                $this->error('群id不能为空');
            }

            $msg = '消息成功发送';
            $message = [];
            try {
                //消息拼接  msgType(1:文本 3:图片 43:视频 47:动图表情包 49:小程序)
                $result = [
                    "cmdType" => "CmdSendMessage",
                    "content" => htmlspecialchars_decode($dataArray['content']),
                    "msgSubType" => 0,
                    "msgType" => $dataArray['msgType'],
                    "seq" => time(),
                    "wechatAccountId" => $dataArray['wechatAccountId'],
                    "wechatChatroomId" => $dataArray['wechatChatroomId'],
                    "wechatFriendId" => 0,
                ];

                $result = json_encode($result);
                $this->client->send($result);
                $message = $this->client->receive();
                //关闭WS链接
                $this->client->close();
                //Log::write('WS群消息发送');
                //Log::write($message);
                $message = json_decode($message, 1);
            } catch (\Exception $e) {
                $msg = $e->getMessage();
            }
            successJson($message,$msg);

        } else {
            errorJson('非法请求');
        }
    }


    /**
     * 发送群消息
     */
    public function sendCommunitys($data = [])
    {

        if (empty($data)) {
            $this->error('参数缺失');
        }
        $dataArray = $data;
        if (!is_array($dataArray)) {
            $this->error('数据格式错误');
        }

        //过滤消息
        if (empty($dataArray['content'])) {
            $this->error('内容缺失');
        }
        if (empty($dataArray['wechatAccountId'])) {
            $this->error('微信id不能为空');
        }

        if (empty($dataArray['msgType'])) {
            $this->error('类型缺失');
        }
        if (empty($dataArray['wechatChatroomId'])) {
            $this->error('群id不能为空');
        }

        $msg = '消息成功发送';
        $message = [];
        try {
            //消息拼接  msgType(1:文本 3:图片 43:视频 47:动图表情包 49:小程序)
            $result = [
                "cmdType" => "CmdSendMessage",
                "content" => $dataArray['content'],
                "msgSubType" => 0,
                "msgType" => $dataArray['msgType'],
                "seq" => time(),
                "wechatAccountId" => $dataArray['wechatAccountId'],
                "wechatChatroomId" => $dataArray['wechatChatroomId'],
                "wechatFriendId" => 0,
            ];

            $result = json_encode($result);
            $this->client->send($result);
            $message = $this->client->receive();
            //关闭WS链接
            $this->client->close();
            //Log::write('WS群消息发送');
            //Log::write($message);
            $message = json_decode($message, 1);
        } catch (\Exception $e) {
            $msg = $e->getMessage();
        }

        successJson($message,$msg);
    }


    /**
     * 获取指定账号朋友圈信息
     */
    public function getMoments()
    {
        if ($this->request->isPost()) {
            $data = $this->request->param();

            if (empty($data)) {
                $this->error('参数缺失');
            }
            $dataArray = $data;
            if (!is_array($dataArray)) {
                $this->error('数据格式错误');
            }
            //获取数据条数
            $count = isset($dataArray['count']) ? $dataArray['count'] : 5;
            //过滤消息
            if (empty($dataArray['wechatAccountId'])) {
                $this->error('指定账号不能为空');
            }
            if (empty($dataArray['wechatFriendId'])) {
                $this->error('指定好友不能为空');
            }
            $msg = '获取朋友圈信息成功';
            $message = [];
            try {
                $params = [
                    "cmdType" => "CmdFetchMoment",
                    "count" => $count,
                    "createTimeSec" => time(),
                    "isTimeline" => false,
                    "prevSnsId" => 0,
                    "wechatAccountId" => $dataArray['wechatAccountId'],
                    "wechatFriendId" => $dataArray['wechatFriendId'],
                    "seq" => time(),
                ];
                $params = json_encode($params);
                //Log::write('WS获取朋友圈信息参数：' . json_encode($params, 256));
                $this->client->send($params);
                $message = $this->client->receive();
                //Log::write('WS获取朋友圈信息成功，结果：' . $message);
                $message = json_decode($message, 1);
                
                // 存储朋友圈数据到数据库
                if (isset($message['momentList']) && !empty($message['momentList'])) {
                    $this->saveMomentsToDatabase($message['momentList'], $dataArray['wechatAccountId'], $dataArray['wechatFriendId']);
                }
                
                //关闭WS链接
                $this->client->close();
            } catch (\Exception $e) {
                $msg = $e->getMessage();
            }

            successJson($message,$msg);
        } else {
            errorJson('非法请求');
        }
    }

    /**
     * 保存朋友圈数据到数据库
     * @param array $momentList 朋友圈数据列表
     * @param int $wechatAccountId 微信账号ID
     * @param string $wechatFriendId 微信好友ID
     * @return bool
     */
    protected function saveMomentsToDatabase($momentList, $wechatAccountId, $wechatFriendId)
    {
        if (empty($momentList) || !is_array($momentList)) {
            return false;
        }
        
        try {
            foreach ($momentList as $moment) {
                // 提取momentEntity中的数据
                $momentEntity = $moment['momentEntity'] ?? [];
                
                // 检查朋友圈数据是否已存在
                $exists = Db::table('s2_wechat_moments')
                    ->where('snsId', $moment['snsId'])
                    ->where('wechatAccountId', $wechatAccountId)
                    ->find();
                    
                $dataToSave = [
                    'commentList' => json_encode($moment['commentList'] ?? [], JSON_UNESCAPED_UNICODE),
                    'createTime' => $moment['createTime'] ?? 0,
                    'likeList' => json_encode($moment['likeList'] ?? [], JSON_UNESCAPED_UNICODE),
                    'content' => $momentEntity['content'] ?? '',
                    'lat' => $momentEntity['lat'] ?? 0,
                    'lng' => $momentEntity['lng'] ?? 0,
                    'location' => $momentEntity['location'] ?? '',
                    'picSize' => $momentEntity['picSize'] ?? 0,
                    'resUrls' => json_encode($momentEntity['resUrls'] ?? [], JSON_UNESCAPED_UNICODE),
                    'userName' => $momentEntity['userName'] ?? '',
                    'snsId' => $moment['snsId'] ?? '',
                    'type' => $moment['type'] ?? 0,
                    'update_time' => time()
                ];
                    
                if ($exists) {
                    // 如果已存在，则更新数据
                    Db::table('s2_wechat_moments')->where('id', $exists['id'])->update($dataToSave);
                } else {
                    // 如果不存在，则插入新数据
                    $dataToSave['wechatAccountId'] = $wechatAccountId;
                    $dataToSave['wechatFriendId'] = $wechatFriendId;
                    $dataToSave['create_time'] = time();
                    Db::table('s2_wechat_moments')->insert($dataToSave);
                }
            }
            
            //Log::write('朋友圈数据已存入数据库，共' . count($momentList) . '条');
            return true;
        } catch (\Exception $e) {
            //Log::write('保存朋友圈数据失败：' . $e->getMessage(), 'error');
            return false;
        }
    }

    /**
     * 获取指定账号朋友圈图片地址
     */
    public function getMomentSourceRealUrl()
    {
        if ($this->request->isPost()) {
            $data = $this->request->param();

            if (empty($data)) {
                $this->error('参数缺失');
            }
            $dataArray = $data;
            if (!is_array($dataArray)) {
                $this->error('数据格式错误');
            }
            //获取数据条数
//            $count = isset($dataArray['count']) ? $dataArray['count'] : 10;
            //过滤消息
            if (empty($dataArray['wechatAccountId'])) {
                $this->error('指定账号不能为空');
            }
            if (empty($dataArray['snsId'])) {
                $this->error('指定消息ID不能为空');
            }
            if (empty($dataArray['snsUrls'])) {
                $this->error('资源信息不能为空');
            }
            $msg = '获取朋友圈资源链接成功';
            $message = [];
            try {
                $params = [
                    "cmdType" => $dataArray['type'],
                    "snsId" => $dataArray['snsId'],
                    "urls" => $dataArray['snsUrls'],
                    "wechatAccountId" => $dataArray['wechatAccountId'],
                    "seq" => time(),
                ];
                $params = json_encode($params);
                $this->client->send($params);
                $message = $this->client->receive();
                //Log::write('WS获取朋友圈图片/视频链接成功，结果：' . json_encode($message, 256));
                //关闭WS链接
                $this->client->close();
            } catch (\Exception $e) {
                $msg = $e->getMessage();
            }

            successJson($message,$msg);
        } else {
            errorJson('非法请求');
        }
    }
}