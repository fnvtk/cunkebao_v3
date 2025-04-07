<?php
namespace app\plan\model;

use think\Model;

/**
 * 计划执行记录模型
 */
class PlanExecution extends Model
{
    // 设置表名
    protected $name = 'plan_execution';
    protected $prefix = 'tk_';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = 'int';
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'plan_id' => 'integer',
        'traffic_id' => 'integer',
        'step' => 'integer',
        'status' => 'integer',
        'result' => 'json',
        'start_time' => 'integer',
        'end_time' => 'integer',
        'createTime' => 'integer',
        'updateTime' => 'integer'
    ];
    
    /**
     * 状态文本获取器
     * @param int $value 状态值
     * @return string 状态文本
     */
    public function getStatusTextAttr($value, $data)
    {
        $status = [
            0 => '等待',
            1 => '进行中',
            2 => '成功',
            3 => '失败'
        ];
        return isset($status[$data['status']]) ? $status[$data['status']] : '未知';
    }
    
    /**
     * 步骤文本获取器
     * @param int $value 步骤值
     * @return string 步骤文本
     */
    public function getStepTextAttr($value, $data)
    {
        $steps = [
            1 => '基础配置',
            2 => '加友计划',
            3 => 'API调用',
            4 => '标签处理'
        ];
        return isset($steps[$data['step']]) ? $steps[$data['step']] : '未知';
    }
    
    /**
     * 创建执行记录
     * @param int $planId 计划ID
     * @param int $step 步骤
     * @param array $data 额外数据
     * @return int 新增记录ID
     */
    public static function createExecution($planId, $step, $data = [])
    {
        $model = new self();
        $model->save(array_merge([
            'plan_id' => $planId,
            'step' => $step,
            'status' => 0, // 等待状态
            'start_time' => time()
        ], $data));
        
        return $model->id;
    }
    
    /**
     * 更新执行状态
     * @param int $id 记录ID
     * @param int $status 状态
     * @param array $data 额外数据
     * @return bool 更新结果
     */
    public static function updateExecution($id, $status, $data = [])
    {
        $updateData = array_merge([
            'status' => $status
        ], $data);
        
        // 如果是完成或失败状态，添加结束时间
        if ($status == 2 || $status == 3) {
            $updateData['end_time'] = time();
        }
        
        return self::where('id', $id)->update($updateData);
    }
    
    /**
     * 获取计划的执行记录
     * @param int $planId 计划ID
     * @param int $step 步骤
     * @return array 执行记录
     */
    public static function getPlanExecutions($planId, $step = null)
    {
        $where = [
            ['plan_id', '=', $planId]
        ];
        
        if ($step !== null) {
            $where[] = ['step', '=', $step];
        }
        
        return self::where($where)
            ->order('createTime DESC')
            ->select();
    }
    
    /**
     * 获取最近的执行记录
     * @param int $planId 计划ID
     * @param int $step 步骤
     * @return array|null 执行记录
     */
    public static function getLatestExecution($planId, $step)
    {
        return self::where([
                ['plan_id', '=', $planId],
                ['step', '=', $step]
            ])
            ->order('createTime DESC')
            ->find();
    }
    
    /**
     * 关联计划
     */
    public function plan()
    {
        return $this->belongsTo('PlanTask', 'plan_id');
    }
    
    /**
     * 关联流量
     */
    public function traffic()
    {
        return $this->belongsTo('TrafficPool', 'traffic_id');
    }
} 