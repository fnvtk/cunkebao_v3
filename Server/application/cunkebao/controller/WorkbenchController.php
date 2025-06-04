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
use app\cunkebao\model\WorkbenchTrafficConfig;

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
    const TYPE_TRAFFIC_DISTRIBUTION = 5;    // 流量分发

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
                    $config->friends = json_encode($param['friends']);
                    // $config->targetGroups = json_encode($param['targetGroups']);
                    // $config->tagOperator = $param['tagOperator'];
                    $config->friendMaxLikes = $param['friendMaxLikes'];
                    $config->friendTags = $param['friendTags'];
                    $config->enableFriendTags = $param['enableFriendTags'];
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
                case self::TYPE_TRAFFIC_DISTRIBUTION: // 流量分发
                    $config = new WorkbenchTrafficConfig;
                    $config->workbenchId = $workbench->id;
                    $config->distributeType = $param['distributeType'];
                    $config->maxPerDay = $param['maxPerDay'];
                    $config->timeType = $param['timeType'];
                    $config->startTime = $param['startTime'];
                    $config->endTime = $param['endTime'];
                    $config->devices = json_encode($param['devices'], JSON_UNESCAPED_UNICODE);
                    $config->pools = json_encode($param['pools'], JSON_UNESCAPED_UNICODE);
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
                $query->field('workbenchId,interval,maxLikes,startTime,endTime,contentTypes,devices,friends');
            },
            'momentsSync' => function($query) {
                $query->field('workbenchId,syncInterval,syncCount,syncType,startTime,endTime,accountType,devices,contentLibraries');
            },
            'trafficConfig' => function($query) {
                $query->field('workbenchId,distributeType,maxPerDay,timeType,startTime,endTime,devices,pools');
            },
            'user' => function($query) {
                $query->field('id,username');
            }
        ];

        $list = Workbench::where($where)
            ->with($with)
            ->field('id,companyId,name,type,status,autoStart,userId,createTime,updateTime')
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
                            $item->config->contentTypes =  json_decode($item->config->contentTypes, true);
                            $item->config->friends = json_decode($item->config->friends, true);
                            
                            // 添加今日点赞数
                            $startTime = strtotime(date('Y-m-d') . ' 00:00:00');
                            $endTime = strtotime(date('Y-m-d') . ' 23:59:59');
                            $todayLikeCount = Db::name('workbench_auto_like_item')
                                ->where('workbenchId', $item->id)
                                ->whereTime('createTime', 'between', [$startTime, $endTime])
                                ->count();
                            
                            // 添加总点赞数
                            $totalLikeCount = Db::name('workbench_auto_like_item')
                                ->where('workbenchId', $item->id)
                                ->count();
                            
                            $item->config->todayLikeCount = $todayLikeCount;
                            $item->config->totalLikeCount = $totalLikeCount;
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
                    case self::TYPE_TRAFFIC_DISTRIBUTION:
                        if (!empty($item->trafficConfig)) {
                            $item->config = $item->trafficConfig;
                            $item->config->devices = json_decode($item->config->devices, true);
                            $item->config->pools = json_decode($item->config->pools, true);
                            $config_item = Db::name('workbench_traffic_config_item')->where(['workbenchId' => $item->id])->order('id DESC')->find();
                            $item->config->lastUpdated = !empty($config_item) ? date('Y-m-d H:i',$config_item['createTime']) : '--';

                            //统计
                            $labels =  $item->config->pools;
                            $totalUsers = Db::table('s2_wechat_friend')->alias('wf')
                                ->join(['s2_company_account' => 'sa'], 'sa.id = wf.accountId', 'left')
                                ->join(['s2_wechat_account' => 'wa'], 'wa.id = wf.wechatAccountId', 'left')
                                ->where([
                                    ['wf.isDeleted', '=', 0],
                                    ['sa.departmentId', '=', $item->companyId]
                                ])
                                ->whereIn('wa.currentDeviceId', $item->config->devices)
                                ->field('wf.id,wf.wechatAccountId,wf.wechatId,wf.labels,sa.userName,wa.currentDeviceId as deviceId')
                                ->where(function ($q) use ($labels) {
                                foreach ($labels as $label) {
                                    $q->whereOrRaw("JSON_CONTAINS(wf.labels, '\"{$label}\"')");
                                }
                            })->count();
                            $totalAccounts = Db::table('s2_company_account')
                            ->alias('a')
                            ->where(['a.departmentId' => $item->companyId, 'a.status' => 0])
                            ->whereNotLike('a.userName', '%_offline%')
                            ->whereNotLike('a.userName', '%_delete%')
                            ->group('a.id')
                            ->count();

                            $todayStart = strtotime(date('Y-m-d 00:00:00'));
                            $todayEnd = strtotime(date('Y-m-d 23:59:59'));
                            $dailyAverage = Db::name('workbench_traffic_config_item')
                            ->where('workbenchId', $item->id)
                            ->whereTime('createTime', 'between', [$todayStart, $todayEnd])
                            ->count();

                            if($dailyAverage > 0){
                                $dailyAverage = $dailyAverage / $totalAccounts;
                            }

                            $item->config->total = [
                                'dailyAverage' => intval($dailyAverage),
                                'totalAccounts' => $totalAccounts,
                                'deviceCount' => count($item->config->devices),
                                'poolCount' => count($item->config->pools),
                                'totalUsers' => $totalUsers >> 0
                            ];
                        }
                        unset($item->trafficConfig,$item->traffic_config);
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
                $query->field('workbenchId,interval,maxLikes,startTime,endTime,contentTypes,devices,friends,friendMaxLikes,friendTags,enableFriendTags');
            },
            'momentsSync' => function($query) {
                $query->field('workbenchId,syncInterval,syncCount,syncType,startTime,endTime,accountType,devices,contentLibraries');
            },
            'trafficConfig' => function($query) {
                $query->field('workbenchId,distributeType,maxPerDay,timeType,startTime,endTime,devices,pools');
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
                    $workbench->config->friends = json_decode($workbench->config->friends, true);
                    //$workbench->config->targetGroups = json_decode($workbench->config->targetGroups, true);
                    $workbench->config->contentTypes = json_decode($workbench->config->contentTypes, true);
                    
                    // 添加今日点赞数
                    $startTime = strtotime(date('Y-m-d') . ' 00:00:00');
                    $endTime = strtotime(date('Y-m-d') . ' 23:59:59');
                    $todayLikeCount = Db::name('workbench_auto_like_item')
                        ->where('workbenchId', $workbench->id)
                        ->whereTime('createTime', 'between', [$startTime, $endTime])
                        ->count();
                    
                    // 添加总点赞数
                    $totalLikeCount = Db::name('workbench_auto_like_item')
                        ->where('workbenchId', $workbench->id)
                        ->count();
                    
                    $workbench->config->todayLikeCount = $todayLikeCount;
                    $workbench->config->totalLikeCount = $totalLikeCount;
                    
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
            case self::TYPE_TRAFFIC_DISTRIBUTION:
                if (!empty($workbench->trafficConfig)) {
                    $workbench->config = $workbench->trafficConfig;
                    $workbench->config->devices = json_decode($workbench->config->devices, true);
                    $workbench->config->pools = json_decode($workbench->config->pools, true);
                    $workbench->config->total = [
                        'dailyAverage' => 0,
                        'deviceCount' => count($workbench->config->devices),
                        'poolCount' => count($workbench->config->pools ),
                        'dailyAverage' => $workbench->config->maxPerDay,
                        'totalUsers' => $workbench->config->maxPerDay * count($workbench->config->devices) * count($workbench->config->pools)
                   
                    ];
                    unset($workbench->trafficConfig,$workbench->traffic_config);
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
                        $config->friends = json_encode($param['friends']);
                        // $config->targetGroups = json_encode($param['targetGroups']);
                        // $config->tagOperator = $param['tagOperator'];
                        $config->friendMaxLikes = $param['friendMaxLikes'];
                        $config->friendTags = $param['friendTags'];
                        $config->enableFriendTags = $param['enableFriendTags'];
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
                case self::TYPE_TRAFFIC_DISTRIBUTION:
                    $config = WorkbenchTrafficConfig::where('workbenchId', $param['id'])->find();
                    if ($config) {
                        $config->distributeType = $param['distributeType'];
                        $config->maxPerDay = $param['maxPerDay'];
                        $config->timeType = $param['timeType'];
                        $config->startTime = $param['startTime'];
                        $config->endTime = $param['endTime'];
                        $config->devices = json_encode($param['devices']);
                        $config->pools = json_encode($param['pools']);
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
                        $newConfig->friends = $config->friends;
                        //$newConfig->targetGroups = $config->targetGroups;
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

    /**
     * 获取点赞记录列表
     * @return \think\response\Json
     */
    public function getLikeRecords()
    {
        $page = $this->request->param('page', 1);
        $limit = $this->request->param('limit', 10);
        $workbenchId = $this->request->param('workbenchId', 0);

        $where = [
            ['wali.workbenchId', '=', $workbenchId]
        ];

 

        // 查询点赞记录
        $list = Db::name('workbench_auto_like_item')->alias('wali')
            ->join(['s2_wechat_moments' => 'wm'], 'wm.snsId = wali.snsId', 'left')
            ->join(['s2_wechat_account' => 'wa'], 'wa.id = wali.wechatAccountId', 'left')
            ->join(['s2_wechat_friend' => 'wf'], 'wf.id = wm.wechatFriendId', 'left')
            ->field([
                'wali.id',
                'wali.workbenchId',
                'wali.momentsId',
                'wali.snsId',
                'wali.wechatAccountId',
                'wali.wechatFriendId',
                'wali.createTime as likeTime',
                'wm.content',
                'wm.resUrls',
                'wm.createTime as momentTime',
                'wm.userName',
                'wa.nickName as operatorName',
                'wa.avatar as operatorAvatar',
                'wf.nickName as friendName',
                'wf.avatar as friendAvatar',
            ])
            ->where($where)
            ->order('wali.createTime', 'desc')
            ->page($page, $limit)
            ->select();

        // 处理数据
        foreach ($list as &$item) {
            // 处理时间格式
            $item['likeTime'] = date('Y-m-d H:i:s', $item['likeTime']);
            $item['momentTime'] = !empty($item['momentTime']) ? date('Y-m-d H:i:s', $item['momentTime']) : '';
            
            // 处理资源链接
            if (!empty($item['resUrls'])) {
                $item['resUrls'] = json_decode($item['resUrls'], true);
            } else {
                $item['resUrls'] = [];
            }
        }

        // 获取总记录数
        $total = Db::name('workbench_auto_like_item')->alias('wali')
            ->where($where)
            ->count();

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
     * 获取朋友圈发布记录列表
     * @return \think\response\Json
     */
    public function getMomentsRecords()
    {
        $page = $this->request->param('page', 1);
        $limit = $this->request->param('limit', 10);
        $workbenchId = $this->request->param('workbenchId', 0);

        $where = [
            ['wmsi.workbenchId', '=', $workbenchId]
        ];

        // 查询发布记录
        $list = Db::name('workbench_moments_sync_item')->alias('wmsi')
            ->join('content_item ci', 'ci.id = wmsi.contentId', 'left')
            ->join(['s2_wechat_account' => 'wa'], 'wa.id = wmsi.wechatAccountId', 'left')
            ->field([
                'wmsi.id',
                'wmsi.workbenchId',
                'wmsi.createTime as publishTime',
                'ci.contentType',
                'ci.content',
                'ci.resUrls',
                'ci.urls',
                'wa.nickName as operatorName',
                'wa.avatar as operatorAvatar'
            ])
            ->where($where)
            ->order('wmsi.createTime', 'desc')
            ->page($page, $limit)
            ->select();

            foreach ($list as &$item) {
                $item['resUrls'] = json_decode($item['resUrls'], true);
                $item['urls'] = json_decode($item['urls'], true);
            }
            


        // 获取总记录数
        $total = Db::name('workbench_moments_sync_item')->alias('wmsi')
            ->where($where)
            ->count();

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
     * 获取朋友圈发布统计
     * @return \think\response\Json
     */
    public function getMomentsStats()
    {
        $workbenchId = $this->request->param('workbenchId', 0);
        if (empty($workbenchId)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        // 获取今日数据
        $todayStart = strtotime(date('Y-m-d') . ' 00:00:00');
        $todayEnd = strtotime(date('Y-m-d') . ' 23:59:59');
        
        $todayStats = Db::name('workbench_moments_sync_item')
            ->where([
                ['workbenchId', '=', $workbenchId],
                ['createTime', 'between', [$todayStart, $todayEnd]]
            ])
            ->field([
                'COUNT(*) as total',
                'SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as success',
                'SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as failed'
            ])
            ->find();

        // 获取总数据
        $totalStats = Db::name('workbench_moments_sync_item')
            ->where('workbenchId', $workbenchId)
            ->field([
                'COUNT(*) as total',
                'SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as success',
                'SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as failed'
            ])
            ->find();

        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'today' => [
                    'total' => intval($todayStats['total']),
                    'success' => intval($todayStats['success']),
                    'failed' => intval($todayStats['failed'])
                ],
                'total' => [
                    'total' => intval($totalStats['total']),
                    'success' => intval($totalStats['success']),
                    'failed' => intval($totalStats['failed'])
                ]
            ]
        ]);
    }

    /**
     * 获取流量分发记录列表
     * @return \think\response\Json
     */
    public function getTrafficDistributionRecords()
    {
        $page = $this->request->param('page', 1);
        $limit = $this->request->param('limit', 10);
        $workbenchId = $this->request->param('workbenchId', 0);

        $where = [
            ['wtdi.workbenchId', '=', $workbenchId]
        ];

        // 查询分发记录
        $list = Db::name('workbench_traffic_distribution_item')->alias('wtdi')
            ->join(['s2_wechat_account' => 'wa'], 'wa.id = wtdi.wechatAccountId', 'left')
            ->join(['s2_wechat_friend' => 'wf'], 'wf.id = wtdi.wechatFriendId', 'left')
            ->field([
                'wtdi.id',
                'wtdi.workbenchId',
                'wtdi.wechatAccountId',
                'wtdi.wechatFriendId',
                'wtdi.createTime as distributeTime',
                'wtdi.status',
                'wtdi.errorMsg',
                'wa.nickName as operatorName',
                'wa.avatar as operatorAvatar',
                'wf.nickName as friendName',
                'wf.avatar as friendAvatar',
                'wf.gender',
                'wf.province',
                'wf.city'
            ])
            ->where($where)
            ->order('wtdi.createTime', 'desc')
            ->page($page, $limit)
            ->select();

        // 处理数据
        foreach ($list as &$item) {
            // 处理时间格式
            $item['distributeTime'] = date('Y-m-d H:i:s', $item['distributeTime']);
            
            // 处理性别
            $genderMap = [
                0 => '未知',
                1 => '男',
                2 => '女'
            ];
            $item['genderText'] = $genderMap[$item['gender']] ?? '未知';

            // 处理状态文字
            $statusMap = [
                0 => '待分发',
                1 => '分发成功',
                2 => '分发失败'
            ];
            $item['statusText'] = $statusMap[$item['status']] ?? '未知状态';
        }

        // 获取总记录数
        $total = Db::name('workbench_traffic_distribution_item')->alias('wtdi')
            ->where($where)
            ->count();

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
     * 获取流量分发统计
     * @return \think\response\Json
     */
    public function getTrafficDistributionStats()
    {
        $workbenchId = $this->request->param('workbenchId', 0);
        if (empty($workbenchId)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        // 获取今日数据
        $todayStart = strtotime(date('Y-m-d') . ' 00:00:00');
        $todayEnd = strtotime(date('Y-m-d') . ' 23:59:59');
        
        $todayStats = Db::name('workbench_traffic_distribution_item')
            ->where([
                ['workbenchId', '=', $workbenchId],
                ['createTime', 'between', [$todayStart, $todayEnd]]
            ])
            ->field([
                'COUNT(*) as total',
                'SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as success',
                'SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as failed'
            ])
            ->find();

        // 获取总数据
        $totalStats = Db::name('workbench_traffic_distribution_item')
            ->where('workbenchId', $workbenchId)
            ->field([
                'COUNT(*) as total',
                'SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as success',
                'SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as failed'
            ])
            ->find();

        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'today' => [
                    'total' => intval($todayStats['total']),
                    'success' => intval($todayStats['success']),
                    'failed' => intval($todayStats['failed'])
                ],
                'total' => [
                    'total' => intval($totalStats['total']),
                    'success' => intval($totalStats['success']),
                    'failed' => intval($totalStats['failed'])
                ]
            ]
        ]);
    }

    /**
     * 获取流量分发详情
     * @return \think\response\Json
     */
    public function getTrafficDistributionDetail()
    {
        $id = $this->request->param('id', 0);
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        $detail = Db::name('workbench_traffic_distribution_item')->alias('wtdi')
            ->join(['s2_wechat_account' => 'wa'], 'wa.id = wtdi.wechatAccountId', 'left')
            ->join(['s2_wechat_friend' => 'wf'], 'wf.id = wtdi.wechatFriendId', 'left')
            ->field([
                'wtdi.id',
                'wtdi.workbenchId',
                'wtdi.wechatAccountId',
                'wtdi.wechatFriendId',
                'wtdi.createTime as distributeTime',
                'wtdi.status',
                'wtdi.errorMsg',
                'wa.nickName as operatorName',
                'wa.avatar as operatorAvatar',
                'wf.nickName as friendName',
                'wf.avatar as friendAvatar',
                'wf.gender',
                'wf.province',
                'wf.city',
                'wf.signature',
                'wf.remark'
            ])
            ->where('wtdi.id', $id)
            ->find();

        if (empty($detail)) {
            return json(['code' => 404, 'msg' => '记录不存在']);
        }

        // 处理数据
        $detail['distributeTime'] = date('Y-m-d H:i:s', $detail['distributeTime']);
        
        // 处理性别
        $genderMap = [
            0 => '未知',
            1 => '男',
            2 => '女'
        ];
        $detail['genderText'] = $genderMap[$detail['gender']] ?? '未知';

        // 处理状态文字
        $statusMap = [
            0 => '待分发',
            1 => '分发成功',
            2 => '分发失败'
        ];
        $detail['statusText'] = $statusMap[$detail['status']] ?? '未知状态';

        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => $detail
        ]);
    }

    /**
     * 创建流量分发计划
     * @return \think\response\Json
     */
    public function createTrafficPlan()
    {
        $param = $this->request->post();
        Db::startTrans();
        try {
            // 1. 创建主表
            $planId = Db::name('ck_workbench')->insertGetId([
                'name' => $param['name'],
                'type' => self::TYPE_TRAFFIC_DISTRIBUTION,
                'status' => 1,
                'autoStart' => $param['autoStart'] ?? 0,
                'userId' => $this->request->userInfo['id'],
                'companyId' => $this->request->userInfo['companyId'],
                'createTime' => time(),
                'updateTime' => time()
            ]);
            // 2. 创建扩展表
            Db::name('ck_workbench_traffic_config')->insert([
                'workbenchId' => $planId,
                'distributeType' => $param['distributeType'],
                'maxPerDay' => $param['maxPerDay'],
                'timeType' => $param['timeType'],
                'startTime' => $param['startTime'],
                'endTime' => $param['endTime'],
                'targets' => json_encode($param['targets'], JSON_UNESCAPED_UNICODE),
                'pools' => json_encode($param['pools'], JSON_UNESCAPED_UNICODE),
                'createTime' => time(),
                'updateTime' => time()
            ]);
            Db::commit();
            return json(['code'=>200, 'msg'=>'创建成功']);
        } catch (\Exception $e) {
            Db::rollback();
            return json(['code'=>500, 'msg'=>'创建失败:'.$e->getMessage()]);
        }
    }

    /**
     * 获取所有微信好友标签及数量统计
     * @return \think\response\Json
     */
    public function getDeviceLabels()
    {
        $deviceIds = $this->request->param('deviceIds', '');
        $companyId = $this->request->userInfo['companyId'];

        $where = [
            ['wc.companyId', '=', $companyId],
        ];

        if (!empty($deviceIds)) {
            $deviceIds = explode(',', $deviceIds);
            $where[] = ['dwl.deviceId', 'in', $deviceIds];
        }

        $wechatAccounts = Db::name('wechat_customer')->alias('wc')
            ->join('device_wechat_login dwl', 'dwl.wechatId = wc.wechatId AND dwl.companyId = wc.companyId AND dwl.alive = 1')
            ->join(['s2_wechat_account' => 'wa'], 'wa.wechatId = wc.wechatId')
            ->where($where)
            ->field('wa.id,wa.wechatId,wa.nickName,wa.labels')
            ->select();

        $labels = [];
        $wechatIds = [];
        foreach ($wechatAccounts as $account) {
            $labelArr = json_decode($account['labels'], true);
            if (is_array($labelArr)) {
                foreach ($labelArr as $label) {
                    if ($label !== '' && $label !== null) {
                        $labels[] = $label;
                    }
                }
            }
            $wechatIds[] = $account['wechatId'];
        }
        // 去重（只保留一个）
        $labels = array_values(array_unique($labels));
        $wechatIds = array_unique($wechatIds);
        
        // 统计数量
        $newLabel = [];
        foreach ($labels as $label) {
            $friendCount = Db::table('s2_wechat_friend')
                ->whereIn('ownerWechatId',$wechatIds)
                ->where('labels', 'like', '%"'.$label.'"%')
                ->count();
            $newLabel[] = [
                'label' => $label,
                'count' => $friendCount
            ];
        }

        // 返回结果
        return json(['code' => 200, 'msg' => '获取成功', 'data' => $newLabel,'total'=> count($newLabel)]);
    }
} 