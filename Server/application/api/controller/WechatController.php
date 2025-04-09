<?php

namespace app\api\controller;

use app\api\model\WechatAccountModel;

class WechatController extends BaseController
{
    /**
     * 保存微信账号数据到数据库
     * @param array $item 微信账号数据
     */
    private function saveWechatAccount($item)
    {
        $data = [
            'id' => $item['id'],
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
            'labels' => !empty($item['labels']) ? json_encode($item['labels']) : json_encode([]),
            'updateTime' => time()
        ];

        $account = WechatAccountModel::where('id', $item['id'])->find();
        if ($account) {
            $account->save($data);
        } else {
            WechatAccountModel::create($data);
        }
    }

    public function getlist($pageIndex = '',$pageSize = '',$isJob = false)
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'缺少授权信息']);
            }else{
                return errorJson('缺少授权信息');
            }
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
                'pageIndex' => !empty($pageIndex) ? $pageIndex : $this->request->param('pageIndex', 0),
                'pageSize' => !empty($pageSize) ? $pageSize : $this->request->param('pageSize', 10)
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
            if($isJob){
                return json_encode(['code'=>200,'msg'=>'获取微信账号列表成功','data'=>$response]);
            }else{
                return successJson($response);
            }
        } catch (\Exception $e) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'获取微信账号列表失败：' . $e->getMessage()]);
            }else{
                return errorJson('获取微信账号列表失败：' . $e->getMessage());
            }
        }
    }
}