<?php

namespace app\cunkebao\controller\wechat;

use AccountWeight\WechatAccountWeightAssessment;
use app\common\model\WechatFriendShip as WechatFriendShipModel;
use app\common\model\WechatRestricts as WechatRestrictsModel;
use app\cunkebao\controller\BaseController;
use library\ResponseHelper;

/**
 * 设备微信控制器
 */
class GetWechatOnDeviceSummarizeV1Controller extends BaseController
{
    /**
     * TODO 计算账号年龄（从创建时间到现在）
     *
     * @param string $wechatId
     * @return string
     */
    protected function getRegisterDate(string $wechatId): string
    {
        return date('Y-m-d H:i:s', strtotime('-15 months'));
    }

    /**
     * TODO 获取每天聊天次数。
     *
     * @param string $wechatId
     * @return int
     */
    protected function getChatTimesPerDay(string $wechatId): int
    {
        return mt_rand(0, 100);
    }

    /**
     * TODO 总聊天数量
     *
     * @param string $wechatId
     * @return int
     */
    protected function getChatTimesTotal(string $wechatId): int
    {
        return mt_rand(2000, 1000000);
    }

    /**
     * 计算活跃程度（根据消息数）
     *
     * @param string $wechatId
     * @return string
     */
    protected function getActivityLevel(string $wechatId): array
    {
        return [
            'allTimes' => $this->getChatTimesTotal($wechatId),
            'dayTimes' => $this->getChatTimesPerDay($wechatId),
        ];
    }

    /**
     * 获取限制记录
     *
     * @param string $wechatId
     * @return array
     */
    protected function getRestrict(string $wechatId): array
    {
        return WechatRestrictsModel::alias('r')
            ->field(
                [
                    'r.id', 'r.restrictTime date', 'r.level', 'r.reason'
                ]
            )
            ->where('r.wechatId', $wechatId)->select()
            ->toArray();
    }

    /**
     * 计算好友数量（每5权重=1好友，最多20个）
     *
     * @param int $weight
     * @return int
     */
    protected function _calAllowedFriends(int $weight): int
    {
        $adjustedWeight = $weight;
        $lastDigit = $weight % 10;

        if ($weight < 10) {
            if ($lastDigit < 5) {
                $adjustedWeight = 5;
            } else {
                $adjustedWeight = 10;
            }
        }

        return min(20, floor($adjustedWeight / 5));
    }

    /**
     * 获取账号权重
     *
     * @param string $wechatId
     * @return array
     */
    protected function getAccountWeight(string $wechatId): array
    {
        // 微信账号加友权重评估
        $assessment = new WechatAccountWeightAssessment();
        $assessment->settingFactor($wechatId);

        return [
            'ageWeight'      => $assessment->calculAgeWeight()->getResult(),        // 账号年龄权重
            'activityWeigth' => $assessment->calculActivityWeigth()->getResult(),   // 计算活跃度权重
            'restrictWeight' => $assessment->calculRestrictWeigth()->getResult(),   // 计算限制影响权重
            'realNameWeight' => $assessment->calculRealNameWeigth()->getResult(),   // 计算实名认证权重
            'scope'          => $assessment->getWeightScope(),                      // 计算总分
        ];
    }

    /**
     * 计算今日新增好友数量
     *
     * @param string $ownerWechatId
     * @return int
     */
    protected function getTodayNewFriendCount(string $ownerWechatId): int
    {
        return WechatFriendShipModel::where(compact('ownerWechatId'))
            ->whereBetween('createTime',
                [
                    strtotime(date('Y-m-d 00:00:00')),
                    strtotime(date('Y-m-d 23:59:59'))
                ]
            )
            ->count('*');
    }

    /**
     * 获取账号加友统计数据.
     *
     * @param string $wechatId
     * @param array $accountWeight
     * @return array
     */
    protected function getStatistics(string $wechatId, array $accountWeight): array
    {
        return [
            'todayAdded' => $this->getTodayNewFriendCount($wechatId),
            'addLimit'   => $this->_calAllowedFriends($accountWeight['scope'])
        ];
    }

    /**
     * 获取微信号详情
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $wechatId = $this->request->param('id/s');

            // 以下内容依次加工数据
            $accountAge = $this->getRegisterDate($wechatId);
            $activityLevel = $this->getActivityLevel($wechatId);
            $accountWeight = $this->getAccountWeight($wechatId);
            $statistics = $this->getStatistics($wechatId, $accountWeight);
            $restrictions = $this->getRestrict($wechatId);

            return ResponseHelper::success(
                compact(
                    'accountAge',
                    'activityLevel',
                    'accountWeight',
                    'statistics',
                    'restrictions'
                )
            );
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 