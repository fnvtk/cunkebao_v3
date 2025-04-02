<?php

namespace app\store\controller;

use think\Db;
use think\facade\Log;
use app\store\controller\BaseController;


/**
 * 系统设置控制器
 */
class SystemConfigController extends BaseController
{
    protected $noNeedLogin = [];
    protected $noNeedRight = ['*'];
    
    /**
     * 获取系统开关状态
     * 
     * @return \think\Response
     */
    public function getSwitchStatus()
    {
        try {
            // 获取设备ID
            $deviceId = $this->device['id'] ?? 0;
            if (!$deviceId) {
                return $this->error('设备不存在');
            }

            // 获取已解析的配置
            $config = json_decode($this->device['taskConfig'], true);


            // 返回开关状态
            return successJson($config);

        } catch (\Exception $e) {
            Log::error('获取开关状态异常：' . $e->getMessage());
            return $this->error('获取开关状态失败');
        }
    }
    
    /**
     * 更新系统开关状态
     * 
     * @return \think\Response
     */
    public function updateSwitchStatus()
    {
        try {
            // 获取参数
            if (empty($this->device)) {
                return errorJson('设备不存在');
            }

            $switchName = $this->request->param('switchName');
            $deviceId = $this->device['id'];
            
            if (empty($switchName)) {
                return errorJson('开关名称不能为空');
            }
            
            // 验证开关名称是否有效
            $validSwitches = ['autoLike', 'momentsSync', 'autoCustomerDev', 'groupMessageDeliver', 'autoGroup'];
            if (!in_array($switchName, $validSwitches)) {
                return errorJson('无效的开关名称');
            }
            
            // 获取当前配置并确保是数组
            $taskConfig = json_decode($this->device['taskConfig'], true);

            // 更新指定开关状态
            $taskConfig[$switchName] = !$taskConfig[$switchName];
            $taskConfig = json_encode($taskConfig);


          
            // 更新数据库
            $result = Db::name('device')
                ->where('id', $deviceId)
                ->update([
                    'taskConfig' => $taskConfig,
                    'updateTime' => time()
                ]);
                
            if ($result === false) {
                Log::error("更新设备{$switchName}开关状态失败，设备ID：{$deviceId}");
                return errorJson('更新失败');
            }
            
            // 清除缓存
           $this->clearDeviceCache();
            
            return successJson([], '更新成功');
            
        } catch (\Exception $e) {
            return errorJson('系统错误'. $e->getMessage());
        }
    }
} 