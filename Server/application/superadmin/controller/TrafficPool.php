<?php
namespace app\superadmin\controller;

use app\superadmin\model\TrafficPool as TrafficPoolModel;
use think\Controller;
use think\facade\Request;

/**
 * 客户池控制器
 */
class TrafficPool extends Controller
{
    /**
     * 获取客户池列表
     * @return \think\response\Json
     */
    public function getList()
    {
        // 获取分页参数
        $page = Request::param('page/d', 1);
        $limit = Request::param('limit/d', 30);
        
        // 构建查询
        $query = TrafficPoolModel::alias('tp')
            ->join('traffic_source ts', 'tp.identifier = ts.identifier', 'INNER')
            ->join('company c', 'ts.companyId = c.id', 'LEFT')
            ->join('wechat_account wa', 'tp.wechatId = wa.wechatId', 'LEFT')
            ->join('wechat_tag wt', 'wa.wechatId = wt.wechatId')
            ->field([
                'ts.id',
                'tp.wechatId',
                'tp.createTime as addTime',
                'ts.fromd as source',
                'c.name as projectName',
                'wa.avatar',
                'wa.gender',
                'wa.nickname',
                'wa.region',
                'wt.tags'
            ])
            ->order('tp.createTime DESC');
        
        // 执行分页查询
        $list = $query->paginate([
            'list_rows' => $limit,
            'page' => $page
        ]);
        
        // 处理性别显示
        $list->each(function($item) {
            // 处理性别显示
            switch($item['gender']) {
                case 1:
                    $item['gender'] = '男';
                    break;
                case 2:
                    $item['gender'] = '女';
                    break;
                default:
                    $item['gender'] = '保密';
            }
            
            // 处理标签显示
            if (is_string($item['tags'])) {
                $item['tags'] = json_decode($item['tags'], true);
            }
            
            return $item;
        });
        
        // 返回结果
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'total' => $list->total(),
                'list' => $list->items(),
                'page' => $list->currentPage(),
                'limit' => $list->listRows()
            ]
        ]);
    }
} 