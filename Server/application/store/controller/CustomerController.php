<?php

namespace app\store\controller;

use app\common\controller\Api;
use think\Db;

/**
 * 客户管理控制器
 */
class CustomerController extends Api
{
    protected $noNeedLogin = [];
    protected $noNeedRight = ['*'];
    
    /**
     * 获取客户列表
     * 
     * @return \think\Response
     */
    public function getList()
    {
        $params = $this->request->param();
        
        // 获取分页参数
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $pageSize = isset($params['pageSize']) ? intval($params['pageSize']) : 10;
        $userInfo = request()->userInfo;

        
        // 必要的查询条件
        $userId = $userInfo['id'];
        $companyId = $userInfo['companyId'];
        
        if (empty($userId) || empty($companyId)) {
            return errorJson('缺少必要参数');
        }
        
        // 构建查询条件
        $where = [
            'du.userId' => $userId,
            'du.companyId' => $companyId
        ];
        
        // 搜索条件
        if (!empty($params['keyword'])) {
            $where['wf.alias|wf.nickname|wf.wechatId'] = ['like', '%' . $params['keyword'] . '%'];
        }
        // if (!empty($params['email'])) {
        //     $where['wa.bindEmail'] = ['like', '%' . $params['email'] . '%'];
        // }
        // if (!empty($params['name'])) {
        //     $where['wa.accountRealName|wa.accountUserName|wa.nickname'] = ['like', '%' . $params['name'] . '%'];
        // }
        
        // 构建查询
        $query = Db::name('device_user')
            ->alias('du')
            ->join(['s2_device' => 'd'], 'd.id = du.deviceId','left')
            ->join(['s2_wechat_account' => 'wa'], 'wa.imei = d.imei','left')
            ->join(['s2_wechat_friend' => 'wf'], 'wf.ownerWechatId = wa.wechatId','left')
            ->where($where)
            ->field('d.id as deviceId,d.imei,wf.*')
            ->group('wf.wechatId'); // 防止重复数据
            
        // 克隆查询对象，用于计算总数
        $countQuery = clone $query;
        $total = $countQuery->count();

        // 获取分页数据
        $list = $query->page($page, $pageSize)
            ->order('wa.id DESC')
            ->select();
      
      

        // 格式化数据
        foreach ($list as &$item) {
            $item['labels'] = json_decode($item['labels'], true);
            $item['createTime'] = date('Y-m-d H:i:s', $item['createTime']);
        }
        unset($item);

        return successJson([
            'list' => $list,
            'total' => $total
        ], '获取成功');
    }
} 