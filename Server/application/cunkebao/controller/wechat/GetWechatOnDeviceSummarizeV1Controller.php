<?php

namespace app\cunkebao\controller\wechat;

use app\common\model\WechatAccount as WechatAccountModel;
use app\cunkebao\controller\BaseController;

/**
 * 设备微信控制器
 */
class GetWechatOnDeviceSummarizeV1Controller extends BaseController
{

    protected function getRegisterDate()
    {
        return date('Y-m-d');
    }



    protected function getWechatAccount()
    {
        $aa = WechatAccountModel::find($this->request->param('id/d'));


        dd(

            $aa->toArray()
        );

    }




    /**
     * 获取微信号详情
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {



            $this->getWechatAccount();






            // 获取微信号基本信息
            $wechat = WechatAccountModel::where('id', $id)
                ->where('isDeleted', 0)
                ->find();

            if (!$wechat) {
                return json([
                    'code' => 404,
                    'msg'  => '微信号不存在'
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
                    'type'      => '添加好友限制',
                    'reason'    => '频繁添加好友',
                    'startTime' => date('Y-m-d H:i:s', strtotime('-1 day')),
                    'endTime'   => date('Y-m-d H:i:s', strtotime('+1 day'))
                ]
            ];

            // 处理返回数据
            $data = [
                'basicInfo'    => [
                    'id'           => $wechat['id'],
                    'wechatId'     => $wechat['wechatId'],
                    'nickname'     => $wechat['nickname'] ?: $wechat['accountNickname'],
                    'avatar'       => $wechat['avatar'],
                    'status'       => $wechat['wechatAlive'] ? '在线' : '离线',
                    'deviceStatus' => $wechat['deviceAlive'] ? '在线' : '离线',
                    'deviceInfo'   => $wechat['imei'] . ($wechat['deviceMemo'] ? " ({$wechat['deviceMemo']})" : ''),
                    'gender'       => $wechat['gender'],
                    'region'       => $wechat['region'],
                    'signature'    => $wechat['signature']
                ],
                'statistics'   => [
                    'totalFriend'       => $wechat['totalFriend'],
                    'maleFriend'        => $wechat['maleFriend'],
                    'femaleFriend'      => $wechat['femaleFriend'],
                    'canAddFriendCount' => 30 - (isset($wechat['yesterdayMsgCount']) ? intval($wechat['yesterdayMsgCount']) : 0),
                    'yesterdayMsgCount' => $wechat['yesterdayMsgCount'],
                    'sevenDayMsgCount'  => $wechat['sevenDayMsgCount'],
                    'thirtyDayMsgCount' => $wechat['thirtyDayMsgCount']
                ],
                'accountInfo'  => [
                    'age'            => $accountAge,
                    'activityLevel'  => $activityLevel,
                    'weight'         => round($weight, 2),
                    'createTime'     => $wechat['createTime'],
                    'lastUpdateTime' => $wechat['updateTime']
                ],
                'restrictions' => $restrictions,
            ];

            return json([
                'code' => 200,
                'msg'  => '获取成功',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg'  => '获取失败：' . $e->getMessage()
            ]);
        }
    }
} 