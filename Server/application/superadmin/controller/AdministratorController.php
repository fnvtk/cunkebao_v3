<?php
namespace app\superadmin\controller;

use app\superadmin\model\Administrator as AdminModel;
use app\superadmin\model\AdministratorPermissions;
use think\Controller;

/**
 * 管理员控制器
 */
class AdministratorController extends Controller
{
    /**
     * 获取管理员列表
     * @return \think\response\Json
     */
    public function getList()
    {
        // 获取分页参数
        $page = $this->request->param('page/d', 1);
        $limit = $this->request->param('limit/d', 10);
        $keyword = $this->request->param('keyword/s', '');
        
        // 构建查询条件
        $where = [
            ['deleteTime', '=', 0]
        ];
        
        // 如果有搜索关键词
        if (!empty($keyword)) {
            $where[] = ['account|name', 'like', "%{$keyword}%"];
        }
        
        // 查询管理员数据
        $total = AdminModel::where($where)->count();
        $list = AdminModel::where($where)
            ->field('id, account, name, status, authId, createTime, lastLoginTime, lastLoginIp')
            ->order('id', 'desc')
            ->page($page, $limit)
            ->select();

        // 格式化数据
        $data = [];
        foreach ($list as $item) {
            $data[] = [
                'id' => $item->id,
                'username' => $item->account,
                'name' => $item->name,
                'role' => $this->getRoleName($item->authId),
                'status' => $item->status,
                'createdAt' => date('Y-m-d H:i:s', $item->createTime),
                'lastLogin' => !empty($item->lastLoginTime) ? date('Y-m-d H:i:s', $item->lastLoginTime) : '从未登录',
                'permissions' => $this->getPermissions($item->id)
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
     * 获取详细信息
     * @param int $id 管理员ID
     * @return \think\response\Json
     */
    public function getDetail($id)
    {
        // 查询管理员信息，关联权限表
        $admin = AdminModel::alias('a')
            ->leftJoin('administrator_permissions p', 'a.id = p.adminId')
            ->where('a.id', $id)
            ->where('a.deleteTime', 0)
            ->field('a.id, a.account, a.name, a.status, a.authId, a.createTime, a.lastLoginTime, p.permissions')
            ->find();
            
        // 如果查不到记录
        if (!$admin) {
            return json([
                'code' => 404,
                'msg' => '管理员不存在',
                'data' => null
            ]);
        }
        
        // 解析权限数据
        $permissionIds = [];
        if (!empty($admin['permissions'])) {
            $permissions = json_decode($admin['permissions'], true);
            $permissions = is_array($permissions) ? $permissions: json_decode($permissions, true);

            if (isset($permissions['ids'])) {
                $permissionIds = is_string($permissions['ids']) ? explode(',', $permissions['ids']) : $permissions['ids'];

                // 确保所有ID都是整数
                $permissionIds = array_map('intval', $permissionIds);
            }
        }

        // 格式化数据
        $data = [
            'id' => $admin['id'],
            'username' => $admin['account'],
            'name' => $admin['name'],
            'status' => $admin['status'],
            'authId' => $admin['authId'],
            'roleName' => $this->getRoleName($admin['authId']),
            'createdAt' => $admin['createTime'],
            'lastLogin' => !empty($admin['lastLoginTime']) ? date('Y-m-d H:i', $admin['lastLoginTime']) : '从未登录',
            'permissions' => $permissionIds, // 直接返回权限ID数组
        ];

        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => array_merge()
        ]);
    }

    
    /**
     * 根据权限ID获取权限列表
     * @param int $authId 权限ID
     * @return array
     */
    private function getPermissions($authId)
    {
        $ids = AdministratorPermissions::getPermissions($authId);

        if ($ids) {
            return \app\superadmin\model\Menu::getMenusNameByIds($ids);
        }

        return [];
    }

    /**
     * 更新管理员信息
     * @return \think\response\Json
     */
    public function updateAdmin()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }
        
        // 获取当前登录的管理员信息
        $currentAdmin = $this->request->adminInfo;
        
        // 获取请求参数
        $id = $this->request->post('id/d');
        $username = $this->request->post('username/s');
        $name = $this->request->post('name/s');
        $password = $this->request->post('password/s');
        $permissionIds = $this->request->post('permissionIds/a');
        
        // 参数验证
        if (empty($id) || empty($username) || empty($name)) {
            return json(['code' => 400, 'msg' => '参数不完整']);
        }
        
