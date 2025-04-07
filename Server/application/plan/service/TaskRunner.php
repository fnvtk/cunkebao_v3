<?php
namespace app\plan\service;

use app\plan\model\PlanTask;
use app\plan\model\PlanExecution;
use app\plan\model\TrafficPool;
use app\plan\model\TrafficSource;
use app\plan\model\Tag;
use think\Db;
use think\facade\Log;
use think\Exception;

/**
 * 任务运行器服务
 */
class TaskRunner
{
    protected $task;
    protected $stepHandlers = [];
    
    /**
     * 构造函数
     * @param PlanTask|int $task 任务对象或ID
     */
    public function __construct($task)
    {
        if (is_numeric($task)) {
            $this->task = PlanTask::getTaskDetail($task);
        } else {
            $this->task = $task;
        }
        
        if (empty($this->task)) {
            throw new Exception('任务不存在');
        }
        
        // 注册步骤处理器
        $this->registerStepHandlers();
    }
    
    /**
     * 注册步骤处理器
     */
    protected function registerStepHandlers()
    {
        // 基础配置
        $this->stepHandlers[1] = function() {
            return $this->handleBasicConfig();
        };
        
        // 加友计划
        $this->stepHandlers[2] = function() {
            return $this->handleAddFriend();
        };
        
        // API调用
        $this->stepHandlers[3] = function() {
            return $this->handleApiCall();
        };
        
        // 标签处理
        $this->stepHandlers[4] = function() {
            return $this->handleTagging();
        };
    }
    
