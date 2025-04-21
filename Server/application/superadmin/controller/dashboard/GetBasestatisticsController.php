<?php

namespace app\superadmin\controller\dashboard;

use app\common\model\Administrator as AdministratorModel;
use app\common\model\Company as CompanyModel;
use think\Controller;

/**
 * 仪表盘控制器
 */
class GetBasestatisticsController extends Controller
{
    /**
     * 项目总数
     *
     * @return CompanyModel
     */
    protected function getCompanyCount(): int
    {
        return CompanyModel::count('*');
    }

    /**
     * 管理员数量
     *
     * @return int
     */
    protected function getAdminCount(): int
    {
        return AdministratorModel::count('*');
    }

    /**
     * 客户总数
     *
     * @return int
     */
    protected function getCustomerCount(): int
    {
        return $this->getCompanyCount();
    }

    /**
     * 获取基础统计信息
     *
     * @return \think\response\Json
     */
    public function index()
    {
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'companyCount' => $this->getCompanyCount(),
                'adminCount' => $this->getAdminCount(),
                'customerCount' => $this->getCustomerCount(),
            ]
        ]);
    }
}