        // 判断是否有权限修改
        if ($currentAdmin->id != 1 && $currentAdmin->id != $id) {
            return json(['code' => 403, 'msg' => '您没有权限修改其他管理员']);
        }
        
        // 查询管理员
        $admin = AdminModel::where('id', $id)->where('deleteTime', 0)->find();
        if (!$admin) {
            return json(['code' => 404, 'msg' => '管理员不存在']);
        }
        
        // 准备更新数据
        $data = [
            'account' => $username,
            'name' => $name,
            'updateTime' => time()
        ];
        
        // 如果提供了密码，则更新密码
        if (!empty($password)) {
            $data['password'] = md5($password);
        }
        
        // 更新管理员信息
        $result = $admin->save($data);
        
        // 如果当前是超级管理员(ID为1)，并且修改的不是自己，则更新权限
        if ($currentAdmin->id == 1 && $currentAdmin->id != $id && !empty($permissionIds)) {
            \app\superadmin\model\AdministratorPermissions::savePermissions($id, $permissionIds);
        }
        
        return json([
            'code' => 200,
            'msg' => '更新成功',
            'data' => null
        ]);
    }

    /**
     * 添加管理员
     * @return \think\response\Json
     */
    public function addAdmin()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }
        
        // 获取当前登录的管理员信息
        $currentAdmin = $this->request->adminInfo;
        
        // 只有超级管理员(ID为1)可以添加管理员
        if ($currentAdmin->id != 1) {
            return json(['code' => 403, 'msg' => '您没有权限添加管理员']);
        }
        
        // 获取请求参数
        $username = $this->request->post('username/s');
        $name = $this->request->post('name/s');
        $password = $this->request->post('password/s');
        $permissionIds = $this->request->post('permissionIds/a');
        
        // 参数验证
        if (empty($username) || empty($name) || empty($password)) {
            return json(['code' => 400, 'msg' => '参数不完整']);
        }
        
        // 检查账号是否已存在
        $exists = AdminModel::where('account', $username)->where('deleteTime', 0)->find();
        if ($exists) {
            return json(['code' => 400, 'msg' => '账号已存在']);
        }
        
        // 创建管理员
        $admin = new AdminModel();
        $admin->account = $username;
        $admin->name = $name;
        $admin->password = md5($password);
        $admin->status = 1;
        $admin->createTime = time();
        $admin->updateTime = time();
        $admin->deleteTime = 0;
        $admin->save();
        
        // 保存权限
        if (!empty($permissionIds)) {
            \app\superadmin\model\AdministratorPermissions::savePermissions($admin->id, $permissionIds);
        }
        
        return json([
            'code' => 200,
            'msg' => '添加成功',
            'data' => null
        ]);
    }

    /**
     * 删除管理员
     * @return \think\response\Json
     */
    public function deleteAdmin()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }
        
        // 获取当前登录的管理员信息
        $currentAdmin = $this->request->adminInfo;
        
        // 获取请求参数
        $id = $this->request->post('id/d');
        
        // 参数验证
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数不完整']);
        }
        
        // 不能删除自己的账号
        if ($currentAdmin->id == $id) {
            return json(['code' => 403, 'msg' => '不能删除自己的账号']);
        }
        
        // 只有超级管理员(ID为1)可以删除管理员
        if ($currentAdmin->id != 1) {
            return json(['code' => 403, 'msg' => '您没有权限删除管理员']);
        }
        
        // 不能删除超级管理员账号
        if ($id == 1) {
            return json(['code' => 403, 'msg' => '不能删除超级管理员账号']);
        }
        
        // 查询管理员
        $admin = AdminModel::where('id', $id)->where('deleteTime', 0)->find();
        if (!$admin) {
            return json(['code' => 404, 'msg' => '管理员不存在']);
        }
        
        // 开启事务
        AdminModel::startTrans();
        try {
            // 执行软删除
            $admin->deleteTime = time();
            $adminResult = $admin->save();
            
            // 删除对应的权限记录
            $permissionModel = new AdministratorPermissions();
            $permResult = $permissionModel->where('adminId', $id)->update(['deleteTime' => time()]);
            
            // 提交事务
            AdminModel::commit();
            
            return json([
                'code' => 200,
                'msg' => '删除成功',
                'data' => null
            ]);
        } catch (\Exception $e) {
            // 回滚事务
            AdminModel::rollback();
            
            return json([
                'code' => 500,
                'msg' => '删除失败: ' . $e->getMessage(),
                'data' => null
            ]);
        }
    }
} 