<?php
namespace app\common\model;

use think\Model;

class User extends Model
{
    /**
     * 数据表名
     * @var string
     */
    protected $table = 'user';

    /**
     * 自动写入时间戳
     * @var bool
     */
    protected $autoWriteTimestamp = true;

    /**
     * 创建时间字段
     * @var string
     */
    protected $createTime = 'create_time';

    /**
     * 更新时间字段
     * @var string
     */
    protected $updateTime = 'update_time';

    /**
     * 隐藏属性
     * @var array
     */
    protected $hidden = ['password', 'delete_time'];

    /**
     * 获取管理员用户信息
     * @param string $username 用户名
     * @param string $password 密码
     * @return array|null
     */
    public static function getAdminUser($username, $password)
    {
        // 目前使用固定账号，后续可改为数据库查询
        if ($username === 'admin' && $password === '123456') {
            return [
                'id' => 1,
                'username' => 'admin',
                'name' => '超级管理员',
                'role' => 'admin',
                'permissions' => ['*'], // 拥有所有权限
            ];
        }
        return null;
    }

    /**
     * 通过手机号获取用户信息
     * @param string $mobile 手机号
     * @return array|null
     */
    public static function getUserByMobile($mobile)
    {
        // 目前使用固定账号，后续可改为数据库查询
        if ($mobile === '13800138000') {
            return [
                'id' => 2,
                'username' => 'mobile_user',
                'name' => '手机用户',
                'mobile' => '13800138000',
                'role' => 'user',
                'permissions' => ['user'], // 普通用户权限
            ];
        }
        return null;
    }
} 