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
    protected $table = 'tk_users';

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
    protected $createTime = 'create_at';

    /**
     * 更新时间字段
     * @var string
     */
    protected $updateTime = 'update_at';

    /**
     * 软删除字段
     * @var string
     */
    protected $deleteTime = 'delete_at';

    /**
     * 隐藏属性
     * @var array
     */
    protected $hidden = ['password', 'delete_at'];

    /**
     * 获取管理员用户信息
     * @param string $username 用户名
     * @param string $password 密码（可能是加密后的）
     * @param bool $isEncrypted 密码是否已加密
     * @return array|null
     */
    public static function getAdminUser($username, $password, $isEncrypted = false)
    {
        // 查询用户
        $user = self::where('username', $username)->find();
        
        if (!$user) {
            // 记录日志
            \think\facade\Log::info('用户不存在', ['username' => $username]);
            return null;
        }
        
        // 记录密码验证信息
        \think\facade\Log::info('密码验证', [
            'username' => $username,
            'input_password' => $password,
            'stored_hash' => $user->password,
            'is_encrypted' => $isEncrypted,
            'password_info' => password_get_info($user->password)
        ]);
        
        // 验证密码
        $isValid = false;
        
        if ($isEncrypted) {
            // 前端已加密，直接比较哈希值
            // 注意：这里需要确保前端和后端使用相同的加密算法和盐值
            $storedHash = self::getStoredHash($user->password);
            $isValid = hash_equals($storedHash, $password);
            
            \think\facade\Log::info('加密密码验证', [
                'username' => $username,
                'stored_hash' => $storedHash,
                'input_hash' => $password,
                'is_valid' => $isValid
            ]);
        } else {
            // 未加密，使用password_verify验证
            $isValid = password_verify($password, $user->password);
        }
        
        \think\facade\Log::info('密码验证结果', [
            'username' => $username,
            'is_valid' => $isValid,
            'is_encrypted' => $isEncrypted
        ]);
        
        if (!$isValid) {
            return null;
        }
        
        return [
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->username, // 暂时使用username作为name
            'role' => 'admin', // 暂时固定为admin角色
            'permissions' => ['*'], // 暂时拥有所有权限
        ];
    }

    /**
     * 获取存储的哈希值
     * 用于前端加密密码的验证
     * @param string $bcryptHash 数据库中存储的bcrypt哈希值
     * @return string 用于前端验证的哈希值
     */
    protected static function getStoredHash($bcryptHash)
    {
        // 这里需要实现与前端相同的加密算法
        // 例如，如果前端使用SHA256加盐，这里需要提取原始密码并进行相同的处理
        // 注意：这只是一个示例，实际实现可能需要根据您的具体需求调整
        
        // 假设我们能够从bcrypt哈希中提取原始密码（实际上这是不可能的，这里只是示例）
        // 在实际应用中，您需要在用户注册或修改密码时同时存储前端加密的哈希值
        $originalPassword = '123456'; // 这里应该是从数据库中获取的原始密码
        $salt = 'yishi_salt_2024'; // 与前端相同的盐值
        
        // 使用与前端相同的算法
        return hash('sha256', $originalPassword . $salt);
    }

    /**
     * 通过手机号获取用户信息
     * @param string $mobile 手机号
     * @return array|null
     */
    public static function getUserByMobile($mobile)
    {
        // 查询用户
        $user = self::where('mobile', $mobile)->find();
        
        if (!$user) {
            return null;
        }
        
        return [
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->username, // 暂时使用username作为name
            'mobile' => $user->mobile,
            'role' => 'user', // 暂时固定为user角色
            'permissions' => ['user'], // 暂时拥有用户权限
        ];
    }
} 