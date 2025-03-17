<?php

namespace app\api\controller;

use app\common\model\WechatFriendModel;
use think\facade\Request;

class WechatFriendController extends BaseController
{
    /**
     * 获取微信好友列表数据
     * @return \think\response\Json
     */
    public function friendlistData()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 构建请求参数
            $params = [
                'accountKeyword' => input('accountKeyword', ''),
                'addFrom' => input('addFrom', []),
                'allotAccountId' => input('allotAccountId', ''),
                'containAllLabel' => input('containAllLabel', false),
                'containSubDepartment' => input('containSubDepartment', false),
                'departmentId' => input('departmentId', ''),
                'extendFields' => input('extendFields', []),
                'friendKeyword' => input('friendKeyword', ''),
                'friendPhoneKeyword' => input('friendPhoneKeyword', ''),
                'friendPinYinKeyword' => input('friendPinYinKeyword', ''),
                'friendRegionKeyword' => input('friendRegionKeyword', ''),
                'friendRemarkKeyword' => input('friendRemarkKeyword', ''),
                'gender' => input('gender', ''),
                'groupId' => input('groupId', null),
                'isDeleted' => input('isDeleted', false),
                'isPass' => input('isPass', true),
                'keyword' => input('keyword', ''),
                'labels' => input('labels', []),
                'pageIndex' => input('pageIndex', 0),
                'pageSize' => input('pageSize', 20),
                'preFriendId' => input('preFriendId', ''),
                'wechatAccountKeyword' => input('wechatAccountKeyword', '')
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'plain');

            // 发送请求获取好友列表
            $result = requestCurl($this->baseUrl . 'api/WechatFriend/friendlistData', $params, 'GET', $header);
            $response = handleApiResponse($result);
            
            // 保存数据到数据库
            if (!empty($response['results'])) {
                foreach ($response['results'] as $item) {
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
            'province' => $item['province'],
            'city' => $item['city'],
            'createTime' => $item['createTime']
        ];

        // 使用三个字段的组合作为唯一性判断
        $friend = WechatFriendModel::where([
            ['ownerWechatId', '=', $item['ownerWechatId']],
            ['wechatId', '=', $item['wechatId']],
            ['wechatAccountId', '=', $item['wechatAccountId']]
        ])->find();

        if ($friend) {
            $friend->save($data);
        } else {
            WechatFriendModel::create($data);
        }
    }
} 