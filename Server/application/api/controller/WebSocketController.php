<?php


namespace app\api\controller;


use think\cache\driver\Redis;
use think\Db;
use think\facade\Log;
use WebSocket\Client;
use think\facade\Env;
use app\api\model\WechatFriendModel as WechatFriend; 
use app\api\model\WechatMomentsModel as WechatMoments;
use think\facade\Cache;



class WebSocketController extends BaseController
{
    protected $authorized;
    protected $accountId;
    protected $client;
    protected $isConnected = false;
    protected $lastHeartbeatTime = 0;
    protected $heartbeatInterval = 30; // 心跳间隔，单位秒

    /************************************
     * 初始化相关功能
     ************************************/
     
    /**
     * 构造函数 - 初始化WebSocket连接
     * @param array $userData 用户数据
     */
    public function __construct($userData = [])
    {
        parent::__construct();
        $this->initConnection($userData);
    }

    /**
     * 初始化WebSocket连接
     * @param array $userData 用户数据
     */
    protected function initConnection($userData = [])
    {
        if(!empty($userData) && count($userData)){
            if (empty($userData['userName']) || empty($userData['password'])) {
                return json_encode(['code'=>400,'msg'=>'参数缺失']);
            }

            // 检查缓存中是否存在有效的token
            $cacheKey = 'websocket_token_' . $userData['userName'];
            $cachedToken =  Cache::get($cacheKey);
            
            if ($cachedToken) {
                $this->authorized = $cachedToken;
                $this->accountId = $userData['accountId'];
            } else {
            $params = [
                'grant_type' => 'password',
                'username' => $userData['userName'],
                'password' => $userData['password']
            ];
            
            // 调用登录接口获取token
                $headerData = ['client:kefu-client'];
            $header = setHeader($headerData, '', 'plain');
                $result = requestCurl('https://kf.quwanzhi.com:9991/token', $params, 'POST', $header);
            $result_array = handleApiResponse($result);

            if (isset($result_array['access_token']) && !empty($result_array['access_token'])) {
                    $this->authorized = $result_array['access_token'];
                $this->accountId = $userData['accountId'];
               
                    // 将token存入缓存，有效期5分钟
                    Cache::set($cacheKey, $this->authorized, 300);
            } else {
                    return json_encode(['code'=>400,'msg'=>'获取系统授权信息失败']);
                }
            }
        } else {
            $this->authorized = $this->request->header('authorization', '');
            $this->accountId = $this->request->param('accountId', '');
        }

        if (empty($this->authorized) || empty($this->accountId)) {
            return json_encode(['code'=>400,'msg'=>'缺失关键参数']);
        }

        $this->connect();
    }

    /**
     * 建立WebSocket连接
     */
    protected function connect()
    {
        try {
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
            $this->isConnected = true;
            $this->lastHeartbeatTime = time();
            
            // 启动心跳检测
            //$this->startHeartbeat();
            
        } catch (\Exception $e) {
            Log::error("WebSocket连接失败：" . $e->getMessage());
            $this->isConnected = false;
        }
    }

    /**
     * 启动心跳检测
     */
    protected function startHeartbeat()
    {
        // 使用定时器发送心跳
        \Swoole\Timer::tick($this->heartbeatInterval * 1000, function() {
            if ($this->isConnected) {
                $this->sendHeartbeat();
            }
        });
    }

    /**
     * 发送心跳包
     */
    protected function sendHeartbeat()
    {
        try {
            $heartbeat = [
                "cmdType" => "CmdHeartbeat",
                "seq" => time()
            ];
            
            $this->client->send(json_encode($heartbeat));
            $this->lastHeartbeatTime = time();
            
        } catch (\Exception $e) {
            Log::error("发送心跳包失败：" . $e->getMessage());
            $this->reconnect();
        }
    }

    /**
     * 重连机制
     */
    protected function reconnect()
    {
        try {
            if ($this->client) {
                $this->client->close();
            }
            $this->isConnected = false;
            $this->connect();
        } catch (\Exception $e) {
            Log::error("WebSocket重连失败：" . $e->getMessage());
        }
    }

    /**
     * 检查连接状态
     */
    protected function checkConnection()
    {
        if (!$this->isConnected || (time() - $this->lastHeartbeatTime) > $this->heartbeatInterval * 2) {
            $this->reconnect();
        }
    }

