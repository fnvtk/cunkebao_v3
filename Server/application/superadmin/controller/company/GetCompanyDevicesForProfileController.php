<?php

namespace app\superadmin\controller\company;

use app\common\model\Device as DeviceModel;
use app\common\model\DeviceWechatLogin as DeviceWechatLoginModel;
use app\common\model\WechatFriend as WechatFriendModel;
use Eison\Utils\Helper\ArrHelper;
use library\ResponseHelper;
use think\Controller;

/**
 * 设备管理控制器
 */
class GetCompanyDevicesForProfileController extends Controller
{
    /**
     * 获取项目下的所有设备
     *
     * @return array
     */
    protected function getDevicesWithCompanyId(): array
    {
        $companyId = $this->request->param('companyId/d', 0);

        $devices = DeviceModel::where(compact('companyId'))->field('id,memo,imei,phone,model,brand,alive,id deviceId')
            ->select()
            ->toArray();

        if (empty($devices)) {
            throw new \Exception('暂无设备', 200);
        }

        return $devices;
    }

    /**
     * 查询设备与微信的关联关系.
     *
     * @return array
     */
    protected function getDeviceWechatRelationsByDeviceIds(array $deviceIds): array
    {
        // 获取设备最新登录记录的id
        $latestLogs = DeviceWechatLoginModel::getDevicesLatestLogin($deviceIds);

        // 获取最新登录记录id
        $latestIds = array_column($latestLogs, 'lastedId');

        return DeviceWechatLoginModel::field('deviceId,wechatId,alive wAlive')
            ->whereIn('id', $latestIds)
            ->select()
            ->toArray();
    }

    /**
     * 获取设备的微信好友统计
     *
     * @param array $ownerWechatId
     * @return void
     */
    protected function getWechatFriendsCount(array $deviceIds): array
    {
        // 查询设备与微信的关联关系
        $relations = $this->getDeviceWechatRelationsByDeviceIds($deviceIds);

        // 统计微信好友数量
        $friendCounts = WechatFriendModel::alias('f')->field('ownerWechatId wechatId,count(*) friendCount')
            ->whereIn('ownerWechatId', array_column($relations, 'wechatId'))
            ->group('ownerWechatId')
            ->select()
            ->toArray();

        return ArrHelper::join($relations, $friendCounts, 'wechatId');
    }

    /**
     * 获取公司关联的设备列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $devices = $this->getDevicesWithCompanyId();
            $friendCount = $this->getWechatFriendsCount(array_column($devices, 'id'));

            $result = ArrHelper::leftJoin($devices, $friendCount, 'deviceId');

            return ResponseHelper::success($result);
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 