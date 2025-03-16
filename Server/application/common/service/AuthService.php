<?php
namespace app\common\service;

use app\common\model\User;
use app\common\util\JwtUtil;
use think\facade\Log;

class AuthService
{
    /**
     * 令牌有效期（秒）
     */
    const TOKEN_EXPIRE = 7200;

    /**
     * 短信服务实例
     * @var SmsService
     */
    protected $smsService;

    /**
     * 构造函数
     */
    public function __construct()
    {
        $this->smsService = new SmsService();
    }

    /**
     * 用户登录
     * @param string $username 用户名
     * @param string $password 密码
     * @param string $ip 登录IP
     * @return array
     * @throws \Exception
     */
    public function login($username, $password, $ip)
    {
        // 获取用户信息
        $user = User::getAdminUser($username, $password);
        
        if (empty($user)) {
            // 记录登录失败
            Log::info('登录失败', ['username' => $username, 'ip' => $ip]);
            throw new \Exception('用户名或密码错误');
        }
        
        // 生成JWT令牌
        $token = JwtUtil::createToken($user, self::TOKEN_EXPIRE);
        $expireTime = time() + self::TOKEN_EXPIRE;
        
        // 记录登录成功
        Log::info('登录成功', ['username' => $username, 'ip' => $ip]);
        
        return [
            'token' => $token,
            'token_expired' => $expireTime,
            'member' => $user
        ];
    }

    /**
     * 手机号验证码登录
     * @param string $mobile 手机号
     * @param string $code 验证码
     * @param string $ip 登录IP
     * @return array
     * @throws \Exception
     */
    public function mobileLogin($mobile, $code, $ip)
    {
        // 验证验证码
        if (!$this->smsService->verifyCode($mobile, $code, 'login')) {
            Log::info('验证码验证失败', ['mobile' => $mobile, 'ip' => $ip]);
            throw new \Exception('验证码错误或已过期');
        }

        // 获取用户信息
        $user = User::getUserByMobile($mobile);
        if (empty($user)) {
            Log::info('用户不存在', ['mobile' => $mobile, 'ip' => $ip]);
            throw new \Exception('用户不存在');
        }

        // 生成JWT令牌
        $token = JwtUtil::createToken($user, self::TOKEN_EXPIRE);
        $expireTime = time() + self::TOKEN_EXPIRE;

        // 记录登录成功
        Log::info('手机号登录成功', ['mobile' => $mobile, 'ip' => $ip]);

        return [
            'token' => $token,
            'token_expired' => $expireTime,
            'member' => $user
        ];
    }

    /**
     * 发送登录验证码
     * @param string $mobile 手机号
     * @param string $type 验证码类型
     * @return array
     * @throws \Exception
     */
    public function sendLoginCode($mobile, $type)
    {
        return $this->smsService->sendCode($mobile, $type);
    }

    /**
     * 获取用户信息
     * @param array $userInfo JWT中的用户信息
     * @return array
     * @throws \Exception
     */
    public function getUserInfo($userInfo)
    {
        if (empty($userInfo)) {
            throw new \Exception('获取用户信息失败');
        }
        
        // 移除不需要返回的字段
        unset($userInfo['exp']);
        unset($userInfo['iat']);
        
        return $userInfo;
    }

    /**
     * 刷新令牌
     * @param array $userInfo JWT中的用户信息
     * @return array
     * @throws \Exception
     */
    public function refreshToken($userInfo)
    {
        if (empty($userInfo)) {
            throw new \Exception('刷新令牌失败');
        }
        
        // 移除过期时间信息
        unset($userInfo['exp']);
        unset($userInfo['iat']);
        
        // 生成新令牌
        $token = JwtUtil::createToken($userInfo, self::TOKEN_EXPIRE);
        $expireTime = time() + self::TOKEN_EXPIRE;
        
        return [
            'token' => $token,
            'token_expired' => $expireTime
        ];
    }
} 