<?php
namespace app\superadmin\controller;

use app\superadmin\model\Company as companyModel;
use app\superadmin\model\Users;
use GuzzleHttp\Client;
use think\Db;
use think\facade\Config;
use think\facade\Request;
use think\facade\Session;

/**
 * 公司控制器
 */
class Company extends Base
{
    /**
     * 创建新项目
     * @return \think\response\Json
     */
    public function create()
    {
        // 验证登录状态
        if (!$this->checkLogin()) {
            return json(['code' => 401, 'msg' => '请先登录']);
        }

        // 获取参数
        $params = Request::only(['nickname', 'account', 'password', 'realName', 'memo']);

        try {
            // 开启事务
            Db::startTrans();

            // 创建Guzzle客户端
            $client = new Client([
                'base_uri' => Config::get('app.api_base_url'),
                'timeout' => 10.0
            ]);

            // 1. 调用创建部门接口
            $departmentResponse = $client->post('/v1/api/account/department/create', [
                'json' => [
                    'name' => $params['name'],
                    'memo' => $params['memo'] ?: '',
                ]
            ]);

            $departmentData = json_decode($departmentResponse->getBody(), true);
            if ($departmentData['code'] != 200) {
                throw new \Exception($departmentData['msg']);
            }

            // 2. 调用创建账号接口
            $accountResponse = $client->post('/v1/api/account/create', [
                'json' => [
                    'userName' => $params['account'],
                    'password' => $params['password'],
                    'realName' => $params['realName'],
                    'nickname' => $params['nickname'],
                    'departmentId' => $departmentData['data']['id']
                ]
            ]);

            $accountData = json_decode($accountResponse->getBody(), true);
            if ($accountData['code'] != 200) {
                throw new \Exception($accountData['msg']);
            }

            // 3. 插入公司表
            $companyData = [
                'companyId' => $departmentData['data']['id'],
                'name' => $departmentData['data']['name'],
                'mome' => $departmentData['data']['memo']
            ];

            if (!companyModel::create($companyData)) {
                throw new \Exception('创建公司记录失败');
            }

            // 4. 插入用户表
            $userData = [
                'account' => $params['account'],
                'passwordMd5' => md5($params['password']),
                'passwordLocal' => $params['password'],
                'companyId' => $departmentData['data']['id']
            ];

            if (!Users::create($userData)) {
                throw new \Exception('创建用户记录失败');
            }

            // 提交事务
            Db::commit();

            return json([
                'code' => 200,
                'msg' => '创建成功',
                'data' => [
                    'companyId' => $departmentData['data']['id'],
                    'name' => $departmentData['data']['name'],
                    'memo' => $departmentData['data']['memo']
                ]
            ]);

        } catch (\Exception $e) {
            // 回滚事务
            Db::rollback();
            return json([
                'code' => 500,
                'msg' => '创建失败：' . $e->getMessage()
            ]);
        }
    }

    /**
     * 检查登录状态
     * @return bool
     */
    protected function checkLogin()
    {
        return Session::has('admin_id');
    }
} 