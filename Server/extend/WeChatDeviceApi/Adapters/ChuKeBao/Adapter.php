<?php

namespace WeChatDeviceApi\Adapters\ChuKeBao;

use WeChatDeviceApi\Contracts\WeChatServiceInterface;
use WeChatDeviceApi\Exceptions\ApiException;
// 如果有 Client.php
// use WeChatDeviceApi\Adapters\ChuKeBao\Client as ChuKeBaoApiClient;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request;
use think\Db;
use think\facade\Config;
use think\facade\Log;
use app\api\controller\FriendTaskController;
use app\common\service\AuthService;
use app\api\controller\WebSocketController;

class Adapter implements WeChatServiceInterface
{
    protected $config;
    // protected $apiClient; // 如果使用 VendorAApiClient

    public function __construct(array $config = [])
    {

        // $this->config = $config ?: Config::get('wechat_device_api.');
        $this->config = $config ?: Config::get('wechat_device_api.adapters.ChuKeBao');
        // $this->config = $config;
        // $this->apiClient = new ChuKeBaoApiClient($config['api_key'], $config['api_secret'], $config['base_url']);
        // 校验配置等...
        if (empty($this->config['base_url']) || empty($this->config['username']) || empty($this->config['password'])) {
            throw new \InvalidArgumentException("ChuKeBao username and password are required.");
        }
    }

    public function addFriend(string $deviceId, string $targetWxId): bool
    {
        // 1. 构建请求参数 (ChuKeBao 特定的格式)
        $params = [
            'device_identifier' => $deviceId,
            'wechat_user_to_add' => $targetWxId,
            'username' => $this->config['username'],
            'password' => $this->config['password'],
            // ... 其他 ChuKeBao 特定参数
        ];

        // 2. 调用 ChuKeBao 的 API (例如使用 GuzzleHttp 或 cURL)
        // $response = $this->apiClient->post('/friend/add', $params);
        // 伪代码:
        $url = $this->config['base_url'] . '/friend/add';
        // $httpClient = new \GuzzleHttp\Client();
        // $response = $httpClient->request('POST', $url, ['form_params' => $params]);
        // $responseData = json_decode($response->getBody()->getContents(), true);

        // 模拟API调用
        echo "ChuKeBao: Adding friend {$targetWxId} using device {$deviceId}\n";
        $responseData = ['code' => 0, 'message' => 'Success']; // 假设的响应

        // 3. 处理响应，转换为标准结果
        if (!isset($responseData['code'])) {
            throw new ApiException("ChuKeBao: Invalid API response for addFriend.");
        }

        if ($responseData['code'] !== 0) {
            throw new ApiException("ChuKeBao: Failed to add friend - " . ($responseData['message'] ?? 'Unknown error'));
        }

        return true;
    }

    public function likeMoment(string $deviceId, string $momentId): bool
    {
        echo "ChuKeBao: Liking moment {$momentId} using device {$deviceId}\n";
        // 实现 VendorA 的点赞逻辑
        return true;
    }

    public function getGroupList(string $deviceId): array
    {
        echo "ChuKeBao: Getting group list for device {$deviceId}\n";
        // 实现 VendorA 的获取群列表逻辑，并转换数据格式
        return [
            ['id' => 'group1_va', 'name' => 'ChuKeBao Group 1', 'member_count' => 10],
        ];
    }

    public function getFriendList(string $deviceId): array
    {
        echo "VendorA: Getting friend list for device {$deviceId}\n";
        return [
            ['id' => 'friend1_va', 'nickname' => 'ChuKeBao Friend 1', 'remark' => 'VA-F1'],
        ];
    }

    public function getDeviceInfo(string $deviceId): array
    {
        echo "ChuKeBao: Getting device info for device {$deviceId}\n";
        return ['id' => $deviceId, 'status' => 'online_va', 'battery' => '80%'];
    }

    public function bindDeviceToCompany(string $deviceId, string $companyId): bool
    {
        echo "ChuKeBao: Binding device {$deviceId} to company {$companyId}\n";
        return true;
    }

    /**
     * 获取群成员列表
     * @param string $deviceId 设备ID
     * @param string $chatroomId 群ID
     * @return array 群成员列表
     */
    public function getChatroomMemberList(string $deviceId, string $chatroomId): array
    {
        echo "ChuKeBao: Getting chatroom member list for device {$deviceId}, chatroom {$chatroomId}\n";
        return [
            ['id' => 'member1_va', 'nickname' => 'VendorA Member 1', 'avatar' => ''],
        ];
    }

    /**
     * 获取指定微信的朋友圈内容/列表
     * @param string $deviceId 设备ID
     * @param string $wxId 微信ID
     * @return array 朋友圈列表
     */
    public function getMomentList(string $deviceId, string $wxId): array
    {
        echo "VendorA: Getting moment list for device {$deviceId}, wxId {$wxId}\n";
        return [
            ['id' => 'moment1_va', 'content' => 'VendorA Moment 1', 'created_at' => time()],
        ];
    }

