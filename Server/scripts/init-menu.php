<?php
/**
 * 菜单表初始化脚本
 * 执行该脚本，会创建菜单表并插入初始菜单数据
 * 执行方式: php init-menu.php
 */

// 定义应用目录
define('APP_PATH', __DIR__ . '/../application/');
define('RUNTIME_PATH', __DIR__ . '/../runtime/');
define('ROOT_PATH', __DIR__ . '/../');

// 加载框架引导文件
require __DIR__ . '/../thinkphp/base.php';

// 加载环境变量
use think\facade\Env;
$rootPath = realpath(__DIR__ . '/../');
Env::load($rootPath . '/.env');

// 读取数据库配置
$dbConfig = [
    'type'     => Env::get('database.type', 'mysql'),
    'hostname' => Env::get('database.hostname', '127.0.0.1'),
    'database' => Env::get('database.database', 'database'),
    'username' => Env::get('database.username', 'root'),
    'password' => Env::get('database.password', 'root'),
    'hostport' => Env::get('database.hostport', '3306'),
    'charset'  => Env::get('database.charset', 'utf8mb4'),
    'prefix'   => Env::get('database.prefix', 'tk_'),
];

// 连接数据库
try {
    $dsn = "{$dbConfig['type']}:host={$dbConfig['hostname']};port={$dbConfig['hostport']};dbname={$dbConfig['database']};charset={$dbConfig['charset']}";
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "数据库连接成功！\n";
} catch (PDOException $e) {
    die("数据库连接失败: " . $e->getMessage() . "\n");
}

// 创建菜单表SQL
$createTableSql = "
CREATE TABLE IF NOT EXISTS `{$dbConfig['prefix']}menus` (
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
";

// 执行创建表SQL
try {
    $pdo->exec($createTableSql);
    echo "菜单表创建成功！\n";
} catch (PDOException $e) {
    echo "菜单表创建失败: " . $e->getMessage() . "\n";
}

// 检查表中是否已有数据
$checkSql = "SELECT COUNT(*) FROM `{$dbConfig['prefix']}menus`";
try {
    $count = $pdo->query($checkSql)->fetchColumn();
    if ($count > 0) {
        echo "菜单表中已有 {$count} 条数据，跳过数据初始化\n";
        exit(0);
    }
} catch (PDOException $e) {
    echo "检查数据失败: " . $e->getMessage() . "\n";
    exit(1);
}

// 插入顶级菜单数据
$topMenus = [
    ['仪表盘', '/dashboard', 'LayoutDashboard', 0, 1, 10],
    ['项目管理', '/dashboard/projects', 'FolderKanban', 0, 1, 20],
    ['客户池', '/dashboard/customers', 'Users', 0, 1, 30],
    ['管理员权限', '/dashboard/admins', 'Settings', 0, 1, 40],
    ['系统设置', '/settings', 'Cog', 0, 1, 50],
];

$insertTopMenuSql = "INSERT INTO `{$dbConfig['prefix']}menus` 
                    (`title`, `path`, `icon`, `parent_id`, `status`, `sort`, `create_time`, `update_time`) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

$timestamp = time();
$insertStmt = $pdo->prepare($insertTopMenuSql);

$pdo->beginTransaction();
try {
    foreach ($topMenus as $index => $menu) {
        $insertStmt->execute([
            $menu[0], // title
            $menu[1], // path
            $menu[2], // icon
            $menu[3], // parent_id
            $menu[4], // status
            $menu[5], // sort
            $timestamp,
            $timestamp
        ]);
    }
    $pdo->commit();
    echo "顶级菜单数据插入成功！\n";
} catch (PDOException $e) {
    $pdo->rollBack();
    echo "顶级菜单数据插入失败: " . $e->getMessage() . "\n";
    exit(1);
}

// 查询刚插入的顶级菜单ID
$menuIds = [];
$queryTopMenuSql = "SELECT id, title FROM `{$dbConfig['prefix']}menus` WHERE parent_id = 0";
try {
    $topMenusResult = $pdo->query($queryTopMenuSql)->fetchAll(PDO::FETCH_ASSOC);
    foreach ($topMenusResult as $menu) {
        $menuIds[$menu['title']] = $menu['id'];
    }
} catch (PDOException $e) {
    echo "查询顶级菜单失败: " . $e->getMessage() . "\n";
    exit(1);
}

// 插入子菜单数据
$subMenus = [
    ['项目列表', '/dashboard/projects', 'List', $menuIds['项目管理'], 1, 21],
    ['新建项目', '/dashboard/projects/new', 'PlusCircle', $menuIds['项目管理'], 1, 22],
    ['客户管理', '/dashboard/customers', 'Users', $menuIds['客户池'], 1, 31],
    ['客户分析', '/dashboard/customers/analytics', 'BarChart', $menuIds['客户池'], 1, 32],
    ['管理员列表', '/dashboard/admins', 'UserCog', $menuIds['管理员权限'], 1, 41],
    ['角色管理', '/dashboard/admins/roles', 'ShieldCheck', $menuIds['管理员权限'], 1, 42],
    ['权限设置', '/dashboard/admins/permissions', 'Lock', $menuIds['管理员权限'], 1, 43],
    ['基本设置', '/settings/general', 'Settings', $menuIds['系统设置'], 1, 51],
    ['安全设置', '/settings/security', 'Shield', $menuIds['系统设置'], 1, 52],
];

$insertSubMenuSql = "INSERT INTO `{$dbConfig['prefix']}menus` 
                    (`title`, `path`, `icon`, `parent_id`, `status`, `sort`, `create_time`, `update_time`) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

$pdo->beginTransaction();
try {
    $insertStmt = $pdo->prepare($insertSubMenuSql);
    foreach ($subMenus as $menu) {
        $insertStmt->execute([
            $menu[0], // title
            $menu[1], // path
            $menu[2], // icon
            $menu[3], // parent_id
            $menu[4], // status
            $menu[5], // sort
            $timestamp,
            $timestamp
        ]);
    }
    $pdo->commit();
    echo "子菜单数据插入成功！\n";
} catch (PDOException $e) {
    $pdo->rollBack();
    echo "子菜单数据插入失败: " . $e->getMessage() . "\n";
    exit(1);
}

echo "菜单初始化完成！\n";