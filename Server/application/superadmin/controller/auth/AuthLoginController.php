<?php

namespace app\superadmin\controller\auth;

use app\common\model\Administrator as AdministratorModel;
use app\superadmin\controller\administrator\DeleteAdministratorController;
use library\ResponseHelper;
use think\Controller;
use think\Validate;

class AuthLoginController extends Controller
{
    /**
     * 创建登录令牌
     * @param DeleteAdministratorController $admin
     * @return string
     */
    protected function createToken(AdministratorModel $admin): string
    {
        return md5($admin->id . '|' . $admin->account . 'cunkebao_admin_secret');
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
            'account' => 'require|/\S+/',
            'password' => 'require|/\S+/',
        ]);

        if (!$validate->check($params)) {
            throw new \Exception($validate->getError(), 400);
        }

        return $this;
    }

    /**
     * 获取管理员信息
     *
     * @param array $params
     * @return object|AdministratorModel
     * @throws \Exception
     */
    protected function getAdministrator(array $params): AdministratorModel
    {
        extract($params);

        $admin = AdministratorModel::where(['account' => $account])->find();

        if (!$admin ||
            $admin->password !== $password ||
            $admin->deleteTime
        ) {
            throw new \Exception('账号不存在或密码错误', 404);
        }

        if (!$admin->status) {
            throw new \Exception('账号已禁用', 404);
        }

        return $admin;
    }

    /**
     * 更新登录信息
     *
     * @param AdministratorModel $admin
     * @return $this
     */
    protected function saveLoginInfo(AdministratorModel $admin): self
    {
        $admin->lastLoginTime = time();
        $admin->lastLoginIp = $this->request->ip();

        if (!$admin->save()) {
            throw new \Exception('拒绝登录', 403);
        }

        return $this;
    }

    /**
     * 设置登录Cookie，有效期24小时
     *
     * @param AdministratorModel $admin
     * @return void
     */
    protected function setCookie(AdministratorModel $admin): void
    {
        cookie('admin_id', $admin->id, 86400);
        cookie('admin_token', $this->createToken($admin), 86400);
    }

    /**
     * 管理员登录
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $params = $this->request->only(['account', 'password']);

            $admin = $this->dataValidate($params)->getAdministrator($params);
            $this->saveLoginInfo($admin)->setCookie($admin);

            return ResponseHelper::success(
                [
                    'id' => $admin->id,
                    'name' => $admin->username,
                    'account' => $admin->account,
                    'token' => cookie('admin_token')
                ]
            );
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
}