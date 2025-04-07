<?php
namespace app\plan\model;

use think\Model;

/**
 * 获客计划任务模型
 */
class PlanTask extends Model
{
    // 设置表名
    protected $name = 'plan_task';
    protected $prefix = 'tk_';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = 'int';
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    protected $deleteTime = 'deleteTime';
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'device_id' => 'integer',
        'scene_id' => 'integer',
        'scene_config' => 'json',
        'status' => 'integer',
        'current_step' => 'integer',
        'priority' => 'integer',
        'created_by' => 'integer',
        'createTime' => 'integer',
        'updateTime' => 'integer',
        'deleteTime' => 'integer'
    ];
    
    /**
     * 状态文本获取器
     * @param int $value 状态值
     * @return string 状态文本
     */
    public function getStatusTextAttr($value, $data)
    {
        $status = [
            0 => '停用',
            1 => '启用', 
            2 => '完成',
            3 => '失败'
        ];
        return isset($status[$data['status']]) ? $status[$data['status']] : '未知';
    }
    
    /**
     * 获取待执行的任务列表
     * @param int $limit 限制数量
     * @return array 任务列表
     */
    public static function getPendingTasks($limit = 10)
    {
        return self::where('status', 1)
            ->order('priority DESC, id ASC')
            ->limit($limit)
            ->select();
    }
    
    /**
     * 更新任务状态
     * @param int $id 任务ID
     * @param int $status 新状态
     * @param int $currentStep 当前步骤
     * @return bool 更新结果
     */
    public static function updateTaskStatus($id, $status, $currentStep = null)
    {
        $data = ['status' => $status];
        if ($currentStep !== null) {
            $data['current_step'] = $currentStep;
        }
        
        return self::where('id', $id)->update($data);
    }
    
    /**
     * 获取任务详情
     * @param int $id 任务ID
     * @return array|null 任务详情
     */
    public static function getTaskDetail($id)
    {
        return self::where('id', $id)->find();
    }
    
    /**
     * 获取任务列表
     * @param array $where 查询条件
     * @param string $order 排序
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return array 任务列表和总数
     */
    public static function getTaskList($where = [], $order = 'id desc', $page = 1, $limit = 10)
    {
        // 构建查询
        $query = self::where($where);
        
        // 计算总数
        $total = $query->count();
        
        // 分页查询数据
        $list = $query->page($page, $limit)
            ->order($order)
            ->select();
        
        return [
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ];
    }
    
    /**
     * 关联场景
     */
    public function scene()
    {
        return $this->belongsTo('PlanScene', 'scene_id');
    }
    
    /**
     * 关联设备
     */
    public function device()
    {
        return $this->belongsTo('app\devices\model\Device', 'device_id');
    }
    
    /**
     * 关联执行记录
     */
    public function executions()
    {
        return $this->hasMany('PlanExecution', 'plan_id');
    }
} 