<?php

namespace app\api\controller;

use think\facade\Request;

class MomentsController extends BaseController
{
    /************************ 朋友圈发布相关接口 ************************/
    
    /**
     * 发布朋友圈
     * @return \think\response\Json
     */
    public function addJob()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取请求参数
            $text = $this->request->param('text', ''); // 朋友圈文本内容
            $picUrlList = $this->request->param('picUrlList', []); // 图片URL列表
            $videoUrl = $this->request->param('videoUrl', ''); // 视频URL
            $immediately = $this->request->param('immediately', true); // 是否立即发布
            $timingTime = $this->request->param('timingTime', ''); // 定时发布时间
            $beginTime = $this->request->param('beginTime', ''); // 开始时间
            $endTime = $this->request->param('endTime', ''); // 结束时间
            $isUseLocation = $this->request->param('isUseLocation', false); // 是否使用位置信息
            $poiName = $this->request->param('poiName', ''); // 位置名称
            $poiAddress = $this->request->param('poiAddress', ''); // 位置地址
            $lat = $this->request->param('lat', 0); // 纬度
            $lng = $this->request->param('lng', 0); // 经度
            $momentContentType = $this->request->param('momentContentType', 1); // 朋友圈内容类型
            $publicMode = $this->request->param('publicMode', 0); // 发布模式
            $altList = $this->request->param('altList', ''); // 替代列表
            $link = $this->request->param('link', []); // 链接信息
            $jobPublishWechatMomentsItems = $this->request->param('jobPublishWechatMomentsItems', []); // 发布账号和评论信息

            // 必填参数验证
            if (empty($jobPublishWechatMomentsItems) || !is_array($jobPublishWechatMomentsItems)) {
                return errorJson('至少需要选择一个发布账号');
            }
            
            // 根据朋友圈类型验证必填字段
            if ($momentContentType == 1 && empty($text)) { // 纯文本
                return errorJson('朋友圈内容不能为空');
            } else if ($momentContentType == 2 && (empty($picUrlList) || empty($text))) { // 图片+文字
                return errorJson('朋友圈内容和图片不能为空');
            } else if ($momentContentType == 3 && (empty($videoUrl) || empty($text))) { // 视频+文字
                return errorJson('朋友圈内容和视频不能为空');
            } else if ($momentContentType == 4 && (empty($link) || empty($text))) { // 链接+文字
                return errorJson('朋友圈内容和链接不能为空');
            }

            // 构建请求参数
            $params = [
                'text' => $text,
                'picUrlList' => $picUrlList,
                'videoUrl' => $videoUrl,
                'immediately' => $immediately,
                'timingTime' => $timingTime,
                'beginTime' => $beginTime,
                'endTime' => $endTime,
                'isUseLocation' => $isUseLocation,
                'poiName' => $poiName,
                'poiAddress' => $poiAddress,
                'lat' => $lat,
                'lng' => $lng,
                'momentContentType' => (int)$momentContentType,
                'publicMode' => (int)$publicMode,
                'altList' => $altList,
                'link' => $link,
                'jobPublishWechatMomentsItems' => $jobPublishWechatMomentsItems
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求发布朋友圈
            $result = requestCurl($this->baseUrl . 'api/JobPublishWechatMoments/addJob', $params, 'POST', $header, 'json');
            
            // 处理响应
            if (is_numeric($result)) {
                return successJson(['jobId' => $result], '朋友圈任务创建成功');
            } else {
                // 尝试解析JSON
                $response = json_decode($result, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($response['id'])) {
                    return successJson(['jobId' => $response['id']], '朋友圈任务创建成功');
                }
                
                // 如果返回的是错误信息
                return errorJson(is_string($result) ? $result : '创建朋友圈任务失败');
            }
        } catch (\Exception $e) {
            return errorJson('发布朋友圈失败：' . $e->getMessage());
        }
    }

    /************************ 朋友圈任务管理相关接口 ************************/

    /**
     * 获取朋友圈任务列表
     * @return \think\response\Json
     */
    public function getList()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', $this->authorization));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 获取请求参数
            $keyword = $this->request->param('keyword', ''); // 关键词搜索
            $jobStatus = $this->request->param('jobStatus', ''); // 任务状态筛选
            $contentType = $this->request->param('contentType', ''); // 内容类型筛选
            $only = $this->request->param('only', 'false'); // 是否只查看自己的
            $pageIndex = $this->request->param('pageIndex', 0); // 当前页码
            $pageSize = $this->request->param('pageSize', 10); // 每页数量
            $from = $this->request->param('from', ''); // 开始日期
            $to = $this->request->param('to', ''); // 结束日期

            // 构建请求参数
            $params = [
                'keyword' => $keyword,
                'jobStatus' => $jobStatus,
                'contentType' => $contentType,
                'only' => $only,
                'pageIndex' => (int)$pageIndex,
                'pageSize' => (int)$pageSize
            ];
            
            // 添加日期筛选条件（如果有）
            if (!empty($from)) {
                $params['from'] = $from;
            }
            if (!empty($to)) {
                $params['to'] = $to;
            }

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'json');

            // 发送请求获取朋友圈任务列表
            $result = requestCurl($this->baseUrl . 'api/JobPublishWechatMoments/listPagination', $params, 'GET', $header, 'json');
            $response = handleApiResponse($result);
            
            return successJson($response);
        } catch (\Exception $e) {
            return errorJson('获取朋友圈任务列表失败：' . $e->getMessage());
        }
    }
} 