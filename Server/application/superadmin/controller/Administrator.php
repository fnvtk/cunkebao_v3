<?php
namespace app\superadmin\controller;

use think\Controller;
use app\superadmin\model\Administrator as AdminModel;

/**
 * 管理员控制器
 */
class Administrator extends Controller
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
                'createdAt' => $item->createTime,
                'lastLogin' => !empty($item->lastLoginTime) ? date('Y-m-d H:i', $item->lastLoginTime) : '从未登录',
                'permissions' => $this->getPermissions($item->authId)
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
        // 查询管理员信息
        $admin = AdminModel::where('id', $id)
            ->where('deleteTime', 0)
            ->field('id, account, name, status, authId, createTime, lastLoginTime')
            ->find();
            
        // 如果查不到记录
        if (!$admin) {
            return json([
                'code' => 404,
                'msg' => '管理员不存在',
                'data' => null
            ]);
        }
        
        // 格式化数据
        $data = [
            'id' => $admin->id,
            'username' => $admin->account,
            'name' => $admin->name,
            'status' => $admin->status,
            'authId' => $admin->authId,
            'roleName' => $this->getRoleName($admin->authId),
            'createdAt' => date('Y-m-d', $admin->createTime),
            'lastLogin' => !empty($admin->lastLoginTime) ? date('Y-m-d H:i', $admin->lastLoginTime) : '从未登录',
            'permissions' => $this->getPermissions($admin->authId)
        ];
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $data
        ]);
    }
    
    /**
     * 根据权限ID获取角色名称
     * @param int $authId 权限ID
     * @return string
     */
    private function getRoleName($authId)
    {
        // 可以从权限表中查询，这里为演示简化处理
        switch($authId) {
            case 1:
                return '超级管理员';
            case 2:
                return '项目管理员';
            case 3:
                return '客户管理员';
            default:
                return '普通管理员';
        }
    }
    
    /**
     * 根据权限ID获取权限列表
     * @param int $authId 权限ID
     * @return array
     */
    private function getPermissions($authId)
    {
        // 可以从权限表中查询，这里为演示简化处理
        $permissions = [
            1 => ['项目管理', '客户池', '管理员权限', '系统设置'],  // 超级管理员
            2 => ['项目管理', '客户池'],                          // 项目管理员
            3 => ['客户池'],                                     // 客户管理员
            4 => []                                              // 普通管理员
        ];
        
        return isset($permissions[$authId]) ? $permissions[$authId] : [];
    }
} 