    /**
     * 发送消息
     * @param array $data 消息数据
     * @return array
     */
    protected function sendMessage($data)
    {
        $this->checkConnection();
        
        try {
            $this->client->send(json_encode($data));
            $response = $this->client->receive();
            return json_decode($response, true);
        } catch (\Exception $e) {
            Log::error("发送消息失败：" . $e->getMessage());
            $this->reconnect();
            return ['code' => 500, 'msg' => '发送消息失败'];
        }
    }

    /************************************
     * 朋友圈相关功能
     ************************************/

    /**
     * 获取指定账号朋友圈信息
     * @param array $data 请求参数
     * @return \think\response\Json
     */
    public function getMoments($data = [])
    {
        $count = !empty($data['count']) ? $data['count'] : 10;
        $wechatAccountId = !empty($data['wechatAccountId']) ? $data['wechatAccountId'] : '';
        $wechatFriendId = !empty($data['wechatFriendId']) ? $data['wechatFriendId'] : 0;
        $prevSnsId = !empty($data['prevSnsId']) ? $data['prevSnsId'] : 0;
        $maxPages = 1; // 最大页数限制为20
        $currentPage = 1; // 当前页码
        $allMoments = []; // 存储所有朋友圈数据

            //过滤消息
        if (empty($wechatAccountId)) {
            return json_encode(['code'=>400,'msg'=>'指定账号不能为空']);
        }

        try {
            do {
                $params = [
                    "cmdType" => "CmdFetchMoment",
                    "count" => $count,
                    "createTimeSec" => time(),
                    "isTimeline" => false,
                    "prevSnsId" => $prevSnsId,
                    "wechatAccountId" => $wechatAccountId,
                    "wechatFriendId" => $wechatFriendId,
                    "seq" => time(),
                ];

                Log::info('获取朋友圈信：' . json_encode($params, 256));
                $message = $this->sendMessage($params);
                Log::info('获取朋友圈信成功：' . json_encode($message, 256));


                // 检查是否遇到频率限制
                if (isset($message['extra']) && strpos($message['extra'], '朋友圈太频繁了') !== false) {
                    Log::info('遇到频率限制,休息10秒后继续');
                    sleep(10);
                    continue;
                }
                

                // 检查返回结果
                if (!isset($message['result']) || empty($message['result']) || !is_array($message['result'])) {
                    break;
                }

            
                // 检查是否遇到旧数据
                $hasOldData = false;
                foreach ($message['result'] as $moment) {
                    $momentId = WechatMoments::where('snsId', $moment['snsId'])
                        ->where('wechatAccountId', $wechatAccountId)
                        ->value('id');
                    
                    if (!empty($momentId)) {
                        $hasOldData = true;
                        break;
                    }
                }

                // 如果遇到旧数据,结束本次任务
                if ($hasOldData) {
                    // Log::info('遇到旧数据,结束本次任务');
                    // break;
                }

                // 合并朋友圈数据
                $allMoments = array_merge($allMoments, $message['result']);

                // 存储当前页的朋友圈数据到数据库
                $this->saveMomentsToDatabase($message['result'], $wechatAccountId, $wechatFriendId);

                // 获取最后一条数据的snsId，用于下次查询
                $lastMoment = end($message['result']);
                if (!$lastMoment || !isset($lastMoment['snsId'])) {
                    break;
                }

                $prevSnsId = $lastMoment['snsId'];
                $currentPage++;

                // 如果已经达到最大页数，退出循环
                if ($currentPage > $maxPages) {
                    Log::info('已达到最大页数限制(' . $maxPages . '页),结束本次任务');
                    break;
                }

                // 如果返回的数据少于请求的数量，说明没有更多数据了
                if (count($message['result']) < $count) {
                    break;
                }

            } while (true);

            // 构建返回数据
            $result = [
                'code' => 200,
                'msg' => '获取朋友圈信息成功',
                'data' => [
                    'list' => $allMoments,
                    'total' => count($allMoments),
                    'nextPrevSnsId' => $prevSnsId
                ]
            ];

            return json_encode($result);
        } catch (\Exception $e) {
            return json_encode(['code'=>500,'msg'=>$e->getMessage()]);
        }
    }

