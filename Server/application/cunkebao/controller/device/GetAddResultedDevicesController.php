<?php

namespace app\cunkebao\controller\device;

use app\api\controller\DeviceController as ApiDeviceController;
use app\common\model\Device as DeviceModel;
use app\common\model\User as UserModel;
use app\cunkebao\controller\BaseController;
use library\ResponseHelper;
use think\Db;

/**
 * 设备控制器
 */
class GetAddResultedDevicesController extends BaseController
{
    /**
     * 通过账号id 获取项目id。
     *
     * @param int $accountId
     * @return int
     */
    protected function getCompanyIdByAccountId(int $accountId): int
    {
        return UserModel::where('s2_accountId', $accountId)->value('companyId');
    }

    /**
     * 获取项目下的所有设备。
     *
     * @param int $companyId
     * @return array
     */
    protected function getAllDevicesIdWithInCompany(int $companyId): array
    {
        return DeviceModel::where('companyId', $companyId)->column('id') ?: [0];
    }

    /**
     * 执行数据迁移。
     *
     * @param int $accountId
     * @return void
     */
    protected function migrateData(int $accountId): void
    {
        $companyId = $this->getCompanyIdByAccountId($accountId);
        $deviceIds = $this->getAllDevicesIdWithInCompany($companyId) ?: [0];

        // 从 s2_device 导入数据。
        $this->getNewDeviceFromS2_device($deviceIds, $companyId);
    }

    /**
     * 从 s2_device 导入数据。
     *
     * @param array $ids
     * @param int $companyId
     * @return void
     */
    protected function getNewDeviceFromS2_device(array $ids, int $companyId): void
    {
        $ids = implode(',', $ids);

        $sql = "insert into ck_device(`id`, `imei`, `model`, phone, operatingSystem,memo,alive,brand,rooted,xPosed,softwareVersion,extra,createTime,updateTime,deleteTime,companyId)  
                select 
                    d.id,d.imei,d.model,d.phone,d.operatingSystem,d.memo,d.alive,d.brand,d.rooted,d.xPosed,d.softwareVersion,d.extra,d.createTime,d.lastUpdateTime,d.deleteTime,a.departmentId companyId
                from s2_device d 
                    join s2_company_account a on d.currentAccountId = a.id
                where isDeleted = 0 and deletedAndStop = 0 and d.id not in ({$ids}) and a.departmentId = {$companyId}
                ";

        Db::query($sql);
    }

    /**
     * 获取添加的关联设备结果。
     *
     * @param int $accountId
     * @return bool
     */
    protected function getAddResulted(int $accountId): bool
    {
        $result = (new ApiDeviceController())->getlist(
            [
                'accountId' => $accountId,
                'pageIndex' => 0,
                'pageSize' => 1
            ],
            true
        );

        $result = json_decode($result, true);
        $result = $result['data']['results'][0] ?? false;

        return $result ? (
            // 125是前端延迟5秒 + 轮询120次 1次/s
            time() - strtotime($result['lastUpdateTime']) <= 65
        ) : false;
    }

    /**
     * 获取基础统计信息
     *
     * @return \think\response\Json
     */
    public function index()
    {
        $accountId = $this->request->param('accountId/d');

        $isAdded = $this->getAddResulted($accountId);
        $isAdded && $this->migrateData($accountId);

        return ResponseHelper::success(
            [
                'added' => $isAdded
            ]
        );
    }
}