    /**
     * 发送微信朋友圈
     * @param string $deviceId 设备ID
     * @param string $wxId 微信ID
     * @param string $moment 朋友圈内容
     * @return bool 是否成功
     */
    public function sendMoment(string $deviceId, string $wxId, string $moment): bool
    {
        echo "VendorA: Sending moment for device {$deviceId}, wxId {$wxId}, content: {$moment}\n";
        return true;
    }

    // sendMsgToFriend 要处理计划任务
    public function sendMsgToFriend(int $friendId, int $wechatAccountId, array $msgConf)
    {
        // todo 直接发消息，同时更新状态为 4（已通过-已发消息） application/api/controller/WebSocketController.php sendPersonal
        // 消息拼接  msgType(1:文本 3:图片 43:视频 47:动图表情包（gif、其他表情包） 49:小程序/其他：图文、文件)
        // 当前，type 为文本、图片、动图表情包的时候，content为string, 其他情况为对象 {type: 'file/link/...', url: '', title: '', thunmbPath: '', desc: ''}
        // $result = [
        //     "content" => $dataArray['content'],
        //     "msgSubType" => 0,
        //     "msgType" => $dataArray['msgType'],
        //     "seq" => time(),
        //     "wechatAccountId" => $dataArray['wechatAccountId'],
        //     "wechatChatroomId" => 0,
        //     "wechatFriendId" => $dataArray['wechatFriendId'],
        // ];
        $wsController = new WebSocketController();
        $wsController->sendPersonal([
            'wechatFriendId' => $friendId,
            'wechatAccountId' => $wechatAccountId,
            'msgConf' => $msgConf,
        ]);


    }

    // getCustomerAcquisitionTask
    public function getCustomerAcquisitionTask($id) {

        // 先读取缓存
        $task_info = cache('task_info_' . $id);
        if (!$task_info) {
            $task_info = Db::name('customer_acquisition_task')
                ->where('id', $id)
                ->find();

            if ($task_info) {
                cache('task_info_' . $id, $task_info);
            } else {
                return [];
            }
        }

        return $task_info;
    }

    // 检查是否是好友关系
    public function checkIfIsWeChatFriendByPhone(string $wxId, string $phone): bool
    {
        if (empty($wxId) || empty($phone)) {
            // Avoid queries with empty essential parameters.
            return false;
        }

        try {
            // The SQL hint provided is:
            // SELECT ownerWechatId, phone, passTime, createTime
            // FROM `s2_wechat_friend`
            // WHERE ownerWechatId = '您的微信ID'  -- Corresponds to $wxId
            //   AND phone LIKE 'phone%'        -- Corresponds to $phone . '%'
            // ORDER BY createTime DESC;

            // $friendRecord = Db::table('s2_wechat_friend')
            //     ->where('ownerWechatId', $wxId)
            //     ->where('phone', 'like', $phone . '%') // Match phone numbers starting with $phone
            //     ->order('createTime', 'desc')          // Order by creation time as hinted
            //     ->find(); // Fetches the first matching record or null
            // $friendRecord = Db::table('s2_wechat_friend')
            $id = Db::table('s2_wechat_friend')
                ->where('ownerWechatId', $wxId)
                ->where('phone', 'like', $phone . '%') // Match phone numbers starting with $phone
                ->order('createTime', 'desc')          // Order by creation time as hinted
                // ->column('id');
                ->value('id');

            // If a record is found, $friendRecord will not be empty.
            // return !empty($friendRecord);
            return (bool)$id;
        } catch (\Exception $e) {
            // Log the exception for diagnostics.
            Log::error("Error in checkIfIsWeChatFriendByPhone (wxId: {$wxId}, phone: {$phone}): " . $e->getMessage());
            // Return false in case of an error, indicating not a friend or unable to determine.
            return false;
        }
    }

    // getWeChatAccoutIdAndFriendIdByWeChatId
    public function getWeChatAccoutIdAndFriendIdByWeChatIdAndFriendPhone(string $wechatId, string $phone): array
    {
        if (empty($wechatId) || empty($phone)) {
            return [];
        }

        return Db::table('s2_wechat_friend')
        ->where('ownerWechatId', $wechatId)
        ->where('phone', 'like', $phone . '%')
        ->field('id,wechatAccountId,passTime,createTime')
        ->find();

    }

    // 判断是否已添加某手机号为好友并返回添加时间
    public function getWeChatFriendPassTimeByPhone(string $wxId, string $phone): int
    {
        if (empty($wxId) || empty($phone)) {
            return 0;
        }

        try {
            // $passTime = Db::table('s2_wechat_friend')
            //     ->where('ownerWechatId', $wxId)
            //     ->where('phone', 'like', $phone . '%') // Match phone numbers starting with $phone
            //     ->order('createTime', 'desc')          // Order by creation time as hinted
            //     ->value('passTime');
            $record = Db::table('s2_wechat_friend')
                ->where('ownerWechatId', $wxId)
                ->where('phone', 'like', $phone . '%') // Match phone numbers starting with $phone
                ->field('id,createTime,passTime')         // Order by creation time as hinted
                ->find();

            return $record['passTime'] ?? $record['createTime'] ?? 0;
        } catch (\Exception $e) {
            Log::error("Error in getWeChatFriendPassTimeByPhone (wxId: {$wxId}, phone: {$phone}): " . $e->getMessage());
            return 0;
        }
    }

