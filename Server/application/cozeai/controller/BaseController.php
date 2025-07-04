<?php

namespace app\cozeai\controller;

use think\Controller;
use think\facade\Config;
use think\facade\Env;

/**
 * Coze AI 基础控制器
 */
class BaseController extends Controller
{
    protected $apiUrl;
    protected $accessToken;
    protected $headers;

    public function __construct()
    {
        parent::__construct();
        
        // 从环境变量获取配置
        $this->apiUrl = Env::get('ai.api_url');
        $this->accessToken = Env::get('ai.token');
        
        // 设置请求头
        $this->headers = [
            'Authorization: Bearer ' . $this->accessToken,
            'Content-Type: application/json'
        ];
    }



/**
     * CURL请求
     *
     * @param $url 请求url地址
     * @param $method 请求方法 get post
     * @param null $postfields post数据数组
     * @param array $headers 请求header信息
     * @param bool|false $debug 调试开启 默认false
     * @return mixed
     */
    protected function httpRequest($url, $method = "GET", $postfields = null, $headers = array(), $timeout = 30, $debug = false)
    {
        $method = strtoupper($method);
        $ci     = curl_init();
        /* Curl settings */
        // curl_setopt($ci, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0); // 使用哪个版本
        curl_setopt($ci, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 6.2; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0");
        curl_setopt($ci, CURLOPT_CONNECTTIMEOUT, 60); /* 在发起连接前等待的时间，如果设置为0，则无限等待 */
        // curl_setopt($ci, CURLOPT_TIMEOUT, 7); /* 设置cURL允许执行的最长秒数 */
        curl_setopt($ci, CURLOPT_TIMEOUT, $timeout); /* 设置cURL允许执行的最长秒数 */
        curl_setopt($ci, CURLOPT_RETURNTRANSFER, true);
        switch ($method) {
            case "POST":
                curl_setopt($ci, CURLOPT_POST, true);
                if (!empty($postfields)) {
                    if (is_string($postfields) && preg_match('/^([\w\-]+=[\w\-]+(&[\w\-]+=[\w\-]+)*)$/', $postfields)) {
                        parse_str($postfields, $output);
                        $postfields = $output;
                    }
                    if (is_array($postfields)) {
                        $tmpdatastr = http_build_query($postfields);
                    } else {
                        $tmpdatastr = $postfields;
                    }
                    curl_setopt($ci, CURLOPT_POSTFIELDS, $tmpdatastr);
                }
                break;
            default:
                curl_setopt($ci, CURLOPT_CUSTOMREQUEST, $method); /* //设置请求方式 */
                break;
        }
 
        $ssl = preg_match('/^https:\/\//i', $url) ? TRUE : FALSE;
        curl_setopt($ci, CURLOPT_URL, $url);
        if ($ssl) {
            curl_setopt($ci, CURLOPT_SSL_VERIFYPEER, FALSE); // https请求 不验证证书和hosts
            curl_setopt($ci, CURLOPT_SSL_VERIFYHOST, FALSE); // 不从证书中检查SSL加密算法是否存在
            // curl_setopt($ci, CURLOPT_SSLVERSION, 4);   //因为之前的POODLE 病毒爆发，许多网站禁用了sslv3（nginx默认是禁用的，ssl_protocols 默认值为TLSv1 TLSv1.1 TLSv1.2;），最新使用sslv4
        }
        //curl_setopt($ci, CURLOPT_HEADER, true); /*启用时会将头文件的信息作为数据流输出*/
        if (ini_get('open_basedir') == '' && ini_get('safe_mode' == 'Off')) {
            curl_setopt($ci, CURLOPT_FOLLOWLOCATION, 1);
        }
        curl_setopt($ci, CURLOPT_MAXREDIRS, 2);/*指定最多的HTTP重定向的数量，这个选项是和CURLOPT_FOLLOWLOCATION一起使用的*/
        curl_setopt($ci, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ci, CURLINFO_HEADER_OUT, true);
        /*curl_setopt($ci, CURLOPT_COOKIE, $Cookiestr); * *COOKIE带过去** */
        $response    = curl_exec($ci);
        $requestinfo = curl_getinfo($ci);
        $http_code   = curl_getinfo($ci, CURLINFO_HTTP_CODE);
        if ($debug) {
            echo "=====post data======\r\n";
            var_dump($postfields);
            echo "=====info===== \r\n";
            print_r($requestinfo);
            echo "=====response=====\r\n";
            print_r($response);
        }
        curl_close($ci);
        return $response;
        //return array($http_code, $response,$requestinfo);
    }



} 