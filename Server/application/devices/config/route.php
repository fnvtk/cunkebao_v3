<?php
// +----------------------------------------------------------------------
// | 设备管理模块路由配置
// +----------------------------------------------------------------------

return [
    // 设备管理路由
    'devices/count' => 'devices/index/count',                // 获取设备总数
    'devices/list' => 'devices/index/index',                 // 获取设备列表
    'devices/info/:id' => 'devices/index/read',              // 获取设备详情
    'devices/add' => ['devices/index/save', ['method' => 'post']],        // 添加设备
    'devices/update/:id' => ['devices/index/update', ['method' => 'put']], // 更新设备
    'devices/delete/:id' => ['devices/index/delete', ['method' => 'delete']], // 删除设备
    'devices/count_by_brand' => 'devices/index/countByBrand',  // 按设备品牌统计数量
    'devices/count_by_status' => 'devices/index/countByStatus', // 按设备在线状态统计数量
]; 