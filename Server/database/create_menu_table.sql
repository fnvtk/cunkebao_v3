-- 创建菜单表
CREATE TABLE IF NOT EXISTS `tk_menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `title` varchar(50) NOT NULL COMMENT '菜单名称',
  `path` varchar(100) NOT NULL COMMENT '路由路径',
  `icon` varchar(50) DEFAULT NULL COMMENT '图标名称',
  `parent_id` int(11) NOT NULL DEFAULT '0' COMMENT '父菜单ID，0表示顶级菜单',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1启用，0禁用',
  `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序，数值越小越靠前',
  `create_time` int(11) DEFAULT NULL COMMENT '创建时间',
  `update_time` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统菜单表';

-- 插入超级管理员顶级菜单
INSERT INTO `tk_menus` (`title`, `path`, `icon`, `parent_id`, `status`, `sort`, `create_time`, `update_time`) VALUES
('仪表盘', '/dashboard', 'LayoutDashboard', 0, 1, 10, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('项目管理', '/dashboard/projects', 'FolderKanban', 0, 1, 20, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('客户池', '/dashboard/customers', 'Users', 0, 1, 30, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('管理员权限', '/dashboard/admins', 'Settings', 0, 1, 40, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('系统设置', '/settings', 'Cog', 0, 1, 50, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 插入子菜单
INSERT INTO `tk_menus` (`title`, `path`, `icon`, `parent_id`, `status`, `sort`, `create_time`, `update_time`) VALUES
('项目列表', '/dashboard/projects', 'List', 2, 1, 21, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('新建项目', '/dashboard/projects/new', 'PlusCircle', 2, 1, 22, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('客户管理', '/dashboard/customers', 'Users', 3, 1, 31, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('客户分析', '/dashboard/customers/analytics', 'BarChart', 3, 1, 32, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('管理员列表', '/dashboard/admins', 'UserCog', 4, 1, 41, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('角色管理', '/dashboard/admins/roles', 'ShieldCheck', 4, 1, 42, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('权限设置', '/dashboard/admins/permissions', 'Lock', 4, 1, 43, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('基本设置', '/settings/general', 'Settings', 5, 1, 51, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('安全设置', '/settings/security', 'Shield', 5, 1, 52, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()); 