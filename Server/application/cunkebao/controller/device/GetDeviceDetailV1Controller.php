<?php

namespace app\cunkebao\controller\device;

use app\common\model\Device as DeviceModel;
use app\common\model\DeviceTaskconf as DeviceTaskconfModel;
use app\common\model\DeviceUser as DeviceUserModel;
use app\common\model\DeviceWechatLogin as DeviceWechatLoginModel;
use app\common\model\User as UserModel;
use app\common\model\WechatCustomer as WechatCustomerModel;
use app\common\model\WechatFriendShip as WechatFriendShipModel;
use app\cunkebao\controller\BaseController;
use Eison\Utils\Helper\ArrHelper;
use library\ResponseHelper;

/**
 * 设备管理控制器
 */
class GetDeviceDetailV1Controller extends BaseController
{
    /**
     * 检查用户是否有权限操作指定设备
     *
     * @param int $deviceId
     * @return void
     */
    protected function checkUserDevicePermission(int $deviceId): void
    {
        $where = [
            'deviceId'  => $deviceId,
            'userId'    => $this->getUserInfo('id'),
            'companyId' => $this->getUserInfo('companyId')
        ];

        $hasPermission = DeviceUserModel::where($where)->count() > 0;

        if (!$hasPermission) {
            throw new \Exception('您没有权限查看该设备', 403);
        }
    }

    /**
     * 解析设备额外信息
     *
     * @param string $extra
     * @return int
     */
    protected function parseExtraForBattery(string $extra): int
    {
        if (!empty($extra)) {
            $extra = json_decode($extra);

            if ($extra && isset($extra->battery)) {
                return intval($extra->battery);
            }
        }

        return 0;
    }

    /**
     * 解析taskConfig字段获取功能开关
     *
     * @param int $deviceId
     * @return int[]
     * @throws \Exception
     */
    protected function getTaskConfig(int $deviceId): array
    {
        $companyId = $this->getUserInfo('companyId');

        $conf = DeviceTaskconfModel::alias('c')
            ->field([
                'c.autoAddFriend', 'c.autoReply', 'c.momentsSync', 'c.aiChat'
            ])
            ->where(compact('companyId', 'deviceId'))
            ->find();

        if (!is_null($conf)) {
            return $conf->toArray();
        }

        // 未配置时赋予默认关闭的状态
        return ArrHelper::getValue('autoAddFriend,autoReply,momentsSync,aiChat', [], 0);
    }

    /**
     * 获取设备最新登录微信的 wechatId
     *
     * @param int $deviceId
     * @return string|null
     * @throws \Exception
     */
    protected function getDeviceLatestWechatLogin(int $deviceId): ?string
    {
        return DeviceWechatLoginModel::where(
            [
                'companyId' => $this->getUserInfo('companyId'),
                'deviceId'  => $deviceId,
                'alive'     => DeviceWechatLoginModel::ALIVE_WECHAT_ACTIVE
            ]
        )
            ->value('wechatId');
    }

    /**
     * 统计设备登录微信的好友
     *
     * @param int $deviceId
     * @return int
     * @throws \Exception
     */
    protected function getTotalFriend(int $deviceId): int
    {
        $ownerWechatId = $this->getDeviceLatestWechatLogin($deviceId);

        if ($ownerWechatId) {
            return WechatFriendShipModel::where(
                [
                    'companyId'     => $this->getUserInfo('companyId'),
                    'ownerWechatId' => $ownerWechatId
                ]
            )
                ->count();
        }

        return 0;
    }

    /**
     * 获取设备绑定微信的消息总数
     *
     * @param int $deviceId
     * @return int
     */
    protected function getThirtyDayMsgCount(int $deviceId): int
    {
        $ownerWechatId = $this->getDeviceLatestWechatLogin($deviceId);

        if ($ownerWechatId) {
            $activity = (string)WechatCustomerModel::where(
                [
                    'wechatId'  => $ownerWechatId,
                    'companyId' => $this->getUserInfo('companyId')
                ]
            )
                ->value('activity');

            return json_decode($activity)->totalMsgCount ?? 0;
        }

        return 0;
    }

    /**
     * 获取设备详情
     * @param int $id 设备ID
     * @return array|null 设备信息
     */
    protected function getDeviceInfo(int $id)
    {
        // 查询设备基础信息与关联的微信账号信息
        $device = DeviceModel::alias('d')
            ->field([
                'd.id', 'd.imei', 'd.memo', 'd.alive', 'd.updateTime as lastUpdateTime', 'd.extra'
            ])
            ->find($id);

        if (empty($device)) {
            throw new \Exception('设备不存在', 404);
        }

        $device['battery'] = $this->parseExtraForBattery($device['extra']);
        $device['features'] = $this->getTaskConfig($id);
        $device['totalFriend'] = $this->getTotalFriend($id);
        $device['thirtyDayMsgCount'] = $this->getThirtyDayMsgCount($id);

        // 设备最后活跃时间为设备状态更新时间
        $device['lastUpdateTime'] = date('Y-m-d H:i:s', $device['lastUpdateTime']);

        // 删除冗余字段
        unset($device['extra']);

        return $device;
    }

    /**
     * 获取设备详情
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $id = $this->request->param('id/d');

            if ($this->getUserInfo('isAdmin') != UserModel::ADMIN_STP) {
                $this->checkUserDevicePermission($id);
            }

            return ResponseHelper::success(
                $this->getDeviceInfo($id)
            );
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 