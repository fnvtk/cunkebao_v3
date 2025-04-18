<?php

namespace app\superadmin\controller\company;

use app\common\model\Company as CompanyModel;
use app\superadmin\controller\BaseController;

/**
 * 公司控制器
 */
class GetCompanyDetailForUpdateController extends BaseController
{
    /**
     * 获取下古墓详情
     *
     * @param int $id
     * @return CompanyModel
     * @throws \Exception
     */
    protected function getCompanyDetail(int $id): array
    {
        $detail = CompanyModel::alias('c')
            ->field([
                'c.id', 'c.name', 'c.status', 'c.memo', 'u.account', 'u.username', 'u.realName',
            ])
            ->leftJoin('users u', 'c.companyId = u.companyId')
            ->find($id);

        if (!$detail) {
            throw new \Exception('项目不存在', 404);
        }

        return $detail->toArray();
    }

    /**
     * 获取项目详情
     *
     * @param int $id
     * @return \think\response\Json
     */
    public function index($id)
    {
        try {
            $data = $this->getCompanyDetail($id);

            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => $e->getCode(),
                'msg' => $e->getMessage()
            ]);
        }
    }
} 