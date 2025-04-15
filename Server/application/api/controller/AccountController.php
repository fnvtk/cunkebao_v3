<?php

namespace app\api\controller;

use app\api\model\CompanyAccountModel;
use app\api\model\CompanyModel;
use Library\S2\Logics\AccountLogic;
use think\facade\Request;

/**
 * 账号管理控制器
 * 包含账号管理和部门管理的相关功能
 */
class AccountController extends BaseController
{
    /************************ 账号管理相关接口 ************************/
    
    /**
     * 获取公司账号列表
     * @param string $pageIndex 页码
     * @param string $pageSize 每页数量
     * @param bool $isJob 是否为定时任务调用
     * @return \think\response\Json
     */
    public function getlist($pageIndex = '',$pageSize = '',$isJob = false)
    {

        $api = new AccountLogic();
        $api->login()->create();


        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'缺少授权信息']);
            }else{
                return errorJson('缺少授权信息');
            }
        }

        try {
            // 构建请求参数
            $params = [
                'showNormalAccount' => $this->request->param('showNormalAccount', ''),
                'keyword' => $this->request->param('keyword', ''),
                'departmentId' => $this->request->param('departmentId', ''),
                'pageIndex' => !empty($pageIndex) ? $pageIndex : $this->request->param('pageIndex', 0),
                'pageSize' => !empty($pageSize) ? $pageSize : $this->request->param('pageSize',20)
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
            
            if($isJob){
                return json_encode(['code'=>200,'msg'=>'获取公司账号列表成功','data'=>$response]);
            }else{
                
                return successJson($response);
            }
        } catch (\Exception $e) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'获取公司账号列表失败：' . $e->getMessage()]);
            }else{
                return errorJson('获取公司账号列表失败：' . $e->getMessage());
            }
        }
    }

    /**
     * 创建新账号
     * @return \think\response\Json
     */
    public function createAccount()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取并验证请求参数
            $userName = $this->request->param('userName', '');
            $password = $this->request->param('password', '');
            $realName = $this->request->param('realName', '');
            $nickname = $this->request->param('nickname', '');
            $memo = $this->request->param('memo', '');
            $departmentId = $this->request->param('departmentId', 0);

            // 参数验证
            if (empty($userName)) {
                return errorJson('用户名不能为空');
            }
            if (!preg_match('/^[a-zA-Z][a-zA-Z0-9]{5,9}$/', $userName)) {
                return errorJson('用户名必须以字母开头，只能包含字母和数字，长度6-10位');
            }
            if (empty($password)) {
                return errorJson('密码不能为空');
            }
            $passwordValidation = validateString($password, 'password');
            if (!$passwordValidation['status']) {
                return errorJson($passwordValidation['message']);
            }
            if (empty($realName)) {
                return errorJson('真实姓名不能为空');
            }
            if (empty($departmentId)) {
                return errorJson('公司ID不能为空');
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
            
            if (is_numeric($result)) {
                return successJson($result);
            } else {
                return errorJson($result);
            }
        } catch (\Exception $e) {
            return errorJson('创建账号失败：' . $e->getMessage());
        }
    }



    /**
     * 创建新账号（包含创建部门）
     * @return \think\response\Json
     */
    public function createNewAccount()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取参数
            $departmentName = $this->request->param('departmentName', '');
            $departmentMemo = $this->request->param('departmentMemo', '');
            $accountName = $this->request->param('accountName', '');
            $accountPassword = $this->request->param('accountPassword', '');
            $accountRealName = $this->request->param('accountRealName', '');
            $accountNickname = $this->request->param('accountNickname', '');
            $accountMemo = $this->request->param('accountMemo', '');

            // 验证参数
            if (empty($departmentName)) {
                return errorJson('部门名称不能为空');
            }
            if (empty($accountName)) {
                return errorJson('账号名称不能为空');
            }
            if (empty($accountPassword)) {
                return errorJson('账号密码不能为空');
            }

            // 检查部门是否已存在
            $existingDepartment = CompanyModel::where('name', $departmentName)->find();
            if ($existingDepartment) {
                return errorJson('部门名称已存在');
            }

            // 检查账号是否已存在
            $existingAccount = CompanyAccountModel::where('userName', $accountName)->find();
            if ($existingAccount) {
                return errorJson('账号名称已存在');
            }

            // 1. 创建部门
            $departmentParams = [
                'name' => $departmentName,
                'memo' => $departmentMemo,
                'departmentIdArr' => [914],
                'parentId' => 914
            ];

            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');
            $departmentResult = requestCurl($this->baseUrl . 'api/Department/createDepartment', $departmentParams, 'POST', $header, 'json');
            
            if (is_numeric($departmentResult)) {
                // 保存部门到数据库
                $department = CompanyModel::create([
                    'id' => $departmentResult,
                    'name' => $departmentName,
                    'memo' => $departmentMemo,
                    'tenantId' => 242,
                    'isTop' => 0,
                    'level' => 1,
                    'parentId' => 914,
                    'privileges' => '',
                    'createTime' => time(),
                    'lastUpdateTime' => 0
                ]);
            } else {
                return errorJson('创建部门失败：' . $departmentResult);
            }

            // 2. 创建账号
            $accountParams = [
                'userName' => $accountName,
                'password' => $accountPassword,
                'realName' => $accountRealName,
                'nickname' => $accountNickname,
                'memo' => $accountMemo,
                'departmentId' => $departmentResult,
                'departmentIdArr' => [914, $departmentResult]
            ];

            $accountResult = requestCurl($this->baseUrl . 'api/Account/newAccount', $accountParams, 'POST', $header, 'json');





            if (!is_numeric($accountResult)) {
                // 如果创建账号失败，删除已创建的部门
                $this->deleteDepartment($accountResult);
                return errorJson('创建账号失败：' . $accountResult['msg']);
            }

            return successJson($accountResult,'账号创建成功');
        } catch (\Exception $e) {
            return errorJson('创建账号失败：' . $e->getMessage());
        }
    }



    /************************ 部门管理相关接口 ************************/

    /**
     * 获取部门列表
     * @return \think\response\Json
     */
    public function getDepartmentList($isJob = false)
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'缺少授权信息']);
            }else{
                return errorJson('缺少授权信息');
            }
        }

        try {
            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求获取部门列表
            $url = $this->baseUrl . 'api/Department/fetchMyAndSubordinateDepartment';
            $result = requestCurl($url, [], 'GET', $header, 'json');
            
            // 处理返回结果
            $response = handleApiResponse($result);
            
            // 保存数据到数据库
            if (!empty($response)) {
                $this->processDepartments($response);
            }
            
            if($isJob){
                return json_encode(['code'=>200,'msg'=>'获取部门列表成功','data'=>$response]);
            }else{
                return successJson($response, '获取部门列表成功');
            }
        } catch (\Exception $e) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'获取部门列表失败：' . $e->getMessage()]);
            }else{
                return errorJson('获取部门列表失败：' . $e->getMessage());
            }
        }
    }

    /**
     * 创建部门
     * @return \think\response\Json
     */
    public function createDepartment()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取并验证请求参数
            $name = $this->request->param('name', '');
            $memo = $this->request->param('memo', '');
            if (empty($name)) {
                return errorJson('请输入公司名称');
            }

            // 检查部门名称是否已存在
            $departmentId = CompanyModel::where('name', $name)->find();
            if (!empty($departmentId)) {
                return successJson($departmentId);
            }

            // 构建请求参数
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
            
            // 处理返回结果
            if (is_numeric($result)) {
                $res = CompanyModel::create([
                    'id' => $result,
                    'name' => $name,
                    'memo' => $memo,
                    'tenantId' => 242,
                    'isTop' => 0,
                    'level' => 1,
                    'parentId' => 914,
                    'privileges' => '',
                    'createTime' => time(),
                    'lastUpdateTime' => 0
                ]);
                return successJson($res);
            } else {
                return errorJson($result);
            }
        } catch (\Exception $e) {
            return errorJson('创建部门失败：' . $e->getMessage());
        }
    }

    /**
     * 修改部门信息
     * @return \think\response\Json
     */
    public function updateDepartment()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取并验证请求参数
            $id = $this->request->param('id', 0);
            $name = $this->request->param('name', '');
            $memo = $this->request->param('memo', '');
            
            if (empty($id)) {
                return errorJson('部门ID不能为空');
            }
            if (empty($name)) {
                return errorJson('部门名称不能为空');
            }
            
            // 验证部门是否存在
            $department = CompanyModel::where('id', $id)->find();
            if (empty($department)) {
                return errorJson('部门不存在');
            }
            
            // 构建请求参数
            $departmentIdArr = $department->parentId == 914 ? [914] : [914, $department->parentId];
            $params = [
                'id' => $id,
                'name' => $name,
                'memo' => $memo,
                'departmentIdArr' => $departmentIdArr,
                'tenantId' => 242,
                'createTime' => $department->createTime,
                'isTop' => $department->isTop,
                'level' => $department->level,
                'parentId' => $department->parentId,
                'lastUpdateTime' => $department->lastUpdateTime,
                'privileges' => $department->privileges
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求修改部门
            $result = requestCurl($this->baseUrl . 'api/Department/department', $params, 'PUT', $header, 'json');
            $response = handleApiResponse($result);
         
            // 更新本地数据库
            $department->name = $name;
            $department->memo = $memo;
            $department->save();
                
            return successJson([], '部门修改成功');
        } catch (\Exception $e) {
            return errorJson('修改部门失败：' . $e->getMessage());
        }
    }

    /**
     * 删除部门
     * @return \think\response\Json
     */
    public function deleteDepartment($id = '')
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取并验证部门ID
            $id = !empty($id) ? $id : $this->request->param('id', '');
            if (empty($id)) {
                return errorJson('部门ID不能为空');
            }

            // 验证部门是否存在
            $department = CompanyModel::where('id', $id)->find();
            if (empty($department)) {
                return errorJson('部门不存在');
            }

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'plain');

            // 发送删除请求
            $result = requestCurl($this->baseUrl . 'api/Department/del/' . $id, [], 'DELETE', $header);
            
            if($result){
                return errorJson($result);
            }else{
                 // 删除本地数据库记录
                $department->delete();
                return successJson([], '部门删除成功');
            }



        } catch (\Exception $e) {
            return errorJson('删除部门失败：' . $e->getMessage());
        }
    }

    /************************ 私有辅助方法 ************************/

    /**
     * 递归处理部门列表
     * @param array $departments 部门数据
     */
    private function processDepartments($departments)
    {
        if (empty($departments) || !is_array($departments)) {
            return;
        }
        
        foreach ($departments as $item) {
            // 保存当前部门
            $this->saveDepartment($item);
            
            // 递归处理子部门
            if (!empty($item['children']) && is_array($item['children'])) {
                $this->processDepartments($item['children']);
            }
        }
    }

    /**
     * 保存部门数据到数据库
     * @param array $item 部门数据
     */
    private function saveDepartment($item)
    {
        $data = [
            'id' => isset($item['id']) ? $item['id'] : 0,
            'name' => isset($item['name']) ? $item['name'] : '',
            'memo' => isset($item['memo']) ? $item['memo'] : '',
            'level' => isset($item['level']) ? $item['level'] : 0,
            'isTop' => isset($item['isTop']) ? $item['isTop'] : false,
            'parentId' => isset($item['parentId']) ? $item['parentId'] : 0,
            'tenantId' => isset($item['tenantId']) ? $item['tenantId'] : 0,
            'privileges' => isset($item['privileges']) ? (is_array($item['privileges']) ? json_encode($item['privileges']) : $item['privileges']) : '',
            'createTime' =>  isset($item['createTime']) ? strtotime($item['createTime']) : 0,
            'lastUpdateTime' => isset($item['lastUpdateTime']) ? ($item['lastUpdateTime'] == '0001-01-01T00:00:00' ? 0 : strtotime($item['lastUpdateTime'])) : 0
        ];

        // 使用id作为唯一性判断
        $department = CompanyModel::where('id', $item['id'])->find();
        if ($department) {
            $department->save($data);
        } else {
            CompanyModel::create($data);
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
            'id' => $item['id'],
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
            'privilegeIds' => isset($item['privilegeIds']) ? json_encode($item['privilegeIds']) : json_encode([]),
            'alive' => isset($item['alive']) ? $item['alive'] : false,
            'hasXiakeAccount' => isset($item['hasXiakeAccount']) ? $item['hasXiakeAccount'] : false,
            'isDeleted' => isset($item['isDeleted']) ? $item['isDeleted'] : false,
            'deleteTime' => $deleteTime
        ];

        // 使用tenantId作为唯一性判断
        $account = CompanyAccountModel::where('id', $item['id'])->find();
        if ($account) {
            $account->save($data);
        } else {
            CompanyAccountModel::create($data);
        }
    }
} 