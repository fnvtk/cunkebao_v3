<?php
namespace app\plan\controller;

use think\Controller;
use think\Request;
use app\plan\model\TrafficPool;
use app\plan\model\TrafficSource;
use app\plan\service\SceneHandler;
use think\facade\Log;

/**
 * 流量控制器
 */
class Traffic extends Controller
{
    /**
     * 初始化
     */
    protected function initialize()
    {
        parent::initialize();
    }
    
    /**
     * 获取流量池列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        $page = Request::param('page', 1, 'intval');
        $limit = Request::param('limit', 10, 'intval');
        $keyword = Request::param('keyword', '');
        $status = Request::param('status', '', 'trim');
        $gender = Request::param('gender', '', 'trim');
        
        // 构建查询条件
        $where = [];
        if (!empty($keyword)) {
            $where[] = ['mobile|tags', 'like', "%{$keyword}%"];
        }
        
        if ($status !== '') {
            $where[] = ['status', '=', intval($status)];
        }
        
        if ($gender !== '') {
            $where[] = ['gender', '=', intval($gender)];
        }
        
        // 查询流量池列表
        $result = TrafficPool::getAvailableTraffic($where, 'id desc', $page, $limit);
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $result
        ]);
    }
    
    /**
     * 获取流量详情
     *
     * @param int $id
     * @return \think\response\Json
     */
    public function read($id)
    {
        $traffic = TrafficPool::get($id);
        if (!$traffic) {
            return json([
                'code' => 404,
                'msg' => '流量记录不存在'
            ]);
        }
        
        // 获取流量来源
        $sources = TrafficSource::getSourcesByTrafficId($id);
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'traffic' => $traffic,
                'sources' => $sources
            ]
        ]);
    }
    
    /**
     * 创建或更新流量
     *
     * @return \think\response\Json
     */
    public function save()
    {
        $data = Request::post();
        
        // 数据验证
        $validate = validate('app\plan\validate\Traffic');
        if (!$validate->check($data)) {
            return json([
                'code' => 400,
                'msg' => $validate->getError()
            ]);
        }
        
        try {
            // 添加或更新流量
            $result = TrafficPool::addOrUpdateTraffic(
                $data['mobile'],
                $data['gender'] ?? 0,
                $data['age'] ?? 0,
                $data['tags'] ?? '',
                $data['province'] ?? '',
                $data['city'] ?? '',
                $data['source_channel'] ?? '',
                $data['source_detail'] ?? []
            );
            
            return json([
                'code' => 200,
                'msg' => '保存成功',
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            Log::error('保存流量记录异常', [
                'data' => $data,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return json([
                'code' => 500,
                'msg' => '保存失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 更新流量记录
     *
     * @param int $id
     * @return \think\response\Json
     */
    public function update($id)
    {
        $data = Request::put();
        
        // 检查流量记录是否存在
        $traffic = TrafficPool::get($id);
        if (!$traffic) {
            return json([
                'code' => 404,
                'msg' => '流量记录不存在'
            ]);
        }
        
        // 准备更新数据
        $updateData = [];
        
        // 只允许更新特定字段
        $allowedFields = ['gender', 'age', 'tags', 'province', 'city', 'status'];
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }
        
        // 更新流量记录
        $traffic->save($updateData);
        
        return json([
            'code' => 200,
            'msg' => '更新成功'
        ]);
    }
    
    /**
     * 删除流量记录
     *
     * @param int $id
     * @return \think\response\Json
     */
    public function delete($id)
    {
        // 检查流量记录是否存在
        $traffic = TrafficPool::get($id);
        if (!$traffic) {
            return json([
                'code' => 404,
                'msg' => '流量记录不存在'
            ]);
        }
        
        // 更新状态为无效
        $traffic->save([
            'status' => 0
        ]);
        
        return json([
            'code' => 200,
            'msg' => '删除成功'
        ]);
    }
    
    /**
     * 获取流量来源统计
     *
     * @return \think\response\Json
     */
    public function sourceStats()
    {
        $channel = Request::param('channel', '');
        $planId = Request::param('plan_id', 0, 'intval');
        $sceneId = Request::param('scene_id', 0, 'intval');
        $startDate = Request::param('start_date', '', 'trim');
        $endDate = Request::param('end_date', '', 'trim');
        
        // 获取统计数据
        $stats = TrafficSource::getSourceStats($channel, $planId, $sceneId, $startDate, $endDate);
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $stats
        ]);
    }
    
    /**
     * 处理外部流量
     *
     * @return \think\response\Json
     */
    public function handleExternalTraffic()
    {
        $data = Request::post();
        
        // 验证必要参数
        if (empty($data['scene_id']) || empty($data['mobile'])) {
            return json([
                'code' => 400,
                'msg' => '缺少必要参数'
            ]);
        }
        
        try {
            // 获取场景处理器
            $handler = SceneHandler::getHandler($data['scene_id']);
            
            // 根据场景类型处理流量
            switch ($data['scene_type'] ?? '') {
                case 'poster':
                    $result = $handler->handlePosterScan($data['mobile'], $data);
                    break;
                    
                case 'order':
                    $result = $handler->handleOrderImport($data['orders'] ?? []);
                    break;
                    
                default:
                    $result = $handler->handleChannelTraffic($data['mobile'], $data['channel'] ?? '', $data);
            }
            
            return json([
                'code' => 200,
                'msg' => '处理成功',
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            Log::error('处理外部流量异常', [
                'data' => $data,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return json([
                'code' => 500,
                'msg' => '处理失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 批量导入流量
     *
     * @return \think\response\Json
     */
    public function importTraffic()
    {
        // 检查是否上传了文件
        $file = Request::file('file');
        if (!$file) {
            return json([
                'code' => 400,
                'msg' => '未上传文件'
            ]);
        }
        
        // 检查文件类型，只允许csv或xlsx
        $fileExt = strtolower($file->getOriginalExtension());
        if (!in_array($fileExt, ['csv', 'xlsx'])) {
            return json([
                'code' => 400,
                'msg' => '仅支持CSV或XLSX格式文件'
            ]);
        }
        
        try {
            // 处理上传文件
            $saveName = \think\facade\Filesystem::disk('upload')->putFile('traffic', $file);
            $filePath = app()->getRuntimePath() . 'storage/upload/' . $saveName;
            
            // 读取文件内容并导入
            $results = [];
            $success = 0;
            $fail = 0;
            
            // 这里简化处理，实际应当使用专业的Excel/CSV解析库
            if ($fileExt == 'csv') {
                $handle = fopen($filePath, 'r');
                
                // 跳过标题行
                fgetcsv($handle);
                
                while (($data = fgetcsv($handle)) !== false) {
                    if (count($data) < 1) continue;
                    
                    $mobile = trim($data[0]);
                    // 验证手机号
                    if (!preg_match('/^1[3-9]\d{9}$/', $mobile)) {
                        $fail++;
                        continue;
                    }
                    
                    // 添加或更新流量
                    TrafficPool::addOrUpdateTraffic(
                        $mobile,
                        isset($data[1]) ? intval($data[1]) : 0,  // 性别
                        isset($data[2]) ? intval($data[2]) : 0,  // 年龄
                        isset($data[3]) ? $data[3] : '',         // 标签
                        isset($data[4]) ? $data[4] : '',         // 省份
                        isset($data[5]) ? $data[5] : '',         // 城市
                        'import',                                // 来源渠道
                        ['detail' => '批量导入']                  // 来源详情
                    );
                    
                    $success++;
                }
                
                fclose($handle);
            } else {
                // 处理xlsx文件，实际应当使用专业的Excel解析库
                // 此处代码省略，依赖于具体的Excel解析库
            }
            
            return json([
                'code' => 200,
                'msg' => '导入完成',
                'data' => [
                    'success' => $success,
                    'fail' => $fail
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('批量导入流量异常', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return json([
                'code' => 500,
                'msg' => '导入失败：' . $e->getMessage()
            ]);
        }
    }
} 