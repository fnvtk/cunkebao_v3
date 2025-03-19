<?php
namespace app\devices\model;

use think\Model;
use think\Db;

/**
 * 微信账号模型类
 */
class WechatAccount extends Model
{
    // 设置表名
    protected $name = 'wechat_account';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = 'datetime';
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'deviceAccountId' => 'integer',
        'keFuAlive' => 'integer',
        'deviceAlive' => 'integer',
        'wechatAlive' => 'integer',
        'yesterdayMsgCount' => 'integer',
        'sevenDayMsgCount' => 'integer',
        'thirtyDayMsgCount' => 'integer',
        'totalFriend' => 'integer',
        'maleFriend' => 'integer',
        'femaleFriend' => 'integer',
        'gender' => 'integer',
        'currentDeviceId' => 'integer',
        'isDeleted' => 'integer',
        'groupId' => 'integer'
    ];
    
    /**
     * 获取在线微信账号数量
     * 
     * @param array $where 额外的查询条件
     * @return int 微信账号数量
     */
    public static function getOnlineWechatCount($where = [])
    {
        $condition = [
            'deviceAlive' => 1,
            'wechatAlive' => 1,
            'isDeleted' => 0
        ];
        
        // 合并额外条件
        if (!empty($where)) {
            $condition = array_merge($condition, $where);
        }
        
        return self::where($condition)->count();
    }
    
    /**
     * 获取有登录微信的设备数量
     * 
     * @param array $where 额外的查询条件
     * @return int 设备数量
     */
    public static function getDeviceWithWechatCount($where = [])
    {
        $condition = [
            'deviceAlive' => 1,
            'isDeleted' => 0
        ];
        
        // 合并额外条件
        if (!empty($where)) {
            $condition = array_merge($condition, $where);
        }
        
        return self::where($condition)->count();
    }
    
    /**
     * 获取在线微信账号列表
     * 
     * @param array $where 额外的查询条件
     * @param string $order 排序方式
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return \think\Paginator 分页对象
     */
    public static function getOnlineWechatList($where = [], $order = 'id desc', $page = 1, $limit = 10)
    {
        $condition = [
            'wechatAlive' => 1,
            'deviceAlive' => 1,
            'isDeleted' => 0
        ];
        
        // 合并额外条件
        if (!empty($where)) {
            $condition = array_merge($condition, $where);
        }
        
        return self::where($condition)
            ->field([
                'id', 
                'wechatId', 
                'accountNickname', 
                'nickname',
                'accountUserName', 
                'avatar', 
                'wechatAlive', 
                'deviceAlive',
                'totalFriend', 
                'maleFriend',
                'femaleFriend',
                'imei',
                'deviceMemo',
                'yesterdayMsgCount'
            ])
            ->order($order)
            ->paginate($limit, false, ['page' => $page]);
    }
} 