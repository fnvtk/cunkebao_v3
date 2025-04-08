<?php
namespace app\plan\model;

use think\Model;

/**
 * 流量标签模型
 */
class TrafficTag extends Model
{
    // 设置表名
    protected $name = 'traffic_tag';
    protected $prefix = 'tk_';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = 'int';
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = false; // 没有更新时间字段
    protected $deleteTime = 'deleteTime';
    
    // 定义软删除
    protected $defaultSoftDelete = 0;
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'tagName' => 'string',
        'companyId' => 'integer',
        'createTime' => 'integer',
        'deleteTime' => 'integer'
    ];
    
    /**
     * 获取标签列表，支持分页和搜索
     *
     * @param array $where 查询条件
     * @param string $order 排序方式
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return \think\Paginator 分页对象
     */
    public static function getTagsByCompany($where = [], $order = 'id desc', $page = 1, $limit = 200)
    {
        return self::where($where)
            ->where('deleteTime', 0) // 只查询未删除的记录
            ->order($order)
            ->paginate($limit, false, [
                'page' => $page
            ]);
    }
} 