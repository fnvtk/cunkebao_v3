<?php
namespace app\common\service;

use think\facade\Cache;
use think\facade\Log;

class SmsService
{
    /**
     * 验证码有效期（秒）
     */
    const CODE_EXPIRE = 300;

    /**
     * 发送验证码
     * @param string $mobile 手机号
     * @param string $type 验证码类型
     * @return array
     * @throws \Exception
     */
    public function sendCode($mobile, $type)
    {
        // 检查发送频率
        $this->checkSendFrequency($mobile);
        
        // 生成验证码
        $code = $this->generateCode();
        
        try {
            // TODO: 对接实际的短信发送服务
            // 这里模拟发送成功
            $this->saveCode($mobile, $code, $type);
            
            // 记录发送日志
            Log::info('验证码发送成功', [
                'mobile' => $mobile,
                'type' => $type,
                'code' => $code
            ]);
            
            return [
                'mobile' => $mobile,
                'expire' => self::CODE_EXPIRE
            ];
        } catch (\Exception $e) {
            Log::error('验证码发送失败', [
                'mobile' => $mobile,
                'type' => $type,
                'error' => $e->getMessage()
            ]);
            throw new \Exception('验证码发送失败，请稍后重试');
        }
    }

    /**
     * 验证验证码
     * @param string $mobile 手机号
     * @param string $code 验证码
     * @param string $type 验证码类型
     * @return bool
     */
    public function verifyCode($mobile, $code, $type)
    {
        $key = $this->getCodeKey($mobile, $type);
        $savedCode = Cache::get($key);
        
        if (!$savedCode || $savedCode !== $code) {
            return false;
        }
        
        // 验证成功后删除验证码
        Cache::rm($key);
        return true;
    }

    /**
     * 检查发送频率
     * @param string $mobile 手机号
     * @throws \Exception
     */
    protected function checkSendFrequency($mobile)
    {
        $key = 'sms_frequency_' . $mobile;
        $lastSendTime = Cache::get($key);
        
        if ($lastSendTime && time() - $lastSendTime < 60) {
            throw new \Exception('发送太频繁，请稍后再试');
        }
        
        Cache::set($key, time(), 60);
    }

    /**
     * 生成验证码
     * @return string
     */
    protected function generateCode()
    {
        return sprintf('%06d', random_int(0, 999999));
    }

    /**
     * 保存验证码
     * @param string $mobile 手机号
     * @param string $code 验证码
     * @param string $type 验证码类型
     */
    protected function saveCode($mobile, $code, $type)
    {
        $key = $this->getCodeKey($mobile, $type);
        Cache::set($key, $code, self::CODE_EXPIRE);
    }

    /**
     * 获取缓存key
     * @param string $mobile 手机号
     * @param string $type 验证码类型
     * @return string
     */
    protected function getCodeKey($mobile, $type)
    {
        return 'sms_code_' . $type . '_' . $mobile;
    }
} 