<?php
namespace app\common\model;

use think\Model;
use think\facade\Cache;

/**
 * 菜单模型类
 */
class Menu extends Model
{
    // 设置数据表名
    protected $name = 'menus';
    
    /**
     * 获取所有菜单，并组织成树状结构
     * @param bool $onlyEnabled 是否只获取启用的菜单
     * @param bool $useCache 是否使用缓存
     * @return array
     */
    public static function getMenuTree($onlyEnabled = true, $useCache = true)
    {
        $cacheKey = 'superadmin_menu_tree' . ($onlyEnabled ? '_enabled' : '_all');
        
        // 查询条件
        $where = [];
        if ($onlyEnabled) {
            $where[] = ['status', '=', 1];
        }
        
        // 获取所有菜单
        $allMenus = self::where($where)
            ->order('sort', 'asc')
            ->select()
            ->toArray();
        
        // 组织成树状结构
        $menuTree = self::buildMenuTree($allMenus);
        
        // 缓存结果
        if ($useCache) {
            Cache::set($cacheKey, $menuTree, 3600); // 缓存1小时
        }
        
        return $menuTree;
    }

    /**
     * 构建菜单树
     * @param array $menus 所有菜单
     * @param int $parentId 父菜单ID
     * @return array
     */
    private static function buildMenuTree($menus, $parentId = 0)
    {
        $tree = [];
        
        foreach ($menus as $menu) {
            if ($menu['parent_id'] == $parentId) {
                $children = self::buildMenuTree($menus, $menu['id']);
                if (!empty($children)) {
                    $menu['children'] = $children;
                }
                $tree[] = $menu;
            }
        }
        
        return $tree;
    }

    /**
     * 根据权限ID获取相应的菜单树
     * @param array $permissionIds 权限ID数组
     * @param bool $onlyEnabled 是否只获取启用的菜单
     * @return array
     */
    public static function getMenuTreeByPermissions($permissionIds, $onlyEnabled = true)
    {
        // 如果没有权限，返回空数组
        if (empty($permissionIds)) {
            return [];
        }
        
        // 查询条件
        $where = [];
        if ($onlyEnabled) {
            $where[] = ['status', '=', 1];
        }
        
        // 获取所有一级菜单（用户拥有权限的）
        $topMenus = self::where($where)
            ->where('parent_id', 0)
            ->whereIn('id', $permissionIds)
            ->order('sort', 'asc')
            ->select()
            ->toArray();
        
        // 菜单ID集合，用于获取子菜单
        $menuIds = array_column($topMenus, 'id');
        
        // 获取所有子菜单
        $childMenus = self::where($where)
            ->where('parent_id', 'in', $menuIds)
            ->order('sort', 'asc')
            ->select()
            ->toArray();
        
        // 将子菜单按照父ID进行分组
        $childMenusGroup = [];
        foreach ($childMenus as $menu) {
            $childMenusGroup[$menu['parent_id']][] = $menu;
        }
        
        // 构建菜单树
        $menuTree = [];
        foreach ($topMenus as $topMenu) {
            // 添加子菜单
            if (isset($childMenusGroup[$topMenu['id']])) {
                $topMenu['children'] = $childMenusGroup[$topMenu['id']];
            }
            $menuTree[] = $topMenu;
        }
        
        return $menuTree;
    }
} 