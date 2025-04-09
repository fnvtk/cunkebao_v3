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

    /**
     * 获取设备总数
     * @param array $where 查询条件
     * @return int 设备总数
     */
    public static function getDeviceCount($where = [])
    {
        // 默认只统计未删除的设备
        if (!isset($where['isDeleted']) && !isset($where['d.isDeleted'])) {
            $where['isDeleted'] = 0;
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
     * 获取设备列表
     * @param array $where 查询条件
     * @param string $order 排序方式
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return \think\Paginator 分页对象
     */
    public static function getDeviceList($where = [], $order = 'd.id desc', $page = 1, $limit = 10)
    {
        // 默认只查询未删除的设备
        if (!isset($where['isDeleted'])) {
            $where['d.isDeleted'] = 0;
        }

        // 构建查询对象
        $query = self::alias('d')
            ->field(['d.id', 'd.imei', 'd.memo', 'w.wechatId', 'd.alive', 'w.totalFriend'])
            ->leftJoin('tk_wechat_account w', 'd.imei = w.imei COLLATE utf8mb4_unicode_ci');

        // 处理查询条件
        foreach ($where as $key => $value) {
            // 处理特殊的exp表达式条件
            if (is_numeric($key) && is_array($value) && isset($value[0]) && $value[0] === 'exp') {
                // 直接添加原始SQL表达式
                $query->whereExp('', $value[1]);
                continue;
            }
            
            // 处理普通条件
            $query->where($key, $value);
        }

        // 返回分页结果
        return $query->order($order)
            ->paginate($limit, false, ['page' => $page]);
    }
    
    /**
     * 获取设备详情
     * @param int $id 设备ID
     * @return array|null 设备信息
     */
    public static function getDeviceInfo($id)
    {
        // 查询设备基础信息与关联的微信账号信息
        $device = self::alias('d')
            ->field([
                'd.id', 'd.imei', 'd.memo', 'd.alive', 'd.taskConfig', 'd.lastUpdateTime',
                'w.id as wechatId', 'w.thirtyDayMsgCount', 'w.totalFriend', 'd.extra'
            ])
            ->leftJoin('tk_wechat_account w', 'd.imei = w.imei')
            ->where('d.id', $id)
            ->where('d.isDeleted', 0)
            ->find();

        // 如果设备存在，处理额外信息
        if ($device) {
            // 解析电量信息
            $battery = 0;
            if (!empty($device['extra'])) {
                $extra = json_decode($device['extra'], true);
                if (is_array($extra) && isset($extra['battery'])) {
                    $battery = intval($extra['battery']);
                }
            }
            $device['battery'] = $battery;
            
            // 解析taskConfig字段获取功能开关
            $features = [
                'autoAddFriend' => false,
                'autoReply' => false,
                'contentSync' => false,
                'aiChat' => false
            ];
            
            if (!empty($device['taskConfig'])) {
                $taskConfig = json_decode($device['taskConfig'], true);
                if (is_array($taskConfig)) {
                    // 映射taskConfig中的字段到前端需要的features
                    $features['autoAddFriend'] = isset($taskConfig['autoAddFriend']) ? (bool)$taskConfig['autoAddFriend'] : false;
                    $features['autoReply'] = isset($taskConfig['autoReply']) ? (bool)$taskConfig['autoReply'] : false;
                    $features['contentSync'] = isset($taskConfig['momentsSync']) ? (bool)$taskConfig['momentsSync'] : false;
                    $features['aiChat'] = isset($taskConfig['aiChat']) ? (bool)$taskConfig['aiChat'] : false;
                }
            }
            
            $device['features'] = $features;
            unset($device['extra']);
            unset($device['taskConfig']);

            // 格式化最后活跃时间
            $device['lastUpdateTime'] = !empty($device['lastUpdateTime']) ? date('Y-m-d H:i:s', strtotime($device['lastUpdateTime'])) : date('Y-m-d H:i:s');
            
            // 确保totalFriend和thirtyDayMsgCount有值，防止NULL
            $device['totalFriend'] = intval($device['totalFriend'] ?? 0);
            $device['thirtyDayMsgCount'] = intval($device['thirtyDayMsgCount'] ?? 0);
        }

        return $device;
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