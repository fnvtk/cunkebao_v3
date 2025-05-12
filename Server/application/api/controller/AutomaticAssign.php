<?php

namespace app\api\controller;

use app\api\model\CompanyAccountModel;
use app\api\model\CompanyModel;
use Library\S2\Logics\AccountLogic;
use think\Db;
use think\facade\Request;

/**
 * 账号管理控制器
 * 包含账号管理和部门管理的相关功能
 */
class AutomaticAssign extends BaseController
{
   
    /**
     * 自动分配微信好友
     * @return \think\response\Json
     */
    public function autoAllotWechatFriend($data = [],$isInner = false)
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            if($isInner){
                return json_encode(['code'=>500,'msg'=>'缺少授权信息']);
            }else{
                return errorJson('缺少授权信息');
            }
        }

        try {
            // 获取请求参数
            $toAccountId = !empty($data['toAccountId']) ? $data['toAccountId'] : input('toAccountId', '');
            $wechatAccountKeyword = !empty($data['wechatAccountKeyword']) ? $data['wechatAccountKeyword'] : input('wechatAccountKeyword', '');
            $isDeleted = !empty($data['isDeleted']) ? $data['isDeleted'] : input('isDeleted', false);
            
            if (empty($toAccountId)) {
                if($isInner){
                    return json_encode(['code'=>500,'msg'=>'目标账号ID不能为空']);
                }else{
                    return errorJson('目标账号ID不能为空');
                }
            }
            
            $params = [
                'accountKeyword' => '',
                'addFrom' => [],
                'allotAccountId' => '',
                'containAllLabel' => false,
                'containSubDepartment' => false,
                'departmentId' => '',
                'extendFields' => [],
                'friendKeyword' => '',
                'friendPhoneKeyword' => '',
                'friendPinYinKeyword' => '',
                'friendRegionKeyword' => '',
                'friendRemarkKeyword' => '',
                'gender' => '',
                'groupId' => null,
                'isByRule' => false,
                'isDeleted' => $isDeleted,
                'isPass' => true,
                'keyword' => '',
                'labels' => [],
                'pageIndex' => 0,
                'pageSize' => 100,
                'preFriendId' => '',
                'toAccountId' => $toAccountId,
                'wechatAccountKeyword' => $wechatAccountKeyword
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求
            $result = requestCurl($this->baseUrl . 'api/WechatFriend/allotSearchResult', $params, 'PUT', $header,'json');
            $response = handleApiResponse($result);
            
            if($response){
                if($isInner){   
                    return json_encode(['code'=>200,'msg'=>'微信好友自动分配成功']);
                }else{
                    return successJson([],'微信好友自动分配成功');
                }
            }else{
                if($isInner){
                    return json_encode(['code'=>500,'msg'=>$response]);
                }else{
                    return errorJson($response);
                }
            }

        } catch (\Exception $e) {
            if($isInner){
                return json_encode(['code'=>500,'msg'=>'微信好友自动分配失败：' . $e->getMessage()]);
            }else{
                return errorJson('微信好友自动分配失败：' . $e->getMessage());
            }
        }
    }


    /**
     * 自动分配微信群聊
     * @param string $toAccountId 目标账号ID
     * @param string $wechatAccountKeyword 微信账号关键字
     * @param bool $isDeleted 是否已删除
     * @return \think\response\Json
     */
    public function autoAllotWechatChatroom($data = [])
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取请求参数
            $toAccountId = !empty($data['toAccountId']) ? $data['toAccountId'] : input('toAccountId', '');
            $wechatAccountKeyword = !empty($data['wechatAccountKeyword']) ? $data['wechatAccountKeyword'] : input('wechatAccountKeyword', '');
            $isDeleted = !empty($data['isDeleted']) ? $data['isDeleted'] : input('isDeleted', false);
            
            if (empty($toAccountId)) {
                return errorJson('目标账号ID不能为空');
            }
            
            $params = [
                'AllotBySearch' => true,
                'byRule' => false,
                'comment' => '',
                'groupId' => null,
                'isDeleted' => $isDeleted,
                'keyword' => '',
                'memberKeyword' => '',
                'notifyReceiver' => false,
                'toAccountId' => $toAccountId,
                'wechatAccountKeyword' => $wechatAccountKeyword,
                'wechatChatroomId' => 0,
                'wechatChatroomIds' => []
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求
            $result = requestCurl($this->baseUrl . 'api/WechatChatroom/allotChatroom', $params, 'PUT', $header, 'json');
            $response = handleApiResponse($result);
            
            if($response){
                return successJson([], '微信群聊自动分配成功');
            }else{
                return errorJson($response);
            }
        } catch (\Exception $e) {
            return errorJson('微信群聊自动分配失败：' . $e->getMessage());
        }
    }

    /**
     * 指定微信好友分配到指定账号
     * @param int $wechatFriendId 微信好友ID
     * @param int $toAccountId 目标账号ID
     * @param string $comment 评论/备注
     * @param bool $notifyReceiver 是否通知接收者
     * @param int $optFrom 操作来源
     * @return \think\response\Json
     */
    public function allotWechatFriend($data = [],$isInner = false)
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            if($isInner){
                return json_encode(['code'=>500,'msg'=>'缺少授权信息']);
            }else{
                return errorJson('缺少授权信息');
            }
        }

        try {
            // 获取请求参数
            $wechatFriendId = !empty($data['wechatFriendId']) ? $data['wechatFriendId'] : input('wechatFriendId', 0);
            $toAccountId = !empty($data['toAccountId']) ? $data['toAccountId'] : input('toAccountId', 0);
            $comment = !empty($data['comment']) ? $data['comment'] : input('comment', '');
            $notifyReceiver = !empty($data['notifyReceiver']) ? $data['notifyReceiver'] : input('notifyReceiver', false);
            $optFrom = !empty($data['optFrom']) ? $data['optFrom'] : input('optFrom', 4); // 默认操作来源为4
            
            // 参数验证
            if (empty($wechatFriendId)) {
                return errorJson('微信好友ID不能为空');
            }
            
            if (empty($toAccountId)) {
                return errorJson('目标账号ID不能为空');
            }
            
    
            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');
            
            // 发送请求
            $url = $this->baseUrl . 'api/WechatFriend/allot?wechatFriendId='.$wechatFriendId.'&notifyReceiver='.$notifyReceiver.'&comment='.$comment.'&toAccountId='.$toAccountId.'&optFrom='.$optFrom;
            $result = requestCurl($url, [], 'PUT', $header, 'json');

            if (empty($result)) {
                if($isInner){       
                    return json_encode(['code'=>200,'msg'=>'微信好友分配成功']);
                }else{
                    return successJson([], '微信好友分配成功');
                }
            } else {
                if($isInner){
                    return json_encode(['code'=>500,'msg'=>$result]);
                }else{
                    return errorJson($result);
                }
            }
        } catch (\Exception $e) {
            if($isInner){
                return json_encode(['code'=>500,'msg'=>'微信好友分配失败：' . $e->getMessage()]);
            }else{
                return errorJson('微信好友分配失败：' . $e->getMessage());
            }
        }
    }
}