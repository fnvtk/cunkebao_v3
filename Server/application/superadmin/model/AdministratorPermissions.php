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
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    protected $deleteTime = 'deleteTime';
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'adminId' => 'integer',
        'permissions' => 'json',
        'createTime' => 'integer',
        'updateTime' => 'integer',
        'deleteTime' => 'integer'
    ];
    
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