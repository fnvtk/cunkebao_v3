<?php
namespace app\superadmin\controller;

use app\superadmin\model\TrafficPool as TrafficPoolModel;
use think\Controller;

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
        $page = $this->request->param('page/d', 1);
        $limit = $this->request->param('limit/d', 20);
        $keyword = $this->request->param('keyword/s', '');
        
        // 构建查询条件
        $where = [];
        
        // 如果有搜索关键词
        if (!empty($keyword)) {
            $where[] = ['tp.nickname|tp.identifier|tp.alias', 'like', "%{$keyword}%"];
        }

        // 查询数据
        $query = TrafficPoolModel::alias('tp')
            // 关联流量来源表
            ->join('traffic_source ts', 'tp.identifier = ts.identifier', 'inner')
            // 关联公司表
            ->join('company c', 'ts.companyId = c.id', 'left')
            // 关联微信好友表
            ->join('wechat_friend wf', 'tp.wechatId = wf.wechatId', 'left')
            // 查询字段
            ->field([
                'distinct ts.identifier',
                'tp.id',
                'tp.avatar', 
                'tp.nickname', 
                'tp.wechatId', 
                'tp.mobile', 
                'tp.createTime',
                'ts.fromd as source',
                'ts.companyId',
                'c.name as companyName',
                'wf.gender',
                'wf.region',
                'wf.labels'
            ]);

        // 统计总数
        $total = $query->where($where)->count();

        // 获取列表数据
        $list = $query->where($where)
            ->order('tp.createTime', 'desc')
            ->page($page, $limit)
            ->select();

        // 格式化数据
        $data = [];
        foreach ($list as $item) {
            $labels = [];
            // 处理标签数据
            if (!empty($item['labels'])) {
                $labelData = json_decode($item['labels'], true);
                if (is_array($labelData)) {
                    foreach ($labelData as $label) {
                        if (isset($label['name'])) {
                            $labels[] = $label['name'];
                        }
                    }
                }
            }

            // 格式化性别
            $gender = '未知';
            switch ($item['gender']) {
                case 1:
                    $gender = '男';
                    break;
                case 2:
                    $gender = '女';
                    break;
            }

            $data[] = [
                'id' => $item['id'],
                'avatar' => $item['avatar'],
                'nickname' => $item['nickname'],
                'wechatId' => $item['wechatId'],
                'gender' => $gender,
                'region' => $item['region'] ?: '未知',
                'tags' => empty($labels) ? [] : $labels,
                'source' => $item['source'] ?: '未知',
                'companyName' => $item['companyName'] ?: '未知',
                'createTime' => date('Y-m-d H:i:s', $item['createTime']),
                'mobile' => $item['mobile']
            ];
        }
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'list' => $data,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ]
        ]);
    }
} 