<?php

namespace app\cunkebao\controller;

use app\cunkebao\model\ContentLibrary;
use app\cunkebao\model\ContentItem;
use think\Controller;
use think\Db;
use app\api\controller\WebSocketController;

/**
 * 内容库控制器
 */
class ContentLibraryController extends Controller
{
    /************************************
     * 内容库基础管理功能
     ************************************/
    
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
        $exists = ContentLibrary::where(['name' => $param['name'],'userId' => $this->request->userInfo['id'],'isDel' => 0])->find();
        if ($exists) {
            return json(['code' => 400, 'msg' => '内容库名称已存在']);
        }

        Db::startTrans();
        try {

            $keywordInclude = isset($param['keywordInclude']) ? json_encode($param['keywordInclude'],256) : json_encode([]);
            $keywordExclude = isset($param['keywordExclude']) ? json_encode($param['keywordExclude'],256) : json_encode([]);
            $sourceType = isset($param['sourceType']) ? $param['sourceType'] : 1;


            // 构建数据
            $data = [
                'name' => $param['name'],
                // 数据来源配置
                'sourceFriends' => $sourceType == 1 ? json_encode($param['friends']) : json_encode([]), // 选择的微信好友
                'sourceGroups' => $sourceType == 2 ? json_encode($param['groups']) : json_encode([]), // 选择的微信群
                'groupMembers' =>  $sourceType == 2 ? json_encode($param['groupMembers']) : json_encode([]), // 群组成员
                // 关键词配置
                'keywordInclude' => $keywordInclude, // 包含的关键词
                'keywordExclude' => $keywordExclude, // 排除的关键词
                // AI配置
                'aiEnabled' => isset($param['aiEnabled']) ? $param['aiEnabled'] : 0, // 是否启用AI
                'aiPrompt' => isset($param['aiPrompt']) ? $param['aiPrompt'] : '', // AI提示词
                // 时间配置
                'timeEnabled' => isset($param['timeEnabled']) ? $param['timeEnabled'] : 0, // 是否启用时间限制
                'timeStart' => isset($param['startTime']) ? strtotime($param['startTime']) : 0, // 开始时间（转换为时间戳）
                'timeEnd' => isset($param['endTime']) ? strtotime($param['endTime']) : 0, // 结束时间（转换为时间戳）
                // 来源类型
                'sourceType' => $sourceType, // 1=好友，2=群，3=好友和群
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
            $item['itemCount'] = Db::name('content_item')->where('libraryId', $item['id'])->count();

            // 获取好友详细信息
            if (!empty($item['sourceFriends'] && $item['sourceType'] == 1)) {
                $friendIds = $item['sourceFriends'];
                $friendsInfo = [];

                if (!empty($friendIds)) {
                    // 查询好友信息，使用wechat_friend表
                    $friendsInfo = Db::name('wechat_friend')->alias('wf')
                        ->field('wf.id,wf.wechatId, wa.nickname, wa.avatar')
                        ->join('wechat_account wa', 'wf.wechatId = wa.wechatId')
                        ->whereIn('wf.id', $friendIds)
                        ->select();
                }

                // 将好友信息添加到返回数据中
                $item['selectedFriends'] = $friendsInfo;
            }

            // 获取群组详细信息
            if (!empty($item['sourceGroups']) && $item['sourceType'] == 2) {
                $groupIds = $item['sourceGroups'];
                $groupsInfo = [];

                if (!empty($groupIds)) {
                    // 查询群组信息
                    $groupsInfo = Db::name('wechat_group')->alias('g')
                        ->field('g.id, g.chatroomId, g.name, g.avatar, g.ownerWechatId')
                        ->whereIn('g.id', $groupIds)
                        ->select();
                }

                // 将群组信息添加到返回数据中
                $item['selectedGroups'] = $groupsInfo;
            }

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
        ->field('id,name,sourceType,sourceFriends,sourceGroups,keywordInclude,keywordExclude,aiEnabled,aiPrompt,timeEnabled,timeStart,timeEnd,status,userId,companyId,createTime,updateTime,groupMembers')
        ->find();

        if (empty($library)) {
            return json(['code' => 404, 'msg' => '内容库不存在']);
        }

        // 处理JSON字段转数组
        $library['sourceFriends'] = json_decode($library['sourceFriends'] ?: '[]', true);
        $library['sourceGroups'] = json_decode($library['sourceGroups'] ?: '[]', true);
        $library['keywordInclude'] = json_decode($library['keywordInclude'] ?: '[]', true);
        $library['keywordExclude'] = json_decode($library['keywordExclude'] ?: '[]', true);
        $library['groupMembers'] = json_decode($library['groupMembers'] ?: '[]', true);

    // 将时间戳转换为日期格式（精确到日）
    if (!empty($library['timeStart'])) {
        $library['timeStart'] = date('Y-m-d', $library['timeStart']);
    }
    if (!empty($library['timeEnd'])) {
        $library['timeEnd'] = date('Y-m-d', $library['timeEnd']);
    }

    // 获取好友详细信息
    if (!empty($library['sourceFriends'])) {
        $friendIds = $library['sourceFriends'];
        $friendsInfo = [];
        
        if (!empty($friendIds)) {
           // 查询好友信息，使用wechat_friend表
            $friendsInfo = Db::name('wechat_friend')->alias('wf')
            ->field('wf.id,wf.wechatId, wa.nickname, wa.avatar')
            ->join('wechat_account wa', 'wf.wechatId = wa.wechatId')
            ->whereIn('wf.id', $friendIds)
            ->select();
        }
        
        // 将好友信息添加到返回数据中
        $library['selectedFriends'] = $friendsInfo;
    }

    // 获取群组详细信息
    if (!empty($library['sourceGroups'])) {
        $groupIds = $library['sourceGroups'];
        $groupsInfo = [];
        
        if (!empty($groupIds)) {
            // 查询群组信息
            $groupsInfo = Db::name('wechat_group')->alias('g')
                ->field('g.id, g.chatroomId, g.name, g.avatar, g.ownerWechatId,wa.nickname as ownerNickname,wa.avatar as ownerAvatar,wa.alias as ownerAlias')
                ->join('wechat_account wa', 'g.ownerWechatId = wa.wechatId')
                ->whereIn('g.id', $groupIds)
                ->select();
        }
        
        // 将群组信息添加到返回数据中
        $library['selectedGroups'] = $groupsInfo;
    }

        return json([
            'code' => 200, 
            'msg' => '获取成功', 
            'data' => $library
        ]);
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

            $keywordInclude = isset($param['keywordInclude']) ? json_encode($param['keywordInclude'],256) : json_encode([]);
            $keywordExclude = isset($param['keywordExclude']) ? json_encode($param['keywordExclude'],256) : json_encode([]);


            // 更新内容库基本信息
            $library->name = $param['name'];
            $library->sourceType = isset($param['sourceType']) ? $param['sourceType'] : 1;
            $library->sourceFriends = $param['sourceType'] == 1 ? json_encode($param['friends']) : json_encode([]);
            $library->sourceGroups = $param['sourceType'] == 2 ? json_encode($param['groups']) : json_encode([]);
            $library->groupMembers = $param['sourceType'] == 2 ? json_encode($param['groupMembers']) : json_encode([]);
            $library->keywordInclude = $keywordInclude;
            $library->keywordExclude = $keywordExclude;
            $library->aiEnabled = isset($param['aiEnabled']) ? $param['aiEnabled'] : 0;
            $library->aiPrompt = isset($param['aiPrompt']) ? $param['aiPrompt'] : '';
            $library->timeEnabled = isset($param['timeEnabled']) ? $param['timeEnabled'] : 0;
            $library->timeStart = isset($param['startTime']) ? strtotime($param['startTime']) : 0;
            $library->timeEnd = isset($param['endTime']) ? strtotime($param['endTime']) : 0;
            $library->status = isset($param['status']) ? $param['status'] : 0;
            $library->updateTime = time();
            

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

    /************************************
     * 内容项目管理功能
     ************************************/

    /**
     * 获取内容库素材列表
     * @return \think\response\Json
     */
    public function getItemList()
    {
        $page = $this->request->param('page', 1);
        $limit = $this->request->param('limit', 10);
        $libraryId = $this->request->param('libraryId', 0);
        $keyword = $this->request->param('keyword', ''); // 搜索关键词

        if (empty($libraryId)) {
            return json(['code' => 400, 'msg' => '内容库ID不能为空']);
        }

        // 验证内容库权限
        $library = ContentLibrary::where([
            ['id', '=', $libraryId],
            ['userId', '=', $this->request->userInfo['id']],
            ['isDel', '=', 0]
        ])->find();

        if (empty($library)) {
            return json(['code' => 404, 'msg' => '内容库不存在或无权限访问']);
        }

        // 构建查询条件
        $where = [
            ['libraryId', '=', $libraryId],
            ['isDel', '=', 0]
        ];


        // 关键词搜索
        if (!empty($keyword)) {
            $where[] = ['content', 'like', '%' . $keyword . '%'];
        }

        // 查询数据
        $list = ContentItem::where($where)
            ->field('id,type,title,content,coverImage,resUrls,urls,createTime,createMomentTime,createMessageTime,wechatId,friendId,wechatChatroomId,senderNickname,location,lat,lng')
            ->order('createTime', 'desc')
            ->page($page, $limit)
            ->select();

        // 处理数据
        foreach ($list as &$item) {
            // 处理资源URL
            $item['resUrls'] = json_decode($item['resUrls'] ?: '[]', true);
            $item['urls'] = json_decode($item['urls'] ?: '[]', true);
            
            // 格式化时间
            //$item['createTime'] = date('Y-m-d H:i:s', $item['createTime']);
            if ($item['createMomentTime']) {
                $item['time'] = date('Y-m-d H:i:s', $item['createMomentTime']);
            }
            if ($item['createMessageTime']) {
                $item['time'] = date('Y-m-d H:i:s', $item['createMessageTime']);
            }

            // 获取发送者信息
            if ($item['type'] == 'moment' && $item['friendId']) {
                $friendInfo = Db::name('wechat_friend')
                    ->alias('wf')
                    ->join('wechat_account wa', 'wf.wechatId = wa.wechatId')
                    ->where('wf.id', $item['friendId'])
                    ->field('wa.nickname, wa.avatar')
                    ->find();
                $item['senderNickname'] = $friendInfo['nickname'] ?: '';
            }
        }
        unset($item);

        // 获取总数
        $total = ContentItem::where($where)->count();

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
        
        // 当类型为群消息时，限制图片只能上传一张
        if ($param['type'] == 'group_message') {
            $images = isset($param['images']) ? $param['images'] : [];
            if (is_string($images)) {
                $images = json_decode($images, true);
            }
            
            if (count($images) > 1) {
                return json(['code' => 400, 'msg' => '群消息类型只能上传一张图片']);
            }
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
    public function deleteItem()
    {

        $id = $this->request->param('id', 0);
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
            $service = new \app\cunkebao\service\ContentItemService();
            $result = $service->deleteItem($id);
            if ($result['code'] != 200) {
                return json($result);
            }

            return json(['code' => 200, 'msg' => '删除成功']);
        } catch (\Exception $e) {
            return json(['code' => 500, 'msg' => '删除失败：' . $e->getMessage()]);
        }
    }

    /**
     * 获取内容项目详情
     * @return \think\response\Json
     */
    public function getItemDetail()
    {
        $id = $this->request->param('id', 0);
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        // 查询内容项目是否存在并检查权限
        $item = ContentItem::alias('i')
            ->join('content_library l', 'i.libraryId = l.id')
            ->where([
                ['i.id', '=', $id],
                ['l.userId', '=', $this->request->userInfo['id']],
                ['i.isDel', '=', 0]
            ])
            ->field('i.*')
            ->find();

        if (empty($item)) {
            return json(['code' => 404, 'msg' => '内容项目不存在或无权限访问']);
        }

        // 处理数据
        // 处理资源URL
        $item['resUrls'] = json_decode($item['resUrls'] ?: '[]', true);
        $item['urls'] = json_decode($item['urls'] ?: '[]', true);
        
        // 添加内容类型的文字描述
        $contentTypeMap = [
            0 => '未知',
            1 => '图片',
            2 => '链接',
            3 => '视频',
            4 => '文本',
            5 => '小程序',
            6 => '图文'
        ];
        $item['contentTypeName'] = $contentTypeMap[$item['contentType'] ?? 0] ?? '未知';
        
        // 格式化时间
        if ($item['createMomentTime']) {
            $item['createMomentTimeFormatted'] = date('Y-m-d H:i:s', $item['createMomentTime']);
        }
        if ($item['createMessageTime']) {
            $item['createMessageTimeFormatted'] = date('Y-m-d H:i:s', $item['createMessageTime']);
        }
        //$item['createTimeFormatted'] = date('Y-m-d H:i:s', $item['createTime']);

        // 获取发送者信息
        if ($item['type'] == 'moment' && $item['friendId']) {
            $friendInfo = Db::name('wechat_friend')
                ->alias('wf')
                ->join('wechat_account wa', 'wf.wechatId = wa.wechatId')
                ->where('wf.id', $item['friendId'])
                ->field('wa.nickname, wa.avatar')
                ->find();
            $item['senderInfo'] = $friendInfo ?: [];
        } elseif ($item['type'] == 'group_message' && $item['wechatChatroomId']) {
            // 获取群组信息
            $groupInfo = Db::name('wechat_group')
                ->where('id', $item['wechatChatroomId'])
                ->field('name, avatar')
                ->find();
            $item['groupInfo'] = $groupInfo ?: [];
        }

        return json([
            'code' => 200, 
            'msg' => '获取成功', 
            'data' => $item
        ]);
    }

    /************************************
     * 数据采集相关功能
     ************************************/
    
    /**
     * 执行朋友圈采集任务
     * @return \think\response\Json
     */
    public function collectMoments()
    {
        // 查询条件：未删除且已开启的内容库
        $where = [
            ['isDel', '=', 0],      // 未删除
            ['status', '=', 1]       // 已开启
        ];
        
        // 查询符合条件的内容库
        $libraries = ContentLibrary::where($where)
            ->field('id,name,sourceType,sourceFriends,sourceGroups,keywordInclude,keywordExclude,aiEnabled,aiPrompt,timeEnabled,timeStart,timeEnd,status,userId,companyId,createTime,updateTime,groupMembers')
            ->order('id', 'desc')
            ->select()->toArray();

        if (empty($libraries)) {
            return json(['code' => 200, 'msg' => '没有可用的内容库配置']);
        }
        
        $successCount = 0;
        $failCount = 0;
        $results = [];
        
        // 处理每个内容库的采集任务
        foreach ($libraries as $library) {
            try {
                // 解析JSON字段
                $library['sourceFriends'] = json_decode($library['sourceFriends'] ?: '[]', true);
                $library['sourceGroups'] = json_decode($library['sourceGroups'] ?: '[]', true);
                $library['keywordInclude'] = json_decode($library['keywordInclude'] ?: '[]', true);
                $library['keywordExclude'] = json_decode($library['keywordExclude'] ?: '[]', true);
                $library['groupMembers'] = json_decode($library['groupMembers'] ?: '[]', true);
                
                // 根据数据来源类型执行不同的采集逻辑
                $collectResult = [];
                switch ($library['sourceType']) {
                    case 1: // 好友类型
                        if (!empty($library['sourceFriends'])) {
                            $collectResult = $this->collectFromFriends($library);
                        }
                        break;
                        
                    case 2: // 群类型
                        if (!empty($library['sourceGroups'])) {
                            $collectResult = $this->collectFromGroups($library);
                        }
                        break;
                        
                    default:
                        $collectResult = [
                            'status' => 'failed',
                            'message' => '不支持的数据来源类型'
                        ];
                }
                
                if ($collectResult['status'] == 'success') {
                    $successCount++;
                } else {
                    $failCount++;
                }
                
                $results[] = [
                    'library_id' => $library['id'],
                    'library_name' => $library['name'],
                    'status' => $collectResult['status'],
                    'message' => $collectResult['message'] ?? '',
                    'data' => $collectResult['data'] ?? []
                ];
                
            } catch (\Exception $e) {
                $failCount++;
                $results[] = [
                    'library_id' => $library['id'],
                    'library_name' => $library['name'],
                    'status' => 'error',
                    'message' => $e->getMessage()
                ];
            }
        }
        
        // 返回采集结果
        return json([
            'code' => 200,
            'msg' => '采集任务执行完成',
            'data' => [
                'total' => count($libraries),
                'success' => $successCount,
                'fail' => $failCount,
                'results' => $results
            ]
        ]);
    }
    
    /**
     * 从好友采集朋友圈内容
     * @param array $library 内容库配置
     * @return array 采集结果
     */
    private function collectFromFriends($library)
    {
        $friendIds = $library['sourceFriends'];
        if (empty($friendIds)) {
            return [
                'status' => 'failed',
                'message' => '没有指定要采集的好友'
            ];
        }
        
        try {
            // 查询好友信息
            $friends = Db::table('s2_wechat_friend')
                ->field('id, wechatAccountId, wechatId')
                ->whereIn('id', $friendIds)
                ->where('isDeleted', 0)
                ->select();
            

            if (empty($friends)) {
                return [
                    'status' => 'failed',
                    'message' => '未找到有效的好友信息'
                ];
            }
            
            // 从朋友圈采集内容
            $collectedData = [];
            $totalMomentsCount = 0;
            
            foreach ($friends as $friend) {
                // 从s2_wechat_moments表获取朋友圈数据
                $moments = Db::table('s2_wechat_moments')
                    ->where([
                        'wechatFriendId' => $friend['id'],
                        'wechatAccountId' => $friend['wechatAccountId']
                    ])
                    ->order('createTime', 'desc')
                    ->select();
                
                if (empty($moments)) {
                    continue;
                }
                
                // 获取好友详细信息
                $friendInfo = Db::table('s2_wechat_friend')
                    ->where('wechatId', $friend['wechatId'])
                    ->field('nickname, avatar')
                    ->find();
                    
                $nickname = $friendInfo['nickname'] ?? '未知好友';
                $friendMomentsCount = 0;
                
                // 处理每条朋友圈数据
                foreach ($moments as $moment) {
                    // 处理关键词过滤
                    $content = $moment['content'] ?? '';
                    
                    // 如果启用了关键词过滤
                    $includeKeywords = $library['keywordInclude'];
                    $excludeKeywords = $library['keywordExclude'];
                    
                    // 检查是否包含必须关键词
                    $includeMatch = empty($includeKeywords);
                    if (!empty($includeKeywords)) {
                        foreach ($includeKeywords as $keyword) {
                            if (strpos($content, $keyword) !== false) {
                                $includeMatch = true;
                                break;
                            }
                        }
                    }
                    
                    // 如果不满足包含条件，跳过
                    if (!$includeMatch) {
                        continue;
                    }
                    
                    // 检查是否包含排除关键词
                    $excludeMatch = false;
                    if (!empty($excludeKeywords)) {
                        foreach ($excludeKeywords as $keyword) {
                            if (strpos($content, $keyword) !== false) {
                                $excludeMatch = true;
                                break;
                            }
                        }
                    }
                    
                    // 如果满足排除条件，跳过
                    if ($excludeMatch) {
                        continue;
                    }
                    
                    // 保存到内容库的content_item表
                    $this->saveMomentToContentItem($moment, $library['id'], $friend, $nickname);
                    
                    $friendMomentsCount++;
                }
                
                if ($friendMomentsCount > 0) {
                    // 记录采集结果
                    $collectedData[$friend['wechatId']] = [
                        'friendId' => $friend['id'],
                        'nickname' => $nickname,
                        'count' => $friendMomentsCount
                    ];
                    
                    $totalMomentsCount += $friendMomentsCount;
                }
            }
            
            // 如果启用了AI处理
            if ($library['aiEnabled'] == 1 && !empty($library['aiPrompt']) && $totalMomentsCount > 0) {
                // 此处实现AI处理逻辑，暂未实现
            }
            
            if (empty($collectedData)) {
                return [
                    'status' => 'warning',
                    'message' => '未采集到任何朋友圈内容'
                ];
            }
            
            return [
                'status' => 'success',
                'message' => '成功采集到' . count($collectedData) . '位好友的' . $totalMomentsCount . '条朋友圈内容',
                'data' => [
                    'friend_count' => count($collectedData),
                    'collected_count' => $totalMomentsCount,
                    'details' => $collectedData
                ]
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => '采集过程发生错误: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * 从群组采集消息内容
     * @param array $library 内容库配置
     * @return array 采集结果
     */
    private function collectFromGroups($library)
    {
        $groupIds = $library['sourceGroups'];
        if (empty($groupIds)) {
            return [
                'status' => 'failed',
                'message' => '没有指定要采集的群组'
            ];
        }
        
        try {
            // 查询群组信息
            $groups = Db::name('wechat_group')->alias('g')
                ->field('g.id, g.chatroomId, g.name, g.ownerWechatId')
                ->whereIn('g.id', $groupIds)
                ->where('g.deleteTime', 0)
                ->select();
            
            if (empty($groups)) {
                return [
                    'status' => 'failed',
                    'message' => '未找到有效的群组信息'
                ];
            }
            
            // 获取群成员信息
            $groupMembers = $library['groupMembers'];
            if (empty($groupMembers)) {
                // 如果没有指定群成员，则尝试获取所有群成员
                return [
                    'status' => 'failed',
                    'message' => '未找到有效的群成员信息'
                ];
            }
            
            // 从群组采集内容
            $collectedData = [];
            $totalMessagesCount = 0;
            $chatroomIds = array_column($groups, 'id');
            
            // 获取群消息 - 支持时间范围过滤
            $messageWhere = [
                ['wechatChatroomId', 'in', $chatroomIds],
                ['type', '=', 2]
            ];
            
            // 如果启用时间限制
            if ($library['timeEnabled'] && $library['timeStart'] > 0 && $library['timeEnd'] > 0) {
                $messageWhere[] = ['createTime', 'between', [$library['timeStart'], $library['timeEnd']]];
            }
            
            // 查询群消息
            $groupMessages = Db::table('s2_wechat_message')
                ->where($messageWhere)
                ->order('createTime', 'desc')
                ->limit(500) // 限制最大消息数量
                ->select();
            if (empty($groupMessages)) {
                return [
                    'status' => 'warning',
                    'message' => '未找到符合条件的群消息'
                ];
            }
            // 按群组分组处理消息
            $groupedMessages = [];
            foreach ($groupMessages as $message) {
                $chatroomId = $message['wechatChatroomId'];
                if (!isset($groupedMessages[$chatroomId])) {
                    $groupedMessages[$chatroomId] = [
                        'count' => 0,
                        'messages' => []
                    ];
                }
                
                // 处理消息内容
                $content = $message['content'] ?? '';
                
                // 如果启用了关键词过滤
                $includeKeywords = $library['keywordInclude'];
                $excludeKeywords = $library['keywordExclude'];
                

                // 检查是否包含必须关键词
                $includeMatch = empty($includeKeywords);
                if (!empty($includeKeywords)) {
                    foreach ($includeKeywords as $keyword) {
                        if (strpos($content, $keyword) !== false) {
                            $includeMatch = true;
                            break;
                        }
                    }
                }
                
                // 如果不满足包含条件，跳过
                if (!$includeMatch) {
                    continue;
                }
                
                // 检查是否包含排除关键词
                $excludeMatch = false;
                if (!empty($excludeKeywords)) {
                    foreach ($excludeKeywords as $keyword) {
                        if (strpos($content, $keyword) !== false) {
                            $excludeMatch = true;
                            break;
                        }
                    }
                }
                
                // 如果满足排除条件，跳过
                if ($excludeMatch) {
                    continue;
                }
                
                // 找到对应的群组信息
                $groupInfo = null;
                foreach ($groups as $group) {
                    if ($group['id'] == $chatroomId) {
                        $groupInfo = $group;
                        break;
                    }
                }
                
                if (!$groupInfo) {
                    continue;
                }

                // 保存消息到内容库
                $this->saveMessageToContentItem($message, $library['id'], $groupInfo);
                
                // 累计计数
                $groupedMessages[$chatroomId]['count']++;
                $groupedMessages[$chatroomId]['messages'][] = [
                    'id' => $message['id'],
                    'content' => mb_substr($content, 0, 50) . (mb_strlen($content) > 50 ? '...' : ''),
                    'sender' => $message['senderNickname'],
                    'time' => date('Y-m-d H:i:s', $message['createTime'])
                ];
                
                $totalMessagesCount++;
            }
            
            // 构建结果数据
            foreach ($groups as $group) {
                $chatroomId = $group['chatroomId'];
                if (isset($groupedMessages[$chatroomId]) && $groupedMessages[$chatroomId]['count'] > 0) {
                    $collectedData[$chatroomId] = [
                        'groupId' => $group['id'],
                        'groupName' => $group['name'],
                        'count' => $groupedMessages[$chatroomId]['count'],
                        'messages' => $groupedMessages[$chatroomId]['messages']
                    ];
                }
            }
            
            // 如果启用了AI处理
            if ($library['aiEnabled'] == 1 && !empty($library['aiPrompt']) && $totalMessagesCount > 0) {
                // 此处实现AI处理逻辑，暂未实现
            }
            
            if (empty($collectedData)) {
                return [
                    'status' => 'warning',
                    'message' => '未采集到符合条件的群消息内容'
                ];
            }
            
            return [
                'status' => 'success',
                'message' => '成功采集到' . count($collectedData) . '个群的' . $totalMessagesCount . '条消息',
                'data' => [
                    'group_count' => count($collectedData),
                    'collected_count' => $totalMessagesCount,
                    'details' => $collectedData
                ]
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => '采集过程发生错误: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * 判断内容类型
     * @param string $content 内容文本
     * @param array $resUrls 资源URL数组
     * @param array $urls URL数组
     * @return int 内容类型: 0=未知, 1=图片, 2=链接, 3=视频, 4=文本, 5=小程序, 6=图文
     */
    private function determineContentType($content, $resUrls = [], $urls = [])
    {
        // 判断是否为空
        if (empty($content) && empty($resUrls) && empty($urls)) {
            return 0; // 未知类型
        }
        
        // 判断是否有小程序信息
        if (strpos($content, '小程序') !== false || strpos($content, 'appid') !== false) {
            return 5; // 小程序
        }
        
        // 检查资源URL中是否有视频或图片
        $hasVideo = false;
        $hasImage = false;
        
        if (!empty($resUrls)) {
            foreach ($resUrls as $url) {
                // 检查是否为视频文件
                if (stripos($url, '.mp4') !== false || 
                    stripos($url, '.mov') !== false || 
                    stripos($url, '.avi') !== false ||
                    stripos($url, '.wmv') !== false ||
                    stripos($url, '.flv') !== false ||
                    stripos($url, 'video') !== false) {
                    $hasVideo = true;
                    break; // 一旦发现视频文件，立即退出循环
                }
                
                // 检查是否为图片文件
                if (stripos($url, '.jpg') !== false || 
                    stripos($url, '.jpeg') !== false || 
                    stripos($url, '.png') !== false || 
                    stripos($url, '.gif') !== false || 
                    stripos($url, '.webp') !== false || 
                    stripos($url, '.bmp') !== false ||
                    stripos($url, 'image') !== false) {
                    $hasImage = true;
                    // 不退出循环，继续检查是否有视频（视频优先级更高）
                }
            }
        }
        
        // 如果发现视频文件，判定为视频类型
        if ($hasVideo) {
            return 3; // 视频
        }
        
        // 优先判断内容文本
        // 如果有文本内容(不仅仅是链接)
        if (!empty($content)) {
            // 判断内容是否主要为文本(排除链接部分)
            $contentWithoutUrls = $content;
            if (!empty($urls)) {
                foreach ($urls as $url) {
                    $contentWithoutUrls = str_replace($url, '', $contentWithoutUrls);
                }
            }
            
            // 如果去除链接后仍有文本内容(不考虑长度)
            if (!empty(trim($contentWithoutUrls))) {
                // 判断是否为图文类型
                if ($hasImage) {
                    return 6; // 图文
                } else {
                    return 4; // 纯文本
                }
            }
        }
        
        // 判断是否为图片类型
        if ($hasImage) {
            return 1; // 图片
        }
        
        // 判断是否为链接类型
        if (!empty($urls)) {
            return 2; // 链接
        }
        
        // 默认为文本类型
        return 4; // 文本
    }

    /**
     * 保存朋友圈数据到内容项目表
     * @param array $moment 朋友圈数据
     * @param int $libraryId 内容库ID
     * @param array $friend 好友信息
     * @param string $nickname 好友昵称
     * @return bool 是否保存成功
     */
    private function saveMomentToContentItem($moment, $libraryId, $friend, $nickname)
    {
        if (empty($moment) || empty($libraryId)) {
            return false;
        }


        try {
            
            // 检查朋友圈数据是否已存在于内容项目中
            $exists = ContentItem::where('libraryId', $libraryId)
                ->where('snsId', $moment['snsId'] ?? '')
                ->find();
                
            if ($exists) {
                return true;
            }
            
            // 解析资源URL (可能是JSON字符串)
            $resUrls = $moment['resUrls'];
            if (is_string($resUrls)) {
                $resUrls = json_decode($resUrls, true);
            }
            
            // 处理urls字段
            $urls = $moment['urls'] ?? [];
            if (is_string($urls)) {
                $urls = json_decode($urls, true);
            }
            
            // 构建封面图片
            $coverImage = '';
            if (!empty($resUrls) && is_array($resUrls) && count($resUrls) > 0) {
                $coverImage = $resUrls[0];
            }
            
            // 判断内容类型 (0=未知, 1=图片, 2=链接, 3=视频, 4=文本, 5=小程序, 6=图文)
            $contentType = $this->determineContentType($moment['content'] ?? '', $resUrls, $urls);
            
            // 如果不存在，则创建新的内容项目
            $item = new ContentItem();
            $item->libraryId = $libraryId;
            $item->type = 'moment'; // 朋友圈类型
            $item->title = '来自 ' . $nickname . ' 的朋友圈';
            $item->contentData = json_encode($moment, JSON_UNESCAPED_UNICODE);
            $item->snsId = $moment['snsId'] ?? ''; // 存储snsId便于后续查询
            $item->createTime = time();
            $item->wechatId = $friend['wechatId'];
            $item->friendId = $friend['id'];
            $item->createMomentTime = $moment['createTime'] ?? 0;
            $item->content = $moment['content'] ?? '';
            $item->coverImage = $coverImage;
            $item->contentType = $contentType; // 设置内容类型
            
            // 独立存储resUrls和urls字段
            $item->resUrls = is_string($moment['resUrls']) ? $moment['resUrls'] : json_encode($resUrls, JSON_UNESCAPED_UNICODE);
            $item->urls = is_string($moment['urls']) ? $moment['urls'] : json_encode($urls, JSON_UNESCAPED_UNICODE);
            
            // 保存地理位置信息
            $item->location = $moment['location'] ?? '';
            $item->lat = $moment['lat'] ?? 0;
            $item->lng = $moment['lng'] ?? 0;
            $item->save();
            return true;
        } catch (\Exception $e) {
            // 记录错误日志
            \think\facade\Log::error('保存朋友圈数据失败: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 保存群聊消息到内容项目表
     * @param array $message 消息数据
     * @param int $libraryId 内容库ID
     * @param array $group 群组信息
     * @return bool 是否保存成功
     */
    private function saveMessageToContentItem($message, $libraryId, $group)
    {
        if (empty($message) || empty($libraryId)) {
            return false;
        }

        try {
            // 检查消息是否已存在于内容项目中
            $exists = ContentItem::where('libraryId', $libraryId)
                ->where('msgId', $message['msgSvrId'] ?? '')
                ->find();

            if ($exists) {
                return true;
            }
            
            // 提取消息内容中的链接
            $content = $message['content'] ?? '';
            $links = [];
            $pattern = '/https?:\/\/[-A-Za-z0-9+&@#\/%?=~_|!:,.;]+[-A-Za-z0-9+&@#\/%=~_|]/';
            preg_match_all($pattern, $content, $matches);
            
            if (!empty($matches[0])) {
                $links = $matches[0];
            }
            
            // 提取可能的图片URL
            $resUrls = [];
            if (isset($message['imageUrl']) && !empty($message['imageUrl'])) {
                $resUrls[] = $message['imageUrl'];
            }
            
            // 判断内容类型 (0=未知, 1=图片, 2=链接, 3=视频, 4=文本, 5=小程序, 6=图文)
            $contentType = $this->determineContentType($content, $resUrls, $links);
            
            // 创建新的内容项目
            $item = new ContentItem();
            $item->libraryId = $libraryId;
            $item->type = 'group_message'; // 群消息类型
            $item->title = '来自 ' . ($group['name'] ?? '未知群组') . ' 的消息';
            $item->contentData = json_encode($message, JSON_UNESCAPED_UNICODE);
            $item->msgId = $message['msgId'] ?? ''; // 存储msgId便于后续查询
            $item->createTime = time();
            $item->content = $content;
            $item->contentType = $contentType; // 设置内容类型
            
            // 设置发送者信息
            $item->wechatId = $message['senderWechatId'] ?? '';
            $item->wechatChatroomId = $message['wechatChatroomId'] ?? '';
            $item->senderNickname = $message['senderNickname'] ?? '';
            $item->createMessageTime = $message['createTime'] ?? 0;
            
            // 处理资源URL
            if (!empty($resUrls)) {
                $item->resUrls = json_encode($resUrls, JSON_UNESCAPED_UNICODE);
                // 设置封面图片
                if (!empty($resUrls[0])) {
                    $item->coverImage = $resUrls[0];
                }
            }
            
            // 处理链接
            if (!empty($links)) {
                $item->urls = json_encode($links, JSON_UNESCAPED_UNICODE);
            }
            
            // 设置商品信息（需根据消息内容解析）
            $this->extractProductInfo($item, $content);
            
            $item->save();
            return true;
        } catch (\Exception $e) {
            // 记录错误日志
            \think\facade\Log::error('保存群消息数据失败: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 从消息内容中提取商品信息
     * @param ContentItem $item 内容项目对象
     * @param string $content 消息内容
     * @return void
     */
    private function extractProductInfo($item, $content)
    {
        // 尝试提取商品名称
        $titlePatterns = [
            '/【(.+?)】/',  // 匹配【】中的内容
            '/《(.+?)》/',  // 匹配《》中的内容
            '/商品名称[:：](.+?)[\r\n]/' // 匹配"商品名称:"后的内容
        ];
        
        foreach ($titlePatterns as $pattern) {
            preg_match($pattern, $content, $matches);
            if (!empty($matches[1])) {
                $item->productTitle = trim($matches[1]);
                break;
            }
        }
        
        // 如果没有找到商品名称，尝试使用内容的前部分作为标题
        if (empty($item->productTitle)) {
            // 获取第一行非空内容作为标题
            $lines = explode("\n", $content);
            foreach ($lines as $line) {
                $line = trim($line);
                if (!empty($line) && mb_strlen($line) > 2) {
                    $item->productTitle = mb_substr($line, 0, 30);
                    break;
                }
            }
        }
    }
    
    /**
     * 获取朋友圈数据
     * @param string $wechatId 微信ID
     * @return array 朋友圈数据
     */
    private function getMomentsData($wechatId)
    {
        // 这里应该是实际从API或数据库获取朋友圈数据的逻辑
        // 这里仅作示例返回
        return [
            // 示例数据
            ['id' => 1, 'content' => '今天天气真好！', 'createTime' => time() - 3600],
            ['id' => 2, 'content' => '分享一个有趣的项目', 'createTime' => time() - 7200],
        ];
    }
    
    /**
     * 根据关键词过滤朋友圈内容
     * @param array $moments 朋友圈内容
     * @param array $includeKeywords 包含关键词
     * @param array $excludeKeywords 排除关键词
     * @return array 过滤后的内容
     */
    private function filterMomentsByKeywords($moments, $includeKeywords, $excludeKeywords)
    {
        if (empty($moments)) {
            return [];
        }
        
        $filtered = [];
        foreach ($moments as $moment) {
            $content = $moment['content'] ?? '';
            
            // 如果内容为空，跳过
            if (empty($content)) {
                continue;
            }
            
            // 检查是否包含必须关键词
            $includeMatch = empty($includeKeywords);
            if (!empty($includeKeywords)) {
                foreach ($includeKeywords as $keyword) {
                    if (strpos($content, $keyword) !== false) {
                        $includeMatch = true;
                        break;
                    }
                }
            }
            
            // 如果不满足包含条件，跳过
            if (!$includeMatch) {
                continue;
            }
            
            // 检查是否包含排除关键词
            $excludeMatch = false;
            if (!empty($excludeKeywords)) {
                foreach ($excludeKeywords as $keyword) {
                    if (strpos($content, $keyword) !== false) {
                        $excludeMatch = true;
                        break;
                    }
                }
            }
            
            // 如果满足排除条件，跳过
            if ($excludeMatch) {
                continue;
            }
            
            // 通过所有过滤，添加到结果中
            $filtered[] = $moment;
        }
        
        return $filtered;
    }
    
    /**
     * 使用AI处理采集的数据
     * @param array $data 采集的数据
     * @param string $prompt AI提示词
     * @return array 处理后的数据
     */
    private function processWithAI($data, $prompt)
    {
        // 这里应该是调用AI处理数据的逻辑
        // 实际实现需要根据具体的AI API
        return $data;
    }
    
    /**
     * 保存采集的数据到内容项目
     * @param array $data 采集的数据
     * @param int $libraryId 内容库ID
     * @return bool 是否保存成功
     */
    private function saveCollectedData($data, $libraryId)
    {
        if (empty($data) || empty($libraryId)) {
            return false;
        }
        
        try {
            foreach ($data as $wechatId => $userData) {
                foreach ($userData['moments'] as $moment) {
                    // 创建内容项目
                    $item = new ContentItem;
                    $item->libraryId = $libraryId;
                    $item->type = 'moment'; // 朋友圈类型
                    $item->title = '来自 ' . $userData['nickname'] . ' 的朋友圈';
                    $item->contentData = json_encode($moment);
                    $item->createTime = time();
                    $item->save();
                }
            }
            return true;
        } catch (\Exception $e) {
            // 记录错误日志
            \think\facade\Log::error('保存采集数据失败: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 获取所有群成员
     * @param array $groupIds 群组ID列表
     * @return array 群成员列表
     */
    private function getAllGroupMembers($groupIds)
    {
        if (empty($groupIds)) {
            return [];
        }
        
        try {
            // 查询群成员信息
            $members = Db::name('wechat_group_member')->alias('gm')
                ->field('gm.id, gm.memberId, gm.groupId, wa.nickname')
                ->join('wechat_account wa', 'gm.memberId = wa.wechatId')
                ->whereIn('gm.groupId', $groupIds)
                ->where('gm.isDel', 0)
                ->select();
                
            return $members;
        } catch (\Exception $e) {
            \think\facade\Log::error('获取群成员失败: ' . $e->getMessage());
            return [];
        }
    }
} 