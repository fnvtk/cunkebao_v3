<?php

namespace app\cozeai\controller;

use app\cozeai\model\Conversation as ConversationModel;

/**
 * Coze AI 对话控制器
 */
class ConversationController extends BaseController
{
    /**
     * 保存对话数据到数据库
     * @param array $conversation 对话数据
     * @param string $bot_id 机器人ID
     */
    private function saveConversation($conversation, $bot_id)
    {
        if (empty($conversation['id'])) {
            return false;
        }

        // 检查是否已存在
        $exists = ConversationModel::where('conversation_id', $conversation['id'])->find();
        
        $meta_data = $conversation['meta_data'] ?? [];
       

        if (!$exists) {
            // 不存在则插入
            return ConversationModel::create([
                'conversation_id' => $conversation['id'],
                'bot_id' => $bot_id,
                'created_at' => $conversation['created_at'],
                'meta_data' => json_encode($meta_data),
                'create_time' => time(),
                'update_time' => time()
            ]);
        } else {
            // 存在则更新
            return $exists->save([
                'meta_data' => json_encode($meta_data),
                'update_time' => time()
            ]);
        }
    }

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
                    $this->saveConversation($item, $bot_id);
                }
            }

            return successJson($result['data'], '获取成功');
            
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

            // 构建元数据和消息
            $meta_data = [
                'uid' => '1111',
                'companyId' => '2222',
            ];
            $messages[] = [
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
          

            // 获取返回的对话数据并保存
            $conversation = $result['data'] ?? [];
            if (!empty($conversation)) {
                $this->saveConversation($conversation, $bot_id);
            }
            
            return successJson($conversation, '创建成功');
            
        } catch (\Exception $e) {
            return errorJson('创建对话失败：' . $e->getMessage());
        }
    }
} 