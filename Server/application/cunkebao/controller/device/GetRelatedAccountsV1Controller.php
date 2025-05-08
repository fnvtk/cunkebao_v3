<?php

namespace app\cunkebao\controller\device;

use app\common\model\DeviceUser as DeviceUserModel;
use app\common\model\DeviceWechatLogin as DeviceWechatLoginModel;
use app\common\model\User as UserModel;
use app\common\model\WechatAccount as WechatAccountModel;
use app\common\model\WechatFriend;
use app\cunkebao\controller\BaseController;
use library\ResponseHelper;

/**
 * 设备管理控制器
 */
class GetRelatedAccountsV1Controller extends BaseController
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
     * 查询设备关联的微信ID列表
     *
     * @param int $deviceId 设备ID
     * @return array 微信ID列表
     */
    protected function getDeviceWechatIds(int $deviceId): array
    {
        $where = [
            'deviceId'  => $deviceId,
            'companyId' => $this->getUserInfo('companyId')
        ];

        return DeviceWechatLoginModel::where($where)->group('wechatId')->column('wechatId');
    }

    /**
     * 通过设备关联的微信号列表获取微信账号
     *
     * @param array $wechatIds
     * @return array
     */
    protected function getWechatAccountsByIds(array $wechatIds): array
    {
        return (array)WechatAccountModel::alias('a')
            ->field([
                'a.wechatId', 'a.nickname', 'a.avatar', 'a.gender', 'a.createTime'
            ])
            ->whereIn('a.wechatId', $wechatIds)
            ->select()
            ->toArray();
    }

    /**
     * TODO 通过微信id获取微信最后活跃时间
     *
     * @param int $time
     * @return string
     */
    protected function getWechatLastActiveTime(int $time): string
    {
        return date('Y-m-d H:i:s', $time ?: time());
    }

    /**
     * TODO 加友状态
     *
     * @param string $wechatId
     * @return string
     */
    protected function getWechatStatusText(string $wechatId): string
    {
        return 1 ? '可加友' : '已停用';
    }

    /**
     * TODO 账号状态
     *
     * @param string $wechatId
     * @return string
     */
    protected function getWechatAliveText(string $wechatId): string
    {
        return 1 ? '正常' : '异常';
    }

    /**
     * 统计微信好友
     *
     * @param string $wechatId
     * @return int
     */
    protected function countFriend(string $wechatId): int
    {
        return WechatFriend::where(['ownerWechatId' => $wechatId])->count();
    }

    /**
     * 获取设备关联的微信账号信息
     *
     * @param int $deviceId 设备ID
     * @return array 微信账号信息列表
     */
    protected function getDeviceRelatedAccounts(int $deviceId)
    {
        // 获取设备关联的微信ID列表
        $wechatIds = $this->getDeviceWechatIds($deviceId);

        if (!empty($wechatIds)) {
            $results = $this->getWechatAccountsByIds($wechatIds);

            foreach ($results as &$account) {
                $account['lastActive'] = $this->getWechatLastActiveTime($account['createTime']);
                $account['statusText'] = $this->getWechatStatusText($account['wechatId']);
                $account['totalFriend'] = $this->countFriend($account['wechatId']);
                $account['wechatAliveText'] = $this->getWechatAliveText($account['wechatId']);
            }

            return $results;
        }

        return [];
    }

    /**
     * 获取设备关联的微信账号
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $deviceId = $this->request->param('id/d');

            if ($this->getUserInfo('isAdmin') != UserModel::ADMIN_STP) {
                $this->checkUserDevicePermission($deviceId);
            }

            // 获取设备关联的微信账号
            $wechatAccounts = $this->getDeviceRelatedAccounts($deviceId);

            return ResponseHelper::success(
                [
                    'deviceId' => $deviceId,
                    'accounts' => $wechatAccounts,
                    'total'    => count($wechatAccounts)
                ]
            );
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 