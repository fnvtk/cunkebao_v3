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
    public function autoAllotWechatFriend($toAccountId = '', $wechatAccountKeyword = '', $isDeleted = false)
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取请求参数
            $toAccountId = !empty($toAccountId) ? $toAccountId : input('toAccountId', '');
            $wechatAccountKeyword = !empty($wechatAccountKeyword) ? $wechatAccountKeyword : input('wechatAccountKeyword', '');
            $isDeleted = !empty($isDeleted) ? $isDeleted : input('isDeleted', false);
            
            if (empty($toAccountId)) {
                return errorJson('目标账号ID不能为空');
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
                return successJson([],'微信好友自动分配成功');
            }else{
                return errorJson($response);
            }

        } catch (\Exception $e) {
            return errorJson('微信好友自动分配失败：' . $e->getMessage());
        }
    }


    /**
     * 自动分配微信群聊
     * @param string $toAccountId 目标账号ID
     * @param string $wechatAccountKeyword 微信账号关键字
     * @param bool $isDeleted 是否已删除
     * @return \think\response\Json
     */
    public function autoAllotWechatChatroom($toAccountId = '', $wechatAccountKeyword = '', $isDeleted = false)
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取请求参数
            $toAccountId = !empty($toAccountId) ? $toAccountId : input('toAccountId', '');
            $wechatAccountKeyword = !empty($wechatAccountKeyword) ? $wechatAccountKeyword : input('wechatAccountKeyword', '');
            $isDeleted = !empty($isDeleted) ? $isDeleted : input('isDeleted', false);
            
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
}