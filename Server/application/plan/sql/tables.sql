-- 获客计划主表
CREATE TABLE `tk_plan_task` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `name` varchar(100) NOT NULL COMMENT '计划名称',
  `device_id` int(10) unsigned DEFAULT NULL COMMENT '关联设备ID',
  `scene_id` int(10) unsigned DEFAULT NULL COMMENT '获客场景ID',
  `scene_config` text DEFAULT NULL COMMENT '场景配置(JSON格式)',
  `status` tinyint(3) unsigned DEFAULT 0 COMMENT '状态：0=停用，1=启用，2=完成，3=失败',
  `current_step` tinyint(3) unsigned DEFAULT 0 COMMENT '当前执行步骤',
  `priority` tinyint(3) unsigned DEFAULT 5 COMMENT '优先级：1-10，数字越大优先级越高',
  `created_by` int(10) unsigned NOT NULL COMMENT '创建人ID',
  `createTime` int(11) DEFAULT NULL COMMENT '创建时间',
  `updateTime` int(11) DEFAULT NULL COMMENT '更新时间',
  `deleteTime` int(11) DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_device` (`device_id`),
  KEY `idx_scene` (`scene_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='获客计划主表';

-- 流量池表
CREATE TABLE `tk_traffic_pool` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `mobile` varchar(20) NOT NULL COMMENT '手机号',
  `name` varchar(50) DEFAULT NULL COMMENT '姓名',
  `gender` tinyint(1) DEFAULT NULL COMMENT '性别：0=未知，1=男，2=女',
  `age` int(3) DEFAULT NULL COMMENT '年龄',
  `region` varchar(100) DEFAULT NULL COMMENT '区域',
  `status` tinyint(3) unsigned DEFAULT 1 COMMENT '状态：0=无效，1=有效',
  `tag_ids` varchar(255) DEFAULT NULL COMMENT '标签ID，逗号分隔',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `last_used_time` int(11) DEFAULT NULL COMMENT '最后使用时间',
  `createTime` int(11) DEFAULT NULL COMMENT '创建时间',
  `updateTime` int(11) DEFAULT NULL COMMENT '更新时间',
  `deleteTime` int(11) DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mobile` (`mobile`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流量池表';

-- 流量来源表
CREATE TABLE `tk_traffic_source` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `traffic_id` int(10) unsigned NOT NULL COMMENT '关联流量池ID',
  `plan_id` int(10) unsigned DEFAULT NULL COMMENT '关联计划ID',
  `scene_id` int(10) unsigned DEFAULT NULL COMMENT '场景ID',
  `channel` varchar(50) NOT NULL COMMENT '渠道：poster=海报, order=订单, douyin=抖音, xiaohongshu=小红书, phone=电话, wechat=公众号, group=微信群, payment=付款码, api=API接口',
  `sub_channel` varchar(50) DEFAULT NULL COMMENT '子渠道',
  `source_detail` text DEFAULT NULL COMMENT '来源详情(JSON格式)',
  `ip` varchar(50) DEFAULT NULL COMMENT '来源IP',
  `user_agent` varchar(255) DEFAULT NULL COMMENT '用户代理',
  `createTime` int(11) DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_traffic` (`traffic_id`),
  KEY `idx_plan` (`plan_id`),
  KEY `idx_scene` (`scene_id`),
  KEY `idx_channel` (`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流量来源表';

-- 计划执行记录表
CREATE TABLE `tk_plan_execution` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `plan_id` int(10) unsigned NOT NULL COMMENT '关联计划ID',
  `traffic_id` int(10) unsigned DEFAULT NULL COMMENT '关联流量ID',
  `step` tinyint(3) unsigned NOT NULL COMMENT '执行步骤：1=基础配置，2=加友计划，3=API调用，4=标签处理',
  `sub_step` varchar(50) DEFAULT NULL COMMENT '子步骤标识',
  `status` tinyint(3) unsigned DEFAULT 0 COMMENT '状态：0=等待，1=进行中，2=成功，3=失败',
  `result` text DEFAULT NULL COMMENT '执行结果(JSON格式)',
  `error` varchar(255) DEFAULT NULL COMMENT '错误信息',
  `start_time` int(11) DEFAULT NULL COMMENT '开始时间',
  `end_time` int(11) DEFAULT NULL COMMENT '结束时间',
  `createTime` int(11) DEFAULT NULL COMMENT '创建时间',
  `updateTime` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_plan` (`plan_id`),
  KEY `idx_traffic` (`traffic_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='计划执行记录表';

-- 标签表
CREATE TABLE `tk_tag` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `name` varchar(50) NOT NULL COMMENT '标签名称',
  `color` varchar(20) DEFAULT NULL COMMENT '标签颜色',
  `type` varchar(20) DEFAULT 'traffic' COMMENT '标签类型：traffic=流量标签，friend=好友标签',
  `count` int(11) DEFAULT 0 COMMENT '使用次数',
  `status` tinyint(3) unsigned DEFAULT 1 COMMENT '状态：0=停用，1=启用',
  `createTime` int(11) DEFAULT NULL COMMENT '创建时间',
  `updateTime` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name_type` (`name`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签表'; 