<?php

namespace app\cozeai\controller;

use app\cozeai\model\Conversation as ConversationModel;

/**
 * Coze AI 对话控制器
 */
class ConversationController extends BaseController
{

    /**
     * 获取会话列表
     */
    public function list()
    {
        try {
            $bot_id = input('bot_id','');
            if(empty($bot_id)){
                return errorJson('智能体ID不能为空');
            }
            $page = input('page',1);
            $limit = input('limit',20);

            $params = [
                'bot_id' => $bot_id,
                'page_num' => $page,
                'page_size' => $limit,
                'sort_order' => 'desc'
            ];
            
            $result = requestCurl($this->apiUrl . "/v1/conversations", $params, 'GET', $this->headers);
            $result = json_decode($result, true);
            
            if ($result['code'] != 0) {
                return errorJson($result['msg'], $result['code']);
            }

            // 处理返回的数据并存入数据库
            if (!empty($result['data']['conversations'])) {
                foreach ($result['data']['conversations'] as $item) {
                    // 检查是否已存在
                    $exists = ConversationModel::where('conversation_id', $item['id'])->find();
                    
                    if (!$exists) {
                        // 不存在则插入
                        ConversationModel::create([
                            'conversation_id' => $item['id'],
                            'bot_id' => $bot_id,
                            'created_at' => $item['created_at'],
                            'meta_data' => json_encode($item['meta_data'] ?? []),
                            'create_time' => time(),
                            'update_time' => time()
                        ]);
                    } else {
                        // 存在则更新
                        $exists->save([
                            'meta_data' => json_encode($item['meta_data'] ?? []),
                            'update_time' => time()
                        ]);
                    }
                }
            }

           return successJson($result['data'], '创建成功');
            
        } catch (\Exception $e) {
            return errorJson('获取对话列表失败：' . $e->getMessage());
        }
    }




    /**
     * 创建对话
     */
    public function create()
    {
        try {
            $bot_id = input('bot_id','');
            $userInfo = request()->userInfo;
            $uid = $userInfo['id'];
            $companyId = $userInfo['companyId'];
            if(empty($bot_id)){
                return errorJson('智能体ID不能为空');
            }

            $meta_data = [
                'uid' => $uid,
                'companyId' => $companyId,
            ];
            $messages = [
                'role' => 'assistant',
                'content' => '欢迎使用美业AI助手，我可以帮您管理客户关系、自动回复消息、创建朋友圈内容，自动点赞开发客户。请问有什么可以帮你的？',
                'type' => 'answer',
                'content_type' => 'text',
            ];


            $params = [
                'bot_id' => $bot_id,
                'meta_data' => json_encode($meta_data),
                'messages' => json_encode($messages),
            ];


            
            $result = requestCurl($this->apiUrl . '/v1/conversation/create', $params, 'POST', $this->headers);
            $result = json_decode($result, true);
            
            if ($result['code'] != 0) {
                return errorJson($result['msg'], $result['code']);
            }
            
            return successJson($result['data'], '创建成功');
            
        } catch (\Exception $e) {
            return errorJson('创建对话失败：' . $e->getMessage());
        }
    }



    /**
     * 获取对话详情
     */
    public function detail()
    {
        try {
            $conversationId = $this->request->param('conversationId');
            
            if (empty($conversationId)) {
                return errorJson('对话ID不能为空');
            }
            
            $result = requestCurl($this->apiUrl . "/v1/conversations/{$conversationId}", [], 'GET', $this->headers);
            $result = json_decode($result, true);
            
            if ($result['code'] != 0) {
                return errorJson($result['msg'], $result['code']);
            }
            
            return successJson($result['data'], '获取成功');
            
        } catch (\Exception $e) {
            return errorJson('获取对话详情失败：' . $e->getMessage());
        }
    }

    /**
     * 删除对话
     */
    public function delete()
    {
        try {
            $conversationId = $this->request->param('conversationId');
            
            if (empty($conversationId)) {
                return errorJson('对话ID不能为空');
            }
            
            $result = requestCurl($this->apiUrl . "/v1/conversations/{$conversationId}/delete", [], 'POST', $this->headers);
            $result = json_decode($result, true);
            
            if ($result['code'] != 0) {
                return errorJson($result['msg'], $result['code']);
            }
            
            return successJson($result['data'], '删除成功');
            
        } catch (\Exception $e) {
            return errorJson('删除对话失败：' . $e->getMessage());
        }
    }
} 