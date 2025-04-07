<?php
namespace app\plan\model;

use think\Model;

/**
 * 流量来源模型
 */
class TrafficSource extends Model
{
    // 设置表名
    protected $name = 'traffic_source';
    protected $prefix = 'tk_';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = 'int';
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = false; // 没有更新时间字段
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'traffic_id' => 'integer',
        'plan_id' => 'integer',
        'scene_id' => 'integer',
        'source_detail' => 'json',
        'createTime' => 'integer'
    ];
    
    /**
     * 渠道文本获取器
     * @param string $value 渠道值
     * @return string 渠道文本
     */
    public function getChannelTextAttr($value, $data)
    {
        $channels = [
            'poster' => '海报',
            'order' => '订单',
            'douyin' => '抖音',
            'xiaohongshu' => '小红书',
            'phone' => '电话',
            'wechat' => '公众号',
            'group' => '微信群',
            'payment' => '付款码',
            'api' => 'API接口'
        ];
        
        return isset($channels[$data['channel']]) ? $channels[$data['channel']] : '未知';
    }
    
    /**
     * 添加流量来源记录
     * @param int $trafficId 流量ID
     * @param string $channel 渠道
     * @param array $data 额外数据
     * @return int 新增记录ID
     */
    public static function addSource($trafficId, $channel, $data = [])
    {
        $model = new self();
        $model->save(array_merge([
            'traffic_id' => $trafficId,
            'channel' => $channel,
            'ip' => request()->ip(),
            'user_agent' => request()->header('user-agent')
        ], $data));
        
        return $model->id;
    }
    
    /**
     * 获取流量来源列表
     * @param int $trafficId 流量ID
     * @return array 来源列表
     */
    public static function getSourcesByTrafficId($trafficId)
    {
        return self::where('traffic_id', $trafficId)
            ->order('createTime DESC')
            ->select();
    }
    
    /**
     * 获取来源统计
     * @param string $channel 渠道
     * @param int $planId 计划ID
     * @param int $sceneId 场景ID
     * @param string $startTime 开始时间
     * @param string $endTime 结束时间
     * @return array 统计数据
     */
    public static function getSourceStats($channel = null, $planId = null, $sceneId = null, $startTime = null, $endTime = null)
    {
        $where = [];
        
        if ($channel !== null) {
            $where[] = ['channel', '=', $channel];
        }
        
        if ($planId !== null) {
            $where[] = ['plan_id', '=', $planId];
        }
        
        if ($sceneId !== null) {
            $where[] = ['scene_id', '=', $sceneId];
        }
        
        if ($startTime !== null) {
            $where[] = ['createTime', '>=', strtotime($startTime)];
        }
        
        if ($endTime !== null) {
            $where[] = ['createTime', '<=', strtotime($endTime)];
        }
        
        return self::where($where)
            ->field('channel, COUNT(*) as count')
            ->group('channel')
            ->select();
    }
    
    /**
     * 关联流量
     */
    public function traffic()
    {
        return $this->belongsTo('TrafficPool', 'traffic_id');
    }
    
    /**
     * 关联计划
     */
    public function plan()
    {
        return $this->belongsTo('PlanTask', 'plan_id');
    }
    
    /**
     * 关联场景
     */
    public function scene()
    {
        return $this->belongsTo('PlanScene', 'scene_id');
    }
} 