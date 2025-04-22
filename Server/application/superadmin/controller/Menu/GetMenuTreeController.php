<?php

namespace app\superadmin\controller\Menu;

use app\common\model\Menu as MenuModel;
use app\common\model\AdministratorPermissions as AdministratorPermissionsModel;
use app\superadmin\controller\BaseController;
use library\ResponseHelper;
use think\facade\Cache;

/**
 * 菜单控制器
 */
class GetMenuTreeController extends BaseController
{
    /**
     * 组织成树状结构
     *
     * @param array $menus
     * @param int $parentId
     * @return array
     */
    private function buildMenuTree(array $menus, int $parentId = 0): array
    {
        $tree = [];

        foreach ($menus as $menu) {
            if ($menu['parentId'] == $parentId) {
                $children = $this->buildMenuTree($menus, $menu['id']);

                if (!empty($children)) {
                    $menu['children'] = $children;
                }

                $tree[] = $menu;
            }
        }

        return $tree;
    }

    /**
     * 获取管理员权限
     *
     * @return array
     */
    protected function getPermissions(): array
    {
        $record = AdministratorPermissionsModel::where('adminId', $this->getAdminInfo('id'))->find();

        if (!$record || empty($record->permissions)) {
            return [];
        }

        $permissions = $record->permissions ? json_decode($record->permissions, true) : [];

        if (isset($permissions['ids']) && !empty($permissions['ids'])) {
            return is_string($permissions['ids']) ? explode(',', $permissions['ids']) : $permissions['ids'];
        }

        return [];
    }

    /**
     * 获取所有菜单，并组织成树状结构
     *
     * @return array
     */
    protected function getMenuTree(): array
    {
        // 获取所有菜单
        $allMenus = MenuModel::where('status', 1)->order('sort', 'asc')->select()->toArray();

        // 组织成树状结构
        return $allMenus ? $this->buildMenuTree($allMenus) : [];
    }

    /**
     * 获取所有一级菜单（用户拥有权限的）
     *
     * @param array $permissionIds
     * @return array
     */
    protected function getTopMenusInPermissionIds(array $permissionIds): array
    {
        $where = [
            'id' => ['in', $permissionIds],
            'parentId' => 0,
            'status' => 1,
        ];

        return MenuModel::where($where)->order('sort', 'asc')->select()->toArray();
    }

    /**
     * 获取所有子菜单.
     *
     * @param array $topMenuIds
     * @return array
     */
    protected function getAllChildrenInPermissionIds(array $topMenuIds): array
    {
        $where = [
            'parentId' => ['in', $topMenuIds],
            'status' => 1,
        ];

        return MenuModel::where($where)->order('sort', 'asc')->select()->toArray();
    }

    /**
     * 获取用户菜单
     *
     * @param array $permissionIds
     * @return array
     */
    protected function getUserMenus(array $permissionIds): array
    {
        $topMenus = $this->getTopMenusInPermissionIds($permissionIds);

        // 菜单ID集合，用于获取子菜单
        $menuIds = array_column($topMenus, 'id');

        return $this->getAllChildrenInPermissionIds($menuIds);
    }

    /**
     * 构建菜单树.
     *
     * @param array $childMenus
     * @return array
     */
    protected function _makeMenuTree(array $childMenus): array
    {
        // 将子菜单按照父ID进行分组
        $childMenusGroup = [];

        foreach ($childMenus as $menu) {
            $childMenusGroup[$menu['parentId']][] = $menu;
        }

        foreach ($topMenus as $topMenu) {
            if (isset($childMenusGroup[$topMenu['id']])) {
                $topMenu['children'] = $childMenusGroup[$topMenu['id']];
            }

            $menuTree[] = $topMenu;
        }

        return $menuTree ?? [];
    }

    /**
     * 根据权限ID获取相应的菜单树
     *
     * @param array $permissionIds 权限ID数组
     * @return array
     */
    protected function getMenuTreeByPermissions(array $permissionIds): array
    {
        if ($permissionIds) {
            $childMenus = $this->getUserMenus($permissionIds);

            // 构建菜单树
            return $this->_makeMenuTree($childMenus);
        }

        // 如果没有权限，返回空数组
        return [];
    }

    /**
     * 获取菜单列表（树状结构）
     * @return \think\response\Json
     */
    public function index()
    {
        if ($this->getAdminInfo('id') == 1) {
            $menuTree = $this->getMenuTree();
        } else {
            $menuTree = $this->getMenuTreeByPermissions(
                $this->getPermissions()
            );
        }

        return ResponseHelper::success($menuTree);
    }
} 