    /**
     * 查询某个微信今天添加了多少个好友
     * @param string $wechatId 微信ID
     * @return int 好友数量
     */
    public function getTodayAddedFriendsCount(string $wechatId): int
    {
        if (empty($wechatId)) {
            return 0;
        }
        try {
            $count = Db::table('s2_friend_task')
                ->where('wechatId', $wechatId)
                ->whereRaw("FROM_UNIXTIME(createTime, '%Y-%m-%d') = CURDATE()")
                ->count();
            return (int)$count;
        } catch (\Exception $e) {
            Log::error("Error in getTodayAddedFriendsCount (wechatId: {$wechatId}): " . $e->getMessage());
            return 0;
        }
    }

    /**
     * 查询某个微信24小时内添加了多少个好友
     * @param string $wechatId 微信ID
     * @return int 好友数量
     */
    public function getLast24hAddedFriendsCount(string $wechatId): int
    {
        if (empty($wechatId)) {
            return 0;
        }
        try {
            $twentyFourHoursAgo = time() - (24 * 60 * 60);
            $count = Db::table('s2_friend_task')
                ->where('wechatId', $wechatId)
                ->where('createTime', '>=', $twentyFourHoursAgo)
                ->count();
            return (int)$count;
        } catch (\Exception $e) {
            Log::error("Error in getLast24hAddedFriendsCount (wechatId: {$wechatId}): " . $e->getMessage());
            return 0;
        }
    }

    /**
     * 查询某个微信最新的一条添加好友任务记录
     * @param string $wechatId 微信ID
     * @return array|null 任务记录或null
     */
    public function getLatestFriendTask(string $wechatId): ?array
    {
        if (empty($wechatId)) {
            return null;
        }
        try {
            $task = Db::table('s2_friend_task')
                ->where('wechatId', $wechatId)
                ->order('createTime', 'desc')
                ->find();
            return $task;
        } catch (\Exception $e) {
            Log::error("Error in getLatestFriendTask (wechatId: {$wechatId}): " . $e->getMessage());
            return null;
        }
    }

    // getLatestFriendTaskByPhoneAndWeChatId
    public function getLatestFriendTaskByPhoneAndWeChatId(string $phone, string $wechatId): array
    {
        if (empty($phone) || empty($wechatId)) {
            return [];
        }

        $record = Db::table('s2_friend_task')
            ->where('phone', $phone)
            ->where('wechatId', $wechatId)
            ->order('createTime', 'desc')
            ->find();
        return $record;
    }

    // 获取最新的一条添加好友任务记录的创建时间
    public function getLastCreateFriendTaskTime(string $wechatId): int
    {
        if (empty($wechatId)) {
            return 0;
        }
        $record = Db::table('s2_friend_task')
            ->where('wechatId', $wechatId)
            ->order('createTime', 'desc')
            ->find();
        return $record['createTime'] ?? 0;
    }

    // 判断是否能够加好友
    public function checkIfCanCreateFriendAddTask(string $wechatId, $conf = []): bool
    {
        if (empty($wechatId)) {
            return false;
        }

        $record = $this->getLatestFriendTask($wechatId);
        if (empty($record)) {
            return true;
        }

        if (!empty($conf['add_gap']) && isset($record['createTime']) && $record['createTime'] > time() - $conf['add_gap'] * 60) {
            return false;
        }

        // conf['allow_add_time_between']
        if (!empty($conf['allow_add_time_between']) && count($conf['allow_add_time_between']) == 2) {
            $currentTime = date('H:i');
            $startTime = $conf['allow_add_time_between'][0];
            $endTime = $conf['allow_add_time_between'][1];
            
            // If current time is NOT between start and end time, return false
            if ($currentTime >= $startTime && $currentTime <= $endTime) {
                return true;
            } else {
                return false;
            }
        }

        if (isset($record['status'])) {
            // if ($record['status'] == 1) {
            //     return true;
            // }

            if ($record['status'] == 2) {

                // todo 判断$record['extra'] 是否包含文字： 操作过于频繁；如果包含判断 updateTime 是否已经超过72min，updateTime是10位时间戳；如果包含指定文字且时间未超过72min，return false
                if (isset($record['extra']) && strpos($record['extra'], '操作过于频繁') !== false) {
                    $updateTime = isset($record['updateTime']) ? (int)$record['updateTime'] : 0;
                    $now = time();
                    $diff = $now - $updateTime;
                    
                    // Check if less than 72 minutes (72 * 60 = 4320 seconds) have passed
                    // if ($diff < 72 * 60) {
                    if ($diff < 24 * 60 * 60) {
                        return false;
                    }
                }

            }
        }

        // $createTime = $record['createTime'];
        // $now = time();
        // $diff = $now - $createTime;
        // if ($diff > 10 * 60) {
        //     return true;
        // }

        return true;   
    }

