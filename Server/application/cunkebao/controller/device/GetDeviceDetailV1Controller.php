<?php

namespace app\cunkebao\controller\device;

use app\common\model\Device as DeviceModel;
use app\common\model\DeviceTaskconf as DeviceTaskconfModel;
use app\common\model\DeviceUser as DeviceUserModel;
use app\common\model\DeviceWechatLogin;
use app\common\model\WechatFriend;
use app\cunkebao\controller\BaseController;
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
            'deviceId' => $deviceId,
            'userId' => $this->getUserInfo('id'),
            'companyId' => $this->getUserInfo('companyId')
        ];

        $hasPermission = DeviceUserModel::where($where)->count() > 0;

        if (!$hasPermission) {
            throw new \Exception('您没有权限查看该设备', '403');
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
            $extra = json_decode($extra, true);

            if (is_array($extra) && isset($extra['battery'])) {
                return intval($extra['battery']);
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
        $where = [
            'deviceId' => $deviceId,
            'companyId' => $this->getUserInfo('companyId'),
            'deleteTime' => 0
        ];

        $conf = DeviceTaskconfModel::where($where)->field('autoAddFriend,autoReply,contentSync,aiChat')->find();

        return $conf ? $conf->toArray() : [
            'autoAddFriend' => 0,
            'autoReply' => 0,
            'contentSync' => 0,
            'aiChat' => 0
        ];
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
        $where = [
            'deviceId' => $deviceId,
            'companyId' => $this->getUserInfo('companyId'),
        ];

        $ownerWechatId = DeviceWechatLogin::where($where)->order('createTime desc')->value('wechatId');

        if ($ownerWechatId) {
            return WechatFriend::where(['ownerWechatId' => $ownerWechatId])->count();
        }

        return 0;
    }

    /**
     * 获取设备绑定微信你的消息总数
     *
     * @return int
     */
    protected function getThirtyDayMsgCount(): int
    {
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
            ->where('d.deleteTime', 0)
            ->find($id);

        if (empty($device)) {
            throw new \Exception('设备不存在', '404');
        }

        $device['battery'] = $this->parseExtraForBattery($device['extra']);
        $device['features'] = $this->getTaskConfig($id);
        $device['totalFriend'] = $this->getTotalFriend($id);
        $device['thirtyDayMsgCount'] = $this->getThirtyDayMsgCount();

        // 设备最后活跃时间为设备状态更新时间
        $device['lastUpdateTime'] = date('Y-m-d H:i:s', $device['lastUpdateTime']);

        // 删除冗余字段
        unset($device['extra']);

        return $device;
    }

    /**
     * 获取设备详情
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $id = $this->request->param('id/d');

            if ($this->getUserInfo('isAdmin') != 1) {
                $this->checkUserDevicePermission($id);
            }

            $resultSet = $this->getDeviceInfo($id);

            return ResponseHelper::success($resultSet);
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 