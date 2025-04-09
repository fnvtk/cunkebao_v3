<?php

namespace app\api\controller;

use think\Controller;
use think\facade\Env;

class BaseController extends Controller {


    /**
     * 令牌
     *
     * @var string
     */
    protected $token = '';

    protected $baseUrl;

    public function __construct() {
        parent::__construct();
        $this->baseUrl = Env::get('api.wechat_url');
        // 允许跨域
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: *');
        header('Access-Control-Allow-Headers: *');
    }




}
