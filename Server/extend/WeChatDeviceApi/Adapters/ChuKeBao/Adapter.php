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
                // ->field('d.id as deviceId, a.wechatId, a.wechatAlive as alive, c.departmentId as companyId, a.updateTime as createTime')
                ->field('d.id as deviceId, a.wechatId, a.wechatAlive as alive, c.departmentId as companyId, a.updateTime as updateTime')
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
