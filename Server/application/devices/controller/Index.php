<?php
namespace app\devices\controller;

use think\Controller;
use app\devices\model\Device;
use think\facade\Request;

/**
 * 设备管理控制器
 */
class Index extends Controller
{
    /**
     * 获取设备总数
     * @return \think\response\Json
     */
    public function count()
    {
        try {
            // 获取查询条件
            $where = [];
            
            // 设备品牌
            $brand = Request::param('brand');
            if (!empty($brand)) {
                $where['brand'] = $brand;
            }
            
            // 设备型号
            $model = Request::param('model');
            if (!empty($model)) {
                $where['model'] = $model;
            }
            
            // 设备在线状态
            $alive = Request::param('alive');
            if (is_numeric($alive)) {
                $where['alive'] = $alive;
            }
            
            // 租户ID
            $tenantId = Request::param('tenant_id');
            if (is_numeric($tenantId)) {
                $where['tenantId'] = $tenantId;
            }
            
            // 分组ID
            $groupId = Request::param('group_id');
            if (is_numeric($groupId)) {
                $where['groupId'] = $groupId;
            }
            
            // 获取设备总数
            $count = Device::getDeviceCount($where);
            
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
            
            // 设备名称
            $userName = Request::param('user_name');
            if (!empty($userName)) {
                $where['userName'] = ['like', "%{$userName}%"];
            }
            
            // 设备IMEI
            $imei = Request::param('imei');
            if (!empty($imei)) {
                $where['imei'] = ['like', "%{$imei}%"];
            }
            
            // 设备品牌
            $brand = Request::param('brand');
            if (!empty($brand)) {
                $where['brand'] = $brand;
            }
            
            // 设备型号
            $model = Request::param('model');
            if (!empty($model)) {
                $where['model'] = $model;
            }
            
            // 设备在线状态
            $alive = Request::param('alive');
            if (is_numeric($alive)) {
                $where['alive'] = $alive;
            }
            
            // 租户ID
            $tenantId = Request::param('tenant_id');
            if (is_numeric($tenantId)) {
                $where['tenantId'] = $tenantId;
            }
            
            // 分组ID
            $groupId = Request::param('group_id');
            if (is_numeric($groupId)) {
                $where['groupId'] = $groupId;
            }
            
            // 获取分页参数
            $page = Request::param('page/d', 1);
            $limit = Request::param('limit/d', 10);
            
            // 获取排序参数
            $sort = Request::param('sort', 'id');
            $order = Request::param('order', 'desc');
            
            // 获取设备列表
            $list = Device::getDeviceList($where, "{$sort} {$order}", $page, $limit);
            
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
            $info = Device::getDeviceInfo($id);
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
            $exists = Device::where('imei', $data['imei'])->where('isDeleted', 0)->find();
            if ($exists) {
                return json([
                    'code' => 400,
                    'msg' => '设备IMEI已存在'
                ]);
            }
            
            // 添加设备
            $id = Device::addDevice($data);
            
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
     * 更新设备
     * @return \think\response\Json
     */
    public function update()
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
            
            // 获取设备数据
            $data = Request::put();
            
            // 验证设备是否存在
            $exists = Device::where('id', $id)->where('isDeleted', 0)->find();
            if (!$exists) {
                return json([
                    'code' => 404,
                    'msg' => '设备不存在'
                ]);
            }
            
            // 如果更新IMEI，验证IMEI是否已存在
            if (!empty($data['imei']) && $data['imei'] != $exists['imei']) {
                $imeiExists = Device::where('imei', $data['imei'])->where('isDeleted', 0)->where('id', '<>', $id)->find();
                if ($imeiExists) {
                    return json([
                        'code' => 400,
                        'msg' => '设备IMEI已存在'
                    ]);
                }
            }
            
            // 更新设备
            $result = Device::updateDevice($id, $data);
            
            return json([
                'code' => 200,
                'msg' => '更新成功',
                'data' => [
                    'result' => $result
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '更新失败：' . $e->getMessage()
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
            $exists = Device::where('id', $id)->where('isDeleted', 0)->find();
            if (!$exists) {
                return json([
                    'code' => 404,
                    'msg' => '设备不存在'
                ]);
            }
            
            // 删除设备
            $result = Device::deleteDevice($id);
            
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
    
    /**
     * 按设备品牌统计数量
     * @return \think\response\Json
     */
    public function countByBrand()
    {
        try {
            // 获取统计数据
            $data = Device::countByBrand();
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 按设备在线状态统计数量
     * @return \think\response\Json
     */
    public function countByStatus()
    {
        try {
            // 获取统计数据
            $data = Device::countByStatus();
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
} 