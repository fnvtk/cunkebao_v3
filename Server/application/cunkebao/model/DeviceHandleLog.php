<?php
namespace app\cunkebao\model;

use think\Model;

/**
 * 设备操作日志模型类
 */
class DeviceHandleLog extends Model
{
    // 设置表名
    protected $name = 'device_handle_log';


    
    /**
     * 获取设备操作日志列表
     * @param array $where 查询条件
     * @param string $order 排序方式
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return \think\Paginator 分页对象
     */
    public static function getLogList($where = [], $order = 'createTime desc', $page = 1, $limit = 10)
    {
        return self::where($where)
            ->order($order)
            ->paginate($limit, false, ['page' => $page]);
    }
    
    /**
     * 根据IMEI获取设备操作日志
     * @param string $imei 设备IMEI
     * @param int $companyId 租户ID
     * @param int $limit 获取条数
     * @return array 日志记录
     */
    public static function getLogsByImei($imei, $companyId = null, $limit = 10)
    {
        $query = self::where('imei', $imei);
        
        if ($companyId !== null) {
            $query->where('companyId', $companyId);
        }
        
        return $query->order('createTime', 'desc')
            ->limit($limit)
            ->select();
    }
    
    /**
     * 根据用户ID获取操作日志
     * @param int $userId 用户ID
     * @param int $companyId 租户ID
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return \think\Paginator 分页对象
     */
    public static function getLogsByUser($userId, $companyId = null, $page = 1, $limit = 10)
    {
        $query = self::where('userId', $userId);
        
        if ($companyId !== null) {
            $query->where('companyId', $companyId);
        }
        
        return $query->order('createTime', 'desc')
            ->paginate($limit, false, ['page' => $page]);
    }
    
    /**
     * 记录设备操作日志的便捷方法
     * @param string $imei 设备IMEI
     * @param int $userId 操作用户ID
     * @param string $content 操作内容
     * @param int $companyId 租户ID
     * @return int 日志ID
     */
    public static function recordLog($imei, $userId, $content, $companyId = null)
    {
        $data = [
            'imei' => $imei,
            'userId' => $userId,
            'content' => $content,
            'companyId' => $companyId
        ];
        
        return self::addLog($data);
    }
} 