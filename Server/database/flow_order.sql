-- 创建流量订单表
CREATE TABLE IF NOT EXISTS `tk_flow_order` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `userId` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `packageId` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '套餐ID',
  `orderNo` varchar(32) NOT NULL DEFAULT '' COMMENT '订单号',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '支付价格',
  `originalPrice` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '原价',
  `payType` varchar(20) NOT NULL DEFAULT '' COMMENT '支付类型(wxpay|alipay|nopay)',
  `tradeNo` varchar(64) NOT NULL DEFAULT '' COMMENT '支付平台交易号',
  `createTime` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  `updateTime` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  `payTime` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '支付时间',
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '状态(0:待支付 1:已完成 2:已取消)',
  `payStatus` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '支付状态(0:未支付 10:已支付)',
  `memo` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `isDel` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否删除(0:否 1:是)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_order_no` (`orderNo`),
  KEY `idx_user_id` (`userId`),
  KEY `idx_package_id` (`packageId`),
  KEY `idx_create_time` (`createTime`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流量订单表'; 