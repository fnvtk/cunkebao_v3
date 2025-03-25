<?php

namespace app\store\controller;

use app\common\controller\Api;
use app\store\model\FlowPackageModel;
use app\store\model\UserFlowPackageModel;
use think\facade\Config;

/**
 * 流量套餐控制器
 */
class FlowPackageController extends Api
{
    protected $noNeedLogin = [];
    protected $noNeedRight = ['*'];
    
    /**
     * 获取流量套餐列表
     * 
     * @return \think\Response
     */
    public function getList()
    {
        $params = $this->request->param();
        
        // 查询条件
        $where = [];
        
        // 只获取未删除的数据
        $where[] = ['isDel', '=', 0];
        
        // 套餐模型
        $model = new FlowPackageModel();
        
        // 查询数据
        $list = $model->where($where)
            ->field('id, name, tag, originalPrice, price, monthlyFlow, duration, privileges')
            ->order('sort', 'asc')
            ->select();
        
        // 格式化返回数据，添加计算字段
        $result = [];
        foreach ($list as $item) {
            $result[] = [
                'id' => $item['id'],
                'name' => $item['name'],
                'tag' => $item['tag'],
                'originalPrice' => $item['originalPrice'],
                'price' => $item['price'],
                'monthlyFlow' => $item['monthlyFlow'],
                'duration' => $item['duration'],
                'discount' => $item->discount,
                'totalFlow' => $item->totalFlow,
                'privileges' => $item['privileges'],
            ];
        }
        
        return successJson($result, '获取成功');
    }
    
    /**
     * 获取流量套餐详情
     * 
     * @param int $id 套餐ID
     * @return \think\Response
     */
    public function detail($id)
    {
        if (empty($id)) {
            return errorJson('参数错误');
        }
        
        // 套餐模型
        $model = new FlowPackageModel();
        
        // 查询数据
        $info = $model->where('id', $id)->where('isDel', 0)->find();
        
        if (empty($info)) {
            return errorJson('套餐不存在');
        }
        
        // 格式化返回数据，添加计算字段
        $result = [
            'id' => $info['id'],
            'name' => $info['name'],
            'tag' => $info['tag'],
            'originalPrice' => $info['originalPrice'],
            'price' => $info['price'],
            'monthlyFlow' => $info['monthlyFlow'],
            'duration' => $info['duration'],
            'discount' => $info->discount,
            'totalFlow' => $info->totalFlow,
            'privileges' => $info['privileges'],
        ];
        
        return successJson($result, '获取成功');
    }
    
    /**
     * 展示用户流量套餐使用情况
     * 
     * @return \think\Response
     */
    public function remainingFlow()
    {
        $params = $this->request->param();
        
        // 获取用户ID，通常应该从会话或令牌中获取
        $userId = isset($params['userId']) ? intval($params['userId']) : 0;
        
        if (empty($userId)) {
            return errorJson('请先登录');
        }
        
        // 获取用户当前有效的流量套餐
        $userPackage = UserFlowPackageModel::getUserActivePackage($userId);
            
        if (empty($userPackage)) {
            return errorJson('您没有有效的流量套餐');
        }
        
        // 获取套餐详情
        $packageId = $userPackage['packageId'];
        $flowPackage = FlowPackageModel::where('id', $packageId)->where('isDel', 0)->find();
        
        if (empty($flowPackage)) {
            return errorJson('套餐信息不存在');
        }
        
        // 计算剩余流量
        $totalFlow = $userPackage['totalFlow'] ?? $flowPackage->totalFlow;  // 总流量
        $usedFlow = $userPackage['usedFlow'] ?? 0;  // 已使用流量
        $remainingFlow = $totalFlow - $usedFlow;  // 剩余流量
        $remainingFlow = $remainingFlow > 0 ? $remainingFlow : 0;  // 确保不为负数
        
        // 计算剩余天数
        $now = time();
        $expireTime = $userPackage['expireTime'];
        $remainingDays = ceil(($expireTime - $now) / 86400);  // 向上取整，剩余天数
        $remainingDays = $remainingDays > 0 ? $remainingDays : 0;  // 确保不为负数
        
        // 剩余百分比
        $flowPercentage = $totalFlow > 0 ? round(($remainingFlow / $totalFlow) * 100, 1) : 0;
        $timePercentage = $userPackage['duration'] > 0 ? 
            round(($remainingDays / ($userPackage['duration'] * 30)) * 100, 1) : 0;
        
        // 返回数据
        $result = [
            'packageName' => $flowPackage['name'],  // 套餐名称
            'remainingFlow' => $remainingFlow,  // 剩余流量(人)
            'totalFlow' => $totalFlow,  // 总流量(人)
            'flowPercentage' => $flowPercentage,  // 剩余流量百分比
            'remainingDays' => $remainingDays,  // 剩余天数
            'totalDays' => $userPackage['duration'] * 30,  // 总天数(按30天/月计算)
            'timePercentage' => $timePercentage,  // 剩余时间百分比
            'expireTime' => date('Y-m-d', $expireTime),  // 到期日期
            'startTime' => date('Y-m-d', $userPackage['startTime']),  // 开始日期
        ];
        
        return successJson($result, '获取成功');
    }
}
