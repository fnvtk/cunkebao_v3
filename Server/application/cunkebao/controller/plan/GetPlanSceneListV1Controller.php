<?php

namespace app\cunkebao\controller\plan;

use app\common\model\PlanScene as PlansSceneModel;
use app\cunkebao\controller\BaseController;
use library\ResponseHelper;
use think\Db;

/**
 * 获客场景控制器
 */
class GetPlanSceneListV1Controller extends BaseController
{
    /**
     * 获取开启的场景列表
     *
     * @param array $params 查询参数
     * @return array
     */
    protected function getSceneList(array $params = []): array
    {
        try {
            // 构建查询条件
            $where = ['status' => PlansSceneModel::STATUS_ACTIVE];
            
            // 搜索条件
            if (!empty($params['keyword'])) {
                $where[] = ['name', 'like', '%' . $params['keyword'] . '%'];
            }
            
            // 标签筛选
            if (!empty($params['tag'])) {
                $where[] = ['scenarioTags', 'like', '%' . $params['tag'] . '%'];
            }
        
            
            // 查询数据
            $query = PlansSceneModel::where($where);
            
            // 获取总数
            $total = $query->count();
            
            // 获取分页数据
            $list = $query->order('sort DESC')->select()->toArray();
            
            // 处理数据
            foreach($list as &$val) {
                $val['scenarioTags'] = json_decode($val['scenarioTags'], true);
                $val['count'] = $this->getPlanCount($val['id']);
                $val['growth'] = $this->calculateGrowth($val['id']);
            }
            unset($val);
            
            return $list;
            
        } catch (\Exception $e) {
            throw new \Exception('获取场景列表失败：' . $e->getMessage());
        }
    }

    /**
     * 获取场景列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $params = $this->request->param();
            $result = $this->getSceneList($params);
            return ResponseHelper::success($result);
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 500);
        }
    }

    /**
     * 获取场景详情
     * 
     * @return \think\response\Json
     */
    public function detail()
    {
        try {
            $id = $this->request->param('id', '');
            if(empty($id)) {
                return ResponseHelper::error('参数缺失');
            }

            $data = PlansSceneModel::where([
                'status' => PlansSceneModel::STATUS_ACTIVE,
                'id' => $id
            ])->find();
            
            if(empty($data)) {
                return ResponseHelper::error('场景不存在');
            }

            $data['scenarioTags'] = json_decode($data['scenarioTags'], true);
            $data['count'] = $this->getPlanCount($id);
            $data['growth'] = $this->calculateGrowth($id);
            
            return ResponseHelper::success($data);
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), 500);
        }
    }

    /**
     * 获取计划数量
     * 
     * @param int $sceneId 场景ID
     * @return int
     */
    private function getPlanCount(int $sceneId): int
    {
        return Db::name('customer_acquisition_task')
            ->where('sceneId', $sceneId)
            ->where('status', 1)
            ->count();
    }

    /**
     * 计算增长率
     * 
     * @param int $sceneId 场景ID
     * @return string
     */
    private function calculateGrowth(int $sceneId): string
    {
        // 获取本月和上月的计划数量
        $currentMonth = Db::name('customer_acquisition_task')
            ->where('sceneId', $sceneId)
            ->where('status', 1)
            ->whereTime('createTime', '>=', strtotime(date('Y-m-01')))
            ->count();
            
        $lastMonth = Db::name('customer_acquisition_task')
            ->where('sceneId', $sceneId)
            ->where('status', 1)
            ->whereTime('createTime', 'between', [
                strtotime(date('Y-m-01', strtotime('-1 month'))),
                strtotime(date('Y-m-01')) - 1
            ])
            ->count();
            
        if ($lastMonth == 0) {
            return $currentMonth > 0 ? '100%' : '0%';
        }
        
        $growth = round(($currentMonth - $lastMonth) / $lastMonth * 100, 2);
        return $growth . '%';
    }
} 