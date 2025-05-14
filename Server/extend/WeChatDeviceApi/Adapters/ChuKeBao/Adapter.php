<?php

namespace WeChatDeviceApi\Adapters\ChuKeBao;

use WeChatDeviceApi\Contracts\WeChatServiceInterface;
use WeChatDeviceApi\Exceptions\ApiException;
// 如果有 Client.php
// use WeChatDeviceApi\Adapters\ChuKeBao\Client as ChuKeBaoApiClient;

use think\Db;
use think\facade\Config;
use think\facade\Log;

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


    /* todo 以上方法待实现，基于/参考 application/api/controller/WebSocketController.php 去实现 */

    
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
                ->field('d.id as deviceId, a.wechatId, a.wechatAlive as alive, c.departmentId as companyId, a.updateTime as createTime')
                ->cursor();

            // $insertData = [];
            // $batchSize = 500; // Insert in batches for better performance

            foreach ($cursor as $item) {

                if (empty($item['deviceId']) || empty($item['wechatId'])) {
                    continue;
                }

                // $exists = Db::connect()->table('ck_device_wechat_login')
                $exists = Db::table('ck_device_wechat_login')
                    ->where('deviceId', $item['deviceId'])
                    ->where('wechatId', $item['wechatId'])
                    // ->where('createTime', $item['createTime'])
                    ->find();

                if ($exists) {
                    Db::table('ck_device_wechat_login')
                        ->where('deviceId', $item['deviceId'])
                        ->where('wechatId', $item['wechatId'])
                        ->update(['alive' => $item['alive']]);
                } else {
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
}
