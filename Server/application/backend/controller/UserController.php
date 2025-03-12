<?php

namespace app\backend\controller;

use app\common\model\UserModel;
use app\common\model\UserTokenModel;

class UserController extends BaseController {

    /**
     * 登录
     *
     * @return \think\response\Json
     */
    public function login() {
        $username = trim($this->request->param('username'));
        $password = trim($this->request->param('password'));
        if (empty($username)
                OR empty($password)) {
            return $this->jsonFail('参数错误');
        }

        $user = UserModel::get([
            'username' => $username,
            'password' => md5($password),
        ]);
        if (empty($user)) {
            return $this->jsonFail('账号/密码错误');
        }
        if ($user->status != UserModel::STATUS_ACTIVE) {
            return $this->jsonFail('账号不可用');
        }

        $tokenModel = new UserTokenModel();
        $tokenModel->token   = md5(time() . uniqid());
        $tokenModel->user_id = $user->id;
        if ($tokenModel->save()) {
            $user->login_time   = time();
            $user->login_count += 1;
            $user->login_ip     = $this->request->ip();
            if ($user->save()) {
                return $this->jsonSucc([
                    'logged'        => TRUE,
                    'token'         => $tokenModel->token,
                    'token_expired' => 365 * 24 * 3600,
                    'user'          => $this->userJson($user),
                ]);
            }
        }

        return $this->jsonFail('登录失败');
    }

    /**
     * 获取当前登录用户
     *
     * @return \think\response\Json
     */
    public function get() {
        if (!empty($this->userModel)) {
            return $this->jsonSucc([
                'logged' => TRUE,
                'user'   => $this->userJson($this->userModel),
            ]);
        } else {
            return $this->jsonSucc([
                'logged' => FALSE,
                'user'   => NULL,
            ]);
        }
    }

    /**
     * 设置密码
     *
     * @return \think\response\Json
     */
    public function password() {
        if (empty($this->userModel)) {
            return $this->jsonFail('未登录');
        }

        $oldPassword = trim($this->request->param('oldPassword'));
        $newPassword = trim($this->request->param('newPassword'));
        if (empty($oldPassword)
                OR empty($newPassword)
                OR strlen($newPassword) < 6
                OR strlen($newPassword) > 16) {
            return $this->jsonFail('参数错误');
        }

        if (md5($oldPassword) != $this->userModel->password) {
            return $this->jsonFail('原密码输入错误');
        }

        $this->userModel->password = md5($newPassword);
        $this->userModel->save();

        return $this->jsonSucc([]);
    }

    /**
     * 登出
     *
     * @return \think\response\Json
     */
    public function logout() {
        if (!empty($this->tokenModel)) {
            $this->tokenModel->delete();
        }

        return $this->jsonSucc([]);
    }
}
