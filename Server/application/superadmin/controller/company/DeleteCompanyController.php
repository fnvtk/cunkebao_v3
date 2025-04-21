<?php

namespace app\superadmin\controller\company;

use app\common\model\Company as CompanyModel;
use app\common\model\User as UserModel;
use app\superadmin\controller\BaseController;
use think\Db;
use think\Validate;

/**
 * 公司控制器
 */
class DeleteCompanyController extends BaseController
{
    /**
     * 数据验证
     *
     * @param array $params
     * @return $this
     * @throws \Exception
     */
    protected function dataValidate(array $params): self
    {
        $validate = Validate::make([
            'id' => 'require|regex:/^[1-9]\d*$/',
        ], [
            'id.regex' => '非法请求',
            'id.require' => '非法请求',
        ]);

        if (!$validate->check($params)) {
            throw new \Exception($validate->getError(), 400);
        }

        return $this;
    }

    /**
     * 删除项目
     *
     * @param int $id
     * @throws \Exception
     */
    protected function deleteCompany(int $id): void
    {
        $company = CompanyModel::where('id', $id)->find();

        if (!$company) {
            throw new \Exception('项目不存在', 404);
        }

        if (!$company->delete()) {
            throw new \Exception('项目删除失败', 400);
        }
    }

    /**
     * 删除用户
     *
     * @param int $companId
     * @throws \Exception
     */
    protected function deleteUser(int $companId): void
    {
        $user = UserModel::where('companyId', $companId)->find();

        if (!$user) {
            throw new \Exception('用户不存在', 404);
        }

        if (!$user->delete()) {
            throw new \Exception('用户删除失败', 400);
        }
    }

    /**
     * 删除存客宝数据
     *
     * @param int $companId
     * @return self
     * @throws \Exception
     */
    protected function delteCkbAbout(int $companId): self
    {
        // 1. 删除项目
        $this->deleteCompany($companId);

        // 2. 删除用户
        $this->deleteUser($companId);

        return $this;
    }

    /**
     * 删除 s2 数据
     *
     * @return void
     */
    protected function deleteS2About()
    {

    }

    /**
     * 删除项目
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $params = $this->request->only('id');
            $companId = $params['id'];

            $this->dataValidate($params);

            Db::startTrans();
            $this->delteCkbAbout($companId)->deleteS2About($companId);
            Db::commit();

            return json([
                'code' => 200,
                'msg' => '删除成功'
            ]);
        } catch (\Exception $e) {
            Db::rollback();

            return json([
                'code' => $e->getCode(),
                'msg' => $e->getMessage()
            ]);
        }
    }
}