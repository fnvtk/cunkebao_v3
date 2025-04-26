<?php

namespace app\api\controller;

use app\api\model\CompanyAccountModel;
use app\api\model\AllotRuleModel;

class AllotRuleController extends BaseController
{
    /**
     * 获取所有分配规则
     * @param bool $isInner 是否为内部调用
     * @return \think\response\Json
     */
    public function getAllRules($data = [], $isInner = false)
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            if ($isInner) {
                return json_encode(['code' => 500, 'msg' => '缺少授权信息']);
            } else {
                return errorJson('缺少授权信息');
            }
        }

        try {
            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'plain');

            // 发送请求获取所有分配规则
            $result = requestCurl($this->baseUrl . 'api/AllotRule/all', [], 'GET', $header);
            $response = handleApiResponse($result);
            
            // 保存数据到数据库
            if (!empty($response)) {
                foreach ($response as $item) {
                    $this->saveAllotRule($item);
                }
            }
            
            if ($isInner) {
                return json_encode(['code' => 200, 'msg' => 'success', 'data' => $response]);
            } else {
                return successJson($response);
            }
        } catch (\Exception $e) {
            if ($isInner) {
                return json_encode(['code' => 500, 'msg' => '获取分配规则失败：' . $e->getMessage()]);
            } else {
                return errorJson('获取分配规则失败：' . $e->getMessage());
            }
        }
    }

    /**
     * 保存分配规则数据到数据库
     * @param array $item 分配规则数据
     */
    private function saveAllotRule($item)
    {
        $data = [
            'id' => isset($item['id']) ? $item['id'] : '',
            'tenantId' => isset($item['tenantId']) ? $item['tenantId'] : 0,
            'allotType' => isset($item['allotType']) ? $item['allotType'] : 0,
            'allotOnline' => isset($item['allotOnline']) ? $item['allotOnline'] : false,
            'kefuRange' => isset($item['kefuRange']) ? $item['kefuRange'] : 0,
            'wechatRange' => isset($item['wechatRange']) ? $item['wechatRange'] : 0,
            'kefuData' => isset($item['kefuData']) ? json_encode($item['kefuData']) : json_encode([]),
            'wechatIds' => isset($item['wechatIds']) ? json_encode($item['wechatIds']) : json_encode([]),
            'labels' => isset($item['labels']) ? json_encode($item['labels']) : json_encode([]),
            'priorityStrategy' => isset($item['priorityStrategy']) ? json_encode($item['priorityStrategy']) : json_encode([]),
            'sortIndex' => isset($item['sortIndex']) ? $item['sortIndex'] : 0,
            'creatorAccountId' => isset($item['creatorAccountId']) ? $item['creatorAccountId'] : 0,
            'createTime' => isset($item['createTime']) ? (strtotime($item['createTime']) ?: 0) : 0,
            'ruleName' => isset($item['ruleName']) ? $item['ruleName'] : '',
        ];

        // 使用ID作为唯一性判断
        $rule = AllotRuleModel::where('id', $item['id'])->find();

        if ($rule) {
            $rule->save($data);
        } else {
            AllotRuleModel::create($data);
        }
    }
}