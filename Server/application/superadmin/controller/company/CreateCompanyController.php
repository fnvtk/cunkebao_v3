<?php

namespace app\superadmin\controller\company;

use app\common\model\Company as CompanyModel;
use app\common\model\User as UsersModel;
use app\library\s2\CurlHandle;
use app\superadmin\controller\BaseController;
use think\Db;
use think\Validate;

/**
 * 公司控制器
 */
class CreateCompanyController extends BaseController
{
    /**
     * 获取 CURL
     *
     * @return CurlHandle|null
     */
    protected function getCurl()
    {
        return CurlHandle::getInstant()->setMethod('post')->setBaseUrl('http://yishi.com/');
    }

    /**
     * S2 创建部门并返回id
     *
     * @param array $params
     * @return array
     */
    protected function s2CreateDepartment(array $params): array
    {
        $response = $this->getCurl()->setMethod('post')->send('v1/api/account/department/create', [
            'name' => $params['name'],
            'memo' => $params['description'],
        ]);

        $result = json_decode($response, true);

        if ($result['code'] != 200) {
            throw new \Exception($result['msg'], '20011');
        }

        return $result['data'];
    }

    /**
     * S2 创建部门账号
     *
     * @param array $params
     * @param int $departmentId
     * @return array
     * @throws \Exception
     */
    protected function s2CreateUserAccountWithinDepartment(array $params, int $departmentId): array
    {
        $response = $this->getCurl()->send('v1/api/account/create', [
            'userName' => $params['account'],
            'password' => $params['password'],
            'realName' => $params['realName'],
            'nickname' => $params['nickname'],
            'departmentId' => $departmentId
        ]);

        $result = json_decode($response, true);

        if ($result['code'] != 200) {
            throw new \Exception($result['msg'], '20011');
        }
    }

    /**
     * 数据验证
     *
     * @return $this
     * @throws \Exception
     */
    protected function dataValidate(): self
    {
        $validate = Validate::make([
            'name' => 'require|max:50|/\S+/',
            'nickname' => 'require|max:20|/\S+/',
            'account' => 'require|regex:/^1[3-9]\d{9}$/',
            'password' => 'require|/\S+/',
            'realName' => 'require|/\S+/',
            'description' => 'require|/\S+/',
        ]);

        if (!$validate->check($this->request->post())) {
            throw new \Exception($validate->getError(), 400);
        }

        return $this;
    }

    /**
     * S2 部分
     *
     * @param array $params
     * @return array
     * @throws \Exception
     */
    protected function creatS2About(array $params): array
    {
        // 1. 调用创建部门接口
        $department = $this->s2CreateDepartment($params);

        // 2. 调用创建账号接口
        $this->s2CreateUserAccountWithinDepartment($params, $department['id']);

        return $department;
    }

    /**
     * 存客宝创建项目
     *
     * @param array $params
     * @return array
     * @throws \Exception
     */
    protected function ckbCreateCompany(array $params): array
    {
        $result = CompanyModel::create(
            [
                'companyId' => $departmentData['id'],
                'name' => $departmentData['name'],
                'mome' => $departmentData['memo']
            ]
        );

        if (!$result) {
            throw new \Exception('创建公司记录失败', 402);
        }
    }

    /**
     * 存客宝创建账号
     *
     * @param array $params
     * @return array
     * @throws \Exception
     */
    protected function ckbCreateUser(array $params): array
    {
        $result = UsersModel::create(
            [
                'account' => $params['account'],
                'passwordMd5' => md5($params['password']),
                'passwordLocal' => $params['password'],
                'companyId' => $departmentData['data']['id']
            ]
        );

        if (!$result) {
            throw new \Exception('创建用户记录失败', 402);
        }
    }

    /**
     * @param array $params
     * @return array
     * @throws \Exception
     */
    protected function createCkbAbout(array $params): array
    {
        // 1. 存客宝创建项目
        $this->ckbCreateCompany($params);

        // 2. 存客宝创建操盘手总账号
        $this->ckbCreateUser();
    }

    /**
     * 创建新项目
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $params = $this->request->only(['name', 'nickname', 'account', 'password', 'realName', 'description']);

            var_dump($params);
            die;
            $department = $this->dataValidate($params)->creatS2About($params);

            Db::startTrans();
            $this->createCkbAbout($department);
            Db::commit();

            return json([
                'code' => 200,
                'msg' => '创建成功'
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