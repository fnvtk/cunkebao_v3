<?php

namespace app\api\controller;

use app\common\model\CompanyAccountModel;
use think\facade\Request;

class AccountController extends BaseController
{
    /**
     * 获取公司账号列表
     * @return \think\response\Json
     */
    public function getlist()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 构建请求参数
            $params = [
                'showNormalAccount' => $this->request->param('showNormalAccount', ''),
                'keyword' => $this->request->param('keyword', ''),
                'departmentId' => $this->request->param('departmentId', ''),
                'pageIndex' => $this->request->param('pageIndex', 0),
                'pageSize' => $this->request->param('pageSize', 12)
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'plain');

            // 发送请求获取公司账号列表
            $result = requestCurl($this->baseUrl . 'api/Account/myTenantPageAccounts', $params, 'GET', $header);
            $response = handleApiResponse($result);
            
            // 保存数据到数据库
            if (!empty($response['results'])) {
                foreach ($response['results'] as $item) {
                    $this->saveAccount($item);
                }
            }
            
            return successJson($response);
        } catch (\Exception $e) {
            return errorJson('获取公司账号列表失败：' . $e->getMessage());
        }
    }

    /**
     * 创建部门
     * @return \think\response\Json
     */
    public function createDepartment()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取请求参数
            $name = $this->request->param('name', '');
            $memo = $this->request->param('memo', '');
            if (empty($name)) {
                return errorJson('请输入公司名称');
            }


            // 参数验证
            if (empty($name)) {
                return errorJson('部门名称不能为空');
            }
            
            // 构建请求参数，设置固定的departmentIdArr和parentId
            $params = [
                'name' => $name,
                'memo' => $memo,
                'departmentIdArr' => [914],
                'parentId' => 914
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求创建部门
            $result = requestCurl($this->baseUrl . 'api/Department/createDepartment', $params, 'POST', $header,'json');

            
            // 尝试提取部门ID
            if (is_int($result)) {
                return successJson($result);
            }else{
                return errorJson($result);
            }

        } catch (\Exception $e) {
            return response('创建部门失败：' . $e->getMessage());
        }
    }

    /**
     * 创建新账号
     * @return \think\response\Json
     */
    public function createAccount()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取请求参数
            $userName = $this->request->param('userName', '');
            $password = $this->request->param('password', '');
            $realName = $this->request->param('realName', '');
            $nickname = $this->request->param('nickname', '');
            $memo = $this->request->param('memo', '');
            $departmentId = $this->request->param('departmentId', 0);

            // 用户名验证
            if (empty($userName)) {
                return errorJson('用户名不能为空');
            }
            
            // 自定义用户名验证：只能使用英文字母或数字
            if (!preg_match('/^[a-zA-Z][a-zA-Z0-9]{5,9}$/', $userName)) {
                return errorJson('用户名必须以字母开头，只能包含字母和数字，长度6-10位');
            }

            // 密码验证
            if (empty($password)) {
                return errorJson('密码不能为空');
            }
            
            // 使用validateString验证密码，添加自定义选项
            $passwordValidation = validateString($password, 'password');
            if (!$passwordValidation['status']) {
                return errorJson($passwordValidation['message']);
            }

            // 真实姓名验证
            if (empty($realName)) {
                return errorJson('真实姓名不能为空');
            }

            
            // 部门ID验证
            if (empty($departmentId)) {
                return errorJson('部门ID不能为空');
            }

            // 构建请求参数
            $params = [
                'userName' => $userName,
                'password' => $password,
                'realName' => $realName,
                'nickname' => $nickname,
                'memo' => $memo,
                'departmentId' => $departmentId,
                'departmentIdArr' => empty($departmentId) ? [914] : [914, $departmentId]
            ];
            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求创建账号
            $result = requestCurl($this->baseUrl . 'api/account/newAccount', $params, 'POST', $header, 'json');

           
            if (is_int($result)) {
                return successJson($result);
            }else{
                return errorJson($result);
            }

        } catch (\Exception $e) {
            return errorJson('创建账号失败：' . $e->getMessage());
        }
    }

    /**
     * 保存账号数据到数据库
     * @param array $item 账号数据
     */
    private function saveAccount($item)
    {
        // 将日期时间字符串转换为时间戳
        $createTime = isset($item['createTime']) ? strtotime($item['createTime']) : null;
        $deleteTime = isset($item['deleteTime']) ? strtotime($item['deleteTime']) : null;

        $data = [
            'accountId' => $item['id'],
            'accountType' => isset($item['accountType']) ? $item['accountType'] : 0,
            'status' => isset($item['status']) ? $item['status'] : 0,
            'tenantId' => isset($item['tenantId']) ? $item['tenantId'] : 0,
            'userName' => isset($item['userName']) ? $item['userName'] : '',
            'realName' => isset($item['realName']) ? $item['realName'] : '',
            'nickname' => isset($item['nickname']) ? $item['nickname'] : '',
            'avatar' => isset($item['avatar']) ? $item['avatar'] : '',
            'phone' => isset($item['phone']) ? $item['phone'] : '',
            'memo' => isset($item['memo']) ? $item['memo'] : '',
            'createTime' => $createTime,
            'creator' => isset($item['creator']) ? $item['creator'] : 0,
            'creatorUserName' => isset($item['creatorUserName']) ? $item['creatorUserName'] : '',
            'creatorRealName' => isset($item['creatorRealName']) ? $item['creatorRealName'] : '',
            'departmentId' => isset($item['departmentId']) ? $item['departmentId'] : 0,
            'departmentName' => isset($item['departmentName']) ? $item['departmentName'] : '',
            'privilegeIds' => isset($item['privilegeIds']) ? $item['privilegeIds'] : [],
            'alive' => isset($item['alive']) ? $item['alive'] : false,
            'hasXiakeAccount' => isset($item['hasXiakeAccount']) ? $item['hasXiakeAccount'] : false,
            'isDeleted' => isset($item['isDeleted']) ? $item['isDeleted'] : false,
            'deleteTime' => $deleteTime
        ];

        // 使用accountId作为唯一性判断
        $account = CompanyAccountModel::where('accountId', $item['id'])->find();

        if ($account) {
            $account->save($data);
        } else {
            CompanyAccountModel::create($data);
        }
    }
} 