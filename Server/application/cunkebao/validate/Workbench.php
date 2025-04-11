<?php

namespace app\cunkebao\validate;

use think\Validate;

class Workbench extends Validate
{
    // 工作台类型定义
    const TYPE_AUTO_LIKE = 1;      // 自动点赞
    const TYPE_MOMENTS_SYNC = 2;    // 朋友圈同步
    const TYPE_GROUP_PUSH = 3;      // 群消息推送
    const TYPE_GROUP_CREATE = 4;    // 自动建群

    /**
     * 验证规则
     */
    protected $rule = [
        'name' => 'require|max:100',
        'type' => 'require|in:1,2,3,4',
        //'autoStart' => 'require|boolean',
        // 自动点赞特有参数
        'interval' => 'requireIf:type,1|number|min:1',
        'maxLikes' => 'requireIf:type,1|number|min:1',
        'startTime' => 'requireIf:type,1|dateFormat:H:i',
        'endTime' => 'requireIf:type,1|dateFormat:H:i',
        'contentTypes' => 'requireIf:type,1|array|contentTypeEnum:text,image,video',
        'targetGroups' => 'requireIf:type,1|array',
        // 朋友圈同步特有参数
        'syncInterval' => 'requireIf:type,2|number|min:1',
        'syncCount' => 'requireIf:type,2|number|min:1',
        'syncType' => 'requireIf:type,2|in:1,2,3,4',
        'startTime' => 'requireIf:type,2|dateFormat:H:i',
        'endTime' => 'requireIf:type,2|dateFormat:H:i',
        'accountType' => 'requireIf:type,2|in:1,2',
        'contentLibraries' => 'requireIf:type,2|array',
        // 群消息推送特有参数
        'pushInterval' => 'requireIf:type,3|number|min:1',
        'pushContent' => 'requireIf:type,3|array',
        'pushTime' => 'requireIf:type,3|array',
        // 自动建群特有参数
        'groupNamePrefix' => 'requireIf:type,4|max:50',
        'maxGroups' => 'requireIf:type,4|number|min:1',
        'membersPerGroup' => 'requireIf:type,4|number|min:1',
        // 通用参数
        'devices' => 'require|array',
    ];

    /**
     * 错误信息
     */
    protected $message = [
        'name.require' => '请输入任务名称',
        'name.max' => '任务名称最多100个字符',
        'type.require' => '请选择工作台类型',
        'type.in' => '工作台类型错误',
        'autoStart.require' => '请选择是否自动启动',
        'autoStart.boolean' => '自动启动参数必须为布尔值',
        // 自动点赞相关提示
        'interval.requireIf' => '请设置点赞间隔',
        'interval.number' => '点赞间隔必须为数字',
        'interval.min' => '点赞间隔必须大于0',
        'maxLikes.requireIf' => '请设置每日最大点赞数',
        'maxLikes.number' => '每日最大点赞数必须为数字',
        'maxLikes.min' => '每日最大点赞数必须大于0',
        'startTime.requireIf' => '请设置开始时间',
        'startTime.dateFormat' => '开始时间格式错误',
        'endTime.requireIf' => '请设置结束时间',
        'endTime.dateFormat' => '结束时间格式错误',
        'contentTypes.requireIf' => '请选择点赞内容类型',
        'contentTypes.array' => '点赞内容类型必须是数组',
        'contentTypes.contentTypeEnum' => '点赞内容类型只能是text、image、video',
        // 朋友圈同步相关提示
        'syncInterval.requireIf' => '请设置同步间隔',
        'syncInterval.number' => '同步间隔必须为数字',
        'syncInterval.min' => '同步间隔必须大于0',
        'syncCount.requireIf' => '请设置同步数量',
        'syncCount.number' => '同步数量必须为数字',
        'syncCount.min' => '同步数量必须大于0',
        'syncType.requireIf' => '请选择同步类型',
        'syncType.in' => '同步类型错误',
        'startTime.requireIf' => '请设置发布开始时间',
        'startTime.dateFormat' => '发布开始时间格式错误',
        'endTime.requireIf' => '请设置发布结束时间',
        'endTime.dateFormat' => '发布结束时间格式错误',
        'accountType.requireIf' => '请选择账号类型',
        'accountType.in' => '账号类型错误',
        'contentLibraries.requireIf' => '请选择内容库',
        'contentLibraries.array' => '内容库格式错误',
        // 群消息推送相关提示
        'pushInterval.requireIf' => '请设置推送间隔',
        'pushInterval.number' => '推送间隔必须为数字',
        'pushInterval.min' => '推送间隔必须大于0',
        'pushContent.requireIf' => '请设置推送内容',
        'pushContent.array' => '推送内容格式错误',
        'pushTime.requireIf' => '请设置推送时间',
        'pushTime.array' => '推送时间格式错误',
        // 自动建群相关提示
        'groupNamePrefix.requireIf' => '请设置群名称前缀',
        'groupNamePrefix.max' => '群名称前缀最多50个字符',
        'maxGroups.requireIf' => '请设置最大建群数量',
        'maxGroups.number' => '最大建群数量必须为数字',
        'maxGroups.min' => '最大建群数量必须大于0',
        'membersPerGroup.requireIf' => '请设置每个群的人数',
        'membersPerGroup.number' => '每个群的人数必须为数字',
        'membersPerGroup.min' => '每个群的人数必须大于0',
        // 通用提示
        'devices.require' => '请选择设备',
        'devices.array' => '设备格式错误',
        'targetGroups.require' => '请选择目标用户组',
        'targetGroups.array' => '目标用户组格式错误'
    ];

    /**
     * 验证场景
     */
    protected $scene = [
        'create' => ['name', 'type', 'autoStart', 'devices', 'targetGroups',
            'interval', 'maxLikes', 'startTime', 'endTime', 'contentTypes',
            'syncInterval', 'syncCount', 'syncType',
            'pushInterval', 'pushContent', 'pushTime',
            'groupNamePrefix', 'maxGroups', 'membersPerGroup'
        ],
        'update_status' => ['id', 'status']
    ];

    /**
     * 自定义验证规则
     */
    protected function contentTypeEnum($value, $rule, $data)
    {
        $allowTypes = explode(',', $rule);
        foreach ($value as $type) {
            if (!in_array($type, $allowTypes)) {
                return false;
            }
        }
        return true;
    }
} 