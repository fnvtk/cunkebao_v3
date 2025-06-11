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
     * @return array
     */
    protected function getSceneList(): array
    {
        $list = PlansSceneModel::where(['status' => PlansSceneModel::STATUS_ACTIVE])->order('sort desc')->select()->toArray();
        $userInfo = $this->getUserInfo();
        foreach($list as &$val){
            $val['scenarioTags'] = json_decode($val['scenarioTags'],true);
            $val['count'] = 0;
            $val['growth'] = "0%";
        }
        unset($val);
        return $list;
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

    /**
     * 获取场景详情
     * 
     */
    public function detail()
    {
        $id = $this->request->param('id','');
        if(empty($id)){
            ResponseHelper::error('参数缺失');
        }

        $data = PlansSceneModel::where(['status' => PlansSceneModel::STATUS_ACTIVE,'id' => $id])->find();
        if(empty($data)){
            ResponseHelper::error('场景不存在');
        }

        $data['scenarioTags'] = json_decode($data['scenarioTags'],true);
        return ResponseHelper::success($data);
    }



} 