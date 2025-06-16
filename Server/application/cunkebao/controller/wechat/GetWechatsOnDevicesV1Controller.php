<?php

namespace app\cunkebao\controller\wechat;

use app\common\model\Device as DeviceModel;
use app\common\model\Device as DevicesModel;
use app\common\model\DeviceUser as DeviceUserModel;
use app\common\model\DeviceWechatLogin as DeviceWechatLoginModel;
use app\common\model\User as UserModel;
use app\common\model\WechatAccount as WechatAccountModel;
use app\common\model\WechatCustomer as WechatCustomerModel;
use app\common\model\WechatFriendShip as WechatFriendShipModel;
use app\cunkebao\controller\BaseController;
use library\ResponseHelper;

/**
 * 微信控制器
 */
class GetWechatsOnDevicesV1Controller extends BaseController
{
    /**
     * 计算今日可添加好友数量
     *
     * @param string $wechatId
     * @return int
     */
    protected function getCanAddFriendCount(string $wechatId): int
    {
        $weight = (string)WechatCustomerModel::where(
            [
                'wechatId'  => $wechatId,
                'companyId' => $this->getUserInfo('companyId')
            ]
        )
            ->value('weight');

        return json_decode($weight)->addLimit ?? 0;
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
     * TODO 获取微信加友状态
     *
     * @param string $wechatId
     * @return int
     */
    protected function getWechatAddFriendStatus(string $wechatId): int
    {
        return 1;
    }

    /**
     * 获取微信好友数量
     *
     * @param string $ownerWechatId
     * @return int
     */
    protected function getFriendsCount(string $ownerWechatId): int
    {
        return WechatFriendShipModel::where(
            [
                'ownerWechatId' => $ownerWechatId,
                //'companyId'     => $this->getUserInfo('companyId'),
            ]
        )
            ->count();
    }

    /**
     * 获取微信所属设备
     *
     * @param string $wechatId
     * @return string
     */
    protected function getWhereOnDevice(string $wechatId): string
    {
        return (string)DeviceModel::alias('d')
            ->where(
                [
                    'l.wechatId' => $wechatId,
                    'l.alive'    => DeviceWechatLoginModel::ALIVE_WECHAT_ACTIVE,
                    'l.companyId' => $this->getUserInfo('companyId')
                ]
            )
            ->join('device_wechat_login l', 'd.id = l.deviceId AND l.companyId = '. $this->getUserInfo('companyId'))
            ->order('l.id desc')
            ->value('d.memo');
    }

    /**
     * 主操盘手获取项目下所有设备的id
     *
     * @return array
     * @throws \Exception
     */
    protected function getCompanyDevicesId(): array
    {
        return DevicesModel::where(
            [
                'companyId' => $this->getUserInfo('companyId')
            ]
        )
            ->column('id');
    }

    /**
     * 非主操盘手获取分配的设备
     *
     * @return array
     */
    protected function getUserDevicesId(): array
    {
        return DeviceUserModel::where(
            [
                'userId'    => $this->getUserInfo('id'),
                'companyId' => $this->getUserInfo('companyId')
            ]
        )
            ->column('deviceId');
    }

    /**
     * 根据不同角色，显示的设备数量不同
     *
     * @return array
     * @throws \Exception
     */
    protected function getDevicesId(): array
    {
        return ($this->getUserInfo('isAdmin') == UserModel::ADMIN_STP)
            ? $this->getCompanyDevicesId()  // 主操盘手获取所有的设备
            : $this->getUserDevicesId();    // 非主操盘手获取分配的设备
    }

    /**
     * 获取有登录设备的微信id
     *
     * @return array
     */
    protected function getWechatIdsOnDevices(): array
    {
        // 关联设备id查询，过滤掉已删除的设备
        if (empty($deviceIds = $this->getDevicesId())) {
            throw new \Exception('暂无设备数据', 200);
        }

        return DeviceWechatLoginModel::where(
            [
                'companyId' => $this->getUserInfo('companyId'),
                'alive'     => DeviceWechatLoginModel::ALIVE_WECHAT_ACTIVE,
            ]
        )
            ->where('deviceId', 'in', $deviceIds)
            ->column('wechatId');
    }

    /**
     * TODO 获取设备最新活跃时间
     *
     * @param string $wechatId
     * @return string
     */
    protected function getLatestActiveTime(string $wechatId): string
    {
        return date('Y-m-d H:i:s', strtotime('-1 day'));
    }

    /**
     * 构建查询条件
     *
     * @param array $params
     * @return array
     */
    protected function makeWhere(array $params = []): array
    {
        if (empty($wechatIds = $this->getWechatIdsOnDevices())) {
            throw new \Exception('设备尚未有登录微信', 200);
        }

        // 关键词搜索（同时搜索微信号和昵称）
        if (!empty($keyword = $this->request->param('keyword'))) {
            $where[] = ['exp', "w.alias LIKE '%{$keyword}%' OR w.nickname LIKE '%{$keyword}%'"];
        }

        $where['w.wechatId'] = array('in', implode(',', $wechatIds));

        return array_merge($where, $params);
    }

    /**
     * 获取在线微信账号列表
     *
     * @param array $where
     * @return \think\Paginator 分页对象
     */
    protected function getOnlineWechatList(array $where): \think\Paginator
    {
        $query = WechatAccountModel::alias('w')
            ->field(
                [
                    'w.id', 'w.nickname', 'w.avatar', 'w.wechatId',
                    'CASE WHEN w.alias IS NULL OR w.alias = "" THEN w.wechatId ELSE w.alias END AS wechatAccount',
                    'l.deviceId'
                ]
            )
            ->join('device_wechat_login l', 'w.wechatId = l.wechatId AND l.companyId = '. $this->getUserInfo('companyId'))
            ->order('w.id desc')
            ->group('w.wechatId');

        foreach ($where as $key => $value) {
            if (is_numeric($key) && is_array($value) && isset($value[0]) && $value[0] === 'exp') {
                $query->whereExp('', $value[1]);
                continue;
            }

            if (is_array($value)) {
                $query->where($key, ...$value);
                continue;
            }

            $query->where($key, $value);
        }

        return $query->paginate($this->request->param('limit/d', 10), false, ['page' => $this->request->param('page/d', 1)]);
    }

    /**
     * 构建返回数据
     *
     * @param \think\Paginator $result
     * @return array
     */
    protected function makeResultedSet(\think\Paginator $result): array
    {
        $resultSets = [];

        foreach ($result->items() as $item) {
            $sections = $item->toArray() + [
                    'times'        => $this->getCanAddFriendCount($item->wechatId),
                    'addedCount'   => $this->getTodayNewFriendCount($item->wechatId),
                    'wechatStatus' => $this->getWechatAddFriendStatus($item->wechatId),
                    'totalFriend'  => $this->getFriendsCount($item->wechatId),
                    'deviceMemo'   => $this->getWhereOnDevice($item->wechatId),
                    'activeTime'   => $this->getLatestActiveTime($item->wechatId),
                ];

            array_push($resultSets, $sections);
        }

        return $resultSets;
    }

    /**
     * 获取在线微信账号列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $result = $this->getOnlineWechatList(
                $this->makeWhere()
            );

            return ResponseHelper::success(
                [
                    'list'  => $this->makeResultedSet($result),
                    'total' => $result->total(),
                ]
            );
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
}