<?php

namespace app\api\controller;

use app\common\model\WechatChatroomModel;
use app\common\model\WechatChatroomMemberModel;
use think\facade\Request;

class WechatChatroomController extends BaseController
{
    /**
     * 获取微信群聊列表
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
                'keyword' =>  $this->request->param('keyword', ''),
                'wechatAccountKeyword' => $this->request->param('wechatAccountKeyword', ''),
                'isDeleted' => $this->request->param('isDeleted', ''),
                'allotAccountId' => $this->request->param('allotAccountId', ''),
                'groupId' => $this->request->param('groupId', ''),
                'wechatChatroomId' => $this->request->param('wechatChatroomId', 0),
                'memberKeyword' => $this->request->param('memberKeyword', ''),
                'pageIndex' => $this->request->param('pageIndex', 0),
                'pageSize' => $this->request->param('pageSize', 20)
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'plain');

            // 发送请求获取群聊列表
            $result = requestCurl($this->baseUrl . 'api/WechatChatroom/pagelist', $params, 'GET', $header);
            $response = handleApiResponse($result);
            
            // 保存数据到数据库
            if (!empty($response['results'])) {
                foreach ($response['results'] as $item) {
                    $this->saveChatroom($item);
                }
            }

            return successJson($response);
        } catch (\Exception $e) {
            return errorJson('获取微信群聊列表失败：' . $e->getMessage());
        }
    }

    /**
     * 保存群聊数据到数据库
     * @param array $item 群聊数据
     */
    private function saveChatroom($item)
    {
        $data = [
            'wechatAccountId' => $item['wechatAccountId'],
            'wechatAccountAlias' => $item['wechatAccountAlias'],
            'wechatAccountWechatId' => $item['wechatAccountWechatId'],
            'wechatAccountAvatar' => $item['wechatAccountAvatar'],
            'wechatAccountNickname' => $item['wechatAccountNickname'],
            'chatroomId' => $item['chatroomId'],
            'hasMe' => $item['hasMe'],
            'chatroomOwnerNickname' => $item['chatroomOwnerNickname'],
            'chatroomOwnerAvatar' => $item['chatroomOwnerAvatar'],
            'conRemark' => isset($item['conRemark']) ? $item['conRemark'] : '',
            'nickname' => $item['nickname'],
            'pyInitial' => $item['pyInitial'],
            'quanPin' => $item['quanPin'],
            'chatroomAvatar' => $item['chatroomAvatar'],
            'members' => is_array($item['members']) ? json_encode($item['members']) : json_encode([]),
            'isDeleted' => $item['isDeleted'],
            'deleteTime' => $item['deleteTime'],
            'createTime' => $item['createTime'],
            'accountId' => $item['accountId'],
            'accountUserName' => $item['accountUserName'],   
            'accountRealName' => $item['accountRealName'],
            'accountNickname' => $item['accountNickname'],
            'groupId' => $item['groupId']
        ];

        // 使用chatroomId和wechatAccountId的组合作为唯一性判断
        $chatroom = WechatChatroomModel::where([
            ['chatroomId', '=', $item['chatroomId']],
            ['wechatAccountId', '=', $item['wechatAccountId']]
        ])->find();

        if ($chatroom) {
            $chatroom->save($data);
        } else {
            WechatChatroomModel::create($data);
        }

        // 同时保存群成员数据
        if (!empty($item['members'])) {
            foreach ($item['members'] as $member) {
                $this->saveChatroomMember($member, $item['chatroomId']);
            }
        }
    }

    /**
     * 获取群成员列表
     * @param string $wechatChatroomId 微信群ID
     * @return \think\response\Json
     */
    public function listChatroomMember($wechatChatroomId = '')
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        if (empty($wechatChatroomId)) {
            return errorJson('群ID不能为空');
        }

        try {
            // 构建请求参数
            $params = [
                'wechatChatroomId' => $wechatChatroomId
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'plain');

            // 发送请求获取群成员列表
            $result = requestCurl($this->baseUrl . 'api/WechatChatroom/listChatroomMember', $params, 'GET', $header);
            $response = handleApiResponse($result);

            // 保存数据到数据库
            if (!empty($response['results'])) {
                foreach ($response['results'] as $item) {
                    $this->saveChatroomMember($item, $wechatChatroomId);
                }
            }
            
            return successJson($response);
        } catch (\Exception $e) {
            return errorJson('获取群成员列表失败：' . $e->getMessage());
        }
    }

    /**
     * 保存群成员数据到数据库
     * @param array $item 群成员数据
     * @param string $wechatChatroomId 微信群ID
     */
    private function saveChatroomMember($item, $wechatChatroomId)
    {
        $data = [
            'chatroomId' => $wechatChatroomId,
            'wechatId' => $item['wechatId'],
            'nickname' => $item['nickname'],
            'avatar' => $item['avatar'],
            'conRemark' => isset($item['conRemark']) ? $item['conRemark'] : '',
            'alias' => isset($item['alias']) ? $item['alias'] : '',
            'friendType' => isset($item['friendType']) ? $item['friendType'] : false
        ];

        // 使用chatroomId和wechatId的组合作为唯一性判断
        $member = WechatChatroomMemberModel::where([
            ['chatroomId', '=', $wechatChatroomId],
            ['wechatId', '=', $item['wechatId']]
        ])->find();

        if ($member) {
            $member->save($data);
        } else {
            WechatChatroomMemberModel::create($data);
        }
    }
} 