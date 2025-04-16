<?php
namespace app\cunkebao\controller;

use app\cunkebao\model\DeviceHandleLog;
use app\cunkebao\model\DeviceWechatLogin;
use think\Controller;
use app\cunkebao\model\Device as DeviceModel;
use app\cunkebao\model\DeviceUser as DeviceUserModel;
use think\Db;
use think\facade\Request;

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
            $wechatAccounts = DeviceWechatLogin::getDeviceRelatedAccounts($deviceId, $userInfo['companyId']);
            
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