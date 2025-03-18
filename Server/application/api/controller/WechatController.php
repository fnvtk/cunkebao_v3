<?php

namespace app\api\controller;

use app\common\model\WechatAccountModel;

class WechatController extends BaseController
{
    /**
     * 保存微信账号数据到数据库
     * @param array $item 微信账号数据
     */
    private function saveWechatAccount($item)
    {
        $data = [
            'wechatId' => $item['wechatId'],
            'deviceAccountId' => $item['deviceAccountId'],
            'imei' => $item['imei'],
            'deviceMemo' => $item['deviceMemo'],
            'accountUserName' => $item['accountUserName'],
            'accountRealName' => $item['accountRealName'],
            'accountNickname' => $item['accountNickname'],
            'keFuAlive' => $item['keFuAlive'],
            'deviceAlive' => $item['deviceAlive'],
            'wechatAlive' => $item['wechatAlive'],
            'yesterdayMsgCount' => $item['yesterdayMsgCount'],
            'sevenDayMsgCount' => $item['sevenDayMsgCount'],
            'thirtyDayMsgCount' => $item['thirtyDayMsgCount'],
            'totalFriend' => $item['totalFriend'],
            'maleFriend' => $item['maleFriend'],
            'femaleFriend' => $item['femaleFriend'],
            'wechatGroupName' => $item['wechatGroupName'],
            'tenantId' => $item['tenantId'],
            'nickname' => $item['nickname'],
            'alias' => $item['alias'],
            'avatar' => $item['avatar'],
            'gender' => $item['gender'],
            'region' => $item['region'],
            'signature' => $item['signature'],
            'bindQQ' => $item['bindQQ'],
            'bindEmail' => $item['bindEmail'],
            'bindMobile' => $item['bindMobile'],
            'currentDeviceId' => $item['currentDeviceId'],
            'isDeleted' => $item['isDeleted'],
            'deleteTime' => $item['deleteTime'],
            'groupId' => $item['groupId'],
            'memo' => $item['memo'],
            'wechatVersion' => $item['wechatVersion'],
            'labels' => $item['labels']
        ];

        $account = WechatAccountModel::where('wechatId', $item['wechatId'])->find();
        if ($account) {
            $account->save($data);
        } else {
            WechatAccountModel::create($data);
        }
    }

    public function getlist()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 构建请求参数
            $params = [
                'wechatAlive' => $this->request->param('wechatAlive', ''),
                'keyword' => $this->request->param('keyword', ''),
                'groupId' => $this->request->param('groupId', ''),
                'departmentId' => $this->request->param('departmentId', ''),
                'hasDevice' => $this->request->param('hasDevice', ''),
                'deviceGroupId' => $this->request->param('deviceGroupId', ''),
                'containSubDepartment' => $this->request->param('containSubDepartment', 'false'),
                'pageIndex' => $this->request->param('pageIndex', 0),
                'pageSize' => $this->request->param('pageSize', 10)
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'plain');

            // 发送请求
            $result = requestCurl($this->baseUrl . 'api/WechatAccount/list', $params, 'GET', $header);
            $response = handleApiResponse($result);
            
            // 保存数据到数据库
            if (!empty($response['results'])) {
                foreach ($response['results'] as $item) {
                    $this->saveWechatAccount($item);
                }
            }
            
            return successJson($response);
        } catch (\Exception $e) {
            return errorJson('获取微信账号列表失败：' . $e->getMessage());
        }
    }
}