   /**
     * 朋友圈点赞
     * @return \think\response\Json
     */
    public function momentInteract($data = [])
    {
        
        $snsId = !empty($data['snsId']) ? $data['snsId'] : '';
        $wechatAccountId = !empty($data['wechatAccountId']) ? $data['wechatAccountId'] : '';
        $wechatFriendId = !empty($data['wechatFriendId']) ? $data['wechatFriendId'] : 0;


        //过滤消息
         if (empty($snsId)) {
             return json_encode(['code'=>400,'msg'=>'snsId不能为空']);
        }
         if (empty($wechatAccountId)) {
             return json_encode(['code'=>400,'msg'=>'微信id不能为空']);
        }
            
         try {
            $result = [
                "cmdType" => "CmdMomentInteract",
                "momentInteractType" => 1,
                "seq" => time(),
                "snsId" => $snsId,
                "wechatAccountId" => $wechatAccountId,
                "wechatFriendId" => $wechatFriendId,
        ];

            $message = $this->sendMessage($result);
            return json_encode(['code'=>200,'msg'=>'点赞成功','data'=>$message]);
         } catch (\Exception $e) {
            return json_encode(['code'=>500,'msg'=>$e->getMessage()]);
        }
    }

      /**
     * 朋友圈取消点赞
     * @return \think\response\Json
     */
    public function momentCancelInteract()
    {
        if ($this->request->isPost()) {
            $data = $this->request->param();

            if (empty($data)) {
                return json_encode(['code'=>400,'msg'=>'参数缺失']);
            }

            //过滤消息
            if (empty($data['snsId'])) {
                return json_encode(['code'=>400,'msg'=>'snsId不能为空']);
            }
            if (empty($data['wechatAccountId'])) {
                return json_encode(['code'=>400,'msg'=>'微信id不能为空']);
            }
            
            try {
            $result = [
                "CommentId2" => '',
                "CommentTime" => 0,
                "cmdType" => "CmdMomentCancelInteract",
                "optType" => 1,
                "seq" => time(),
                    "snsId" => $data['snsId'],
                    "wechatAccountId" => $data['wechatAccountId'],
                "wechatFriendId" => 0,
            ];

                $message = $this->sendMessage($result);
                return json_encode(['code'=>200,'msg'=>'取消点赞成功','data'=>$message]);
            } catch (\Exception $e) {
                return json_encode(['code'=>500,'msg'=>$e->getMessage()]);
            }
        } else {
            return json_encode(['code'=>400,'msg'=>'非法请求']);
        }
    }

