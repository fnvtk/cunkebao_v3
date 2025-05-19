<?php

namespace app\cunkebao\controller\plan;

use app\common\model\PlanScene as PlansSceneModel;
use app\cunkebao\controller\BaseController;
use library\ResponseHelper;

/**
 * 获客场景控制器
 */
class GetPlanSceneListV1Controller extends BaseController
{
    /**
     * 获取开启的场景列表
     *
     * @return array
     */
    protected function getSceneList(): array
    {
        return PlansSceneModel::where(
            [
                'status' => PlansSceneModel::STATUS_ACTIVE
            ]
        )
            ->order('sort desc')
            ->select()->toArray();
    }

    /**
     * 获取场景列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        return ResponseHelper::success(
            $this->getSceneList()
        );
    }
} 