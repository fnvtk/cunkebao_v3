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

    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
} 