    /**
     * 获取指定账号朋友圈图片地址
     * @param array $data 请求参数
     * @return string JSON响应
     */
    public function getMomentSourceRealUrl($data = [])
    {
        try {
            // 参数验证
            if (empty($data)) {
                return json_encode(['code' => 400, 'msg' => '参数缺失']);
            }

            // 验证必要参数
            $requiredParams = ['snsId', 'snsUrls', 'wechatAccountId'];
            foreach ($requiredParams as $param) {
                if (empty($data[$param])) {
                    return json_encode(['code' => 400, 'msg' => "参数 {$param} 不能为空"]);
                }
            }

            // 验证snsUrls是否为数组
            if (!is_array($data['snsUrls'])) {
                return json_encode(['code' => 400, 'msg' => '资源信息格式错误，应为数组']);
            }

            // 检查连接状态
            if (!$this->isConnected) {
                $this->connect();
                if (!$this->isConnected) {
                    return json_encode(['code' => 500, 'msg' => 'WebSocket连接失败']);
                }
            }

            // 构建请求参数
            $params = [
                "cmdType" => 'CmdDownloadMomentImagesResult',
                "snsId" => $data['snsId'],
                "urls" => $data['snsUrls'],
                "wechatAccountId" => $data['wechatAccountId'],
                "seq" => time(),
            ];

            // 记录请求日志
            Log::info('获取朋友圈资源链接请求：' . json_encode($params, 256));

            // 发送请求
            $this->client->send(json_encode($params));
            
            // 接收响应
            $response = $this->client->receive();
            $message = json_decode($response, true);

            if(empty($message)){
                return json_encode(['code'=>500,'msg'=>'获取朋友圈资源链接失败']);
            }
            if($message['cmdType'] == 'CmdDownloadMomentImagesResult' && is_array($message['urls']) && count($message['urls']) > 0){
                $urls = json_encode($message['urls'],256);
                Db::table('s2_wechat_moments')->where('snsId',$data['snsId'])->update(['resUrls'=>$urls]);
            }
            return json_encode(['code'=>200,'msg'=>'获取朋友圈资源链接成功','data'=>$message]);
        } catch (\Exception $e) {
            // 记录错误日志
            Log::error('获取朋友圈资源链接异常：' . $e->getMessage());
            Log::error('异常堆栈：' . $e->getTraceAsString());

            // 尝试重连
            try {
                $this->reconnect();
            } catch (\Exception $reconnectError) {
                Log::error('WebSocket重连失败：' . $reconnectError->getMessage());
            }

            return json_encode([
                'code' => 500,
                'msg' => '获取朋友圈资源链接失败：' . $e->getMessage()
            ]);
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
                $momentId = WechatMoments::where('snsId', $moment['snsId'])
                    ->where('wechatAccountId', $wechatAccountId)
                    ->value('id');
                    
                $dataToSave = [
                    'commentList' => json_encode($moment['commentList'] ?? [], 256),
                    'createTime' => $moment['createTime'] ?? 0,
                    'likeList' => json_encode($moment['likeList'] ?? [], 256),
                    'content' => $momentEntity['content'] ?? '',
                    'lat' => $momentEntity['lat'] ?? 0,
                    'lng' => $momentEntity['lng'] ?? 0,
                    'location' => $momentEntity['location'] ?? '',
                    'picSize' => $momentEntity['picSize'] ?? 0,
                    'resUrls' => json_encode($momentEntity['resUrls'] ?? [], 256),
                    'urls' => json_encode($momentEntity['urls'] ?? [], 256),
                    'userName' => $momentEntity['userName'] ?? '',
                    'snsId' => $moment['snsId'] ?? '',
                    'type' => $moment['type'] ?? 0,
                    'update_time' => time()
                ];
                if (!empty($momentId)) {
                    // 如果已存在，则更新数据
                    Db::table('s2_wechat_moments')->where('id', $momentId)->update($dataToSave);
                } else {
                    if(empty($wechatFriendId)){
                        $wechatFriendId = WechatFriend::where('wechatAccountId', $wechatAccountId)->where('wechatId', $momentEntity['userName'])->value('id');
                    }
                    // 如果不存在，则插入新数据
                    $dataToSave['wechatAccountId'] = $wechatAccountId;
                    $dataToSave['wechatFriendId'] = $wechatFriendId ?? 0;
                    $dataToSave['create_time'] = time();
                    $res = WechatMoments::create($dataToSave);
                }
                // // 获取资源链接
                // if(empty($momentEntity['resUrls']) && !empty($momentEntity['urls'])){
                //     $snsData = [
                //         'snsId' => $moment['snsId'],
                //         'snsUrls' => $momentEntity['urls'],
                //         'wechatAccountId' => $wechatAccountId,
                //     ];
                //     $this->getMomentSourceRealUrl($snsData);
                // }

            }
            //Log::write('朋友圈数据已存入数据库，共' . count($momentList) . '条');
            return true;
        } catch (\Exception $e) {
            //Log::write('保存朋友圈数据失败：' . $e->getMessage(), 'error');
            return false;
        }
    }


    /**
     * 修改好友标签
     * @param array $data 请求参数
     * @return string JSON响应
     */
    public function modifyFriendLabel($data = [])
    {
        // 获取请求参数
        $wechatFriendId = !empty($data['wechatFriendId']) ? $data['wechatFriendId'] : 0;
        $wechatAccountId = !empty($data['wechatAccountId']) ? $data['wechatAccountId'] : '';
        $labels = !empty($data['labels']) ? $data['labels'] : [];

        // 验证必要参数
        if (empty($wechatFriendId)) {
            return json_encode(['code' => 400, 'msg' => '好友ID不能为空']);
        }
        
        if (empty($wechatAccountId)) {
            return json_encode(['code' => 400, 'msg' => '微信账号ID不能为空']);
        }

        if (empty($labels)) {
            return json_encode(['code' => 400, 'msg' => '标签不能为空']);
        }

        try {
            // 构建请求参数
            $params = [
                "cmdType" => "CmdModifyFriendLabel",
                "labels" => $labels,
                "seq" => time(),
                "wechatAccountId" => $wechatAccountId,
                "wechatFriendId" => $wechatFriendId,
            ];

            // 发送请求并获取响应
            $message = $this->sendMessage($params);
            
            // 记录日志
            Log::info('修改好友标签：' . json_encode($params, 256));
            Log::info('修改好友标签结果：' . json_encode($message, 256));

            // 返回成功响应
            return json_encode(['code' => 200, 'msg' => '修改标签成功', 'data' => $message]);
        } catch (\Exception $e) {
            // 记录错误日志
            Log::error('修改好友标签失败：' . $e->getMessage());
            
            // 返回错误响应
            return json_encode(['code' => 500, 'msg' => '修改标签失败：' . $e->getMessage()]);
        }
    }

    /************************************
     * 消息发送相关功能
     ************************************/

    /**
     * 个人消息发送
     * @return \think\response\Json
     */
    public function sendPersonal(array $dataArray)
    {
        //过滤消息
        if (empty($dataArray['content'])) {
            return json_encode(['code' => 400, 'msg' => '内容缺失']);
        }
        if (empty($dataArray['wechatAccountId'])) {
            return json_encode(['code' => 400, 'msg' => '微信id不能为空']);
        }
        if (empty($dataArray['wechatFriendId'])) {
            return json_encode(['code' => 400, 'msg' => '接收人不能为空']);
        }

        if (empty($dataArray['msgType'])) {
            return json_encode(['code' => 400, 'msg' => '类型缺失']);
        }

        // 消息拼接  msgType(1:文本 3:图片 43:视频 47:动图表情包（gif、其他表情包） 49:小程序/其他：图文、文件)
        // 当前，type 为文本、图片、动图表情包的时候，content为string, 其他情况为对象 {type: 'file/link/...', url: '', title: '', thunmbPath: '', desc: ''}
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
        return $message;
    }

    /**
     * 发送群消息
     * @return \think\response\Json
     */
    public function sendCommunity()
    {
        if ($this->request->isPost()) {
            $data = $this->request->post();
            if (empty($data)) {
                return json_encode(['code'=>400,'msg'=>'参数缺失']);
            }
            $dataArray = $data;
            if (!is_array($dataArray)) {
                return json_encode(['code'=>400,'msg'=>'数据格式错误']);
            }

            //过滤消息
            if (empty($dataArray['content'])) {
                return json_encode(['code'=>400,'msg'=>'内容缺失']);
            }
            if (empty($dataArray['wechatAccountId'])) {
                return json_encode(['code'=>400,'msg'=>'微信id不能为空']);
            }

            if (empty($dataArray['msgType'])) {
                return json_encode(['code'=>400,'msg'=>'类型缺失']);
            }
            if (empty($dataArray['wechatChatroomId'])) {
                return json_encode(['code'=>400,'msg'=>'群id不能为空']);
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
            return json_encode(['code'=>200,'msg'=>$msg,'data'=>$message]);

        } else {
            return json_encode(['code'=>400,'msg'=>'非法请求']);
            //return errorJson('非法请求');
        }
    }

    /**
     * 发送群消息(内部调用版)
     * @param array $data 消息数据
     * @return \think\response\Json
     */
    public function sendCommunitys($data = [])
    {
        if (empty($data)) {
            return json_encode(['code'=>400,'msg'=>'参数缺失']);
        }
        $dataArray = $data;
        if (!is_array($dataArray)) {
            return json_encode(['code'=>400,'msg'=>'数据格式错误']);
        }

        //过滤消息
        if (empty($dataArray['content'])) {
            return json_encode(['code'=>400,'msg'=>'内容缺失']);
        }
        if (empty($dataArray['wechatAccountId'])) {
            return json_encode(['code'=>400,'msg'=>'微信id不能为空']);
        }

        if (empty($dataArray['msgType'])) {
            return json_encode(['code'=>400,'msg'=>'类型缺失']);
        }
        if (empty($dataArray['wechatChatroomId'])) {
            return json_encode(['code'=>400,'msg'=>'群id不能为空']);
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

        return json_encode(['code'=>200,'msg'=>$msg,'data'=>$message]);
    }
}