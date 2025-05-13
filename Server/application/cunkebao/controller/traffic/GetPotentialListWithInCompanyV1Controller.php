<?php

namespace app\cunkebao\controller\traffic;

use app\common\model\TrafficPool as TrafficPoolModel;
use app\common\model\WechatFriendShip as WechatFriendShipModel;
use app\cunkebao\controller\BaseController;
use library\ResponseHelper;

/**
 * 流量池控制器
 */
class GetPotentialListWithInCompanyV1Controller extends BaseController
{
    /**
     * 构建查询条件
     *
     * @param array $params
     * @return array
     */
    protected function makeWhere(array $params = []): array
    {
        if (!empty($keyword = $this->request->param('keyword'))) {
            $where[] = ['exp', "p.identifier LIKE '%{$keyword}%'"];
        }

        // 状态筛选
        if ($status = $this->request->param('status')) {
            $where['s.status'] = $status;
        }

        // 来源的筛选
        if ($fromd = $this->request->param('fromd')) {
            $where['s.fromd'] = $fromd;
        }

        $where['s.companyId'] = $this->getUserInfo('companyId');

        return array_merge($where, $params);
    }

    /**
     * 获取流量池列表
     *
     * @param array $where
     * @return \think\Paginator
     */
    protected function getPoolListByCompanyId(array $where): \think\Paginator
    {
        $query = TrafficPoolModel::alias('p')
            ->field(
                [
                    'p.identifier nickname', 'p.mobile', 'p.wechatId', 'p.identifier',
                    's.id', 's.fromd', 's.status', 's.createTime'
                ]
            )
            ->join('traffic_source s', 'p.identifier=s.identifier')
            ->order('s.id desc');

        foreach ($where as $key => $value) {
            if (is_numeric($key) && is_array($value) && isset($value[0]) && $value[0] === 'exp') {
                $query->whereExp('', $value[1]);
                continue;
            }

            $query->where($key, $value);
        }

        return $query->paginate($this->request->param('limit/d', 10), false, ['page' => $this->request->param('page/d', 1)]);
    }

    /**
     * 获取流量池列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $result = $this->getPoolListByCompanyId( $this->makeWhere() );

            return ResponseHelper::success(
                [
                    'list'  => $result->items(),
                    'total' => $result->total(),
                ]
            );
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 