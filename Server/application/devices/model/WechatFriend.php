<?php
namespace app\devices\model;

use think\Model;
use think\Db;

/**
 * 微信好友模型类
 */
class WechatFriend extends Model
{
    // 设置表名
    protected $name = 'wechat_friend';
    protected $prefix = 'tk_';
    
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
        'wechatAccountId' => 'integer',
        'gender' => 'integer',
        'addFrom' => 'integer',
        'isDeleted' => 'integer',
        'isPassed' => 'integer',
        'accountId' => 'integer',
        'groupId' => 'integer',
        'labels' => 'json',
        'deleteTime' => 'datetime',
        'passTime' => 'datetime',
        'createTime' => 'datetime'
    ];
    
    /**
     * 根据微信账号ID获取好友列表
     * 
     * @param string $ownerWechatId 所有者微信ID
     * @param array $params 查询条件参数
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return array 好友列表和总数
     */
    public static function getFriendsByWechatId($ownerWechatId, $params = [], $page = 1, $limit = 20)
    {
        // 构建基础查询
        $query = self::where('ownerWechatId', $ownerWechatId)
            ->where('isDeleted', 0);
        
        // 添加筛选条件（昵称、备注、微信号、标签）
        if (!empty($params['keyword'])) {
            $keyword = $params['keyword'];
            $query->where(function($q) use ($keyword) {
                $q->whereOr('nickname', 'like', "%{$keyword}%")
                  ->whereOr('conRemark', 'like', "%{$keyword}%")
                  ->whereOr('alias', 'like', "%{$keyword}%")
                  ->whereOr("JSON_SEARCH(labels, 'one', '%{$keyword}%') IS NOT NULL");
            });
        }
        
        // 计算总数
        $total = $query->count();
        
        // 分页查询数据
        $friends = $query->page($page, $limit)
            ->order('createTime desc')
            ->field('wechatId, alias, avatar, labels, accountNickname, accountRealName, nickname, conRemark, gender, region')
            ->select();
        
        return [
            'list' => $friends,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ];
    }
} 