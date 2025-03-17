<?php
namespace app\devices\controller;

use think\Controller;
use app\devices\model\Device as DeviceModel;
use think\facade\Request;
use app\common\util\JwtUtil;

/**
 * 设备管理控制器
 */
class Device extends Controller
{
    /**
     * 用户信息
     * @var object
     */
    protected $user;
    
    /**
     * 初始化
     */
    protected function initialize()
    {
        parent::initialize();
        
        // 设置时区
        date_default_timezone_set('Asia/Shanghai');
    }
    
    /**
     * 获取设备总数
     * @return \think\response\Json
     */
    public function count()
    {
        try {
            // 获取查询条件
            $where = [];
            
            // 租户ID
            $tenantId = Request::param('tenant_id');
            if (is_numeric($tenantId)) {
                $where['tenantId'] = $tenantId;
            }

            // 设备在线状态
            $alive = Request::param('alive');
            if (is_numeric($alive)) {
                $where['alive'] = $alive;
            }
            
            // 获取设备总数
            $count = DeviceModel::getDeviceCount($where);
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'count' => $count
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取设备列表
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            // 获取查询条件
            $where = [];
            
            // 设备IMEI
            $imei = Request::param('imei');
            if (!empty($imei)) {
                $where['imei'] = ['like', "%{$imei}%"];
            }
            
            // 设备备注
            $memo = Request::param('memo');
            if (!empty($memo)) {
                $where['memo'] = ['like', "%{$memo}%"];
            }

            // 设备在线状态
            $alive = Request::param('alive');
            if (is_numeric($alive)) {
                $where['alive'] = $alive;
            }
            
            // 获取分页参数
            $page = (int)Request::param('page', 1);
            $limit = (int)Request::param('limit', 10);
            
            // 获取排序参数
            $sort = Request::param('sort', 'id');
            $order = Request::param('order', 'desc');
            
            // 获取设备列表
            $list = DeviceModel::getDeviceList($where, "{$sort} {$order}", $page, $limit);
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'total' => $list->total(),
                    'list' => $list->items()
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取设备详情
     * @return \think\response\Json
     */
    public function read()
    {
        try {
            // 获取设备ID
            $id = Request::param('id/d');
            if (empty($id)) {
                return json([
                    'code' => 400,
                    'msg' => '参数错误'
                ]);
            }
            
            // 获取设备详情
            $info = DeviceModel::getDeviceInfo($id);
            if (empty($info)) {
                return json([
                    'code' => 404,
                    'msg' => '设备不存在'
                ]);
            }
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => $info
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }

    /**
     * 刷新设备
     * @return \think\response\Json
     */
    public function refresh()
    {
        try {    
        
            return json([
                'code' => 200,
                'msg' => '刷新成功',
                'data' => []
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 添加设备
     * @return \think\response\Json
     */
    public function save()
    {
        try {
            // 获取设备数据
            $data = Request::post();
            
            // 验证IMEI是否为空
            if (empty($data['imei'])) {
                return json([
                    'code' => 400,
                    'msg' => '设备IMEI不能为空'
                ]);
            }
            
            // 验证IMEI是否已存在
            $exists = DeviceModel::where('imei', $data['imei'])->where('isDeleted', 0)->find();
            if ($exists) {
                return json([
                    'code' => 400,
                    'msg' => '设备IMEI已存在'
                ]);
            }
            
            // 添加设备
            $id = DeviceModel::addDevice($data);
            
            return json([
                'code' => 200,
                'msg' => '添加成功',
                'data' => [
                    'id' => $id
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '添加失败：' . $e->getMessage()
            ]);
        }
    }
     
    /**
     * 删除设备
     * @return \think\response\Json
     */
    public function delete()
    {
        try {
            // 获取设备ID
            $id = Request::param('id/d');
            if (empty($id)) {
                return json([
                    'code' => 400,
                    'msg' => '参数错误'
                ]);
            }
            
            // 验证设备是否存在
            $exists = DeviceModel::where('id', $id)->where('isDeleted', 0)->find();
            if (!$exists) {
                return json([
                    'code' => 404,
                    'msg' => '设备不存在'
                ]);
            }
            
            // 删除设备
            $result = DeviceModel::deleteDevice($id);
            
            return json([
                'code' => 200,
                'msg' => '删除成功',
                'data' => [
                    'result' => $result
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '删除失败：' . $e->getMessage()
            ]);
        }
    }
} 