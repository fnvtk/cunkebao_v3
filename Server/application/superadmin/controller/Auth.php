<?php
namespace app\superadmin\controller;

use think\Controller;
use app\superadmin\model\Administrator;

class Auth extends Controller
{
    /**
     * 管理员登录
     * @return \think\response\Json
     */
    public function login()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }

        $account = $this->request->post('account');
        $password = $this->request->post('password');

        if (empty($account) || empty($password)) {
            return json(['code' => 400, 'msg' => '账号和密码不能为空']);
        }

        $admin = Administrator::login($account, $password);
        
        if (!$admin) {
            return json(['code' => 401, 'msg' => '账号或密码错误']);
        }

        // 更新登录信息
        $admin->lastLoginTime = time();
        $admin->lastLoginIp = $this->request->ip();
        $admin->save();

        // 设置登录Cookie，有效期24小时
        cookie('admin_id', $admin->id, 86400);
        cookie('admin_token', $this->createToken($admin), 86400);

        return json([
            'code' => 200,
            'msg' => '登录成功',
            'data' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'account' => $admin->account,
                'token' => cookie('admin_token')
            ]
        ]);
    }

    /**
     * 创建登录令牌
     * @param Administrator $admin
     * @return string
     */
    private function createToken($admin)
    {
        $data = $admin->id . '|' . $admin->account;
        return md5($data . 'cunkebao_admin_secret');
    }
} 