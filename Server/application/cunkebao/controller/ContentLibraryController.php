<?php

namespace app\cunkebao\controller;

use app\cunkebao\model\ContentLibrary;
use app\cunkebao\model\ContentItem;
use think\Controller;
use think\Db;

/**
 * 内容库控制器
 */
class ContentLibraryController extends Controller
{
    /**
     * 获取内容库列表
     * @return \think\response\Json
     */
    public function getList()
    {
        $page = $this->request->param('page', 1);
        $limit = $this->request->param('limit', 10);
        $keyword = $this->request->param('keyword', '');

        $where = [
            ['userId', '=', $this->request->userInfo['id']]
        ];
        
        // 添加名称模糊搜索
        if ($keyword !== '') {
            $where[] = ['name', 'like', '%' . $keyword . '%'];
        }

        $list = ContentLibrary::where($where)
            ->field('id,name,description,createTime,updateTime')
            ->order('id', 'desc')
            ->page($page, $limit)
            ->select();

        $total = ContentLibrary::where($where)->count();

        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'list' => $list,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ]
        ]);
    }

    /**
     * 获取内容库详情
     * @param int $id 内容库ID
     * @return \think\response\Json
     */
    public function detail($id)
    {
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        $library = ContentLibrary::where([
            ['id', '=', $id],
            ['userId', '=', $this->request->userInfo['id']]
        ])
        ->field('id,name,description,createTime,updateTime')
        ->find();

        if (empty($library)) {
            return json(['code' => 404, 'msg' => '内容库不存在']);
        }

        // 获取内容项目
        $items = ContentItem::where('libraryId', $id)->select();
        $library['items'] = $items;

        return json(['code' => 200, 'msg' => '获取成功', 'data' => $library]);
    }

    /**
     * 创建内容库
     * @return \think\response\Json
     */
    public function create()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 400, 'msg' => '请求方式错误']);
        }

        // 获取请求参数
        $param = $this->request->post();

        // 简单验证
        if (empty($param['name'])) {
            return json(['code' => 400, 'msg' => '内容库名称不能为空']);
        }

        Db::startTrans();
        try {
            // 创建内容库
            $library = new ContentLibrary;
            $library->name = $param['name'];
            $library->description = isset($param['description']) ? $param['description'] : '';
            $library->userId = $this->request->userInfo['id'];
            $library->companyId = $this->request->userInfo['companyId'];
            $library->save();

            // 如果有内容项目，也一并创建
            if (!empty($param['items']) && is_array($param['items'])) {
                foreach ($param['items'] as $item) {
                    $contentItem = new ContentItem;
                    $contentItem->libraryId = $library->id;
                    $contentItem->type = $item['type'];
                    $contentItem->title = $item['title'] ?? '';
                    $contentItem->contentData = $item['contentData'];
                    $contentItem->save();
                }
            }

            Db::commit();
            return json(['code' => 200, 'msg' => '创建成功', 'data' => ['id' => $library->id]]);
        } catch (\Exception $e) {
            Db::rollback();
            return json(['code' => 500, 'msg' => '创建失败：' . $e->getMessage()]);
        }
    }

    /**
     * 更新内容库
     * @return \think\response\Json
     */
    public function update()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 400, 'msg' => '请求方式错误']);
        }

        // 获取请求参数
        $param = $this->request->post();

        // 简单验证
        if (empty($param['id'])) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        if (empty($param['name'])) {
            return json(['code' => 400, 'msg' => '内容库名称不能为空']);
        }

        // 查询内容库是否存在
        $library = ContentLibrary::where([
            ['id', '=', $param['id']],
            ['userId', '=', $this->request->userInfo['id']]
        ])->find();

        if (!$library) {
            return json(['code' => 404, 'msg' => '内容库不存在']);
        }

        Db::startTrans();
        try {
            // 更新内容库基本信息
            $library->name = $param['name'];
            $library->description = isset($param['description']) ? $param['description'] : '';
            $library->save();

            Db::commit();
            return json(['code' => 200, 'msg' => '更新成功']);
        } catch (\Exception $e) {
            Db::rollback();
            return json(['code' => 500, 'msg' => '更新失败：' . $e->getMessage()]);
        }
    }

    /**
     * 删除内容库
     * @param int $id 内容库ID
     * @return \think\response\Json
     */
    public function delete($id)
    {
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        $library = ContentLibrary::where([
            ['id', '=', $id],
            ['userId', '=', $this->request->userInfo['id']]
        ])->find();

        if (!$library) {
            return json(['code' => 404, 'msg' => '内容库不存在']);
        }

        Db::startTrans();
        try {
            // 删除相关内容项目
            ContentItem::where('libraryId', $id)->delete();
            
            // 删除内容库
            $library->delete();

            Db::commit();
            return json(['code' => 200, 'msg' => '删除成功']);
        } catch (\Exception $e) {
            Db::rollback();
            return json(['code' => 500, 'msg' => '删除失败：' . $e->getMessage()]);
        }
    }

    /**
     * 添加内容项目
     * @return \think\response\Json
     */
    public function addItem()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 400, 'msg' => '请求方式错误']);
        }

        // 获取请求参数
        $param = $this->request->post();

        // A简单验证
        if (empty($param['libraryId'])) {
            return json(['code' => 400, 'msg' => '内容库ID不能为空']);
        }

        if (empty($param['type'])) {
            return json(['code' => 400, 'msg' => '内容类型不能为空']);
        }

        if (empty($param['contentData'])) {
            return json(['code' => 400, 'msg' => '内容数据不能为空']);
        }

        // 查询内容库是否存在
        $library = ContentLibrary::where([
            ['id', '=', $param['libraryId']],
            ['userId', '=', $this->request->userInfo['id']]
        ])->find();

        if (!$library) {
            return json(['code' => 404, 'msg' => '内容库不存在']);
        }

        try {
            // 创建内容项目
            $item = new ContentItem;
            $item->libraryId = $param['libraryId'];
            $item->type = $param['type'];
            $item->title = $param['title'] ?? '';
            $item->contentData = $param['contentData'];
            $item->save();

            return json(['code' => 200, 'msg' => '添加成功', 'data' => ['id' => $item->id]]);
        } catch (\Exception $e) {
            return json(['code' => 500, 'msg' => '添加失败：' . $e->getMessage()]);
        }
    }

    /**
     * 删除内容项目
     * @param int $id 内容项目ID
     * @return \think\response\Json
     */
    public function deleteItem($id)
    {
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        // 查询内容项目是否存在并检查权限
        $item = ContentItem::alias('i')
            ->join('content_library l', 'i.libraryId = l.id')
            ->where([
                ['i.id', '=', $id],
                ['l.userId', '=', $this->request->userInfo['id']]
            ])
            ->find();

        if (!$item) {
            return json(['code' => 404, 'msg' => '内容项目不存在或无权限操作']);
        }

        try {
            // 删除内容项目
            ContentItem::destroy($id);

            return json(['code' => 200, 'msg' => '删除成功']);
        } catch (\Exception $e) {
            return json(['code' => 500, 'msg' => '删除失败：' . $e->getMessage()]);
        }
    }
} 