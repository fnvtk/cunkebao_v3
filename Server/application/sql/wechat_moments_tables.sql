-- 朋友圈表
CREATE TABLE IF NOT EXISTS `wechat_moments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `wechatAccountId` int(11) NOT NULL COMMENT '微信账号ID',
  `wechatFriendId` varchar(64) NOT NULL COMMENT '微信好友ID',
  `snsId` varchar(64) NOT NULL COMMENT '朋友圈消息ID',
  `commentList` text COMMENT '评论列表JSON',
  `createTime` bigint(20) DEFAULT '0' COMMENT '创建时间戳',
  `likeList` text COMMENT '点赞列表JSON',
  `content` text COMMENT '朋友圈内容',
  `lat` decimal(10,6) DEFAULT '0.000000' COMMENT '纬度',
  `lng` decimal(10,6) DEFAULT '0.000000' COMMENT '经度',
  `location` varchar(255) DEFAULT '' COMMENT '位置信息',
  `picSize` int(11) DEFAULT '0' COMMENT '图片大小',
  `resUrls` text COMMENT '资源URL列表',
  `userName` varchar(64) DEFAULT '' COMMENT '用户名',
  `type` int(11) DEFAULT '0' COMMENT '朋友圈类型',
  `create_time` int(11) DEFAULT NULL COMMENT '数据创建时间',
  `update_time` int(11) DEFAULT NULL COMMENT '数据更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sns_account` (`snsId`,`wechatAccountId`),
  KEY `idx_account_friend` (`wechatAccountId`,`wechatFriendId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信朋友圈数据表'; 