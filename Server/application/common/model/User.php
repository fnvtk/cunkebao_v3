<?php
namespace app\common\model;

use think\Model;
use think\model\concern\SoftDelete;

class User extends Model
{
    use SoftDelete;
    
    /**
     * 数据表名
     * @var string
     */
    protected $table = 'ck_users';

    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    protected $defaultSoftDelete = 0;

    /**
     * 主键
     * @var string
     */
    protected $pk = 'id';

    /**
     * 软删除字段
     * @var string
     */
    protected $deleteTime = 'deleteTime';

    /**
     * 隐藏属性
     * @var array
     */
    protected $hidden = ['passwordMd5', 'passwordLocal', 'deleteTime'];

    /**
     * 字段类型
     * @var array
     */
    protected $type = [
        'id' => 'integer',
        'isAdmin' => 'integer',
        'companyId' => 'integer',
        'typeId' => 'integer',
        'lastLoginTime' => 'integer',
        'status' => 'integer',
        'createTime' => 'integer',
        'updateTime' => 'integer',
        'deleteTime' => 'integer'
    ];

    /**
     * 通过手机号获取用户信息
     * @param string $account 手机号
     * @return array|null
     */
    public static function getUserByMobile($account)
    {
        // 查询用户
        $user = self::where('account', $account)
                    ->where('status', 1)
                    ->find();
        
        if (!$user) {
            return null;
        }
        
        // 用手机号当做默认用户名（如果没有设置用户名）
        $username = $user->username ?: $user->account;
        // 默认头像地址
        $avatar = $user->avatar ?: '';
        
        return [
            'id' => $user->id,
            'username' => $username,
            'account' => $user->account,
            'avatar' => $avatar,
            'isAdmin' => $user->isAdmin,
            'companyId' => $user->companyId,
            'typeId' => $user->typeId,
            'lastLoginIp' => $user->lastLoginIp,
            'lastLoginTime' => $user->lastLoginTime
        ];
    }
} 