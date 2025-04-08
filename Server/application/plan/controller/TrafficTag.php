<?php
namespace app\plan\controller;

use think\Controller;
use think\facade\Request;
use app\plan\model\TrafficTag as TrafficTagModel;

/**
 * 流量标签控制器
 */
class TrafficTag extends Controller
{
    /**
     * 获取标签列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            // 获取登录用户信息
            $userInfo = request()->userInfo;
            
            // 获取查询条件
            $where = [];
            
            // 关键词搜索
            $keyword = Request::param('keyword', '');
            if (!empty($keyword)) {
                $where[] = ['tagName', 'like', "%{$keyword}%"];
            }
            
            // 添加公司ID过滤条件
            $where[] = ['companyId', '=', $userInfo['companyId']];
            
            // 获取分页参数
            $page = (int)Request::param('page', 1);
            $limit = (int)Request::param('limit', 200); // 默认每页显示200条
            
            // 获取排序参数
            $sort = Request::param('sort', 'id');
            $order = Request::param('order', 'desc');
            
            // 查询列表
            $list = TrafficTagModel::getTagsByCompany($where, "{$sort} {$order}", $page, $limit);
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'total' => $list->total(),
                    'list' => $list->items(),
                    'page' => $page,
                    'limit' => $limit
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
} 