    /**
     * 运行任务
     * @return array 执行结果
     */
    public function run()
    {
        if ($this->task['status'] != 1) {
            return [
                'success' => false,
                'message' => '任务未启用，无法运行'
            ];
        }
        
        // 获取当前步骤
        $currentStep = $this->task['current_step'];
        
        // 检查是否需要初始化第一步
        if ($currentStep == 0) {
            $currentStep = 1;
            PlanTask::updateTaskStatus($this->task['id'], 1, $currentStep);
            $this->task['current_step'] = $currentStep;
        }
        
        // 执行当前步骤
        if (isset($this->stepHandlers[$currentStep])) {
            try {
                $result = call_user_func($this->stepHandlers[$currentStep]);
                
                if ($result['success']) {
                    // 检查是否需要进入下一步
                    if ($result['completed'] && $currentStep < 4) {
                        $nextStep = $currentStep + 1;
                        PlanTask::updateTaskStatus($this->task['id'], 1, $nextStep);
                    } else if ($result['completed'] && $currentStep == 4) {
                        // 所有步骤已完成，标记任务为完成状态
                        PlanTask::updateTaskStatus($this->task['id'], 2, $currentStep);
                    }
                } else {
                    // 如果步骤执行失败，记录错误并可能更新任务状态
                    Log::error('任务执行失败：', [
                        'task_id' => $this->task['id'],
                        'step' => $currentStep,
                        'error' => $result['message']
                    ]);
                    
                    // 视情况决定是否将任务标记为失败
                    if ($result['fatal']) {
                        PlanTask::updateTaskStatus($this->task['id'], 3, $currentStep);
                    }
                }
                
                return $result;
                
            } catch (Exception $e) {
                // 捕获并记录异常
                Log::error('任务执行异常：', [
                    'task_id' => $this->task['id'],
                    'step' => $currentStep,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                return [
                    'success' => false,
                    'message' => '任务执行异常：' . $e->getMessage(),
                    'fatal' => true
                ];
            }
        } else {
            return [
                'success' => false,
                'message' => '未知的任务步骤：' . $currentStep,
                'fatal' => true
            ];
        }
    }
    
    /**
     * 处理基础配置步骤
     * @return array 处理结果
     */
    protected function handleBasicConfig()
    {
        // 创建执行记录
        $executionId = PlanExecution::createExecution($this->task['id'], 1, [
            'status' => 1 // 设置为进行中
        ]);
        
        try {
            // 检查设备状态
            if (empty($this->task['device_id'])) {
                PlanExecution::updateExecution($executionId, 3, [
                    'error' => '未设置设备'
                ]);
                
                return [
                    'success' => false,
                    'message' => '未设置设备',
                    'fatal' => true
                ];
            }
            
            // 检查场景配置
            if (empty($this->task['scene_id'])) {
                PlanExecution::updateExecution($executionId, 3, [
                    'error' => '未设置获客场景'
                ]);
                
                return [
                    'success' => false,
                    'message' => '未设置获客场景',
                    'fatal' => true
                ];
            }
            
            // 检查场景配置
            if (empty($this->task['scene_config'])) {
                PlanExecution::updateExecution($executionId, 3, [
                    'error' => '场景配置为空'
                ]);
                
                return [
                    'success' => false,
                    'message' => '场景配置为空',
                    'fatal' => true
                ];
            }
            
            // 标记基础配置步骤为完成
            PlanExecution::updateExecution($executionId, 2, [
                'result' => [
                    'device_id' => $this->task['device_id'],
                    'scene_id' => $this->task['scene_id'],
                    'config_valid' => true
                ]
            ]);
            
            return [
                'success' => true,
                'message' => '基础配置验证通过',
                'completed' => true
            ];
            
        } catch (Exception $e) {
            PlanExecution::updateExecution($executionId, 3, [
                'error' => '基础配置异常：' . $e->getMessage()
            ]);
            
            throw $e;
        }
    }
    
    /**
     * 处理加友计划步骤
     * @return array 处理结果
     */
    protected function handleAddFriend()
    {
        // 创建执行记录
        $executionId = PlanExecution::createExecution($this->task['id'], 2, [
            'status' => 1 // 设置为进行中
        ]);
        
        try {
            // 从流量池中选择符合条件的流量
            $trafficConditions = $this->getTrafficConditions();
            $trafficData = TrafficPool::getAvailableTraffic($trafficConditions, 'last_used_time ASC', 1, 1);
            
            if (empty($trafficData['list'])) {
                // 没有符合条件的流量，标记为等待状态
                PlanExecution::updateExecution($executionId, 0, [
                    'error' => '没有符合条件的流量'
                ]);
                
                return [
                    'success' => true,
                    'message' => '没有符合条件的流量，等待下次执行',
                    'completed' => false // 不算失败，但也不进入下一步
                ];
            }
            
            $traffic = $trafficData['list'][0];
            
            // 调用设备服务执行加好友操作
            $addFriendResult = $this->callDeviceAddFriend($traffic);
            
            if ($addFriendResult['success']) {
                // 更新流量使用状态
                TrafficPool::setTrafficUsed($traffic['id']);
                
                // 标记执行记录为成功
                PlanExecution::updateExecution($executionId, 2, [
                    'traffic_id' => $traffic['id'],
                    'result' => $addFriendResult['data']
                ]);
                
                return [
                    'success' => true,
                    'message' => '加友成功：' . $traffic['mobile'],
                    'completed' => true,
                    'traffic' => $traffic
                ];
            } else {
                // 标记执行记录为失败
                PlanExecution::updateExecution($executionId, 3, [
                    'traffic_id' => $traffic['id'],
                    'error' => $addFriendResult['message'],
                    'result' => $addFriendResult['data'] ?? null
                ]);
                
                return [
                    'success' => false,
                    'message' => '加友失败：' . $addFriendResult['message'],
                    'fatal' => false // 加友失败不算致命错误，可以下次继续
                ];
            }
            
        } catch (Exception $e) {
            PlanExecution::updateExecution($executionId, 3, [
                'error' => '加友计划异常：' . $e->getMessage()
            ]);
            
            throw $e;
        }
    }
    
    /**
     * 处理API调用步骤
     * @return array 处理结果
     */
    protected function handleApiCall()
    {
        // 创建执行记录
        $executionId = PlanExecution::createExecution($this->task['id'], 3, [
            'status' => 1 // 设置为进行中
        ]);
        
        try {
            // 获取上一步成功处理的流量信息
            $lastExecution = PlanExecution::getLatestExecution($this->task['id'], 2);
            
            if (empty($lastExecution) || $lastExecution['status'] != 2) {
                PlanExecution::updateExecution($executionId, 3, [
                    'error' => '上一步未成功完成'
                ]);
                
                return [
                    'success' => false,
                    'message' => '上一步未成功完成，无法进行API调用',
                    'fatal' => true
                ];
            }
            
            $trafficId = $lastExecution['traffic_id'];
            if (empty($trafficId)) {
                PlanExecution::updateExecution($executionId, 3, [
                    'error' => '未找到有效的流量ID'
                ]);
                
                return [
                    'success' => false,
                    'message' => '未找到有效的流量ID',
                    'fatal' => true
                ];
            }
            
            // 获取流量详情
            $traffic = TrafficPool::getTrafficDetail($trafficId);
            if (empty($traffic)) {
                PlanExecution::updateExecution($executionId, 3, [
                    'error' => '未找到流量信息'
                ]);
                
                return [
                    'success' => false,
                    'message' => '未找到流量信息',
                    'fatal' => true
                ];
            }
            
            // 根据场景配置调用相应的API
            $apiCallResult = $this->callSceneApi($traffic);
            
            if ($apiCallResult['success']) {
                // 标记执行记录为成功
                PlanExecution::updateExecution($executionId, 2, [
                    'traffic_id' => $trafficId,
                    'result' => $apiCallResult['data']
                ]);
                
                return [
                    'success' => true,
                    'message' => 'API调用成功',
                    'completed' => true,
                    'traffic' => $traffic
                ];
            } else {
                // 标记执行记录为失败
                PlanExecution::updateExecution($executionId, 3, [
                    'traffic_id' => $trafficId,
                    'error' => $apiCallResult['message'],
                    'result' => $apiCallResult['data'] ?? null
                ]);
                
                return [
                    'success' => false,
                    'message' => 'API调用失败：' . $apiCallResult['message'],
                    'fatal' => $apiCallResult['fatal'] ?? false
                ];
            }
            
        } catch (Exception $e) {
            PlanExecution::updateExecution($executionId, 3, [
                'error' => 'API调用异常：' . $e->getMessage()
            ]);
            
            throw $e;
        }
    }
    
    /**
     * 处理标签步骤
     * @return array 处理结果
     */
    protected function handleTagging()
    {
        // 创建执行记录
        $executionId = PlanExecution::createExecution($this->task['id'], 4, [
            'status' => 1 // 设置为进行中
        ]);
        
        try {
            // 获取上一步成功处理的流量信息
            $lastExecution = PlanExecution::getLatestExecution($this->task['id'], 3);
            
            if (empty($lastExecution) || $lastExecution['status'] != 2) {
                PlanExecution::updateExecution($executionId, 3, [
                    'error' => '上一步未成功完成'
                ]);
                
                return [
                    'success' => false,
                    'message' => '上一步未成功完成，无法进行标签处理',
                    'fatal' => true
                ];
            }
            
            $trafficId = $lastExecution['traffic_id'];
            if (empty($trafficId)) {
                PlanExecution::updateExecution($executionId, 3, [
                    'error' => '未找到有效的流量ID'
                ]);
                
                return [
                    'success' => false,
                    'message' => '未找到有效的流量ID',
                    'fatal' => true
                ];
            }
            
            // 获取流量详情
            $traffic = TrafficPool::getTrafficDetail($trafficId);
            if (empty($traffic)) {
                PlanExecution::updateExecution($executionId, 3, [
                    'error' => '未找到流量信息'
                ]);
                
                return [
                    'success' => false,
                    'message' => '未找到流量信息',
                    'fatal' => true
                ];
            }
            
            // 获取并应用标签
            $taggingResult = $this->applyTags($traffic);
            
            if ($taggingResult['success']) {
                // 标记执行记录为成功
                PlanExecution::updateExecution($executionId, 2, [
                    'traffic_id' => $trafficId,
                    'result' => $taggingResult['data']
                ]);
                
                return [
                    'success' => true,
                    'message' => '标签处理成功',
                    'completed' => true,
                    'traffic' => $traffic
                ];
            } else {
                // 标记执行记录为失败
                PlanExecution::updateExecution($executionId, 3, [
                    'traffic_id' => $trafficId,
                    'error' => $taggingResult['message'],
                    'result' => $taggingResult['data'] ?? null
                ]);
                
                return [
                    'success' => false,
                    'message' => '标签处理失败：' . $taggingResult['message'],
                    'fatal' => $taggingResult['fatal'] ?? false
                ];
            }
            
        } catch (Exception $e) {
            PlanExecution::updateExecution($executionId, 3, [
                'error' => '标签处理异常：' . $e->getMessage()
            ]);
            
            throw $e;
        }
    }
    
    /**
     * 获取流量筛选条件
     * @return array 条件数组
     */
    protected function getTrafficConditions()
    {
        $conditions = [];
        
        // 根据场景配置获取筛选条件
        if (isset($this->task['scene_config']) && is_array($this->task['scene_config'])) {
            $config = $this->task['scene_config'];
            
            // 添加性别筛选
            if (isset($config['gender']) && in_array($config['gender'], [0, 1, 2])) {
                $conditions[] = ['gender', '=', $config['gender']];
            }
            
            // 添加年龄筛选
            if (isset($config['age_min']) && is_numeric($config['age_min'])) {
                $conditions[] = ['age', '>=', intval($config['age_min'])];
            }
            
            if (isset($config['age_max']) && is_numeric($config['age_max'])) {
                $conditions[] = ['age', '<=', intval($config['age_max'])];
            }
            
            // 添加区域筛选
            if (isset($config['region']) && !empty($config['region'])) {
                $conditions[] = ['region', 'like', '%' . $config['region'] . '%'];
            }
        }
        
        return $conditions;
    }
    
    /**
     * 调用设备加好友操作
     * @param array $traffic 流量信息
     * @return array 调用结果
     */
    protected function callDeviceAddFriend($traffic)
    {
        // 模拟调用设备操作
        // 实际项目中应该调用实际的设备API
        
        // 记录设备调用日志
        Log::info('设备加好友操作', [
            'task_id' => $this->task['id'],
            'device_id' => $this->task['device_id'],
            'mobile' => $traffic['mobile']
        ]);
        
        // 模拟成功率
        $success = mt_rand(0, 10) > 2;
        
        if ($success) {
            return [
                'success' => true,
                'message' => '加好友操作成功',
                'data' => [
                    'add_time' => date('Y-m-d H:i:s'),
                    'device_id' => $this->task['device_id'],
                    'mobile' => $traffic['mobile']
                ]
            ];
        } else {
            return [
                'success' => false,
                'message' => '加好友操作失败：' . ['设备繁忙', '用户拒绝', '网络异常'][mt_rand(0, 2)],
                'data' => [
                    'attempt_time' => date('Y-m-d H:i:s'),
                    'device_id' => $this->task['device_id'],
                    'mobile' => $traffic['mobile']
                ]
            ];
        }
    }
    
    /**
     * 根据场景调用相应API
     * @param array $traffic 流量信息
     * @return array 调用结果
     */
    protected function callSceneApi($traffic)
    {
        // 根据场景类型调用不同API
        if (empty($this->task['scene_id'])) {
            return [
                'success' => false,
                'message' => '场景未设置',
                'fatal' => true
            ];
        }
        
        // 记录API调用日志
        Log::info('场景API调用', [
            'task_id' => $this->task['id'],
            'scene_id' => $this->task['scene_id'],
            'traffic_id' => $traffic['id']
        ]);
        
        // 模拟成功率
        $success = mt_rand(0, 10) > 1;
        
        if ($success) {
            return [
                'success' => true,
                'message' => 'API调用成功',
                'data' => [
                    'call_time' => date('Y-m-d H:i:s'),
                    'scene_id' => $this->task['scene_id'],
                    'traffic_id' => $traffic['id']
                ]
            ];
        } else {
            return [
                'success' => false,
                'message' => 'API调用失败：' . ['参数错误', 'API超时', '系统异常'][mt_rand(0, 2)],
                'data' => [
                    'attempt_time' => date('Y-m-d H:i:s'),
                    'scene_id' => $this->task['scene_id'],
                    'traffic_id' => $traffic['id']
                ],
                'fatal' => false // API调用失败通常不算致命错误
            ];
        }
    }
    
    /**
     * 应用标签
     * @param array $traffic 流量信息
     * @return array 处理结果
     */
    protected function applyTags($traffic)
    {
        // 获取需要应用的标签
        $tags = [];
        
        // 从场景配置中获取标签
        if (isset($this->task['scene_config']) && is_array($this->task['scene_config']) && isset($this->task['scene_config']['tags'])) {
            $configTags = $this->task['scene_config']['tags'];
            if (is_array($configTags)) {
                $tags = array_merge($tags, $configTags);
            } else if (is_string($configTags)) {
                $tags[] = $configTags;
            }
        }
        
        // 从场景获取标签
        if (!empty($this->task['scene_id'])) {
            $tags[] = '场景_' . $this->task['scene_id'];
        }
        
        // 如果没有标签，返回成功
        if (empty($tags)) {
            return [
                'success' => true,
                'message' => '没有需要应用的标签',
                'data' => []
            ];
        }
        
        // 处理标签
        $tagIds = [];
        foreach ($tags as $tagName) {
            $tagId = Tag::getOrCreate($tagName, 'friend');
            $tagIds[] = $tagId;
            Tag::updateCount($tagId);
        }
        
        // 记录标签应用日志
        Log::info('应用标签', [
            'task_id' => $this->task['id'],
            'traffic_id' => $traffic['id'],
            'tag_ids' => $tagIds
        ]);
        
        // 更新流量标签
        $existingTags = empty($traffic['tag_ids']) ? [] : explode(',', $traffic['tag_ids']);
        $allTags = array_unique(array_merge($existingTags, $tagIds));
        
        TrafficPool::where('id', $traffic['id'])->update([
            'tag_ids' => implode(',', $allTags)
        ]);
        
        return [
            'success' => true,
            'message' => '标签应用成功',
            'data' => [
                'tag_ids' => $tagIds,
                'tag_names' => $tags
            ]
        ];
    }
} 