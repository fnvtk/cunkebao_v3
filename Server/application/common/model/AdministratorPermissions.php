<?php
namespace app\common\model;

use think\Model;

/**
 * 超级管理员权限配置模型类
 */
class AdministratorPermissions extends Model
{
    // 设置数据表名
    protected $name = 'administrator_permissions';

    /**
     * 保存管理员权限
     * @param int $adminId 管理员ID
     * @param array $permissionIds 权限ID数组
     * @return bool
     */
    public static function savePermissions($adminId, $permissionIds)
    {
        // 检查是否已有记录
        $record = self::where('adminId', $adminId)->find();

        // 准备权限数据
        $permissionData = [
            'ids' => is_array($permissionIds) ? implode(',', $permissionIds) : $permissionIds
        ];

        if ($record) {
            // 更新已有记录
            return $record->save([
                'permissions' => json_encode($permissionData),
                'updateTime' => time()
            ]);
        } else {
            // 创建新记录
            return self::create([
                'adminId' => $adminId,
                'permissions' => json_encode($permissionData),
                'createTime' => time(),
                'updateTime' => time(),
                'deleteTime' => 0
            ]);
        }
    }
    

} 