    // 获取触客宝系统的客服微信账号id，用于后续微信相关操作
    public function getWeChatAccountIdByWechatId(string $wechatId): string
    {
        if (empty($wechatId)) {
            return '';
        }
        $record = Db::table('s2_wechat_account')
            ->where('wechatId', $wechatId)
            ->field('id')
            ->find();
        return $record['id'] ?? '';
    }

    // 获取在线的客服微信账号id列表
    public function getOnlineWeChatAccountIdsByWechatIds(array $wechatIds): array
    {
        if (empty($wechatIds)) {
            return [];
        }
        $records = Db::table('s2_wechat_account')
            ->where('deviceAlive', 1)
            ->where('wechatAlive', 1)
            ->where('wechatId', 'in', $wechatIds)
            // ->field('id')
            ->field('id,wechatId')
            // ->select();
            ->column('id', 'wechatId');

        return $records;
    }

    // getWeChatIdsByDeviceIds
    // public function getWeChatIdsByDeviceIds(array $deviceIds): array
    public function getWeChatIdsAccountIdsMapByDeviceIds(array $deviceIds): array
    {
        if (empty($deviceIds)) {
            return [];
        }
        $records = Db::table('s2_wechat_account')
            ->where('deviceAlive', 1)
            ->where('currentDeviceId', 'in', $deviceIds)
            // ->field('id,wechatId,currentDeviceId')
            ->field('id,wechatId')
            // ->select();
            ->column('id,wechatId');
        return $records;
    }

    // addFriendTaskApi
    public function addFriendTaskApi(int $wechatAccountId, string $phone, string $message, string $remark, array $labels, $authorization = '') {
        
        $authorization = $authorization ?: AuthService::getSystemAuthorization();

        if (empty($authorization)) {
            return [
                'status_code' => 0,
                'body' => null,
                'error' => true,
            ];
        }

        // $friendTaskController = new FriendTaskController();
        // $friendTaskController->addFriendTask($wechatAccountId, $phone, $reqConf);

        // todo 调用 application/api/controller/FriendTaskController.php: addFriendTask()
        $params = [
            'phone' => $phone,
            'message' => $message,
            'remark' => $remark,
            // 'labels' => is_array($labels) ? $labels : [$labels],
            'labels' => $labels,
            'wechatAccountId' => $wechatAccountId
        ];
        $client = new Client([
            'base_uri' => $this->config['base_url'],
            'timeout' => 30, // 设置超时时间，可以根据需要调整
        ]);
        // 准备请求头
        $headers = [
            'Content-Type' => 'application/json',
            'client' => 'system'
        ];
        // 如果有授权信息，添加到请求头
        // if (!empty($authorization)) {
        //     $headers['Authorization'] = 'bearer ' . $authorization;
        // }
        $headers['Authorization'] = 'bearer ' . $authorization;
        try {
            // 发送请求
            $response = $client->request('POST', 'api/AddFriendByPhoneTask/add', [
                'headers' => $headers,
                'json' => $params, // Guzzle 会自动将数组转换为 JSON
            ]);
            
            // 获取状态码
            $statusCode = $response->getStatusCode();
            
            // 获取响应体并解析 JSON
            $body = $response->getBody()->getContents();
            $result = json_decode($body, true);
            
            // 返回结果，包含状态码和响应体
            return [
                'status_code' => $statusCode,
                'body' => $result
            ];
            
        } catch (RequestException $e) {
            // 处理请求异常，可以获取错误响应
            if ($e->hasResponse()) {
                $statusCode = $e->getResponse()->getStatusCode();

                if ($statusCode == 401) {
                    $authorization = AuthService::getSystemAuthorization(false);
                    return $this->addFriendTaskApi($wechatAccountId, $phone, $message, $remark, $labels, $authorization);
                }

                $body = $e->getResponse()->getBody()->getContents();
                $result = json_decode($body, true);
                
                return [
                    'status_code' => $statusCode,
                    'body' => $result,
                    'error' => true
                ];
            }

            Log::error("Error in addFriendTaskApi (wechatAccountId: {$wechatAccountId}, phone: {$phone}, message: {$message}, remark: {$remark}, labels: " . json_encode($labels) . "): " . $e->getMessage());
            
            // 没有响应的异常
            return [
                'status_code' => 0,
                'body' => null,
                'error' => true,
                'message' => $e->getMessage()
            ];
        } catch (GuzzleException $e) {
            // 处理其他 Guzzle 异常
            return [
                'status_code' => 0,
                'body' => null,
                'error' => true,
                'message' => $e->getMessage()
            ];
        }
    }

