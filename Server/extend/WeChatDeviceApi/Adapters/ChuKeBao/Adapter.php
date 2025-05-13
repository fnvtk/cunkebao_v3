<?php

namespace WeChatDeviceApi\Adapters\ChuKeBao;

use WeChatDeviceApi\Contracts\WeChatServiceInterface;
use WeChatDeviceApi\Exceptions\ApiException;
// 如果有 Client.php
// use WeChatDeviceApi\Adapters\ChuKeBao\Client as ChuKeBaoApiClient;

use think\Db;

class Adapter implements WeChatServiceInterface
{
    protected $config;
    // protected $apiClient; // 如果使用 VendorAApiClient

    public function __construct(array $config = [])
    {
        $this->config = $config;
        // $this->apiClient = new ChuKeBaoApiClient($config['api_key'], $config['api_secret'], $config['base_url']);
        // 校验配置等...
        if (empty($config['api_key']) || empty($config['username']) || empty($config['password'])) {
            throw new \InvalidArgumentException("ChuKeBao username and password are required.");
        }
    }

    public function addFriend(string $deviceId, string $targetWxId): bool
    {
        // 1. 构建请求参数 (VendorA 特定的格式)
        $params = [
            'device_identifier' => $deviceId,
            'wechat_user_to_add' => $targetWxId,
            'username' => $this->config['username'],
            'password' => $this->config['password'],
            // ... 其他 VendorA 特定参数
        ];

        // 2. 调用 VendorA 的 API (例如使用 GuzzleHttp 或 cURL)
        // $response = $this->apiClient->post('/friend/add', $params);
        // 伪代码:
        $url = $this->config['base_url'] . '/friend/add';
        // $httpClient = new \GuzzleHttp\Client();
        // $response = $httpClient->request('POST', $url, ['form_params' => $params]);
        // $responseData = json_decode($response->getBody()->getContents(), true);

        // 模拟API调用
        echo "VendorA: Adding friend {$targetWxId} using device {$deviceId}\n";
        $responseData = ['code' => 0, 'message' => 'Success']; // 假设的响应

        // 3. 处理响应，转换为标准结果
        if (!isset($responseData['code'])) {
            throw new ApiException("VendorA: Invalid API response for addFriend.");
        }

        if ($responseData['code'] !== 0) {
            throw new ApiException("VendorA: Failed to add friend - " . ($responseData['message'] ?? 'Unknown error'));
        }

        return true;
    }

    public function likeMoment(string $deviceId, string $momentId): bool
    {
        echo "VendorA: Liking moment {$momentId} using device {$deviceId}\n";
        // 实现 VendorA 的点赞逻辑
        return true;
    }

    public function getGroupList(string $deviceId): array
    {
        echo "VendorA: Getting group list for device {$deviceId}\n";
        // 实现 VendorA 的获取群列表逻辑，并转换数据格式
        return [
            ['id' => 'group1_va', 'name' => 'VendorA Group 1', 'member_count' => 10],
        ];
    }

    public function getFriendList(string $deviceId): array
    {
        echo "VendorA: Getting friend list for device {$deviceId}\n";
        return [
            ['id' => 'friend1_va', 'nickname' => 'VendorA Friend 1', 'remark' => 'VA-F1'],
        ];
    }

    public function getDeviceInfo(string $deviceId): array
    {
        echo "VendorA: Getting device info for device {$deviceId}\n";
        return ['id' => $deviceId, 'status' => 'online_va', 'battery' => '80%'];
    }

    public function bindDeviceToCompany(string $deviceId, string $companyId): bool
    {
        echo "VendorA: Binding device {$deviceId} to company {$companyId}\n";
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
        echo "VendorA: Getting chatroom member list for device {$deviceId}, chatroom {$chatroomId}\n";
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
        // $usleepTime = 100000;
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
        $sql = "INSERT INTO ck_wechat_account(wechatId,alias,nickname,pyInitial,quanPin,avatar,gender,region,signature,phone,country,privince,city,createTime,updateTime)
        SELECT
            wechatId,alias,nickname,pyInitial,quanPin,avatar,gender,region,signature,phone,country,privince,city,createTime,updateTime
        FROM
            s2_wechat_friend GROUP BY wechatId;
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
            updateTime=VALUES(updateTime);";

        $affected = Db::execute($sql);
        return $affected;
    }

    // syncWechatDeviceLoginLog
    public function syncWechatDeviceLoginLog()
    {
        Db::table('s2_wechat_account')
            ->alias('a')
            ->join('s2_device d', 'd.imei = a.imei')
            ->join('s2_company_account c', 'c.id = d.currentAccountId')
            ->field('d.id as deviceId, a.wechatId, a.wechatAlive as alive, c.departmentId as companyId, a.updateTime as createTime')
            ->chunk(1000, function ($data) {
                foreach ($data as $item) {
                    $exists = Db::table('ck_device_wechat_login')
                        ->where('deviceId', $item['deviceId'])
                        ->where('wechatId', $item['wechatId'])
                        ->where('createTime', $item['createTime'])
                        ->find();

                    if (!$exists) {
                        Db::table('ck_device_wechat_login')->insert($item);
                    }
                }
            });
    }

