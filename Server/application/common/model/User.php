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

    /**
     * 主键
     * @var string
     */
    protected $pk = 'id';

    /**
     * 自动写入时间戳
     * @var bool
     */
    protected $autoWriteTimestamp = true;

    /**
     * 创建时间字段
     * @var string
     */
    protected $createTime = 'createTime';

    /**
     * 更新时间字段
     * @var string
     */
    protected $updateTime = 'updateTime';

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
     * 获取用户信息
     * @param string $account 账号（手机号）
     * @param string $password 密码（可能是加密后的）
     * @param int $typeId 身份信息
     * @return array|null
     */
    public static function getUser($account, $password, $typeId)
    {
        // 查询用户
        $user = self::where('account', $account)
                    ->where('typeId', $typeId)
                    ->where('status', 1)
                    ->find();
        if (!$user) {
            // 记录日志
            \think\facade\Log::info('用户不存在或已禁用', ['account' => $account]);
            return null;
        }
        
        // 记录密码验证信息
        \think\facade\Log::info('密码验证', [
            'account' => $account,
            'input_password' => $password,
            'stored_hash' => $user->passwordMd5,
        ]);
        
        // 验证密码
        $isValid = ($user->passwordMd5 == md5($password));

        \think\facade\Log::info('密码验证结果', [
            'account' => $account,
            'is_valid' => $isValid,
        ]);
        
        if (!$isValid) {
            return null;
        }
        
        // 更新登录信息
        $user->lastLoginIp = request()->ip();
        $user->lastLoginTime = time();
        $user->save();
        
        // 用手机号当做默认用户名（如果没有设置用户名）
        $username = $user->username ?: $user->account;
        
        return [
            'id' => $user->id,
            'username' => $username,
            'account' => $user->account,
            'avatar' => $user->avatar,
            'isAdmin' => $user->isAdmin,
            'companyId' => $user->companyId,
            'typeId' => $user->typeId,
            'lastLoginIp' => $user->lastLoginIp,
            'lastLoginTime' => $user->lastLoginTime
        ];
    }

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
    
    /**
     * 验证用户密码
     * @param string $password 密码
     * @param bool $isEncrypted 是否已加密
     * @return bool
     */
    public function verifyPassword($password, $isEncrypted = false)
    {
        if ($isEncrypted) {
            return hash_equals($this->passwordMd5, $password);
        } else {
            return $this->passwordMd5 === md5($password);
        }
    }
} 