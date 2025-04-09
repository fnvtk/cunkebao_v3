<?php
namespace app\cunkebao\model;

use think\Model;

/**
 * 微信账号模型类
 */
class WechatAccount extends Model
{
    // 设置表名
    protected $name = 'wechat_account';
    
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