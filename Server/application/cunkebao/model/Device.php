<?php
namespace app\cunkebao\model;

use think\Model;
use think\Db;

/**
 * 设备模型类
 */
class Device extends Model
{
    // 设置表名
    protected $name = 'device';

    /**
     * 获取设备总数
     * @param array $where 查询条件
     * @return int 设备总数
     */
    public static function getDeviceCount($where = [])
    {
        // 默认只统计未删除的设备
        if (!isset($where['deleteTime']) && !isset($where['d.deleteTime'])) {
            $where['deleteTime'] = 0;
        }
        
        // 确定是否使用了表别名
        $hasAlias = false;
        foreach ($where as $key => $value) {
            if (strpos($key, '.') !== false) {
                $hasAlias = true;
                break;
            }
        }
        
        // 如果使用了表别名，则需要使用查询构造器
        if ($hasAlias) {
            return self::alias('d')->where($where)->count();
        } else {
            return self::where($where)->count();
        }
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