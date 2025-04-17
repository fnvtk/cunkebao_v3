<?php

namespace app\superadmin\controller\administrator;

use app\common\model\Administrator as AdministratorModel;
use app\superadmin\controller\BaseController;
use think\Db;

/**
 * 管理员控制器
 */
class GetAdministratorDetailController extends BaseController
{
    /**
     * 查询管理员信息，关联权限表
     *
     * @param int $adminId
     * @return AdministratorModel
     * @throws \Exception
     */
    protected function getAdministrator(int $adminId): AdministratorModel
    {
        $admin = AdministratorModel::alias('a')
            ->field(
                'a.id, a.account username, a.name, a.status, a.authId, a.createTime createdAt, a.lastLoginTime, p.permissions'
            )
            ->leftJoin('administrator_permissions p', 'a.id = p.adminId')
            ->where('a.id', $adminId)
            ->where('a.deleteTime', 0)
            ->find();

        if (!$admin) {
            throw new \Exception('管理员不存在', 404);
        }

        return $admin;
    }

    /**
     * 解析权限数据
     *
     * @param string|null $permission
     * @return array
     */
    protected function parsePermissions(?string $permission): array
    {
        $permissionIds = [];

        if (!empty($permission)) {
            $permissions = json_decode($permission, true);
            $permissions = is_array($permissions) ? $permissions : json_decode($permissions, true);

            if (isset($permissions['ids'])) {
                $permissionIds = is_string($permissions['ids']) ? explode(',', $permissions['ids']) : $permissions['ids'];
                $permissionIds = array_map('intval', $permissionIds);
            }
        }

        return $permissionIds;
    }

    /**
     * 根据权限ID获取角色名称
     *
     * @param int $authId
     * @return string
     */
    protected function getRoleName($authId): string
    {
        switch ($authId) {
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
     * 获取详细信息
     *
     * @param int $id 管理员ID
     * @return \think\response\Json
     */
    public function index($id)
    {
        try {
            $admin = $this->getAdministrator($id);
            $roleName = $this->getRoleName($admin->authId);
            $permissionIds = $this->parsePermissions($admin->permissions);

            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => array_merge($admin->toArray(), [
                    'roleName' => $roleName,
                    'permissions' => $permissionIds,
                    'lastLogin' => !empty($admin->lastLoginTime) ? date('Y-m-d H:i', $admin->lastLoginTime) : '从未登录',
                ])
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => $e->getCode(),
                'msg' => $e->getMessage()
            ]);
        }
    }
}