<?php
namespace app\plan\controller;

use think\Controller;
use think\Request;
use app\plan\model\PlanScene;

/**
 * 获客场景控制器
 */
class Scene extends Controller
{
    /**
     * 获取场景列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        $page = Request::param('page', 1, 'intval');
        $limit = Request::param('limit', 10, 'intval');
        $keyword = Request::param('keyword', '');
        
        // 构建查询条件
        $where = [];
        if (!empty($keyword)) {
            $where[] = ['name', 'like', "%{$keyword}%"];
        }
        
        // 默认只显示有效场景
        $where[] = ['status', '=', 1];
        
        // 查询列表
        $result = PlanScene::getSceneList($where, 'id desc', $page, $limit);
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $result
        ]);
    }
    
    /**
     * 获取单个场景详情
     *
     * @param int $id 场景ID
     * @return \think\response\Json
     */
    public function read($id)
    {
        // 查询场景信息
        $scene = PlanScene::getSceneInfo($id);
        
        if (!$scene) {
            return json([
                'code' => 404,
                'msg' => '场景不存在'
            ]);
        }
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $scene
        ]);
    }
} 