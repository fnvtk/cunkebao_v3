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
            'Authorization:Bearer '. $this->accessToken,
            'Content-Type:application/json'
        ];
    }

    /**
     * 发送GET请求
     * @param string $url 请求地址
     * @param array $params 请求参数
     * @return array
     */
    protected function get($url, $params = [])
    {
        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->get($this->apiUrl . $url, [
                'headers' => $this->headers,
                'query' => $params
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * 发送POST请求
     * @param string $url 请求地址
     * @param array $data 请求数据
     * @return array
     */
    protected function post($url, $data = [])
    {
        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->post($this->apiUrl . $url, [
                'headers' => $this->headers,
                'json' => $data
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }


} 