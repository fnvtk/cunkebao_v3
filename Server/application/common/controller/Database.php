<?php
namespace app\common\controller;

use think\Controller;
use think\Db;
use think\facade\Config;
use app\common\helper\ResponseHelper;

/**
 * 数据库控制器
 * 用于初始化数据库
 */
class Database extends Controller
{
    /**
     * 初始化数据库
     * @return \think\response\Json
     */
    public function init()
    {
        try {
            // 创建表结构
            $createTableSql = "
            CREATE TABLE IF NOT EXISTS `tk_users` (
              `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
              `username` varchar(50) NOT NULL COMMENT '用户名',
              `password` varchar(60) NOT NULL COMMENT '密码',
              `mobile` varchar(11) DEFAULT NULL COMMENT '登录手机号',
              `identity_id` int(10) DEFAULT NULL COMMENT '身份信息',
              `auth_id` int(10) DEFAULT NULL COMMENT '权限id',
              `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
              `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
              `delete_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
              PRIMARY KEY (`id`),
              UNIQUE KEY `idx_username` (`username`),
              UNIQUE KEY `idx_mobile` (`mobile`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
            ";
            
            Db::execute($createTableSql);
            
            // 检查是否已存在admin用户
            $adminExists = Db::table('tk_users')->where('username', 'admin')->find();
            
            if (!$adminExists) {
                // 生成密码的加密值
                $hashedPassword = password_hash('123456', PASSWORD_BCRYPT);
                
                // 插入测试数据
                $insertDataSql = "
                INSERT INTO `tk_users` (`username`, `password`, `mobile`, `identity_id`, `auth_id`) VALUES
                ('admin', '{$hashedPassword}', '13800138000', 1, 1);
                ";
                
                Db::execute($insertDataSql);
            }
            
            return ResponseHelper::success(null, '数据库初始化完成');
        } catch (\Exception $e) {
            return ResponseHelper::error('数据库初始化失败: ' . $e->getMessage());
        }
    }

    /**
     * 测试数据库连接和查询
     * @return \think\response\Json
     */
    public function test()
    {
        try {
            // 查询用户表中的数据
            $users = Db::table('tk_users')->select();
            
            return ResponseHelper::success([
                'count' => count($users),
                'users' => $users
            ], '数据库查询成功');
        } catch (\Exception $e) {
            return ResponseHelper::error('数据库查询失败: ' . $e->getMessage());
        }
    }

    /**
     * 更新用户密码
     * @param string $username 用户名
     * @param string $password 新密码
     * @return \think\response\Json
     */
    public function updatePassword($username = 'admin', $password = '123456')
    {
        try {
            // 生成密码的加密值
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            
            // 更新数据库中的用户密码
            $result = Db::table('tk_users')
                ->where('username', $username)
                ->update(['password' => $hashedPassword]);
            
            if ($result) {
                return ResponseHelper::success([
                    'username' => $username,
                    'password' => $password,
                    'hashed_password' => $hashedPassword
                ], '密码更新成功');
            } else {
                return ResponseHelper::error('用户不存在或密码未更改');
            }
        } catch (\Exception $e) {
            return ResponseHelper::error('密码更新失败: ' . $e->getMessage());
        }
    }

    /**
     * 调试密码验证
     * @param string $username 用户名
     * @param string $password 密码
     * @return \think\response\Json
     */
    public function debugPassword($username = 'admin', $password = '123456')
    {
        try {
            // 查询用户
            $user = Db::table('tk_users')->where('username', $username)->find();
            
            if (!$user) {
                return ResponseHelper::error('用户不存在');
            }
            
            // 生成新的密码哈希
            $newHash = password_hash($password, PASSWORD_BCRYPT);
            
            // 验证密码
            $isValid = password_verify($password, $user['password']);
            
            // 更新密码（确保使用正确的哈希算法）
            if (!$isValid) {
                Db::table('tk_users')
                    ->where('username', $username)
                    ->update(['password' => $newHash]);
            }
            
            return ResponseHelper::success([
                'username' => $username,
                'stored_hash' => $user['password'],
                'new_hash' => $newHash,
                'is_valid' => $isValid,
                'password_info' => password_get_info($user['password'])
            ], '密码验证调试信息');
        } catch (\Exception $e) {
            return ResponseHelper::error('密码验证调试失败: ' . $e->getMessage());
        }
    }

    /**
     * 重置用户密码
     * @param string $username 用户名
     * @param string $password 新密码
     * @return \think\response\Json
     */
    public function resetPassword($username = 'admin', $password = '123456')
    {
        try {
            // 查询用户
            $user = Db::table('tk_users')->where('username', $username)->find();
            
            if (!$user) {
                return ResponseHelper::error('用户不存在');
            }
            
            // 使用正确的哈希算法生成密码
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
            
            // 更新数据库中的用户密码
            $result = Db::table('tk_users')
                ->where('username', $username)
                ->update(['password' => $hashedPassword]);
            
            if ($result) {
                // 验证密码是否正确
                $isValid = password_verify($password, $hashedPassword);
                
                return ResponseHelper::success([
                    'username' => $username,
                    'password' => $password,
                    'hashed_password' => $hashedPassword,
                    'is_valid' => $isValid
                ], '密码重置成功');
            } else {
                return ResponseHelper::error('密码重置失败');
            }
        } catch (\Exception $e) {
            return ResponseHelper::error('密码重置失败: ' . $e->getMessage());
        }
    }
} 