<?php
namespace app\superadmin\model;

use think\Model;

/**
 * 超级管理员模型类
 */
class Administrator extends Model
{
    // 设置数据表名
    protected $name = 'administrators';
    
    // 设置数据表前缀
    protected $prefix = 'tk_';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    protected $deleteTime = 'deleteTime';
    
    // 隐藏字段
    protected $hidden = [
        'password'
    ];

    /**
     * 验证管理员登录
     * @param string $account 账号
     * @param string $password 密码(已MD5加密)
     * @return array|null
     */
    public static function login($account, $password)
    {
        return self::where([
            ['account', '=', $account],
            ['password', '=', $password],
            ['status', '=', 1],
            ['deleteTime', '=', 0]
        ])->find();
    }
} 