    // createFriendAddTask $accountId, $task['phone'], $task_info['reqConf'] -hello_msg，remark_type
    // public function createFriendAddTask(int $wechatAccountId, string $phone, array $conf): bool
    public function createFriendAddTask(int $wechatAccountId, string $phone, array $conf)
    {
        if (empty($wechatAccountId) || empty($phone) || empty($conf)) {
            // return false;
            return;
        }

        // $remark = '';
        // if (isset($conf['remark_type']) && $conf['remark_type'] == 'phone') {
        //     $remark = $phone . '-' . $conf['task_name'] ?? '获客';
        // } else {

        // }
        $remark = $phone . '-' . $conf['task_name'] ?? '获客';

        $tags = [];
        if  (!empty($conf['tags'])) {
            if (is_array($conf['tags'])) {
                $tags = $conf['tags'];
            } 

            if (strpos($conf['tags'], ',') !== false) {
                $tags = explode(',', $conf['tags']);
            }
        }

        // $res = $this->addFriendTaskApi($wechatAccountId, $phone, $conf['hello_msg'] ?? '你好', $remark, $conf['tags'] ?? []);
        $this->addFriendTaskApi($wechatAccountId, $phone, $conf['hello_msg'] ?? '你好', $remark, $tags);

        // if ($res['status_code']) {
        
        // }
       

        
        // return true;
        
    }

    /* TODO: 以上方法待实现，基于/参考 application/api/controller/WebSocketController.php 去实现；以下同步脚本用的方法转移到其他类 */


    // NOTE: run in background; 5min 同步一次
    // todo: 后续经过`s2_`表，直接对接三方的api去sync
    public function syncFriendship()
    {
        $sql = "INSERT INTO ck_wechat_friendship(id,wechatId,tags,memo,ownerWechatId,createTime,updateTime,deleteTime,companyId)
        SELECT 
            f.id,f.wechatId,f.labels as tags,f.conRemark as memo,f.ownerWechatId,f.createTime,f.updateTime,f.deleteTime,
            c.departmentId
        FROM s2_wechat_friend f
            LEFT JOIN s2_wechat_account a on a.id = f.wechatAccountId
            LEFT JOIN s2_company_account c on c.id = a.deviceAccountId
        LIMIT ?, ?
        ON DUPLICATE KEY UPDATE 
            id=VALUES(id),
            tags=VALUES(tags),
            memo=VALUES(memo),
            updateTime=VALUES(updateTime),
            deleteTime=VALUES(deleteTime),
            companyId=VALUES(companyId)";

        $offset = 0;
        $limit = 2000;
        $usleepTime = 50000;

        do {
            $affected = Db::execute($sql, [$offset, $limit]);
            $offset += $limit;
            if ($affected > 0) {
                usleep($usleepTime);
            }
        } while ($affected > 0);
    }


    public function syncWechatAccount()
    {
        $pk = 'wechatId';
        $limit = 1000;
        // $lastId = '';
        $lastId = null; // Or some other sentinel indicating "first run"


        $totalAffected = 0;
        $iterations = 0;
        $maxIterations = 10000;

        do {
            // Fetch a batch of distinct wechatIds
            // Important: Order by wechatId for consistent pagination
            $sourceDb = Db::connect()->table('s2_wechat_friend');
            // if ($lastId !== '') { // For subsequent iterations
            if (!is_null($lastId)) { // Check if it's not the first iteration
                $sourceDb->where($pk, '>', $lastId);
            }
            $distinctWechatIds = $sourceDb->order($pk, 'ASC')
                ->distinct(true)
                ->limit($limit)
                ->column($pk); // Get an array of wechatIds

            if (empty($distinctWechatIds)) {
                break; // No more wechatIds to process
            }

            // Prepare the main IODKU query for this batch of wechatIds
            $sql = "INSERT INTO ck_wechat_account(wechatId,alias,nickname,pyInitial,quanPin,avatar,gender,region,signature,phone,country,privince,city,createTime,updateTime)
        SELECT
            wechatId,alias,nickname,pyInitial,quanPin,avatar,gender,region,signature,phone,country,privince,city,createTime,updateTime
        FROM
            s2_wechat_friend 
        WHERE wechatId IN (" . implode(',', array_fill(0, count($distinctWechatIds), '?')) . ")
        GROUP BY wechatId  -- Grouping within the selected wechatIds
        ON DUPLICATE KEY UPDATE 
            alias=VALUES(alias),
            nickname=VALUES(nickname),
            pyInitial=VALUES(pyInitial),
            quanPin=VALUES(quanPin),
            avatar=VALUES(avatar),
            gender=VALUES(gender),
            region=VALUES(region),
            signature=VALUES(signature),
            phone=VALUES(phone),
            country=VALUES(country),
            privince=VALUES(privince),
            city=VALUES(city),
            updateTime=VALUES(updateTime)";

            // The parameters for the IN clause are the distinctWechatIds themselves
            $bindings = $distinctWechatIds;

            try {
                $affected = Db::execute($sql, $bindings);
                $totalAffected += $affected;
                // Log::info("syncWechatAccount: Processed batch of " . count($distinctWechatIds) . " distinct wechatIds. Affected rows: " . $affected);

                // Update lastId for the next iteration
                $lastId = end($distinctWechatIds);

                if ($affected > 0) {
                    usleep(50000);
                }
            } catch (\Exception $e) {
                Log::error("syncWechatAccount batch error: " . $e->getMessage() . " with wechatIds starting around " . $distinctWechatIds[0] . ". SQL: " . $sql . " Bindings: " . json_encode($bindings));
                // Decide if you want to break or continue with the next batch
                break; // Example: break on error
            }
            $iterations++;
        } while (count($distinctWechatIds) === $limit && $iterations < $maxIterations); // Continue if we fetched a full batch

        // Log::info("syncWechatAccount finished. Total affected rows: " . $totalAffected);
        return $totalAffected;
    }


