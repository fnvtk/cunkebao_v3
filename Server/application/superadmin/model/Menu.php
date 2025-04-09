<?php
namespace app\superadmin\model;

use think\Model;
use think\facade\Cache;

/**
 * 菜单模型类
 */
class Menu extends Model
{
    // 设置数据表名
    protected $name = 'menus';
    
    // 设置数据表前缀
    protected $prefix = 'tk_';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    
    // 定义时间戳字段名
    protected $createTime = 'create_time';
    protected $updateTime = 'update_time';
    
    /**
     * 获取所有菜单，并组织成树状结构
     * @param bool $onlyEnabled 是否只获取启用的菜单
     * @param bool $useCache 是否使用缓存
     * @return array
     */
    public static function getMenuTree($onlyEnabled = true, $useCache = true)
    {
        $cacheKey = 'superadmin_menu_tree' . ($onlyEnabled ? '_enabled' : '_all');
        
        // 如果使用缓存并且缓存中有数据，则直接返回缓存数据
//        if ($useCache && Cache::has($cacheKey)) {
//            return Cache::get($cacheKey);
//        }
        
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
     * 清除菜单缓存
     */
    public static function clearMenuCache()
    {
        Cache::delete('superadmin_menu_tree_enabled');
        Cache::delete('superadmin_menu_tree_all');
    }
    
    /**
     * 添加或更新菜单
     * @param array $data 菜单数据
     * @return bool
     */
    public static function saveMenu($data)
    {
        if (isset($data['id']) && $data['id'] > 0) {
            // 更新
            $menu = self::find($data['id']);
            if (!$menu) {
                return false;
            }
            $result = $menu->save($data);
        } else {
            // 新增
            $menu = new self();
            $result = $menu->save($data);
        }
        
        // 清除缓存
        self::clearMenuCache();
        
        return $result !== false;
    }
    
    /**
     * 删除菜单
     * @param int $id 菜单ID
     * @return bool
     */
    public static function deleteMenu($id)
    {
        // 查找子菜单
        $childCount = self::where('parent_id', $id)->count();
        if ($childCount > 0) {
            return false; // 有子菜单不能删除
        }
        
        $result = self::destroy($id);
        
        // 清除缓存
        self::clearMenuCache();
        
        return $result !== false;
    }
} 