<?php

namespace app\cunkebao\controller\wechat;

use app\common\model\WechatAccount as WechatAccountModel;
use app\common\model\WechatFriendShip as WechatFriendShipModel;
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
     * TODO 获取限制记录
     *
     * @param string $wechatId
     * @return array
     */
    protected function getRestrict(string $wechatId): array
    {
        return [
            [
                'id'     => 1,
                'level'   => 2,
                'reason' => '频繁添加好友',
                'date'   => date('Y-m-d H:i:s', strtotime('-1 day')),
            ],
            [
                'id'     => 2,
                'level'   => 3,
                'reason' => '营销内容违规',
                'date'   => date('Y-m-d H:i:s', strtotime('-1 day')),
            ],
        ];
    }

    /**
     * 计算两个时间相差几个月
     *
     * @param string $wechatId
     * @return float|int
     * @throws \DateMalformedStringException
     */
    protected function getDateDiff(string $wechatId): int
    {
        $currentData  = new \DateTime(date('Y-m-d H:i:s', time()));
        $registerDate = new \DateTime($this->getRegisterDate($wechatId));

        $interval = date_diff($currentData, $registerDate);

        return $interval->y * 12 + $interval->m;
    }

    /**
     * 计算账号年龄权重
     *
     * @param string $wechatId
     * @return int
     * @throws \DateMalformedStringException
     */
    protected function _calculAgeWeight(string $wechatId): int
    {
        // 规定账号年龄五年起拥有最高权重
        $cha = ceil($this->getDateDiff($wechatId) / 60) * 100;

        return $cha > 100 ? 100 : $cha;
    }

    /**
     * 计算活跃度权重
     *
     * @param string $wechatId
     * @return int
     */
    protected function _calActivityWeigth(string $wechatId): int
    {
        // 规定每天发送50条消息起拥有最高权重
        $cha = ceil($this->getChatTimesPerDay($wechatId) / 50) * 100;

        return $cha > 100 ? 100 : $cha;
    }

    /**
     * 计算限制影响权重
     *
     * @param string $wechatId
     * @return int
     */
    protected function _calRestrictWeigth(string $wechatId): int
    {
        $list = $this->getRestrict($wechatId);  // 2
        $gtmd = 10 - count($list);              // 规定没有限制记录拥有最高权重，10条以上权重为0

        return ($gtmd < 0 ? 0 : $gtmd) * 10;
    }

    /**
     * 计算实名认证权重
     *
     * @param string $wechatId
     * @return int
     */
    protected function _calRealNameWeigth(string $wechatId): int
    {
        return 100;
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
        $ageWeight = $this->_calculAgeWeight($wechatId);           // 账号年龄权重
        $activityWeigth = $this->_calActivityWeigth($wechatId);    // 计算活跃度权重
        $restrictWeight = $this->_calRestrictWeigth($wechatId);    // 计算限制影响权重
        $realNameWeight = $this->_calRealNameWeigth($wechatId);    // 计算实名认证权重

        $scope = ceil(($ageWeight + $activityWeigth + $restrictWeight + $realNameWeight) / 4);  // 计算总分

        return compact(
            'scope',
            'ageWeight',
            'activityWeigth',
            'restrictWeight',
            'realNameWeight'
        );
    }

    /**
     * 计算今日新增好友数量
     *
     * @param string $ownerWechatId
     * @return int
     */
    protected function getTodayNewFriendCount(string $ownerWechatId): int
    {
        return WechatFriendShipModel::where( compact('ownerWechatId') )
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
     * 获取原始的64位的微信id
     *
     * @return string
     * @throws \Exception
     */
    protected function getStringWechatIdByNumberId(): string
    {
        $account = WechatAccountModel::find(
            $this->request->param('id/d')
        );

        if (is_null($account)) {
            throw new \Exception('微信账号不存在', 404);
        }

        return $account->wechatId;
    }

    /**
     * 获取微信号详情
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $wechatId = $this->getStringWechatIdByNumberId();

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