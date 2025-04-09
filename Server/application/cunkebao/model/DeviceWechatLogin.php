<?php
namespace app\cunkebao\model;

use think\Model;

/**
 * 设备微信登录记录模型类
 */
class DeviceWechatLogin extends Model
{
    // 设置表名
    protected $name = 'device_wechat_login';
    
    /**
     * 查询设备关联的微信ID列表
     * @param int $deviceId 设备ID
     * @param int $companyId 公司/租户ID
     * @return array 微信ID列表
     */
    public static function getDeviceWechatIds($deviceId, $companyId = null)
    {
        $query = self::where('deviceId', $deviceId);
        
        // 如果提供了公司ID，则添加对应的条件
        if ($companyId !== null) {
            $query->where('companyId', $companyId);
        }
        
        // 提取微信ID
        $records = $query->select();
        $wechatIds = [];
        
        foreach ($records as $record) {
            if (!empty($record['wechatId'])) {
                $wechatIds[] = $record['wechatId'];
            }
        }
        
        return $wechatIds;
    }
    
    /**
     * 根据微信ID查询关联的设备
     * @param string $wechatId 微信ID
     * @param int $companyId 公司/租户ID
     * @return array 设备ID列表
     */
    public static function getWechatDeviceIds($wechatId, $companyId = null)
    {
        $query = self::where('wechatId', $wechatId);
        
        // 如果提供了公司ID，则添加对应的条件
        if ($companyId !== null) {
            $query->where('companyId', $companyId);
        }
        
        // 提取设备ID
        $records = $query->select();
        $deviceIds = [];
        
        foreach ($records as $record) {
            if (!empty($record['deviceId'])) {
                $deviceIds[] = $record['deviceId'];
            }
        }
        
        return $deviceIds;
    }
    
    /**
     * 添加设备微信登录记录
     * @param int $deviceId 设备ID
     * @param string $wechatId 微信ID
     * @param int $companyId 公司/租户ID
     * @return int 新增记录ID
     */
    public static function addRecord($deviceId, $wechatId, $companyId)
    {
        // 检查是否已存在相同记录
        $exists = self::where('deviceId', $deviceId)
            ->where('wechatId', $wechatId)
            ->where('companyId', $companyId)
            ->find();
            
        if ($exists) {
            return $exists['id'];
        }
        
        // 创建新记录
        $model = new self();
        $model->deviceId = $deviceId;
        $model->wechatId = $wechatId;
        $model->companyId = $companyId;
        $model->save();
        
        return $model->id;
    }
    
    /**
     * 删除设备微信登录记录
     * @param int $deviceId 设备ID
     * @param string $wechatId 微信ID，为null时删除设备所有记录
     * @param int $companyId 公司/租户ID，为null时不限公司
     * @return bool 删除结果
     */
    public static function removeRecord($deviceId, $wechatId = null, $companyId = null)
    {
        $query = self::where('deviceId', $deviceId);
        
        if ($wechatId !== null) {
            $query->where('wechatId', $wechatId);
        }
        
        if ($companyId !== null) {
            $query->where('companyId', $companyId);
        }
        
        return $query->delete();
    }
    
    /**
     * 关联Device模型
     * @return \think\model\relation\BelongsTo
     */
    public function device()
    {
        return $this->belongsTo('Device', 'deviceId');
    }
    
    /**
     * 获取设备关联的微信账号信息
     * @param int $deviceId 设备ID
     * @param int $companyId 公司/租户ID
     * @return array 微信账号信息列表
     */
    public static function getDeviceRelatedAccounts($deviceId, $companyId = null)
    {
        // 获取设备关联的微信ID列表
        $wechatIds = self::getDeviceWechatIds($deviceId, $companyId);
        if (empty($wechatIds)) {
            return [];
        }
        
        // 查询微信账号信息
        $accounts = \think\Db::name('wechat_account')
            ->alias('wa')
            ->field([
                'wa.id', 
                'wa.wechatId', 
                'wa.accountNickname', 
                'wa.nickname',
                'wa.accountUserName', 
                'wa.avatar', 
                'wa.gender',
                'wa.wechatAlive', 
                'wa.status',
                'wa.totalFriend',
                'wa.createTime',
                'wa.updateTime'
            ])
            ->whereIn('wa.wechatId', $wechatIds)
            ->where('wa.isDeleted', 0)
            ->select();
        
        // 处理结果数据
        $result = [];
        foreach ($accounts as $account) {
            // 计算最后活跃时间
            $lastActive = date('Y-m-d H:i:s', max($account['updateTime'], $account['createTime']));
            
            // 格式化数据
            $result[] = [
                'id' => $account['id'],
                'wechatId' => $account['wechatId'],
                'nickname' => $account['accountNickname'] ?: $account['nickname'] ?: '未命名微信',
                'accountUserName' => $account['accountUserName'],
                'avatar' => $account['avatar'],
                'gender' => intval($account['gender']),
                'status' => intval($account['status']),
                'statusText' => intval($account['status']) === 1 ? '可加友' : '已停用',
                'wechatAlive' => intval($account['wechatAlive']),
                'wechatAliveText' => intval($account['wechatAlive']) === 1 ? '正常' : '异常',
                'totalFriend' => intval($account['totalFriend']),
                'lastActive' => $lastActive
            ];
        }
        
        return $result;
    }
} 