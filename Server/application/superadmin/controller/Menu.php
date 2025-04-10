<?php
namespace app\superadmin\controller;

use think\Controller;
use app\superadmin\model\Menu as MenuModel;

/**
 * 菜单控制器
 */
class Menu extends Controller
{
    /**
     * 获取菜单列表（树状结构）
     * @return \think\response\Json
     */
    public function getMenuTree()
    {
        // 参数处理
        $onlyEnabled = $this->request->param('only_enabled', 1);
        $useCache = $this->request->param('use_cache', 0); // 由于要根据用户权限过滤，默认不使用缓存
        
        // 获取当前登录的管理员信息
        $adminInfo = $this->request->adminInfo;
        
        // 调用模型获取菜单树
        if ($adminInfo->id == 1) {
            // 超级管理员获取所有菜单
            $menuTree = MenuModel::getMenuTree($onlyEnabled, $useCache);
        } else {
            // 非超级管理员根据权限获取菜单
            $permissionIds = \app\superadmin\model\AdministratorPermissions::getPermissions($adminInfo->id);
            $menuTree = MenuModel::getMenuTreeByPermissions($permissionIds, $onlyEnabled);
        }
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $menuTree
        ]);
    }
    
    /**
     * 获取所有菜单（平铺结构，便于后台管理）
     * @return \think\response\Json
     */
    public function getMenuList()
    {
        // 查询条件
        $where = [];
        $status = $this->request->param('status');
        if ($status !== null && $status !== '') {
            $where[] = ['status', '=', intval($status)];
        }
        
        // 获取所有菜单
        $menus = MenuModel::where($where)
            ->order('sort', 'asc')
            ->select();
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $menus
        ]);
    }
    
    /**
     * 添加或更新菜单
     * @return \think\response\Json
     */
    public function saveMenu()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }
        
        // 获取参数
        $data = $this->request->post();
        
        // 验证参数
        $validate = $this->validate($data, [
            'title|菜单名称' => 'require|max:50',
            'path|路由路径' => 'require|max:100',
            'parent_id|父菜单ID' => 'require|number',
            'status|状态' => 'require|in:0,1',
            'sort|排序' => 'require|number',
        ]);
        
        if ($validate !== true) {
            return json(['code' => 400, 'msg' => $validate]);
        }
        
        // 保存菜单
        $result = MenuModel::saveMenu($data);
        
        if ($result) {
            return json(['code' => 200, 'msg' => '保存成功']);
        } else {
            return json(['code' => 500, 'msg' => '保存失败']);
        }
    }
    
    /**
     * 删除菜单
     * @param int $id 菜单ID
     * @return \think\response\Json
     */
    public function deleteMenu($id)
    {
        if (!$this->request->isDelete()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }
        
        if (empty($id) || !is_numeric($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }
        
        $result = MenuModel::deleteMenu($id);
        
        if ($result) {
            return json(['code' => 200, 'msg' => '删除成功']);
        } else {
            return json(['code' => 500, 'msg' => '删除失败，可能存在子菜单']);
        }
    }
    
    /**
     * 更新菜单状态
     * @return \think\response\Json
     */
    public function updateStatus()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }
        
        $id = $this->request->post('id');
        $status = $this->request->post('status');
        
        if (empty($id) || !is_numeric($id) || !in_array($status, [0, 1])) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }
        
        $menu = MenuModel::find($id);
        if (!$menu) {
            return json(['code' => 404, 'msg' => '菜单不存在']);
        }
        
        $menu->status = $status;
        $result = $menu->save();
        
        // 清除缓存
        MenuModel::clearMenuCache();
        
        if ($result) {
            return json(['code' => 200, 'msg' => '状态更新成功']);
        } else {
            return json(['code' => 500, 'msg' => '状态更新失败']);
        }
    }
    
    /**
     * 获取一级菜单（供权限设置使用）
     * @return \think\response\Json
     */
    public function getTopLevelMenus()
    {
        // 获取所有启用的一级菜单
        $menus = \app\superadmin\model\Menu::where([
            ['parent_id', '=', 0],
            ['status', '=', 1]
        ])
        ->field('id, title')
        ->order('sort', 'asc')
        ->select();
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $menus
        ]);
    }
} 