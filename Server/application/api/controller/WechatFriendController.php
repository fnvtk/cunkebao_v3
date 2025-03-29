<?php

namespace app\api\controller;

use app\api\model\WechatFriendModel;
use think\facade\Request;

class WechatFriendController extends BaseController
{
    /**
     * 获取微信好友列表数据
     * @return \think\response\Json
     */
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
                'accountKeyword' => '',
                'addFrom' => '[]',
                'allotAccountId' => input('allotAccountId', ''),
                'containSubDepartment' => false,
                'departmentId' => '',
                'extendFields' => '{}',
                'gender' => '',
                'groupId' => null,
                'isDeleted' => null,
                'isPass' => null,
                'keyword' =>  input('keyword', ''),
                'labels' => '[]',
                'pageIndex' => input('pageIndex', 0),
                'pageSize' => input('pageSize', 20),
                'preFriendId' => input('preFriendId', ''),
                'wechatAccountKeyword' => input('wechatAccountKeyword', '')
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization);

            // 发送请求获取好友列表
            $result = requestCurl($this->baseUrl . 'api/WechatFriend/friendlistData', $params, 'POST', $header,'json');
            $response = handleApiResponse($result);
            
            // 保存数据到数据库
            if (is_array($response)) {
                foreach ($response as $item) {
                    $this->saveFriend($item);
                }
            }
            
            return successJson($response);
        } catch (\Exception $e) {
            return errorJson('获取微信好友列表失败：' . $e->getMessage());
        }
    }

    /**
     * 保存微信好友数据到数据库
     * @param array $item 微信好友数据
     */
    private function saveFriend($item)
    {
        $data = [
            'id' => $item['id'],
            'wechatAccountId' => $item['wechatAccountId'],
            'alias' => $item['alias'],
            'wechatId' => $item['wechatId'],
            'conRemark' => $item['conRemark'],
            'nickname' => $item['nickname'],
            'pyInitial' => $item['pyInitial'],
            'quanPin' => $item['quanPin'],
            'avatar' => $item['avatar'],
            'gender' => $item['gender'],
            'region' => $item['region'],
            'addFrom' => $item['addFrom'],
            'labels' => is_array($item['labels']) ? json_encode($item['labels']) : json_encode([]),
            'signature' => $item['signature'],
            'isDeleted' => $item['isDeleted'],
            'isPassed' => $item['isPassed'],
            'deleteTime' => $item['deleteTime'],
            'accountId' => $item['accountId'],
            'extendFields' => is_array($item['extendFields']) ? json_encode($item['extendFields']) : json_encode([]),
            'accountUserName' => $item['accountUserName'],
            'accountRealName' => $item['accountRealName'],
            'accountNickname' => $item['accountNickname'],
            'ownerAlias' => $item['ownerAlias'],
            'ownerWechatId' => $item['ownerWechatId'],
            'ownerNickname' => $item['ownerNickname'],
            'ownerAvatar' => $item['ownerAvatar'],
            'phone' => $item['phone'],
            'thirdParty' => is_array($item['thirdParty']) ? json_encode($item['thirdParty']) : json_encode([]),
            'groupId' => $item['groupId'],
            'passTime' => $item['passTime'],
            'additionalPicture' => $item['additionalPicture'],
            'desc' => $item['desc'],
            'country' => $item['country'],
            'province' => isset($item['province']) ? $item['province'] : '',
            'city' => isset($item['city']) ? $item['city'] : '',
            'createTime' =>isset($item['createTime']) ? $item['createTime'] : '',
        ];

        // 使用三个字段的组合作为唯一性判断
        $friend = WechatFriendModel::where('id',$item['id'])->find();

        if ($friend) {
            $friend->save($data);
        } else {
            WechatFriendModel::create($data);
        }
    }
} 