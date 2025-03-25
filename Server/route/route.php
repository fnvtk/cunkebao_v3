<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006~2018 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------

use think\facade\Route;

// 加载Common模块路由配置
include __DIR__ . '/../application/common/config/route.php';

// 加载Devices模块路由配置
include __DIR__ . '/../application/devices/config/route.php';

// 加载Store模块路由配置
include __DIR__ . '/../application/store/config/route.php';

return [];
