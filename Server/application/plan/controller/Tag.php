<?php
namespace app\plan\controller;

use think\Controller;
use think\Request;
use app\plan\model\Tag as TagModel;
use think\facade\Log;

/**
 * 标签控制器
 */
class Tag extends Controller
{
    /**
     * 初始化
     */
    protected function initialize()
    {
        parent::initialize();
    }
    
    /**
     * 获取标签列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        $type = Request::param('type', '');
        $status = Request::param('status', 1, 'intval');
        
        // 查询标签列表
        $tags = TagModel::getTagsByType($type, $status);
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $tags
        ]);
    }
    
    /**
     * 创建标签
     *
     * @return \think\response\Json
     */
    public function save()
    {
        $data = Request::post();
        
        // 数据验证
        if (empty($data['name']) || empty($data['type'])) {
            return json([
                'code' => 400,
                'msg' => '缺少必要参数'
            ]);
        }
        
        try {
            // 创建或获取标签
            $tagId = TagModel::getOrCreate($data['name'], $data['type']);
            
            return json([
                'code' => 200,
                'msg' => '创建成功',
                'data' => $tagId
            ]);
            
        } catch (\Exception $e) {
            Log::error('创建标签异常', [
                'data' => $data,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return json([
                'code' => 500,
                'msg' => '创建失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 批量创建标签
     *
     * @return \think\response\Json
     */
    public function batchCreate()
    {
        $data = Request::post();
        
        // 数据验证
        if (empty($data['names']) || empty($data['type'])) {
            return json([
                'code' => 400,
                'msg' => '缺少必要参数'
            ]);
        }
        
        // 检查名称数组
        if (!is_array($data['names'])) {
            return json([
                'code' => 400,
                'msg' => '标签名称必须是数组'
            ]);
        }
        
        try {
            $result = [];
            
            // 批量处理标签
            foreach ($data['names'] as $name) {
                $name = trim($name);
                if (empty($name)) continue;
                
                $tagId = TagModel::getOrCreate($name, $data['type']);
                $result[] = [
                    'id' => $tagId,
                    'name' => $name,
                    'type' => $data['type']
                ];
            }
            
            return json([
                'code' => 200,
                'msg' => '创建成功',
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            Log::error('批量创建标签异常', [
                'data' => $data,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return json([
                'code' => 500,
                'msg' => '创建失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 更新标签
     *
     * @param int $id
     * @return \think\response\Json
     */
    public function update($id)
    {
        $data = Request::put();
        
        // 检查标签是否存在
        $tag = TagModel::get($id);
        if (!$tag) {
            return json([
                'code' => 404,
                'msg' => '标签不存在'
            ]);
        }
        
        // 准备更新数据
        $updateData = [];
        
        // 只允许更新特定字段
        $allowedFields = ['name', 'status'];
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }
        
        // 更新标签
        $tag->save($updateData);
        
        // 如果更新了标签名称，且该标签有使用次数，则增加计数
        if (isset($updateData['name']) && $updateData['name'] != $tag->name && $tag->count > 0) {
            $tag->updateCount(1);
        }
        
        return json([
            'code' => 200,
            'msg' => '更新成功'
        ]);
    }
    
    /**
     * 删除标签
     *
     * @param int $id
     * @return \think\response\Json
     */
    public function delete($id)
    {
        // 检查标签是否存在
        $tag = TagModel::get($id);
        if (!$tag) {
            return json([
                'code' => 404,
                'msg' => '标签不存在'
            ]);
        }
        
        // 更新状态为删除
        $tag->save([
            'status' => 0
        ]);
        
        return json([
            'code' => 200,
            'msg' => '删除成功'
        ]);
    }
    
    /**
     * 获取标签名称
     *
     * @return \think\response\Json
     */
    public function getNames()
    {
        $ids = Request::param('ids');
        
        // 验证参数
        if (empty($ids)) {
            return json([
                'code' => 400,
                'msg' => '缺少标签ID参数'
            ]);
        }
        
        // 处理参数
        if (is_string($ids)) {
            $ids = explode(',', $ids);
        }
        
        // 获取标签名称
        $names = TagModel::getTagNames($ids);
        
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $names
        ]);
    }
} 