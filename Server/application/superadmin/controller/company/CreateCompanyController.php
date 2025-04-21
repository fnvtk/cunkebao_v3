<?php

namespace app\superadmin\controller\company;

use app\common\model\Company as CompanyModel;
use app\common\model\User as UsersModel;
use app\library\s2\CurlHandle;
use app\superadmin\controller\BaseController;
use Eison\Utils\Helper\ArrHelper;
use think\Db;
use think\facade\Env;
use think\Validate;

/**
 * 公司控制器
 */
class CreateCompanyController extends BaseController
{
    /**
     * S2 创建部门并返回id
     *
     * @param array $params
     * @return array
     */
    protected function s2CreateDepartment(array $params): ?array
    {
        $params = ArrHelper::getValue('name=departmentName,memo=departmentMemo,account=accountName,password=accountPassword,realName=accountRealName,username=accountNickname,accountMemo', $params);

        // 创建公司部门
        $response = CurlHandle::getInstant()
            ->setBaseUrl(Env::get('rpc.API_BASE_URL'))
            ->setMethod('post')
            ->send('/v1/api/account/createNewAccount', $params);

        $result = json_decode($response, true);

        if ($result['code'] != 200) {
            throw new \Exception($result['msg'], 210 . $result['code']);
        }

        return $result['data'] ?: null;
    }

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
            'name' => 'require|max:50|/\S+/',
            'username' => 'require|max:20|/\S+/',
            'account' => 'require|regex:/^1[3-9]\d{9}$/',
            'status' => 'require|in:0,1',
            'password' => 'require|/\S+/',
            'realName' => 'require|/\S+/',
            'memo' => '/\S+/',
        ], [
            'name.require' => '请输入项目名称',
            'username.require' => '请输入用户昵称',
            'account.require' => '请输入账号',
            'account.regex' => '账号为手机号',
            'status.require' => '缺少重要参数',
            'status.in' => '非法参数',
            'password.require' => '请输入密码',
            'realName.require' => '请输入真实姓名',
        ]);

        if (!$validate->check($params)) {
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
        $department = $this->s2CreateDepartment($params);

        if (!$department || !isset($department['id']) || !isset($department['departmentId'])) {
            throw new \Exception('S2返参异常', 210402);
        }

        return array_merge($params, [
            'companyId' => $department['departmentId'],
            's2_accountId' => $department['id'],
        ]);
    }

    /**
     * 存客宝创建项目
     *
     * @param array $params
     * @return void
     * @throws \Exception
     */
    protected function ckbCreateCompany(array $params): void
    {
        $params = ArrHelper::getValue('companyId=id,companyId,name,memo,status', $params);
        $result = CompanyModel::create($params);

        if (!$result) {
            throw new \Exception('创建公司记录失败', 402);
        }
    }

    /**
     * 存客宝创建账号
     *
     * @param array $params
     * @return void
     * @throws \Exception
     */
    protected function ckbCreateUser(array $params): void
    {
        $params = ArrHelper::getValue(
            'username,account,password=passwordLocal,companyId,s2_accountId,status,realName',
            $params
        );

        $result = UsersModel::create(array_merge($params, [
            'passwordMd5' => md5($params['passwordLocal']),
            'isAdmin' => 1,  // 主要账号默认1
            'typeId'  => 1,  // 类型：运营后台/操盘手传1、 门店传2
        ]));

        if (!$result) {
            throw new \Exception('创建用户记录失败', 402);
        }
    }

    /**
     * @param array $params
     * @return void
     * @throws \Exception
     */
    protected function createCkbAbout(array $params)
    {
        // 1. 存客宝创建项目
        $this->ckbCreateCompany($params);

        // 2. 存客宝创建操盘手总账号
        $this->ckbCreateUser($params);
    }

    /**
     * 创建新项目
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $params = $this->request->only(['name', 'status', 'username', 'account', 'password', 'realName', 'memo']);
            $params = $this->dataValidate($params)->creatS2About($params);

            Db::startTrans();
            $this->createCkbAbout($params);
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