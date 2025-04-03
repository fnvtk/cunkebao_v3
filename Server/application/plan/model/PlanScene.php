<?php
namespace app\plan\model;

use think\Model;

/**
 * 获客场景模型类
 */
class PlanScene extends Model
{
    // 设置表名
    protected $name = 'plan_scene';
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
        'status' => 'integer',
        'createTime' => 'integer',
        'updateTime' => 'integer',
        'deleteTime' => 'integer'
    ];
    
    /**
     * 获取场景列表
     * 
     * @param array $where 查询条件
     * @param string $order 排序
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return array 场景列表和总数
     */
    public static function getSceneList($where = [], $order = 'id desc', $page = 1, $limit = 10)
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
     * 获取单个场景信息
     * 
     * @param int $id 场景ID
     * @return array|null 场景信息
     */
    public static function getSceneInfo($id)
    {
        return self::where('id', $id)->find();
    }
} 