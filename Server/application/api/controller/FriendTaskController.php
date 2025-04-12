<?php

namespace app\api\controller;

use app\api\model\FriendTaskModel;
use think\facade\Request;

class FriendTaskController extends BaseController
{
    /************************ 好友任务管理相关接口 ************************/
    
    /**
     * 获取添加好友记录列表
     * @param int $pageIndex 页码
     * @param int $pageSize 每页数量
     * @param bool $isJob 是否为定时任务调用
     * @return \think\response\Json
     */
    public function getlist($pageIndex, $pageSize, $isJob = false)
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
                'keyword' => $this->request->param('keyword', ''),
                'status' => $this->request->param('status', ''),
                'pageIndex' => !empty($pageIndex) ? $pageIndex :  $this->request->param('pageIndex', 0),
                'pageSize' => !empty($pageSize) ? $pageSize :  $this->request->param('pageSize', 20),
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求获取添加好友记录列表
            $result = requestCurl($this->baseUrl . 'api/AddFriendByPhoneTask/list', $params, 'GET', $header,'json');
            $response = handleApiResponse($result);
            

            // 保存数据到数据库
            if (!empty($response['results'])) {
                foreach ($response['results'] as $item) {
                    $this->saveFriendTask($item);
                }
            }
            if($isJob){
                return json_encode(['code'=>200,'msg'=>'获取添加好友记录列表成功','data'=>$response]);
            }else{
                return successJson($response);
            }
        } catch (\Exception $e) {
            if($isJob){
                return json_encode(['code'=>500,'msg'=>'获取添加好友记录列表失败：' . $e->getMessage()]);
            }else{
                return errorJson('获取添加好友记录列表失败：' . $e->getMessage());
            }
        }
    }

    /**
     * 添加好友任务
     * @return \think\response\Json
     */
    public function addFriendTask()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取请求参数
            $phone = $this->request->param('phone', '');
            $message = $this->request->param('message', '');
            $remark = $this->request->param('remark', '');
            $labels = $this->request->param('labels', []);
            $wechatAccountId = $this->request->param('wechatAccountId', 0);

            // 参数验证
            if (empty($phone)) {
                return errorJson('手机号不能为空');
            }
            
            if (empty($wechatAccountId)) {
                return errorJson('微信号不能为空');
            }

            // 构建请求参数
            $params = [
                'phone' => $phone,
                'message' => $message,
                'remark' => $remark,
                'labels' => is_array($labels) ? $labels : [$labels],
                'wechatAccountId' => (int)$wechatAccountId
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求添加好友任务
            $result = requestCurl($this->baseUrl . 'api/AddFriendByPhoneTask/add', $params, 'POST', $header, 'json');
            
            // 处理响应
            return successJson([], '添加好友任务创建成功');
        } catch (\Exception $e) {
            return errorJson('添加好友任务失败：' . $e->getMessage());
        }
    }

    /************************ 私有辅助方法 ************************/

    /**
     * 保存添加好友记录到数据库
     * @param array $item 添加好友记录数据
     */
    private function saveFriendTask($item)
    {
        // 将日期时间字符串转换为时间戳
        $createTime = isset($item['createTime']) ? strtotime($item['createTime']) : null;

        $data = [
            'id' => $item['id'],
            'tenantId' => $item['tenantId'],
            'operatorAccountId' => $item['operatorAccountId'],
            'status' => $item['status'],
            'phone' => $item['phone'],
            'msgContent' => $item['msgContent'],
            'wechatAccountId' => $item['wechatAccountId'],
            'createTime' => $createTime,
            'remark' => $item['remark'],
            'extra' => $item['extra'],
            'labels' => $item['labels'],
            'from' => $item['from'],
            'alias' => $item['alias'],
            'wechatId' => $item['wechatId'],
            'wechatAvatar' => $item['wechatAvatar'],
            'wechatNickname' => $item['wechatNickname'],
            'accountNickname' => $item['accountNickname'],
            'accountRealName' => $item['accountRealName'],
            'accountUsername' => $item['accountUsername']
        ];

        // 使用taskId作为唯一性判断
        $task = FriendTaskModel::where('id', $item['id'])->find();

        if ($task) {
            $task->save($data);
        } else {
            FriendTaskModel::create($data);
        }
    }
} 