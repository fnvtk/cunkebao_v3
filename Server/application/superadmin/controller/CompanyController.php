<?php
namespace app\superadmin\controller;

use app\library\s2\CurlHandle;
use app\superadmin\model\Company as companyModel;
use app\superadmin\model\Users;
use GuzzleHttp\Client;
use think\Controller;
use think\Db;
use think\facade\Config;
use think\facade\Request;
use think\facade\Session;

/**
 * 公司控制器
 */
class CompanyController extends Controller
{
    /**
     * 创建新项目
     * @return \think\response\Json
     */
    public function create()
    {
        // 获取参数
        $params = Request::only(['name', 'nickname', 'account', 'password', 'realName', 'description']);

        try {
            // 开启事务
            Db::startTrans();
            $curl = CurlHandle::getInstant()->setBaseUrl('http://yishi.com/');

            // 1. 调用创建部门接口
            $departmentResponse = $curl->setMethod('post')->send('v1/api/account/department/create', [
                'name' => $params['name'],
                'memo' => $params['description'] ?: '',
            ]);

            $departmentData = json_decode($departmentResponse, true);
            if ($departmentData['code'] != 200) {
                throw new \Exception($departmentData['msg']);
            }

            // 2. 调用创建账号接口
            $accountResponse = $curl->setMethod('post')->send('v1/api/account/create', [
                'userName' => $params['account'],
                'password' => $params['password'],
                'realName' => $params['realName'],
                'nickname' => $params['nickname'],
                'departmentId' => $departmentData['data']['id']
            ]);

            $accountData = json_decode($accountResponse, true);
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
     * 获取项目列表
     * @return \think\response\Json
     */
    public function getList()
    {
        // 获取分页参数
        $page = $this->request->param('page/d', 1);
        $limit = $this->request->param('limit/d', 10);
        $keyword = $this->request->param('keyword/s', '');
        
        // 构建查询条件
        $where = [];
        if (!empty($keyword)) {
            $where[] = ['name', 'like', "%{$keyword}%"];
        }
        
        // 查询项目数据
        $total = companyModel::where($where)->count();
        $list = companyModel::where($where)
            ->field('id, name, status, tenantId, companyId, memo, createTime')
            ->order('id', 'desc')
            ->page($page, $limit)
            ->select();
            
        // 获取每个项目的子账号数量
        $data = [];
        foreach ($list as $item) {
            // 查询该项目下的子账号数量
            $userCount = Users::where('companyId', $item['companyId'])
                ->where('deleteTime', 0)
                ->count();
                
            $data[] = [
                'id' => $item['id'],
                'name' => $item['name'],
                'status' => $item['status'],
                'tenantId' => $item['tenantId'],
                'companyId' => $item['companyId'],
                'memo' => $item['memo'],
                'userCount' => $userCount,
                'createTime' => date('Y-m-d H:i:s', $item['createTime'])
            ];
        }
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'list' => $data,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ]
        ]);
    }
    
    /**
     * 获取项目详情
     * @param int $id 项目ID
     * @return \think\response\Json
     */
    public function getDetail($id)
    {
        $company = companyModel::get($id);
        if (!$company) {
            return json(['code' => 404, 'msg' => '项目不存在']);
        }
        
        // 获取项目下的子账号数量
        $userCount = Users::where('companyId', $id)
            ->where('deleteTime', 0)
            ->count();
            
        $data = [
            'id' => $company->id,
            'name' => $company->name,
            'status' => $company->status,
            'tenantId' => $company->tenantId,
            'companyId' => $company->companyId,
            'memo' => $company->memo,
            'userCount' => $userCount,
            'createTime' => date('Y-m-d H:i:s', $company->createTime)
        ];
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $data
        ]);
    }
    
    /**
     * 更新项目信息
     * @return \think\response\Json
     */
    public function update()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }
        
        // 获取请求参数
        $id = $this->request->post('id/d', 0);
        $name = $this->request->post('name/s', '');
        $status = $this->request->post('status/d');
        $tenantId = $this->request->post('tenantId/d');
        $companyId = $this->request->post('companyId/d');
        $memo = $this->request->post('memo/s', '');
        
        // 参数验证
        if (empty($id) || empty($name)) {
            return json(['code' => 400, 'msg' => '请填写必要参数']);
        }
        
        // 查询项目
        $company = companyModel::get($id);
        if (!$company) {
            return json(['code' => 404, 'msg' => '项目不存在']);
        }
        
        // 检查项目名称是否已存在（排除自身）
        $exists = companyModel::where('name', $name)
            ->where('id', '<>', $id)
            ->find();
        if ($exists) {
            return json(['code' => 400, 'msg' => '项目名称已存在']);
        }
        
        // 更新数据
        $company->name = $name;
        if (isset($status)) $company->status = $status;
        if (isset($tenantId)) $company->tenantId = $tenantId;
        if (isset($companyId)) $company->companyId = $companyId;
        $company->memo = $memo;
        $company->updateTime = time();
        
        if ($company->save()) {
            return json([
                'code' => 200,
                'msg' => '更新成功'
            ]);
        }
        
        return json(['code' => 500, 'msg' => '更新失败']);
    }
    
    /**
     * 删除项目
     * @return \think\response\Json
     */
    public function delete()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }
        
        $id = $this->request->post('id/d', 0);
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '请指定要删除的项目']);
        }
        
        // 查询项目
        $company = companyModel::get($id);
        if (!$company) {
            return json(['code' => 404, 'msg' => '项目不存在']);
        }
        
        // 检查是否有关联的子账号
        $userCount = Users::where('companyId', $id)
            ->where('deleteTime', 0)
            ->count();
        if ($userCount > 0) {
            return json(['code' => 400, 'msg' => '该项目下还有关联的子账号，无法删除']);
        }
        
        // 执行删除
        if ($company->delete()) {
            return json([
                'code' => 200,
                'msg' => '删除成功'
            ]);
        }
        
        return json(['code' => 500, 'msg' => '删除失败']);
    }
    
    /**
     * 更新项目状态
     * @return \think\response\Json
     */
    public function updateStatus()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }
        
        $id = $this->request->post('id/d', 0);
        $status = $this->request->post('status/d');
        
        if (empty($id) || !isset($status)) {
            return json(['code' => 400, 'msg' => '参数不完整']);
        }
        
        // 查询项目
        $company = companyModel::get($id);
        if (!$company) {
            return json(['code' => 404, 'msg' => '项目不存在']);
        }
        
        // 更新状态
        $company->status = $status;
        $company->updateTime = time();
        
        if ($company->save()) {
            return json([
                'code' => 200,
                'msg' => '状态更新成功'
            ]);
        }
        
        return json(['code' => 500, 'msg' => '状态更新失败']);
    }
} 