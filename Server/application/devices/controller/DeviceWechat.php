<?php
namespace app\devices\controller;

use app\common\model\CompanyAccount;
use think\Controller;
use app\devices\model\WechatAccount;
use think\facade\Request;
use think\Db;

/**
 * 设备微信控制器
 */
class DeviceWechat extends Controller
{
    /**
     * 获取在线微信账号数量
     * @return \think\response\Json
     */
    public function count()
    {
        try {
            // 获取在线微信账号数量
            $count = WechatAccount::getOnlineWechatCount();
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'count' => $count
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取有登录微信的设备数量
     * @return \think\response\Json
     */
    public function deviceCount()
    {
        try {
            // 获取有登录微信的设备数量
            $count = WechatAccount::getDeviceWithWechatCount();
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'count' => $count
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }

    /**
     * 刷新设备微信状态
     * @return \think\response\Json
     */
    public function refresh()
    {
        try {    
            return json([
                'code' => 200,
                'msg' => '刷新成功',
                'data' => []
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取在线微信账号列表
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            // 获取登录用户信息
            $userInfo = request()->userInfo;
            // 获取查询条件
            $where = [];
            
            // 微信ID
            $wechatId = Request::param('wechat_id');
            if (!empty($wechatId)) {
                $where['wechatId'] = ['like', "%{$wechatId}%"];
            }
            
            // 昵称
            $nickname = Request::param('nickname');
            if (!empty($nickname)) {
                $where['nickname|accountNickname'] = ['like', "%{$nickname}%"];
            }

            // 获取分页参数
            $page = (int)Request::param('page', 1);
            $limit = (int)Request::param('limit', 10);
            
            // 获取排序参数
            $sort = Request::param('sort', 'id');
            $order = Request::param('order', 'desc');

            // 公司账户表没有 companyId，需要转换一下
            $acountInfo = CompanyAccount::getAccountByCompanyId($userInfo['companyId']);

            // 先用账号进行查询
            $where['accountUserName'] = $acountInfo['userName'];

            // 根据用户权限不同实现不同的查询逻辑
            if ($userInfo['isAdmin'] == 1) {
                // 管理员直接查询tk_wechat_account表
                $list = WechatAccount::getOnlineWechatList($where, "{$sort} {$order}", $page, $limit);
            } else {
                // 非管理员先查询tk_device_user表
                $deviceIds = Db::table('tk_device_user')
                    ->where('companyId', $userInfo['companyId'])
                    ->where('userId', $userInfo['id'])
                    ->column('deviceId');
                
                if (empty($deviceIds)) {
                    // 如果没有绑定设备，返回提示信息
                    return json([
                        'code' => 403,
                        'msg' => '请联系管理员绑定设备微信',
                        'data' => [
                            'total' => 0,
                            'list' => []
                        ]
                    ]);
                }

                // 获取这些设备关联的微信ID
                $wechatIds = Db::table('tk_device_wechat_login')
                    ->where('companyId', $userInfo['companyId'])
                    ->whereIn('deviceId', $deviceIds)
                    ->column('wechatId');
                
                if (empty($wechatIds)) {
                    return json([
                        'code' => 200,
                        'msg' => '获取成功',
                        'data' => [
                            'total' => 0,
                            'list' => []
                        ]
                    ]);
                }
                
                // 将微信ID添加到查询条件中
                $where['id'] = ['in', $wechatIds];
                
                // 查询微信账号
                $list = WechatAccount::getOnlineWechatList($where, "{$sort} {$order}", $page, $limit);
            }
            
            // 处理返回数据
            $data = [];
            foreach ($list->items() as $item) {
                // 计算今日可添加好友数量（这里使用一个示例算法，你可以根据实际需求修改）
                $canAddFriendCount = 20 - Db::table('tk_friend_task')->where('wechatId', $item['wechatId'])->count('*');
                if ($canAddFriendCount < 0) {
                    $canAddFriendCount = 0;
                }

                // 计算今日新增好友数量（示例数据，实际需要从数据库获取或通过其他方式计算）
                // 这里只是一个示例，你需要根据实际情况替换
                $todayNewFriendCount = Db::table('tk_friend_task')->where('wechatId', $item['wechatId'])
                    ->where('status', 3)
                    ->count('*');
                
                $data[] = [
                    'id' => $item['id'],
                    'wechatId' => $item['wechatId'],
                    'nickname' => $item['nickname'] ?: $item['accountNickname'],
                    'avatar' => $item['avatar'],
                    'accountUserName' => $item['accountUserName'],
                    'status' => $item['wechatAlive'] ? '在线' : '离线',
                    'deviceStatus' => $item['deviceAlive'] ? '在线' : '离线',
                    'totalFriend' => $item['totalFriend'],
                    'canAddFriendCount' => $canAddFriendCount,
                    'deviceInfo' => $item['imei'] . ($item['deviceMemo'] ? " ({$item['deviceMemo']})" : ''),
                    'todayNewFriendCount' => $todayNewFriendCount
                ];
            }
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'total' => $list->total(),
                    'list' => $data
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }

    /**
     * 获取微信号详情
     * @param int $id 微信号ID
     * @return \think\response\Json
     */
    public function detail($id)
    {
        try {
            // 获取微信号基本信息
            $wechat = WechatAccount::where('id', $id)
                ->where('isDeleted', 0)
                ->find();
                
            if (!$wechat) {
                return json([
                    'code' => 404,
                    'msg' => '微信号不存在'
                ]);
            }
            
            // 计算账号年龄（从创建时间到现在）
            $accountAge = 0;
            if ($wechat['createTime']) {
                $createTime = strtotime($wechat['createTime']);
                $now = time();
                $accountAge = floor(($now - $createTime) / (24 * 3600));
            }
            
            // 计算活跃程度（根据消息数）
            $activityLevel = '低';
            if ($wechat['thirtyDayMsgCount'] > 1000) {
                $activityLevel = '高';
            } elseif ($wechat['thirtyDayMsgCount'] > 500) {
                $activityLevel = '中';
            }
            
            // 评估账号权重（示例算法）
            $weight = 0;
            // 基础权重
            $weight += 10;
            // 好友数量权重
            $weight += min($wechat['totalFriend'] / 100, 20);
            // 活跃度权重
            $weight += min($wechat['thirtyDayMsgCount'] / 100, 20);
            // 账号年龄权重
            $weight += min($accountAge / 30, 10);
            // 在线状态权重
            if ($wechat['wechatAlive']) {
                $weight += 5;
            }
            
            // 获取限制记录（示例数据，实际需要从数据库获取）
            $restrictions = [
                [
                    'type' => '添加好友限制',
                    'reason' => '频繁添加好友',
                    'startTime' => date('Y-m-d H:i:s', strtotime('-1 day')),
                    'endTime' => date('Y-m-d H:i:s', strtotime('+1 day'))
                ]
            ];
            
            // 获取微信好友列表
            $friends = Db::table('tk_wechat_friend')
                ->where('wechatAccountId', $id)
                ->where('isDeleted', 0)
                ->field([
                    'id',
                    'wechatId',
                    'nickname',
                    'avatar',
                    'gender',
                    'region',
                    'signature',
                    'labels',
                    'createTime'
                ])
                ->select();
            
            // 处理返回数据
            $data = [
                'basicInfo' => [
                    'id' => $wechat['id'],
                    'wechatId' => $wechat['wechatId'],
                    'nickname' => $wechat['nickname'] ?: $wechat['accountNickname'],
                    'avatar' => $wechat['avatar'],
                    'status' => $wechat['wechatAlive'] ? '在线' : '离线',
                    'deviceStatus' => $wechat['deviceAlive'] ? '在线' : '离线',
                    'deviceInfo' => $wechat['imei'] . ($wechat['deviceMemo'] ? " ({$wechat['deviceMemo']})" : ''),
                    'gender' => $wechat['gender'],
                    'region' => $wechat['region'],
                    'signature' => $wechat['signature']
                ],
                'statistics' => [
                    'totalFriend' => $wechat['totalFriend'],
                    'maleFriend' => $wechat['maleFriend'],
                    'femaleFriend' => $wechat['femaleFriend'],
                    'canAddFriendCount' => 30 - (isset($wechat['yesterdayMsgCount']) ? intval($wechat['yesterdayMsgCount']) : 0),
                    'yesterdayMsgCount' => $wechat['yesterdayMsgCount'],
                    'sevenDayMsgCount' => $wechat['sevenDayMsgCount'],
                    'thirtyDayMsgCount' => $wechat['thirtyDayMsgCount']
                ],
                'accountInfo' => [
                    'age' => $accountAge,
                    'activityLevel' => $activityLevel,
                    'weight' => round($weight, 2),
                    'createTime' => $wechat['createTime'],
                    'lastUpdateTime' => $wechat['updateTime']
                ],
                'restrictions' => $restrictions,
                'friends' => $friends
            ];
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }

    /**
     * 微信好友转移
     * 将一个微信号的好友转移至另一个在线微信号
     * 
     * @return \think\response\Json
     */
    public function transferFriends()
    {
        try {
            // 获取请求参数
            $sourceWechatId = Request::param('source_id'); // 源微信账号ID
            $targetWechatId = Request::param('target_id'); // 目标微信账号ID
            
            // 参数验证
            if (empty($sourceWechatId) || empty($targetWechatId)) {
                return json([
                    'code' => 400,
                    'msg' => '参数错误：源微信账号ID和目标微信账号ID不能为空'
                ]);
            }
            
            // 检查源微信账号是否存在
            $sourceWechat = WechatAccount::where('id', $sourceWechatId)
                ->where('isDeleted', 0)
                ->find();
                
            if (!$sourceWechat) {
                return json([
                    'code' => 404,
                    'msg' => '源微信账号不存在'
                ]);
            }
            
            // 检查目标微信账号是否存在且在线
            $targetWechat = WechatAccount::where('id', $targetWechatId)
                ->where('isDeleted', 0)
                ->where('wechatAlive', 1)
                ->where('deviceAlive', 1)
                ->find();
                
            if (!$targetWechat) {
                return json([
                    'code' => 404,
                    'msg' => '目标微信账号不存在或不在线'
                ]);
            }
            
            // 获取源微信账号的好友列表
            $friends = Db::table('tk_wechat_friend')
                ->where('wechatAccountId', $sourceWechatId)
                ->where('isDeleted', 0)
                ->select();
                
            // 统计好友数量
            $totalFriends = count($friends);
            
            if ($totalFriends == 0) {
                return json([
                    'code' => 400,
                    'msg' => '源微信账号没有可转移的好友'
                ]);
            }
            
            // 开始事务
            Db::startTrans();
            
            try {
                $successCount = 0;
                $failCount = 0;
                $duplicateCount = 0;
                $failList = [];
                
                foreach ($friends as $friend) {
                    // 检查目标微信账号是否已经有此好友
                    $existFriend = Db::table('tk_wechat_friend')
                        ->where('wechatAccountId', $targetWechatId)
                        ->where('wechatId', $friend['wechatId'])
                        ->where('isDeleted', 0)
                        ->find();
                        
                    if ($existFriend) {
                        // 已经存在此好友，跳过
                        $duplicateCount++;
                        continue;
                    }
                    
                    // 准备插入数据
                    $newFriend = [
                        'wechatAccountId' => $targetWechatId,
                        'alias' => $friend['alias'],
                        'wechatId' => $friend['wechatId'],
                        'conRemark' => $friend['conRemark'],
                        'nickname' => $friend['nickname'],
                        'pyInitial' => $friend['pyInitial'],
                        'quanPin' => $friend['quanPin'],
                        'avatar' => $friend['avatar'],
                        'gender' => $friend['gender'],
                        'region' => $friend['region'],
                        'addFrom' => $friend['addFrom'],
                        'labels' => $friend['labels'],
                        'signature' => $friend['signature'],
                        'isDeleted' => 0,
                        'isPassed' => $friend['isPassed'],
                        'accountId' => $friend['accountId'],
                        'extendFields' => $friend['extendFields'],
                        'accountUserName' => $friend['accountUserName'],
                        'accountRealName' => $friend['accountRealName'],
                        'accountNickname' => $friend['accountNickname'],
                        'ownerAlias' => $targetWechat['alias'],
                        'ownerWechatId' => $targetWechat['wechatId'],
                        'ownerNickname' => $targetWechat['nickname'] ?: $targetWechat['accountNickname'],
                        'ownerAvatar' => $targetWechat['avatar'],
                        'phone' => $friend['phone'],
                        'thirdParty' => $friend['thirdParty'],
                        'groupId' => $friend['groupId'],
                        'passTime' => $friend['passTime'],
                        'additionalPicture' => $friend['additionalPicture'],
                        'desc' => $friend['desc'],
                        'country' => $friend['country'],
                        'province' => $friend['province'],
                        'city' => $friend['city'],
                        'createTime' => date('Y-m-d H:i:s'),
                        'updateTime' => date('Y-m-d H:i:s')
                    ];
                    
                    // 插入新好友记录
                    $result = Db::table('tk_wechat_friend')->insert($newFriend);
                    
                    if ($result) {
                        $successCount++;
                    } else {
                        $failCount++;
                        $failList[] = [
                            'id' => $friend['id'],
                            'wechatId' => $friend['wechatId'],
                            'nickname' => $friend['nickname']
                        ];
                    }
                }
                
                // 更新两个微信账号的好友数量
                $maleFriendsCount = Db::table('tk_wechat_friend')
                    ->where('wechatAccountId', $targetWechatId)
                    ->where('isDeleted', 0)
                    ->where('gender', 1)
                    ->count();
                    
                $femaleFriendsCount = Db::table('tk_wechat_friend')
                    ->where('wechatAccountId', $targetWechatId)
                    ->where('isDeleted', 0)
                    ->where('gender', 2)
                    ->count();
                    
                $totalFriendsCount = $maleFriendsCount + $femaleFriendsCount;
                
                // 更新目标微信账号的好友数量
                WechatAccount::where('id', $targetWechatId)
                    ->update([
                        'totalFriend' => $totalFriendsCount,
                        'maleFriend' => $maleFriendsCount,
                        'femaleFriend' => $femaleFriendsCount,
                        'updateTime' => date('Y-m-d H:i:s')
                    ]);
                
                // 提交事务
                Db::commit();
                
                return json([
                    'code' => 200,
                    'msg' => '好友转移成功',
                    'data' => [
                        'total' => $totalFriends,
                        'success' => $successCount,
                        'fail' => $failCount,
                        'duplicate' => $duplicateCount,
                        'failList' => $failList
                    ]
                ]);
            } catch (\Exception $e) {
                // 回滚事务
                Db::rollback();
                throw $e;
            }
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '好友转移失败：' . $e->getMessage()
            ]);
        }
    }
} 