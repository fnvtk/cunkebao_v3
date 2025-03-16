<?php
namespace app\common\controller;

use app\common\helper\ResponseHelper;
use app\common\service\AuthService;
use think\Controller;
use think\facade\Request;

/**
 * 认证控制器
 * 处理用户登录和身份验证
 */
class Auth extends Controller
{
    /**
     * 允许跨域请求的域名
     * @var string
     */
    protected $allowOrigin = '*';
    
    /**
     * 认证服务实例
     * @var AuthService
     */
    protected $authService;
    
    /**
     * 初始化
     * 设置跨域相关响应头
     */
    public function initialize()
    {
        parent::initialize();
        
        // 允许跨域访问
        header('Access-Control-Allow-Origin: ' . $this->allowOrigin);
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        
        // 预检请求直接返回200
        if (Request::method(true) == 'OPTIONS') {
            exit();
        }

        // 初始化认证服务
        $this->authService = new AuthService();
    }
    
    /**
     * 用户登录
     * @return \think\response\Json
     */
    public function login()
    {
        // 获取登录参数
        $params = Request::only(['username', 'password']);
        
        // 参数验证
        $validate = validate('common/Auth');
        if (!$validate->scene('login')->check($params)) {
            return ResponseHelper::error($validate->getError());
        }
        
        try {
            // 调用登录服务
            $result = $this->authService->login(
                $params['username'],
                $params['password'],
                Request::ip()
            );
            return ResponseHelper::success($result, '登录成功');
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage());
        }
    }
    
    /**
     * 获取用户信息
     * @return \think\response\Json
     */
    public function info()
    {
        try {
            $result = $this->authService->getUserInfo(request()->userInfo);
            return ResponseHelper::success($result);
        } catch (\Exception $e) {
            return ResponseHelper::unauthorized($e->getMessage());
        }
    }
    
    /**
     * 刷新令牌
     * @return \think\response\Json
     */
    public function refresh()
    {
        try {
            $result = $this->authService->refreshToken(request()->userInfo);
            return ResponseHelper::success($result, '刷新成功');
        } catch (\Exception $e) {
            return ResponseHelper::unauthorized($e->getMessage());
        }
    }
} 