<?php
namespace app\common\model;

use think\Model;

/**
 * 设备用户关联模型
 * 用于管理设备与操盘手（用户）的关联关系
 */
class DeviceUser extends Model
{
    /**
     * 数据表名
     * @var string
     */
    protected $name = 'device_user';
    
    /**
     * 设置主键
     * 由于该表是多字段联合主键，这里不设置主键
     * @var string
     */
    protected $pk = '';
    
    /**
     * 自动时间戳
     * 该表不需要时间戳
     * @var bool
     */
    protected $autoWriteTimestamp = false;
    
    /**
     * 字段类型
     * @var array
     */
    protected $type = [
        'companyId' => 'integer',
        'userId' => 'integer',
        'deviceId' => 'integer'
    ];
    
    /**
     * 获取指定用户的所有设备ID
     * @param int $userId 用户ID
     * @param int $companyId 公司ID
     * @return array 设备ID数组
     */
    public static function getUserDeviceIds($userId, $companyId = null)
    {
        $where = ['userId' => $userId];
        
        if (!is_null($companyId)) {
            $where['companyId'] = $companyId;
        }
        
        return self::where($where)
            ->column('deviceId');
    }
    
    /**
     * 获取指定设备的所有用户ID
     * @param int $deviceId 设备ID
     * @param int $companyId 公司ID
     * @return array 用户ID数组
     */
    public static function getDeviceUserIds($deviceId, $companyId = null)
    {
        $where = ['deviceId' => $deviceId];
        
        if (!is_null($companyId)) {
            $where['companyId'] = $companyId;
        }
        
        return self::where($where)
            ->column('userId');
    }
    
    /**
     * 添加设备与用户的关联
     * @param int $companyId 公司ID
     * @param int $userId 用户ID
     * @param int $deviceId 设备ID
     * @return bool 是否添加成功
     */
    public static function addRelation($companyId, $userId, $deviceId)
    {
        // 检查关联是否已存在
        $exists = self::where([
            'companyId' => $companyId,
            'userId' => $userId,
            'deviceId' => $deviceId
        ])->find();
        
        if ($exists) {
            return true; // 已存在，视为添加成功
        }
        
        // 添加新关联
        return self::create([
            'companyId' => $companyId,
            'userId' => $userId,
            'deviceId' => $deviceId
        ]) ? true : false;
    }
    
    /**
     * 批量添加设备与用户的关联
     * @param int $companyId 公司ID
     * @param int $userId 用户ID
     * @param array $deviceIds 设备ID数组
     * @return int 成功添加的记录数
     */
    public static function batchAddRelations($companyId, $userId, array $deviceIds)
    {
        if (empty($deviceIds)) {
            return 0;
        }
        
        $data = [];
        foreach ($deviceIds as $deviceId) {
            $data[] = [
                'companyId' => $companyId,
                'userId' => $userId,
                'deviceId' => $deviceId
            ];
        }
        
        // 批量添加前先删除已存在的关联，避免主键冲突
        self::where('userId', $userId)
            ->where('companyId', $companyId)
            ->whereIn('deviceId', $deviceIds)
            ->delete();
        
        return self::insertAll($data);
    }
    
    /**
     * 删除设备与用户的关联
     * @param int $companyId 公司ID
     * @param int $userId 用户ID
     * @param int $deviceId 设备ID
     * @return bool 是否删除成功
     */
    public static function removeDeviceUserRelation($companyId, $userId, $deviceId)
    {
        return self::where([
            'companyId' => $companyId,
            'userId' => $userId,
            'deviceId' => $deviceId
        ])->delete() !== false;
    }
    

    
    /**
     * 关联用户模型
     * @return \think\model\relation\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('User', 'userId', 'id');
    }
    
    /**
     * 关联设备模型
     * @return \think\model\relation\BelongsTo
     */
    public function device()
    {
        return $this->belongsTo('app\devices\model\Device', 'deviceId', 'id');
    }
    
    /**
     * 关联公司模型
     * @return \think\model\relation\BelongsTo
     */
    public function company()
    {
        return $this->belongsTo('Company', 'companyId', 'id');
    }
} 