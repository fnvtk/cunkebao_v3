<?php
namespace app\cunkebao\model;

use think\Model;

/**
 * 微信好友模型类
 */
class WechatFriend extends Model
{
    // 设置表名
    protected $name = 'wechat_friend';

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