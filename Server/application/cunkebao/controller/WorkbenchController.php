<?php

namespace app\cunkebao\controller;

use app\cunkebao\model\Workbench;
use app\cunkebao\model\WorkbenchAutoLike;
use app\cunkebao\model\WorkbenchMomentsSync;
use app\cunkebao\model\WorkbenchGroupPush;
use app\cunkebao\model\WorkbenchGroupCreate;
use app\cunkebao\validate\Workbench as WorkbenchValidate;
use think\Controller;
use think\Db;

/**
 * 工作台控制器
 */
class WorkbenchController extends Controller
{
    /**
     * 工作台类型定义
     */
    const TYPE_AUTO_LIKE = 1;      // 自动点赞
    const TYPE_MOMENTS_SYNC = 2;    // 朋友圈同步
    const TYPE_GROUP_PUSH = 3;      // 群消息推送
    const TYPE_GROUP_CREATE = 4;    // 自动建群

    /**
     * 创建工作台
     * @return \think\response\Json
     */
    public function create()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 400, 'msg' => '请求方式错误']);
        }

        // 获取登录用户信息
        $userInfo = request()->userInfo;

        // 获取请求参数
        $param = $this->request->post();

        // 验证数据
        $validate = new WorkbenchValidate;
        if (!$validate->scene('create')->check($param)) {
            return json(['code' => 400, 'msg' => $validate->getError()]);
        }

        Db::startTrans();
        try {
            // 创建工作台基本信息
            $workbench = new Workbench;
            $workbench->name = $param['name'];
            $workbench->type = $param['type'];
            $workbench->status = 1;
            $workbench->autoStart = !empty($param['autoStart']) ? 1 : 0;
            $workbench->userId = $userInfo['id'];
            $workbench->companyId = $userInfo['companyId'];
            $workbench->createTime = time();
            $workbench->updateTime = time();
            $workbench->save();

            // 根据类型创建对应的配置
            switch ($param['type']) {
                case self::TYPE_AUTO_LIKE: // 自动点赞
                    $config = new WorkbenchAutoLike;
                    $config->workbenchId = $workbench->id;
                    $config->interval = $param['interval'];
                    $config->maxLikes = $param['maxLikes'];
                    $config->startTime = $param['startTime'];
                    $config->endTime = $param['endTime'];
                    $config->contentTypes = json_encode($param['contentTypes']);
                    $config->devices = json_encode($param['devices']);
                    $config->targetGroups = json_encode($param['targetGroups']);
                    $config->tagOperator = $param['tagOperator'];
                    $config->createTime = time();
                    $config->updateTime = time();
                    $config->save();
                    break;

                case self::TYPE_MOMENTS_SYNC: // 朋友圈同步
                    $config = new WorkbenchMomentsSync;
                    $config->workbenchId = $workbench->id;
                    $config->syncInterval = $param['syncInterval'];
                    $config->syncCount = $param['syncCount'];
                    $config->syncType = $param['syncType'];
                    $config->startTime = $param['startTime'];
                    $config->endTime = $param['endTime'];
                    $config->accountType = $param['accountType'];
                    $config->devices = json_encode($param['devices']);
                    $config->contentLibraries = json_encode($param['contentLibraries'] ?? []);
                    $config->createTime = time();
                    $config->updateTime = time();
                    $config->save();
                    break;

                case self::TYPE_GROUP_PUSH: // 群消息推送
                    $config = new WorkbenchGroupPush;
                    $config->workbenchId = $workbench->id;
                    $config->pushInterval = $param['pushInterval'];
                    $config->pushContent = json_encode($param['pushContent']);
                    $config->pushTime = json_encode($param['pushTime']);
                    $config->devices = json_encode($param['devices']);
                    $config->targetGroups = json_encode($param['targetGroups']);
                    $config->save();
                    break;

                case self::TYPE_GROUP_CREATE: // 自动建群
                    $config = new WorkbenchGroupCreate;
                    $config->workbenchId = $workbench->id;
                    $config->groupNamePrefix = $param['groupNamePrefix'];
                    $config->maxGroups = $param['maxGroups'];
                    $config->membersPerGroup = $param['membersPerGroup'];
                    $config->devices = json_encode($param['devices']);
                    $config->targetGroups = json_encode($param['targetGroups']);
                    $config->createTime = time();
                    $config->updateTime = time();
                    $config->save();
                    break;
            }

            Db::commit();
            return json(['code' => 200, 'msg' => '创建成功', 'data' => ['id' => $workbench->id]]);
        } catch (\Exception $e) {
            Db::rollback();
            return json(['code' => 500, 'msg' => '创建失败：' . $e->getMessage()]);
        }
    }

    /**
     * 获取工作台列表
     * @return \think\response\Json
     */
    public function getList()
    {
        $page = $this->request->param('page', 1);
        $limit = $this->request->param('limit', 10);
        $type = $this->request->param('type', '');
        $keyword = $this->request->param('name', '');

        $where = [
            ['userId', '=', $this->request->userInfo['id']],
            ['isDel', '=', 0]
        ];
        
        // 添加类型筛选
        if ($type !== '') {
            $where[] = ['type', '=', $type];
        }
        
        // 添加名称模糊搜索
        if ($keyword !== '') {
            $where[] = ['name', 'like', '%' . $keyword . '%'];
        }

        // 定义关联关系
        $with = [
            'autoLike' => function($query) {
                $query->field('workbenchId,interval,maxLikes,startTime,endTime,contentTypes,devices,targetGroups');
            },
            'momentsSync' => function($query) {
                $query->field('workbenchId,syncInterval,syncCount,syncType,startTime,endTime,accountType,devices,contentLibraries');
            },
            'user' => function($query) {
                $query->field('id,username');
            }
        ];

        $list = Workbench::where($where)
            ->with($with)
            ->field('id,name,type,status,autoStart,userId,createTime,updateTime')
            ->order('id', 'desc')
            ->page($page, $limit)
            ->select()
            ->each(function ($item) {
                // 处理配置信息
                switch ($item->type) {
                    case self::TYPE_AUTO_LIKE:
                        if (!empty($item->autoLike)) {
                            $item->config = $item->autoLike;
                            $item->config->devices = json_decode($item->config->devices, true);
                            $item->config->targetGroups = json_decode($item->config->targetGroups, true);
                            $item->config->contentTypes =  json_decode($item->config->contentTypes, true);
                        }
                        unset($item->autoLike,$item->auto_like);
                        break;
                    case self::TYPE_MOMENTS_SYNC:
                        if (!empty($item->momentsSync)) {
                            $item->config = $item->momentsSync;
                            $item->config->devices = json_decode($item->config->devices, true);
                            $item->config->contentLibraries = json_decode($item->config->contentLibraries, true);
                            
                            // 获取内容库名称
                            if (!empty($item->config->contentLibraries)) {
                                $libraryNames = \app\cunkebao\model\ContentLibrary::where('id', 'in', $item->config->contentLibraries)
                                    ->column('name');
                                $item->config->contentLibraryNames = $libraryNames;
                            } else {
                                $item->config->contentLibraryNames = [];
                            }
                        }
                        unset($item->momentsSync,$item->moments_sync);
                        break;
                    case self::TYPE_GROUP_PUSH:
                        if (!empty($item->groupPush)) {
                            $item->config = $item->groupPush;
                            $item->config->devices = json_decode($item->config->devices, true);
                            $item->config->targetGroups = json_decode($item->config->targetGroups, true);
                            $item->config->pushContent = json_decode($item->config->pushContent, true);
                            $item->config->pushTime = json_decode($item->config->pushTime, true);
                        }
                        unset($item->groupPush,$item->group_push);
                        break;
                    case self::TYPE_GROUP_CREATE:
                        if (!empty($item->groupCreate)) {
                            $item->config = $item->groupCreate;
                            $item->config->devices = json_decode($item->config->devices, true);
                            $item->config->targetGroups = json_decode($item->config->targetGroups, true);
                        }
                        unset($item->groupCreate,$item->group_create);
                        break;
                }
                // 添加创建人名称
                $item['creatorName'] = $item->user ? $item->user->username : '';
                unset($item['user']); // 移除关联数据
                return $item;
            });

        $total = Workbench::where($where)->count();

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
     * 获取工作台详情
     * @param int $id 工作台ID
     * @return \think\response\Json
     */
    public function detail()
    {
        $id = $this->request->param('id', '');

        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        // 定义关联关系
        $with = [
            'autoLike' => function($query) {
                $query->field('workbenchId,interval,maxLikes,startTime,endTime,contentTypes,devices,targetGroups');
            },
            'momentsSync' => function($query) {
                $query->field('workbenchId,syncInterval,syncCount,syncType,startTime,endTime,accountType,devices,contentLibraries');
            },
            // 'groupPush' => function($query) {
            //     $query->field('workbenchId,pushInterval,pushContent,pushTime,devices,targetGroups');
            // },
            // 'groupCreate' => function($query) {
            //     $query->field('workbenchId,groupNamePrefix,maxGroups,membersPerGroup,devices,targetGroups');
            // }
        ];

        $workbench = Workbench::where([
            ['id', '=', $id],
            ['userId', '=', $this->request->userInfo['id']],
            ['isDel', '=', 0]
        ])
        ->field('id,name,type,status,autoStart,createTime,updateTime')
        ->with($with)
        ->find();

        if (empty($workbench)) {
            return json(['code' => 404, 'msg' => '工作台不存在']);
        }

        // 处理配置信息
        switch ($workbench->type) {
            case self::TYPE_AUTO_LIKE:
                if (!empty($workbench->autoLike)) {
                    $workbench->config = $workbench->autoLike;
                    $workbench->config->devices = json_decode($workbench->config->devices, true);
                    $workbench->config->targetGroups = json_decode($workbench->config->targetGroups, true);
                    $workbench->config->contentTypes = json_decode($workbench->config->contentTypes, true);
                    unset($workbench->autoLike,$workbench->auto_like);
                }
                break;
            case self::TYPE_MOMENTS_SYNC:
                if (!empty($workbench->momentsSync)) {
                    $workbench->config = $workbench->momentsSync;
                    $workbench->config->devices = json_decode($workbench->config->devices, true);
                    $workbench->config->contentLibraries = json_decode($workbench->config->contentLibraries, true);
                    unset($workbench->momentsSync,$workbench->moments_sync);
                }
                break;
            case self::TYPE_GROUP_PUSH:
                if (!empty($workbench->groupPush)) {
                    $workbench->config = $workbench->groupPush;
                    $workbench->config->devices = json_decode($workbench->config->devices, true);
                    $workbench->config->targetGroups = json_decode($workbench->config->targetGroups, true);
                    $workbench->config->pushContent = json_decode($workbench->config->pushContent, true);
                    $workbench->config->pushTime = json_decode($workbench->config->pushTime, true);
                }
                break;
            case self::TYPE_GROUP_CREATE:
                if (!empty($workbench->groupCreate)) {
                    $workbench->config = $workbench->groupCreate;
                    $workbench->config->devices = json_decode($workbench->config->devices, true);
                    $workbench->config->targetGroups = json_decode($workbench->config->targetGroups, true);
                }
                break;
        }
        unset($workbench->autoLike, $workbench->momentsSync, $workbench->groupPush, $workbench->groupCreate);

        return json(['code' => 200, 'msg' => '获取成功', 'data' => $workbench]);
    }

    /**
     * 更新工作台
     * @return \think\response\Json
     */
    public function update()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 400, 'msg' => '请求方式错误']);
        }

        // 获取请求参数
        $param = $this->request->post();

        // 验证数据
        $validate = new WorkbenchValidate;
        if (!$validate->scene('update')->check($param)) {
            return json(['code' => 400, 'msg' => $validate->getError()]);
        }

        // 查询工作台是否存在
        $workbench = Workbench::where([
            ['id', '=', $param['id']],
            ['userId', '=', $this->request->userInfo['id']],
            ['isDel', '=', 0]
        ])->find();

        if (!$workbench) {
            return json(['code' => 404, 'msg' => '工作台不存在']);
        }

        Db::startTrans();
        try {
            // 更新工作台基本信息
            $workbench->name = $param['name'];
            $workbench->autoStart = !empty($param['autoStart']) ? 1 : 0;
            $workbench->updateTime = time();
            $workbench->save();

            // 根据类型更新对应的配置
            switch ($workbench->type) {
                case self::TYPE_AUTO_LIKE:
                    $config = WorkbenchAutoLike::where('workbenchId', $param['id'])->find();
                    if ($config) {
                        $config->interval = $param['interval'];
                        $config->maxLikes = $param['maxLikes'];
                        $config->startTime = $param['startTime'];
                        $config->endTime = $param['endTime'];
                        $config->contentTypes = json_encode($param['contentTypes']);
                        $config->devices = json_encode($param['devices']);
                        $config->targetGroups = json_encode($param['targetGroups']);
                        $config->tagOperator = $param['tagOperator'];
                        $config->updateTime = time();
                        $config->save();
                    }
                    break;

                case self::TYPE_MOMENTS_SYNC:
                    $config = WorkbenchMomentsSync::where('workbenchId', $param['id'])->find();
                    if ($config) {
                        $config->syncInterval = $param['syncInterval'];
                        $config->syncCount = $param['syncCount'];
                        $config->syncType = $param['syncType'];
                        $config->startTime = $param['startTime'];
                        $config->endTime = $param['endTime'];
                        $config->accountType = $param['accountType'];
                        $config->devices = json_encode($param['devices']);
                        $config->contentLibraries = json_encode($param['contentLibraries'] ?? []);
                        $config->updateTime = time();
                        $config->save();
                    }
                    break;

                case self::TYPE_GROUP_PUSH:
                    $config = WorkbenchGroupPush::where('workbenchId', $param['id'])->find();
                    if ($config) {
                        $config->pushInterval = $param['pushInterval'];
                        $config->pushContent = json_encode($param['pushContent']);
                        $config->pushTime = json_encode($param['pushTime']);
                        $config->devices = json_encode($param['devices']);
                        $config->targetGroups = json_encode($param['targetGroups']);
                        $config->save();
                    }
                    break;

                case self::TYPE_GROUP_CREATE:
                    $config = WorkbenchGroupCreate::where('workbenchId', $param['id'])->find();
                    if ($config) {
                        $config->groupNamePrefix = $param['groupNamePrefix'];
                        $config->maxGroups = $param['maxGroups'];
                        $config->membersPerGroup = $param['membersPerGroup'];
                        $config->devices = json_encode($param['devices']);
                        $config->targetGroups = json_encode($param['targetGroups']);
                        $config->updateTime = time();
                        $config->save();
                    }
                    break;
            }

            Db::commit();
            return json(['code' => 200, 'msg' => '更新成功']);
        } catch (\Exception $e) {
            Db::rollback();
            return json(['code' => 500, 'msg' => '更新失败：' . $e->getMessage()]);
        }
    }

    /**
     * 更新工作台状态
     * @return \think\response\Json
     */
    public function updateStatus()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 400, 'msg' => '请求方式错误']);
        }

        $param = $this->request->post();

        // 验证数据
        $validate = new WorkbenchValidate;
        if (!$validate->scene('update_status')->check($param)) {
            return json(['code' => 400, 'msg' => $validate->getError()]);
        }

        $workbench = Workbench::where([
            ['id', '=', $param['id']],
            ['userId', '=', $this->request->userInfo['id']]
        ])->find();

        if (empty($workbench)) {
            return json(['code' => 404, 'msg' => '工作台不存在']);
        }

        $workbench->status = !$workbench['status'];
        $workbench->save();

        return json(['code' => 200, 'msg' => '更新成功']);
    }

    /**
     * 删除工作台（软删除）
     */
    public function delete()
    {
        $id = $this->request->param('id');
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        $workbench = Workbench::where([
            ['id', '=', $id],
            ['userId', '=', $this->request->userInfo['id']],
            ['isDel', '=', 0]
        ])->find();

        if (!$workbench) {
            return json(['code' => 404, 'msg' => '工作台不存在']);
        }

        // 软删除
        $workbench->isDel = 1;
        $workbench->deleteTime = date('Y-m-d H:i:s');
        $workbench->save();

        return json(['code' => 200, 'msg' => '删除成功']);
    }

    /**
     * 拷贝工作台
     * @return \think\response\Json
     */
    public function copy()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 400, 'msg' => '请求方式错误']);
        }

        $id = $this->request->post('id');
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        // 验证权限并获取原数据
        $workbench = Workbench::where([
            ['id', '=', $id],
            ['userId', '=', $this->request->userInfo['id']]
        ])->find();

        if (empty($workbench)) {
            return json(['code' => 404, 'msg' => '工作台不存在']);
        }

        Db::startTrans();
        try {
            // 创建新的工作台基本信息
            $newWorkbench = new Workbench;
            $newWorkbench->name = $workbench->name . ' copy';
            $newWorkbench->type = $workbench->type;
            $newWorkbench->status = 1; // 新拷贝的默认启用
            $newWorkbench->autoStart = $workbench->autoStart;
            $newWorkbench->userId = $this->request->userInfo['id'];
            $newWorkbench->companyId = $this->request->userInfo['companyId'];
            $newWorkbench->save();

            // 根据类型拷贝对应的配置
            switch ($workbench->type) {
                case self::TYPE_AUTO_LIKE:
                    $config = WorkbenchAutoLike::where('workbenchId', $id)->find();
                    if ($config) {
                        $newConfig = new WorkbenchAutoLike;
                        $newConfig->workbenchId = $newWorkbench->id;
                        $newConfig->interval = $config->interval;
                        $newConfig->maxLikes = $config->maxLikes;
                        $newConfig->startTime = $config->startTime;
                        $newConfig->endTime = $config->endTime;
                        $newConfig->contentTypes = $config->contentTypes;
                        $newConfig->devices = $config->devices;
                        $newConfig->targetGroups = $config->targetGroups;
                        $newConfig->save();
                    }
                    break;
                case self::TYPE_MOMENTS_SYNC:
                    $config = WorkbenchMomentsSync::where('workbenchId', $id)->find();
                    if ($config) {
                        $newConfig = new WorkbenchMomentsSync;
                        $newConfig->workbenchId = $newWorkbench->id;
                        $newConfig->syncInterval = $config->syncInterval;
                        $newConfig->syncCount = $config->syncCount;
                        $newConfig->syncType = $config->syncType;
                        $newConfig->startTime = $config->startTime;
                        $newConfig->endTime = $config->endTime;
                        $newConfig->accountType = $config->accountType;
                        $newConfig->devices = $config->devices;
                        $newConfig->contentLibraries = $config->contentLibraries;
                        $newConfig->save();
                    }
                    break;
                case self::TYPE_GROUP_PUSH:
                    $config = WorkbenchGroupPush::where('workbenchId', $id)->find();
                    if ($config) {
                        $newConfig = new WorkbenchGroupPush;
                        $newConfig->workbenchId = $newWorkbench->id;
                        $newConfig->pushInterval = $config->pushInterval;
                        $newConfig->pushContent = $config->pushContent;
                        $newConfig->pushTime = $config->pushTime;
                        $newConfig->devices = $config->devices;
                        $newConfig->targetGroups = $config->targetGroups;
                        $newConfig->save();
                    }
                    break;
                case self::TYPE_GROUP_CREATE:
                    $config = WorkbenchGroupCreate::where('workbenchId', $id)->find();
                    if ($config) {
                        $newConfig = new WorkbenchGroupCreate;
                        $newConfig->workbenchId = $newWorkbench->id;
                        $newConfig->groupNamePrefix = $config->groupNamePrefix;
                        $newConfig->maxGroups = $config->maxGroups;
                        $newConfig->membersPerGroup = $config->membersPerGroup;
                        $newConfig->devices = $config->devices;
                        $newConfig->targetGroups = $config->targetGroups;
                        $newConfig->save();
                    }
                    break;
            }

            Db::commit();
            return json(['code' => 200, 'msg' => '拷贝成功', 'data' => ['id' => $newWorkbench->id]]);
        } catch (\Exception $e) {
            Db::rollback();
            return json(['code' => 500, 'msg' => '拷贝失败：' . $e->getMessage()]);
        }
    }
} 