    public function syncWechatDeviceLoginLog()
    {
        try {
            $cursor = Db::table('s2_wechat_account')
                ->alias('a')
                ->join(['s2_device' => 'd'], 'd.imei = a.imei')
                ->join(['s2_company_account' => 'c'], 'c.id = d.currentAccountId')
                // ->field('d.id as deviceId, a.wechatId, a.wechatAlive as alive, c.departmentId as companyId, a.updateTime as createTime')
                ->field('d.id as deviceId, a.wechatId, a.wechatAlive as alive, c.departmentId as companyId, a.updateTime as updateTime')
                ->cursor();

            // $insertData = [];
            // $batchSize = 500; // Insert in batches for better performance

            foreach ($cursor as $item) {

                if (empty($item['deviceId']) || empty($item['wechatId']) || empty($item['companyId'])) {
                    continue;
                }

                // $exists = Db::connect()->table('ck_device_wechat_login')
                $exists = Db::table('ck_device_wechat_login')
                    ->where('deviceId', $item['deviceId'])
                    ->where('wechatId', $item['wechatId'])
                    ->where('companyId', $item['companyId'])
                    // ->where('createTime', $item['createTime'])
                    ->find();

                if ($exists) {
                    Db::table('ck_device_wechat_login')
                        ->where('deviceId', $item['deviceId'])
                        ->where('wechatId', $item['wechatId'])
                        ->where('companyId', $item['companyId'])
                        ->update(['alive' => $item['alive'], 'updateTime' => $item['updateTime']]);
                } else {
                    $item['createTime'] = $item['updateTime'];
                    Db::table('ck_device_wechat_login')->insert($item);
                }

                // $insertData[] = $item;

                // if (count($insertData) >= $batchSize) {
                //     Db::connect()->table('ck_device_wechat_login')->insertAll($insertData, true); // true for INSERT IGNORE
                //     $insertData = []; // Reset for next batch
                // }

            }

            // Insert any remaining data
            // if (!empty($insertData)) {
            //     Db::connect()->table('ck_device_wechat_login')->insertAll($insertData, true); // true for INSERT IGNORE
            // }

            return true;
        } catch (\Exception $e) {
            Log::error("微信好友同步任务异常: " . $e->getMessage() . ", 堆栈: " . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * 大数据量分批处理版本
     * 适用于数据源非常大的情况，避免一次性加载全部数据到内存
     * 独立脚本执行，30min 同步一次 和 流量来源的更新一起
     * 
     * @param int $batchSize 每批处理的数据量
     * @return int 影响的行数
     */
    public function syncWechatFriendToTrafficPoolBatch($batchSize = 5000)
    {
        Db::execute("CREATE TEMPORARY TABLE IF NOT EXISTS temp_wechat_ids (
        wechatId VARCHAR(64) PRIMARY KEY
    ) ENGINE=MEMORY");

        Db::execute("TRUNCATE TABLE temp_wechat_ids");

        // 批量插入去重的wechatId
        Db::execute("INSERT INTO temp_wechat_ids SELECT DISTINCT wechatId FROM s2_wechat_friend");

        $total = Db::table('temp_wechat_ids')->count();

        $batchCount = ceil($total / $batchSize);
        $affectedRows = 0;

        try {
            for ($i = 0; $i < $batchCount; $i++) {
                $offset = $i * $batchSize;

                $sql = "INSERT IGNORE INTO ck_traffic_pool(`identifier`, `wechatId`, `mobile`) 
                        SELECT t.wechatId AS identifier, t.wechatId, 
                            (SELECT phone FROM s2_wechat_friend 
                                WHERE wechatId = t.wechatId LIMIT 1) AS mobile
                        FROM (
                            SELECT wechatId FROM temp_wechat_ids LIMIT {$offset}, {$batchSize}
                        ) AS t";

                $currentAffected = Db::execute($sql);
                $affectedRows += $currentAffected;

                if ($i % 5 == 0) {
                    gc_collect_cycles();
                }

                usleep(30000); // 30毫秒
            }
        } catch (\Exception $e) {
            \think\facade\Log::error("Error in traffic pool sync: " . $e->getMessage());
            throw $e;
        } finally {
            Db::execute("DROP TEMPORARY TABLE IF EXISTS temp_wechat_ids");
        }

        return $affectedRows;
    }



    /**
     * 同步/更新微信客服信息到ck_wechat_customer表
     * 
     * @param int $batchSize 每批处理的数据量
     * @return int 影响的行数
     */
    public function syncWechatCustomer($batchSize = 1000)
    {
        try {
            // 1. 获取要处理的wechatId和companyId列表
            $customerList = Db::table('ck_device_wechat_login')
                ->field('DISTINCT wechatId, companyId')
                ->select();

            $totalAffected = 0;
            $batchCount = ceil(count($customerList) / $batchSize);

            for ($i = 0; $i < $batchCount; $i++) {
                $batch = array_slice($customerList, $i * $batchSize, $batchSize);
                $insertData = [];

                foreach ($batch as $customer) {
                    $wechatId = $customer['wechatId'];
                    $companyId = $customer['companyId'];

                    if (empty($wechatId)) continue;

                    // 2. 获取s2_wechat_account数据
                    $accountInfo = Db::table('s2_wechat_account')
                        ->where('wechatId', $wechatId)
                        ->find();

                    // 3. 获取群数量 (不包含 @openim 结尾的identifier)
                    $groupCount = Db::table('ck_wechat_group_member')
                        ->where('identifier', $wechatId)
                        ->where('customerIs', 1)
                        ->where('identifier', 'not like', '%@openim')
                        ->count();

                    // 4. 检查记录是否已存在
                    $existingRecord = Db::table('ck_wechat_customer')
                        ->where('wechatId', $wechatId)
                        ->find();

                    // 5. 构建basic JSON数据
                    $basic = [];
                    if ($existingRecord && !empty($existingRecord['basic'])) {
                        $basic = json_decode($existingRecord['basic'], true) ?: [];
                    }

                    if (empty($basic['registerDate'])) {
                        $basic['registerDate'] = date('Y-m-d H:i:s', strtotime('-' . mt_rand(1, 150) . ' months'));
                    }

                    // 6. 构建activity JSON数据
                    $activity = [];
                    if ($existingRecord && !empty($existingRecord['activity'])) {
                        $activity = json_decode($existingRecord['activity'], true) ?: [];
                    }

                    if ($accountInfo) {
                        $activity['yesterdayMsgCount'] = $accountInfo['yesterdayMsgCount'] ?? 0;
                        $activity['sevenDayMsgCount'] = $accountInfo['sevenDayMsgCount'] ?? 0;
                        $activity['thirtyDayMsgCount'] = $accountInfo['thirtyDayMsgCount'] ?? 0;

                        // 计算totalMsgCount
                        if (empty($activity['totalMsgCount'])) {
                            $activity['totalMsgCount'] = $activity['thirtyDayMsgCount'];
                        } else {
                            $activity['totalMsgCount'] += $activity['yesterdayMsgCount'];
                        }
                    }

                    // 7. 构建friendShip JSON数据
                    $friendShip = [];
                    if ($existingRecord && !empty($existingRecord['friendShip'])) {
                        $friendShip = json_decode($existingRecord['friendShip'], true) ?: [];
                    }

                    if ($accountInfo) {
                        $friendShip['totalFriend'] = $accountInfo['totalFriend'] ?? 0;
                        $friendShip['maleFriend'] = $accountInfo['maleFriend'] ?? 0;
                        $friendShip['unknowFriend'] = $accountInfo['unknowFriend'] ?? 0;
                        $friendShip['femaleFriend'] = $accountInfo['femaleFriend'] ?? 0;
                    }
                    $friendShip['groupNumber'] = $groupCount;

                    // 8. 构建weight JSON数据 (每天只计算一次)
                    // $weight = [];
                    // if ($existingRecord && !empty($existingRecord['weight'])) {
                    //     $weight = json_decode($existingRecord['weight'], true) ?: [];

                    //     // 如果不是今天更新的，重新计算权重
                    //     $lastUpdateDate = date('Y-m-d', $existingRecord['updateTime'] ?? 0);
                    //     if ($lastUpdateDate !== date('Y-m-d')) {
                    //         $weight = $this->calculateCustomerWeight($basic, $activity, $friendShip);
                    //     }
                    // } else {
                    //     $weight = $this->calculateCustomerWeight($basic, $activity, $friendShip);
                    // }

                    // 9. 准备更新或插入的数据
                    $data = [
                        'wechatId' => $wechatId,
                        'companyId' => $companyId,
                        'basic' => json_encode($basic),
                        'activity' => json_encode($activity),
                        'friendShip' => json_encode($friendShip),
                        // 'weight' => json_encode($weight),
                        'updateTime' => time()
                    ];

                    if ($existingRecord) {
                        // 更新记录
                        Db::table('ck_wechat_customer')
                            ->where('wechatId', $wechatId)
                            ->update($data);
                    } else {
                        // 插入记录
                        Db::table('ck_wechat_customer')->insert($data);
                    }

                    $totalAffected++;
                }

                // 释放内存
                if ($i % 5 == 0) {
                    gc_collect_cycles();
                }

                usleep(50000); // 50毫秒短暂休息
            }

            return $totalAffected;
        } catch (\Exception $e) {
            Log::error("同步微信客服信息异常: " . $e->getMessage() . ", 堆栈: " . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * 计算客服权重
     * 
     * @param array $basic 基础信息
     * @param array $activity 活跃信息
     * @param array $friendShip 好友关系信息
     * @return array 权重信息
     */
    private function calculateCustomerWeight($basic, $activity, $friendShip)
    {
        // 1. 计算账号年龄权重（最大20分）
        $ageWeight = 0;
        if (!empty($basic['registerDate'])) {
            $registerTime = strtotime($basic['registerDate']);
            $accountAgeMonths = floor((time() - $registerTime) / (30 * 24 * 3600));
            $ageWeight = min(20, floor($accountAgeMonths / 12) * 4);
        }

        // 2. 计算活跃度权重（最大30分）
        $activityWeight = 0;
        if (!empty($activity)) {
            // 基于消息数计算活跃度
            $msgScore = 0;
            if ($activity['thirtyDayMsgCount'] > 10000) $msgScore = 15;
            elseif ($activity['thirtyDayMsgCount'] > 5000) $msgScore = 12;
            elseif ($activity['thirtyDayMsgCount'] > 1000) $msgScore = 8;
            elseif ($activity['thirtyDayMsgCount'] > 500) $msgScore = 5;
            elseif ($activity['thirtyDayMsgCount'] > 100) $msgScore = 3;

            // 连续活跃天数加分（这里简化处理，实际可能需要更复杂逻辑）
            $activeScore = min(15, $activity['yesterdayMsgCount'] > 10 ? 15 : floor($activity['yesterdayMsgCount'] / 2));

            $activityWeight = $msgScore + $activeScore;
        }

        // 3. 计算限制影响权重（最大15分）
        $restrictWeight = 15; // 默认满分，无限制

        // 4. 计算实名认证权重（最大10分）
        $realNameWeight = 0; // 简化处理，默认未实名

        // 5. 计算可加友数量限制（基于好友数量，最大为5000）
        $addLimit = 0;
        if (!empty($friendShip['totalFriend'])) {
            $addLimit = max(0, min(5000 - $friendShip['totalFriend'], 5000));
            $addLimit = floor($addLimit / 1000); // 每1000个空位1分，最大5分
        }

        // 6. 计算总分（满分75+5分）
        $scope = $ageWeight + $activityWeight + $restrictWeight + $realNameWeight;

        return [
            'ageWeight' => $ageWeight,
            'activityWeight' => $activityWeight, // 注意这里修正了拼写错误
            'restrictWeight' => $restrictWeight,
            'realNameWeight' => $realNameWeight,
            'scope' => $scope,
            'addLimit' => $addLimit
        ];
    }

    /**
     * 同步设备信息到ck_device表
     * 数据量不大，仅同步一次所有设备
     * 
     * @return int 影响的行数
     */
    public function syncDevice()
    {
        try {
            $sql = "INSERT INTO ck_device(`id`, `imei`, `model`, phone, operatingSystem, memo, alive, brand, rooted, xPosed, softwareVersion, extra, createTime, updateTime, deleteTime, companyId)  
            SELECT 
            d.id, d.imei, d.model, d.phone, d.operatingSystem, d.memo, d.alive, d.brand, d.rooted, d.xPosed, d.softwareVersion, d.extra, d.createTime, d.lastUpdateTime, d.deleteTime, a.departmentId companyId
            FROM s2_device d 
            JOIN s2_company_account a ON d.currentAccountId = a.id
            ON DUPLICATE KEY UPDATE
                `model` = VALUES(`model`),
                `phone` = VALUES(`phone`),
                `operatingSystem` = VALUES(`operatingSystem`),
                `memo` = VALUES(`memo`),
                `alive` = VALUES(`alive`),
                `brand` = VALUES(`brand`),
                `rooted` = VALUES(`rooted`),
                `xPosed` = VALUES(`xPosed`),
                `softwareVersion` = VALUES(`softwareVersion`),
                `extra` = VALUES(`extra`),
                `updateTime` = VALUES(`updateTime`),
                `deleteTime` = VALUES(`deleteTime`),
                `companyId` = VALUES(`companyId`)";

            $affected = Db::execute($sql);
            return $affected;
        } catch (\Exception $e) {
            Log::error("同步设备信息异常: " . $e->getMessage() . ", 堆栈: " . $e->getTraceAsString());
            return false;
        }
    }
}
