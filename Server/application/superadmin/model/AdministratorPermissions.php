<?php
namespace app\superadmin\model;

use think\Model;

/**
 * 超级管理员权限配置模型类
 */
class AdministratorPermissions extends Model
{
    // 设置数据表名
    protected $name = 'administrator_permissions';


    /**
     * 获取管理员权限
     * @param int $adminId 管理员ID
     * @return array 权限ID数组
     */
    public static function getPermissions($adminId)
    {
        $record = self::where('adminId', $adminId)->find();
        
        if (!$record || empty($record->permissions)) {
            return [];
        }

        $permissions = $record->permissions ? json_decode($record->permissions, true) : [];

        if (isset($permissions['ids']) && !empty($permissions['ids'])) {
            return is_string($permissions['ids']) ? explode(',', $permissions['ids']) : $permissions['ids'];
        }
        
        return [];
    }
} 