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
            // 获取登录用户信息
            $userInfo = request()->userInfo;
            if (empty($userInfo)) {
                return json([
                    'code' => 401,
                    'msg' => '未登录或登录已过期'
                ]);
            }
            
            // 获取查询条件
            $where = [];
            
            // 租户ID / 公司ID
            $where['companyId'] = $userInfo['companyId'];

            // 设备在线状态
            $alive = Request::param('alive');
            if (is_numeric($alive)) {
                $where['alive'] = $alive;
            }
            
            // 根据用户管理员状态调整查询条件
            if ($userInfo['isAdmin'] == 1) {
                // 管理员直接查询所有设备
                $count = DeviceModel::getDeviceCount($where);
            } else {
                // 非管理员需要查询关联表
                $deviceIds = \app\common\model\DeviceUser::getUserDeviceIds(
                    $userInfo['id'], 
                    $userInfo['companyId']
                );
                
                if (empty($deviceIds)) {
                    return json([
                        'code' => 403,
                        'msg' => '请联系管理员绑定设备',
                        'data' => [
                            'count' => 0
                        ]
                    ]);
                }
                
                // 添加设备ID过滤条件
                $where['id'] = ['in', $deviceIds];
                $count = DeviceModel::getDeviceCount($where);
            }
            
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
            // 获取登录用户信息
            $userInfo = request()->userInfo;
            if (empty($userInfo)) {
                return json([
                    'code' => 401,
                    'msg' => '未登录或登录已过期'
                ]);
            }

            // 获取查询条件
            $where = [];
            
            // 设备IMEI
            $imei = Request::param('imei');
            if (!empty($imei)) {
                $where['d.imei'] = ['like', "%{$imei}%"];
            }
            
            // 设备备注
            $memo = Request::param('memo');
            if (!empty($memo)) {
                $where['d.memo'] = ['like', "%{$memo}%"];
            }

            // 设备在线状态
            $alive = Request::param('alive');
            if (is_numeric($alive)) {
                $where['d.alive'] = $alive;
            }
            
            // 获取分页参数
            $page = (int)Request::param('page', 1);
            $limit = (int)Request::param('limit', 10);
            
            // 获取排序参数
            $sort = Request::param('sort', 'd.id');
            $order = Request::param('order', 'desc');
            
            // 添加公司ID过滤条件
            $where['d.companyId'] = $userInfo['companyId'];

            // 根据用户管理员状态调整查询条件
            if ($userInfo['isAdmin'] == 1) {
                // 管理员直接查询所有设备
                $list = DeviceModel::getDeviceList($where, "{$sort} {$order}", $page, $limit);
            } else {
                // 非管理员需要查询关联表
                $deviceIds = \app\common\model\DeviceUser::getUserDeviceIds(
                    $userInfo['id'], 
                    $userInfo['companyId']
                );
                
                if (empty($deviceIds)) {
                    return json([
                        'code' => 403,
                        'msg' => '请联系管理员绑定设备'
                    ]);
                }
                
                // 添加设备ID过滤条件
                $where['d.id'] = ['in', $deviceIds];
                $list = DeviceModel::getDeviceList($where, "{$sort} {$order}", $page, $limit);
            }
            
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
            // 获取登录用户信息
            $userInfo = request()->userInfo;
            if (empty($userInfo)) {
                return json([
                    'code' => 401,
                    'msg' => '未登录或登录已过期'
                ]);
            }
            
            // 获取设备ID
            $id = Request::param('id/d');
            if (empty($id)) {
                return json([
                    'code' => 400,
                    'msg' => '参数错误'
                ]);
            }
            
            // 检查用户权限
            if ($userInfo['isAdmin'] != 1) {
                // 非管理员需要检查是否有权限访问该设备
                $hasPermission = \app\common\model\DeviceUser::checkUserDevicePermission(
                    $userInfo['id'], 
                    $id, 
                    $userInfo['companyId']
                );
                
                if (!$hasPermission) {
                    return json([
                        'code' => 403,
                        'msg' => '您没有权限查看该设备'
                    ]);
                }
            }
            
            // 获取设备详情
            $info = DeviceModel::getDeviceInfo($id);
            if (empty($info)) {
                return json([
                    'code' => 404,
                    'msg' => '设备不存在'
                ]);
            }
            
            // 检查设备是否属于用户所在公司
            if ($info['companyId'] != $userInfo['companyId']) {
                return json([
                    'code' => 403,
                    'msg' => '您没有权限查看该设备'
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
            // 获取登录用户信息
            $userInfo = request()->userInfo;
            if (empty($userInfo)) {
                return json([
                    'code' => 401,
                    'msg' => '未登录或登录已过期'
                ]);
            }
            
            // 执行刷新逻辑
            // TODO: 实现实际刷新设备状态的功能
            
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
            // 获取登录用户信息
            $userInfo = request()->userInfo;
            if (empty($userInfo)) {
                return json([
                    'code' => 401,
                    'msg' => '未登录或登录已过期'
                ]);
            }
            
            // 检查用户权限，只有管理员可以添加设备
            if ($userInfo['isAdmin'] != 1) {
                return json([
                    'code' => 403,
                    'msg' => '您没有权限添加设备'
                ]);
            }
            
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
            
            // 设置设备公司ID
            $data['companyId'] = $userInfo['companyId'];
            
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
            // 获取登录用户信息
            $userInfo = request()->userInfo;
            if (empty($userInfo)) {
                return json([
                    'code' => 401,
                    'msg' => '未登录或登录已过期'
                ]);
            }
            
            // 检查用户权限，只有管理员可以删除设备
            if ($userInfo['isAdmin'] != 1) {
                return json([
                    'code' => 403,
                    'msg' => '您没有权限删除设备'
                ]);
            }
            
            // 获取设备ID
            $id = Request::param('id/d');
            if (empty($id)) {
                return json([
                    'code' => 400,
                    'msg' => '参数错误'
                ]);
            }
            
            // 验证设备是否存在
            $exists = DeviceModel::where('id', $id)
                ->where('isDeleted', 0)
                ->where('companyId', $userInfo['companyId'])
                ->find();
                
            if (!$exists) {
                return json([
                    'code' => 404,
                    'msg' => '设备不存在或无权限操作'
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