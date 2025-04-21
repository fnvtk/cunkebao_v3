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
        $sourceType = $this->request->param('sourceType', ''); // 新增：来源类型，1=好友，2=群

        $where = [
            ['userId', '=', $this->request->userInfo['id']],
            ['isDel', '=', 0]  // 只查询未删除的记录
        ];
        
        // 添加名称模糊搜索
        if ($keyword !== '') {
            $where[] = ['name', 'like', '%' . $keyword . '%'];
        }

   // 添加名称模糊搜索
        if (!empty($sourceType)) {
            $where[] = ['sourceType', '=', $sourceType];
        }



        $list = ContentLibrary::where($where)
            ->field('id,name,sourceFriends,sourceGroups,keywordInclude,keywordExclude,aiEnabled,aiPrompt,timeEnabled,timeStart,timeEnd,status,sourceType,userId,createTime,updateTime')
            ->with(['user' => function($query) {
                $query->field('id,username');
            }])
            ->order('id', 'desc')
            ->page($page, $limit)
            ->select();

        // 处理JSON字段
        foreach ($list as &$item) {
            $item['sourceFriends'] = json_decode($item['sourceFriends'] ?: '[]', true);
            $item['sourceGroups'] = json_decode($item['sourceGroups'] ?: '[]', true);
            $item['keywordInclude'] = json_decode($item['keywordInclude'] ?: '[]', true);
            $item['keywordExclude'] = json_decode($item['keywordExclude'] ?: '[]', true);
            // 添加创建人名称
            $item['creatorName'] = $item['user']['username'] ?? '';
            unset($item['user']); // 移除关联数据
        }
        unset($item);

        $total = ContentLibrary::where($where)->count();

        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'list' => $list,
                'total' => $total,
                'page' => $page,
            ]
        ]);
    }

    /**
     * 获取内容库详情
     * @return \think\response\Json
     */
    public function detail()
    {
        $id = $this->request->param('id', 0);
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        $library = ContentLibrary::where([
            ['id', '=', $id],
            ['userId', '=', $this->request->userInfo['id']],
            ['isDel', '=', 0]  // 只查询未删除的记录
        ])
        ->field('id,name,sourceType,sourceFriends,sourceGroups,keywordInclude,keywordExclude,aiEnabled,aiPrompt,timeEnabled,timeStart,timeEnd,status,userId,companyId,createTime,updateTime')
        ->find();

        if (empty($library)) {
            return json(['code' => 404, 'msg' => '内容库不存在']);
        }

        // 处理JSON字段转数组
        $library['sourceFriends'] = json_decode($library['sourceFriends'] ?: '[]', true);
        $library['sourceGroups'] = json_decode($library['sourceGroups'] ?: '[]', true);
        $library['keywordInclude'] = json_decode($library['keywordInclude'] ?: '[]', true);
        $library['keywordExclude'] = json_decode($library['keywordExclude'] ?: '[]', true);

    // 将时间戳转换为日期格式（精确到日）
    if (!empty($library['timeStart'])) {
        $library['timeStart'] = date('Y-m-d', $library['timeStart']);
    }
    if (!empty($library['timeEnd'])) {
        $library['timeEnd'] = date('Y-m-d', $library['timeEnd']);
    }


        return json([
            'code' => 200, 
            'msg' => '获取成功', 
            'data' => $library
        ]);
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

        // 验证参数
        if (empty($param['name'])) {
            return json(['code' => 400, 'msg' => '内容库名称不能为空']);
        }

        // 检查内容库名称是否已存在
        $exists = ContentLibrary::where('name', $param['name'])->find();
        if ($exists) {
            return json(['code' => 400, 'msg' => '内容库名称已存在']);
        }

        Db::startTrans();
        try {
            // 构建数据
            $data = [
                'name' => $param['name'],
                // 数据来源配置
                'sourceFriends' => isset($param['friends']) ? json_encode($param['friends']) : '[]', // 选择的微信好友
                'sourceGroups' => isset($param['groups']) ? json_encode($param['groups']) : '[]', // 选择的微信群
                // 关键词配置
                'keywordInclude' => isset($param['keywordInclude']) ? json_encode($param['keywordInclude']) : '[]', // 包含的关键词
                'keywordExclude' => isset($param['keywordExclude']) ? json_encode($param['keywordExclude']) : '[]', // 排除的关键词
                // AI配置
                'aiEnabled' => isset($param['aiEnabled']) ? $param['aiEnabled'] : 0, // 是否启用AI
                'aiPrompt' => isset($param['aiPrompt']) ? $param['aiPrompt'] : '', // AI提示词
                // 时间配置
                'timeEnabled' => isset($param['timeEnabled']) ? $param['timeEnabled'] : 0, // 是否启用时间限制
                'timeStart' => isset($param['startTime']) ? strtotime($param['startTime']) : 0, // 开始时间（转换为时间戳）
                'timeEnd' => isset($param['endTime']) ? strtotime($param['endTime']) : 0, // 结束时间（转换为时间戳）
                // 来源类型
                'sourceType' => isset($param['sourceType']) ? $param['sourceType'] : 0, // 1=好友，2=群，3=好友和群
                // 基础信息
                'status' => isset($param['status']) ? $param['status'] : 0, // 状态：0=禁用，1=启用
                'userId' => $this->request->userInfo['id'],
                'companyId' => $this->request->userInfo['companyId'],
                'createTime' => time(),
                'updateTime' => time()
            ];

            // 创建内容库
            $library = new ContentLibrary;
            $result = $library->save($data);

            if (!$result) {
                Db::rollback();
                return json(['code' => 500, 'msg' => '创建内容库失败']);
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
     * @return \think\response\Json
     */
    public function delete()
    {
        $id = $this->request->param('id', 0);
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        $library = ContentLibrary::where([
            ['id', '=', $id],
            ['userId', '=', $this->request->userInfo['id']],
            ['isDel', '=', 0]  // 只删除未删除的记录
        ])->find();

        if (empty($library)) {
            return json(['code' => 404, 'msg' => '内容库不存在']);
        }

        try {
            // 软删除
            $library->isDel = 1;
            $library->deleteTime = time();
            $library->save();

            return json(['code' => 200, 'msg' => '删除成功']);
        } catch (\Exception $e) {
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