    /**
     * 大数据量分批处理版本
     * 适用于数据源非常大的情况，避免一次性加载全部数据到内存
     * 独立脚本执行，30min 同步一次 和 流量来源的更新一起
     * 
     * @param int $batchSize 每批处理的数据量
     * @return int 影响的行数
     */
    // public function syncWechatFriendToTrafficPoolBatch($batchSize = 5000)
    // {
    //     // 1. 获取数据总量
    //     $total = Db::table('s2_wechat_friend')
    //         ->group('wechatId')
    //         ->count();

    //     // 2. 计算需要处理的批次
    //     $batchCount = ceil($total / $batchSize);
    //     $affectedRows = 0;

    //     // 3. 分批处理
    //     for ($i = 0; $i < $batchCount; $i++) {
    //         $offset = $i * $batchSize;

    //         // 分批查询SQL，使用LIMIT控制每次获取的数据量
    //         $sql = "INSERT IGNORE INTO ck_traffic_pool(`identifier`, `wechatId`, `mobile`) 
    //                 SELECT wechatId identifier, wechatId, phone 
    //                 FROM (
    //                     SELECT wechatId, phone 
    //                     FROM `s2_wechat_friend` 
    //                     GROUP BY wechatId 
    //                     LIMIT {$offset}, {$batchSize}
    //                 ) AS temp";

    //         $affectedRows += Db::execute($sql);

    //         // 释放内存
    //         if ($i % 5 == 0) {
    //             Db::clear();
    //             gc_collect_cycles();
    //         }
    //     }

    //     return $affectedRows;
    // }



    public function syncWechatFriendToTrafficPoolBatch($batchSize = 5000)
    {
        // 1. 先获取去重后的wechatId清单并建立临时索引
        Db::execute("CREATE TEMPORARY TABLE IF NOT EXISTS temp_wechat_ids (
        wechatId VARCHAR(64) PRIMARY KEY
    ) ENGINE=MEMORY");

        Db::execute("TRUNCATE TABLE temp_wechat_ids");

        // 批量插入去重的wechatId
        Db::execute("INSERT INTO temp_wechat_ids SELECT DISTINCT wechatId FROM s2_wechat_friend");

        // 2. 获取临时表的数据总量
        $total = Db::table('temp_wechat_ids')->count();

        // 3. 计算需要处理的批次
        $batchCount = ceil($total / $batchSize);
        $affectedRows = 0;

        // 4. 开始事务处理批量数据
        try {
            for ($i = 0; $i < $batchCount; $i++) {
                $offset = $i * $batchSize;

                // 使用临时表和JOIN来提高查询效率
                // $sql = "INSERT IGNORE INTO ck_traffic_pool(`identifier`, `wechatId`, `mobile`) 
                //     SELECT t.wechatId AS identifier, t.wechatId, f.phone AS mobile 
                //     FROM (
                //         SELECT wechatId FROM temp_wechat_ids LIMIT {$offset}, {$batchSize}
                //     ) AS t 
                //     LEFT JOIN s2_wechat_friend f ON t.wechatId = f.wechatId
                //     GROUP BY t.wechatId";
                $sql = "INSERT IGNORE INTO ck_traffic_pool(`identifier`, `wechatId`, `mobile`) 
                        SELECT t.wechatId AS identifier, t.wechatId, 
                            (SELECT phone FROM s2_wechat_friend 
                                WHERE wechatId = t.wechatId LIMIT 1) AS mobile
                        FROM (
                            SELECT wechatId FROM temp_wechat_ids LIMIT {$offset}, {$batchSize}
                        ) AS t";

                $currentAffected = Db::execute($sql);
                $affectedRows += $currentAffected;

                // 更频繁地释放内存
                // if ($i % 2 == 1) {
                if ($i % 5 == 0) {
                    // Db::clear();
                    gc_collect_cycles();
                }

                // 添加短暂休眠，但不要太长以免影响总体执行时间
                // 20-50毫秒通常是个不错的平衡点
                usleep(30000); // 30毫秒

                // 如果批处理大小很大或者当前批影响行数很多，可以适当增加休眠时间
                // if ($currentAffected > 1000) {
                //     usleep(20000); // 额外增加20毫秒
                // }

                // 输出进度日志
                // $progress = round(($i + 1) / $batchCount * 100, 2);
                // \think\facade\Log::info("Traffic pool sync progress: {$progress}% completed. Rows affected in this batch: {$currentAffected}");
            }
        } catch (\Exception $e) {
            \think\facade\Log::error("Error in traffic pool sync: " . $e->getMessage());
            // 删除临时表
            // Db::execute("DROP TEMPORARY TABLE IF EXISTS temp_wechat_ids");
            throw $e;
        } finally {
            Db::execute("DROP TEMPORARY TABLE IF EXISTS temp_wechat_ids");
        }

        // 5. 清理临时表
        // Db::execute("DROP TEMPORARY TABLE IF EXISTS temp_wechat_ids");

        return $affectedRows;
    }
}
