<?php
namespace app\common\validate;

use think\Validate;

class Auth extends Validate
{
    /**
     * 验证规则
     * @var array
     */
    protected $rule = [
        'username' => 'require|length:3,32',
        'password' => 'require|length:6,32',
        'mobile' => 'require|mobile',
        'code' => 'require|length:6',
        'type' => 'require|in:login,register',
    ];

    /**
     * 错误信息
     * @var array
     */
    protected $message = [
        'username.require' => '用户名不能为空',
        'username.length' => '用户名长度必须在3-32个字符之间',
        'password.require' => '密码不能为空',
        'password.length' => '密码长度必须在6-32个字符之间',
        'mobile.require' => '手机号不能为空',
        'mobile.mobile' => '手机号格式不正确',
        'code.require' => '验证码不能为空',
        'code.length' => '验证码必须是6位数字',
        'type.require' => '验证码类型不能为空',
        'type.in' => '验证码类型不正确',
    ];

    /**
     * 验证场景
     * @var array
     */
    protected $scene = [
        'login' => ['username', 'password'],
        'mobile_login' => ['mobile', 'code'],
        'send_code' => ['mobile', 'type'],
    ];
} 