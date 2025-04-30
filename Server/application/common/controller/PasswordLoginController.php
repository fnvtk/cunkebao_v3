<?php

namespace app\common\controller;

use app\common\model\User as UserModel;
use app\common\util\JwtUtil;
use Exception;
use library\ResponseHelper;
use think\response\Json;
use think\Validate;

/**
 * 认证控制器
 * 处理用户登录和身份验证
 */
class PasswordLoginController extends BaseController
{
    /**
     * 获取用户基本信息
     *
     * @param string $account
     * @param int $typeId
     * @return UserModel
     */
    protected function getUserProfileWithAccountAndType(string $account, int $typeId): UserModel
    {
        $user = UserModel::where(function ($query) use ($account) {
            $query->where('phone', $account)->whereOr('account', $account);
        })
            ->where(function ($query) use ($typeId) {
                $query->where('status', 1)->where('typeId', $typeId);
            })->find();

        return $user;
    }

    /**
     * 获取用户信息
     *
     * @param string $account 账号（手机号）
     * @param string $password 密码（可能是加密后的）
     * @param int $typeId 身份信息
     * @return array|null
     */
    protected function getUser(string $account, string $password, int $typeId): array
    {
        $user = $this->getUserProfileWithAccountAndType($account, $typeId);

        if (!$user) {
            throw new \Exception('用户不存在或已禁用', 403);
        }

        if ($user->passwordMd5 !== md5($password)) {
            throw new \Exception('账号或密码错误', 403);
        }

        return $user->toArray();
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
            'account' => 'require',
            'password' => 'require|length:6,64',
            'typeId' => 'require|in:1,2',
        ], [
            'account.require' => '账号不能为空',
            'password.require' => '密码不能为空',
            'password.length' => '密码长度必须在6-64个字符之间',
            'typeId.require' => '用户类型不能为空',
            'typeId.in' => '用户类型错误',
        ]);

        if (!$validate->check($params)) {
            throw new \Exception($validate->getError(), 400);
        }

        return $this;
    }

    /**
     * 用户登录
     *
     * @param string $account 账号（手机号）
     * @param string $password 密码（可能是加密后的）
     * @param string $typeId 登录IP
     * @return array
     * @throws \Exception
     */
    protected function doLogin(string $account, string $password, int $typeId): array
    {
        // 获取用户信息
        $member = $this->getUser($account, $password, $typeId);

        // 生成JWT令牌
        $token = JwtUtil::createToken($member, 7200);
        $token_expired = time() + 7200;

        return compact('member', 'token', 'token_expired');
    }

    /**
     * 用户登录
     *
     * @return Json
     */
    public function index()
    {
        $params = $this->request->only(['account', 'password', 'typeId']);

        try {
            $result = $this->dataValidate($params)->doLogin(
                $params['account'],
                $params['password'],
                $params['typeId']
            );

            return ResponseHelper::success($result, '登录成功');
        } catch (Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 