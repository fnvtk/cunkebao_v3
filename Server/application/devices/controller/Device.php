<?php
namespace app\devices\controller;

use app\devices\model\DeviceHandleLog;
use think\Controller;
use app\devices\model\Device as DeviceModel;
use think\Db;
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
            // 获取查询条件
            $where = [];
            
            // 关键词搜索（同时搜索IMEI和备注）
            $keyword = Request::param('keyword');
            if (!empty($keyword)) {
                // 使用复杂条件实现OR查询
                $where[] = ['exp', "d.imei LIKE '%{$keyword}%' OR d.memo LIKE '%{$keyword}%'"];
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
            $data['id'] = time();

            try {
                Db::startTrans();

                // 添加设备
                $id = DeviceModel::addDevice($data);

                // 添加设备操作记录
                DeviceHandleLog::addLog(
                    [
                        'imei' => $data['imei'],
                        'userId' => $userInfo['id'],
                        'content' => '添加设备',
                        'companyId' => $userInfo['companyId'],
                    ]
                );
                Db::commit();
            } catch (\Exception $e) {
                Db::rollback();

                return json([
                    'code' => 500,
                    'msg' => '添加失败：' . $e->getMessage()
                ]);
            }

            // 此处调用底层API
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

    /**
     * 更新设备任务配置
     * @return \think\response\Json
     */
    public function updateTaskConfig()
    {
        // 获取请求参数
        $data = $this->request->post();

        // 获取登录用户信息
        $userInfo = request()->userInfo;
        
        // 验证参数
        if (empty($data['id'])) {
            return json(['code' => 400, 'msg' => '设备ID不能为空']);
        }
        
        // 转换为整型，确保ID格式正确
        $deviceId = intval($data['id']);
        
        // 先获取设备信息，确认设备存在且未删除
        $device = \app\devices\model\Device::where('id', $deviceId)
            ->where('isDeleted', 0)
            ->find();
            
        if (!$device) {
            return json(['code' => 404, 'msg' => '设备不存在或已删除']);
        }
        
        // 读取原taskConfig，如果存在则解析
        $taskConfig = [];
        if (!empty($device['taskConfig'])) {
            $taskConfig = json_decode($device['taskConfig'], true) ?: [];
        }
        
        // 更新需要修改的配置项
        $updateFields = ['autoAddFriend', 'autoReply', 'momentsSync', 'aiChat'];
        $hasUpdate = false;
        
        foreach ($updateFields as $field) {
            if (isset($data[$field])) {
                // 将值转换为布尔类型存储
                $taskConfig[$field] = (bool)$data[$field];
                $hasUpdate = true;
            }
        }
        
        // 如果没有需要更新的字段，直接返回成功
        if (!$hasUpdate) {
            return json(['code' => 200, 'msg' => '更新成功', 'data' => ['taskConfig' => $taskConfig]]);
        }

        try {
            Db::startTrans();

            // 更新设备taskConfig字段
            $result = \app\devices\model\Device::where('id', $deviceId)
                ->update([
                    'taskConfig' => json_encode($taskConfig),
                    'updateTime' => time()
                ]);

            if (isset($data['autoAddFriend'])) {
                $content = $data['autoAddFriend'] ? '开启自动添加好友' : '关闭自动添加好友';
            }

            if (isset($data['autoReply'])) {
                $content = $data['autoReply'] ? '开启自动回复' : '关闭自动回复';
            }

            if (isset($data['momentsSync'])) {
                $content = $data['momentsSync'] ? '开启朋友圈同步' : '关闭朋友圈同步';
            }

            if (isset($data['aiChat'])) {
                $content = $data['aiChat'] ? '开启AI会话' : '关闭AI会话';
            }

            // 添加设备操作记录
            DeviceHandleLog::addLog(
                [
                    'imei' => $device['imei'],
                    'deviceId' => $deviceId,
                    'userId' => $userInfo['id'],
                    'content' => $content,
                    'companyId' => $userInfo['companyId'],
                ]
            );
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            
            return json([
                'code' => 500,
                'msg' => '更新任务配置失败'
            ]);
        }

        if ($result) {
            return json([
                'code' => 200, 
                'msg' => '更新任务配置成功',
                'data' => [
                    'taskConfig' => $taskConfig
                ]
            ]);
        } else {
            return json(['code' => 500, 'msg' => '更新任务配置失败']);
        }
    }

    /**
     * 获取设备关联的微信账号
     * @return \think\response\Json
     */
    public function getRelatedAccounts()
    {
        try {
            // 获取登录用户信息
            $userInfo = request()->userInfo;

            // 获取设备ID
            $deviceId = $this->request->param('id/d');
            if (empty($deviceId)) {
                return json([
                    'code' => 400,
                    'msg' => '设备ID不能为空'
                ]);
            }
            
            // 检查用户是否有权限访问该设备
            if ($userInfo['isAdmin'] != 1) {
                // 非管理员需要检查是否有权限访问该设备
                $hasPermission = \app\common\model\DeviceUser::checkUserDevicePermission(
                    $userInfo['id'], 
                    $deviceId, 
                    $userInfo['companyId']
                );
                
                if (!$hasPermission) {
                    return json([
                        'code' => 403,
                        'msg' => '您没有权限查看该设备'
                    ]);
                }
            }
            
            // 获取设备信息，确认设备存在
            $device = DeviceModel::where('id', $deviceId)
                ->where('isDeleted', 0)
                ->find();
                
            if (!$device) {
                return json([
                    'code' => 404,
                    'msg' => '设备不存在或已删除'
                ]);
            }
            
            // 获取设备关联的微信账号
            $wechatAccounts = \app\devices\model\DeviceWechatLogin::getDeviceRelatedAccounts($deviceId, $userInfo['companyId']);
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'deviceId' => $deviceId,
                    'accounts' => $wechatAccounts,
                    'total' => count($wechatAccounts)
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
     * 获取设备操作记录
     * @return \think\response\Json
     */
    public function handleLogs()
    {
        try {
            // 获取登录用户信息
            $userInfo = request()->userInfo;
            
            // 获取设备ID
            $deviceId = $this->request->param('id/d');
            if (empty($deviceId)) {
                return json([
                    'code' => 400,
                    'msg' => '设备ID不能为空'
                ]);
            }
            
            // 检查用户是否有权限访问该设备
            if ($userInfo['isAdmin'] != 1) {
                // 非管理员需要检查是否有权限访问该设备
                $hasPermission = \app\common\model\DeviceUser::checkUserDevicePermission(
                    $userInfo['id'], 
                    $deviceId, 
                    $userInfo['companyId']
                );
                
                if (!$hasPermission) {
                    return json([
                        'code' => 403,
                        'msg' => '您没有权限查看该设备'
                    ]);
                }
            }
            
            // 获取设备信息，确认设备存在
            $device = DeviceModel::where('id', $deviceId)
                ->where('isDeleted', 0)
                ->find();
                
            if (!$device) {
                return json([
                    'code' => 404,
                    'msg' => '设备不存在或已删除'
                ]);
            }
            
            // 获取分页参数
            $page = (int)Request::param('page', 1);
            $limit = (int)Request::param('limit', 10);
            
            // 查询设备操作记录，并关联用户表获取操作人信息
            $logs = Db::table('tk_device_handle_log')
                ->alias('l')
                ->join('tk_users u', 'l.userId = u.id', 'left')
                ->where('l.imei', $device['imei'])
                ->where('l.companyId', $userInfo['companyId'])
                ->field([
                    'l.id', 
                    'l.content', 
                    'l.createTime', 
                    'u.username'
                ])
                ->order('l.createTime desc')
                ->paginate($limit, false, ['page' => $page]);
            
            // 格式化返回数据
            $items = [];
            foreach ($logs as $log) {
                $items[] = [
                    'id' => $log['id'],
                    'content' => $log['content'],
                    'username' => $log['username'] ? $log['username'] : '未知用户',
                    'createTime' => $log['createTime']
                ];
            }
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'total' => $logs->total(),
                    'list' => $items
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
} 