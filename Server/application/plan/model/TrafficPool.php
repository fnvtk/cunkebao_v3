<?php
namespace app\plan\model;

use think\Model;

/**
 * 流量池模型
 */
class TrafficPool extends Model
{
    // 设置表名
    protected $name = 'traffic_pool';
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
        'gender' => 'integer',
        'age' => 'integer',
        'status' => 'integer',
        'last_used_time' => 'integer',
        'createTime' => 'integer',
        'updateTime' => 'integer',
        'deleteTime' => 'integer'
    ];
    
    /**
     * 添加或更新流量信息
     * @param string $mobile 手机号
     * @param array $data 流量数据
     * @return int|bool 流量ID或更新结果
     */
    public static function addOrUpdateTraffic($mobile, $data = [])
    {
        // 查询是否已存在该手机号
        $exists = self::where('mobile', $mobile)->find();
        
        // 设置通用数据
        $saveData = array_merge([
            'mobile' => $mobile,
            'status' => 1,
            'last_used_time' => time()
        ], $data);
        
        if ($exists) {
            // 更新已存在的流量记录
            return self::where('id', $exists['id'])->update($saveData);
        } else {
            // 创建新的流量记录
            $model = new self();
            $model->save($saveData);
            return $model->id;
        }
    }
    
    /**
     * 获取可用的流量列表
     * @param array $where 查询条件
     * @param string $order 排序
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return array 流量列表和总数
     */
    public static function getAvailableTraffic($where = [], $order = 'last_used_time ASC', $page = 1, $limit = 10)
    {
        // 确保只查询有效流量
        $where[] = ['status', '=', 1];
        
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
     * 设置流量使用时间
     * @param int $id 流量ID
     * @return bool 更新结果
     */
    public static function setTrafficUsed($id)
    {
        return self::where('id', $id)->update([
            'last_used_time' => time()
        ]);
    }
    
    /**
     * 获取流量详情
     * @param int $id 流量ID
     * @return array|null 流量详情
     */
    public static function getTrafficDetail($id)
    {
        return self::where('id', $id)->find();
    }
    
    /**
     * 根据手机号获取流量详情
     * @param string $mobile 手机号
     * @return array|null 流量详情
     */
    public static function getTrafficByMobile($mobile)
    {
        return self::where('mobile', $mobile)->find();
    }
    
    /**
     * 关联流量来源
     */
    public function sources()
    {
        return $this->hasMany('TrafficSource', 'traffic_id');
    }
} 