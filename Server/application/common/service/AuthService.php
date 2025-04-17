<?php
namespace app\common\service;

use app\common\model\User;
use app\common\util\JwtUtil;
use think\facade\Log;
use think\facade\Cache;
use think\facade\Config;
use think\facade\Env;

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
     * @param string $account 账号（手机号）
     * @param string $password 密码（可能是加密后的）
     * @param string $ip 登录IP
     * @return array
     * @throws \Exception
     */
    public function login($account, $password, $typeId, $ip)
    {
        // 获取用户信息
        $user = User::getUser($account, $password, $typeId);

        if (empty($user)) {
            // 记录登录失败
            Log::info('登录失败', ['account' => $account, 'ip' => $ip, 'is_encrypted' => true]);
            throw new \Exception('账号或密码错误');
        }
        
        // 生成JWT令牌
        $token = JwtUtil::createToken($user, self::TOKEN_EXPIRE);
        $expireTime = time() + self::TOKEN_EXPIRE;
        
        // 记录登录成功
        Log::info('登录成功', ['account' => $account, 'ip' => $ip]);
        
        return [
            'token' => $token,
            'token_expired' => $expireTime,
            'member' => $user
        ];
    }

    /**
     * 手机号验证码登录
     * @param string $account 手机号
     * @param string $code 验证码（可能是加密后的）
     * @param string $ip 登录IP
     * @param bool $isEncrypted 验证码是否已加密
     * @return array
     * @throws \Exception
     */
    public function mobileLogin($account, $code, $ip, $isEncrypted = false)
    {
        // 验证验证码
        if (!$this->smsService->verifyCode($account, $code, 'login', $isEncrypted)) {
            Log::info('验证码验证失败', ['account' => $account, 'ip' => $ip, 'is_encrypted' => $isEncrypted]);
            throw new \Exception('验证码错误或已过期');
        }

        // 获取用户信息
        $user = User::getUserByMobile($account);
        if (empty($user)) {
            Log::info('用户不存在', ['account' => $account, 'ip' => $ip]);
            throw new \Exception('用户不存在');
        }

        // 生成JWT令牌
        $token = JwtUtil::createToken($user, self::TOKEN_EXPIRE);
        $expireTime = time() + self::TOKEN_EXPIRE;

        // 记录登录成功
        Log::info('手机号登录成功', ['account' => $account, 'ip' => $ip]);

        return [
            'token' => $token,
            'token_expired' => $expireTime,
            'member' => $user
        ];
    }

    /**
     * 发送登录验证码
     * @param string $account 手机号
     * @param string $type 验证码类型
     * @return array
     * @throws \Exception
     */
    public function sendLoginCode($account, $type)
    {
        return $this->smsService->sendCode($account, $type);
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

    /**
     * 获取系统授权信息，使用缓存存储10分钟
     * @return string
     */
    public static function getSystemAuthorization()
    {
        // 定义缓存键名
        $cacheKey = 'system_authorization_token';
        
        // 尝试从缓存获取授权信息
        $authorization = Cache::get($cacheKey);
        $authorization = 'aXRi4R80zwTXo9V-VCXVYk4IMLl5ufKASoRtYHfaRh_uLwil_mO9U_jWfxeR1yupJIPuQCZknXGpctr9PTS1hbormw3RSrOwunNKTsvvcGzjTa0bBUz3S9W8x_PtvbY4_JpoXl8x8hm8cUa37zLlN7DQBAmj8He40FCxMTh1MC4xorM11aXoVFvYcrAkv_urHINWDmfNhH9icXzreiX9Uynw4fq7BkuP7yr6WHQ5z0NkOfKoMcesH4gPn_h_OLHC0T_ps2ky--M5HOvd5WgBmYRecNOcqbe4e0oIIO5ffANLsybyhLOEha3a03qKsyfAFWdf0A';
       // 如果缓存中没有或已过期，则重新获取
        if (empty($authorization)) {
            try {
                // 从环境变量中获取API用户名和密码
                $username = Env::get('api.username', '');
                $password = Env::get('api.password', '');
                
                if (empty($username) || empty($password)) {
                    Log::error('缺少API用户名或密码配置');
                    return '';
                }
                
                // 构建登录参数
                $params = [
                    'grant_type' => 'password',
                    'username' => $username,
                    'password' => $password
                ];
                
                // 获取API基础URL
                $baseUrl = Env::get('api.wechat_url', '');
                if (empty($baseUrl)) {
                    Log::error('缺少API基础URL配置');
                    return '';
                }
                
                // 调用登录接口获取token
                // 设置请求头
                $headerData = ['client:system'];
                $header = setHeader($headerData, '', 'plain');
                $result = requestCurl($baseUrl . 'token', $params, 'POST',$header);
                $result_array = handleApiResponse($result);

                if (isset($result_array['access_token']) && !empty($result_array['access_token'])) {
                    $authorization = $result_array['access_token'];
                    
                    // 存入缓存，有效期10分钟（600秒）
                    Cache::set($cacheKey, $authorization, 600);
                    Cache::set('system_refresh_token', $result_array['refresh_token'], 600);

                    Log::info('已重新获取系统授权信息并缓存');
                    return $authorization;
                } else {
                    Log::error('获取系统授权信息失败：' . ($response['message'] ?? '未知错误'));
                    return '';
                }
            } catch (\Exception $e) {
                Log::error('获取系统授权信息异常：' . $e->getMessage());
                return '';
            }
        }
        
        return $authorization;
    }
} 