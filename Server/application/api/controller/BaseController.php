<?php

namespace app\api\controller;

use think\Controller;

class BaseController extends Controller {

    /**
     * 令牌
     *
     * @var null
     */
    protected $token = NULL;

    protected function initialize() {
        parent::initialize();

        // 允许跨域
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: *');
        header('Access-Control-Allow-Headers: *');
    }

    /**
     * 接口调用成功 JSON
     *
     * @param null $data
     * @return \think\response\Json
     */
    protected function jsonSucc($data = NULL) {
        return json([
            'code' => 0,
            'msg'  => '操作成功',
            'data' => $data,
        ]);
    }

    /**
     * 接口调用错误 JSON
     *
     * @param $error
     * @param int $code
     * @return \think\response\Json
     */
    protected function jsonFail($error, $code = 500) {
        return json([
            'code' => $code,
            'msg'  => $error,
        ]);
    }

    /**
     * 获取URL
     *
     * @param $url
     * @return string
     */
    protected function absoluteUrl($url) {
        return (!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . ($url{0} === '/' ? $url : '/' . $url);
    }

    /**
     * 小数格式化
     *
     * @param $float
     * @return float
     */
    protected function floatFormat($float) {
        return floatval($float);
    }
}