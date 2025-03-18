<?php
namespace app\devices\model;

use think\Model;
use think\Db;

/**
 * 设备模型类
 */
class Device extends Model
{
    // 设置表名
    protected $name = 'device';
    
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
        'createTime' => 'integer',
        'updateTime' => 'integer',
        'deleteTime' => 'integer',
        'alive' => 'integer',
        'isDeleted' => 'integer',
        'tenantId' => 'integer',
        'groupId' => 'integer'
    ];
    
    /**
     * 获取设备总数
     * @param array $where 查询条件
     * @return int 设备总数
     */
    public static function getDeviceCount($where = [])
    {
        // 默认只统计未删除的设备
        if (!isset($where['isDeleted'])) {
            $where['isDeleted'] = 0;
        }
        
        return self::where($where)->count();
    }
    
    /**
     * 获取设备列表
     * @param array $where 查询条件
     * @param string $order 排序方式
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return \think\Paginator 分页对象
     */
    public static function getDeviceList($where = [], $order = 'id desc', $page = 1, $limit = 10)
    {
        // 默认只查询未删除的设备
        if (!isset($where['isDeleted'])) {
            $where['isDeleted'] = 0;
        }
        
        return self::where($where)
            ->order($order)
            ->paginate($limit, false, ['page' => $page]);
    }
    
    /**
     * 获取设备详情
     * @param int $id 设备ID
     * @return array|null 设备信息
     */
    public static function getDeviceInfo($id)
    {
        return self::where('id', $id)
            ->where('isDeleted', 0)
            ->find();
    }
    
    /**
     * 添加设备
     * @param array $data 设备数据
     * @return int 新增设备ID
     */
    public static function addDevice($data)
    {
        $device = new self();
        $device->allowField(true)->save($data);
        return $device->id;
    }
    
    /**
     * 更新设备
     * @param int $id 设备ID
     * @param array $data 设备数据
     * @return bool 更新结果
     */
    public static function updateDevice($id, $data)
    {
        return self::where('id', $id)
            ->where('isDeleted', 0)
            ->update($data);
    }
    
    /**
     * 删除设备（软删除）
     * @param int $id 设备ID
     * @return bool 删除结果
     */
    public static function deleteDevice($id)
    {
        return self::where('id', $id)
            ->update([
                'isDeleted' => 1,
                'deleteTime' => date('Y-m-d H:i:s', time())
            ]);
    }
    
    /**
     * 按设备品牌统计数量
     * @return array 统计结果
     */
    public static function countByBrand()
    {
        return self::where('isDeleted', 0)
            ->group('brand')
            ->field('brand, count(*) as count')
            ->select();
    }
    
    /**
     * 按设备在线状态统计数量
     * @return array 统计结果
     */
    public static function countByStatus()
    {
        return self::where('isDeleted', 0)
            ->group('alive')
            ->field('alive, count(*) as count')
            ->select();
    }
} 