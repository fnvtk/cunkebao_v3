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

return [
    // 数据库类型
    'type'            => 'mysql',
    // 服务器地址
    'hostname'        => '127.0.0.1',
    // 数据库名
    'database'        => 'xianyu_script',
    // 用户名
    'username'        => 'xianyu_script',
    // 密码
    'password'        => 'Mddfts7ex3LCMRWb',
    // 端口
    'hostport'        => '',
    // 连接dsn
    'dsn'             => '',
    // 数据库连接参数
    'params'          => [],
    // 数据库编码默认采用utf8
    'charset'         => 'utf8mb4',
    // 数据库表前缀
    'prefix'          => 'tk_',
    // 数据库调试模式
    'debug'           => true,
    // 数据库部署方式:0 集中式(单一服务器),1 分布式(主从服务器)
    'deploy'          => 0,
    // 数据库读写是否分离 主从式有效
    'rw_separate'     => false,
    // 读写分离后 主服务器数量
    'master_num'      => 1,
    // 指定从服务器序号
    'slave_no'        => '',
    // 自动读取主库数据
    'read_master'     => false,
    // 是否严格检查字段是否存在
    'fields_strict'   => true,
    // 数据集返回类型
    'resultset_type'  => 'array',
    // 自动写入时间戳字段
    'auto_timestamp'  => true,
    // 时间字段取出后的默认时间格式
    'datetime_format' => 'Y-m-d H:i:s',
    // 是否需要进行SQL性能分析
    'sql_explain'     => false,
    // Builder类
    'builder'         => '',
    // Query类
    'query'           => '\\think\\db\\Query',
    // 是否需要断线重连
    'break_reconnect' => true,
    // 断线标识字符串
    'break_match_str' => [],
    'clone' => [
        // 数据库类型
        'type'        => 'mysql',
        // 服务器地址
        'hostname'    => 'gz-cynosdbmysql-grp-2k3icgxh.sql.tencentcdb.com',
        // 数据库名
        'database'    => 'clone',
        // 数据库用户名
        'username'    => 'root',
        // 数据库密码
        'password'    => 'Lo.EQ{%t9G#v-1qv*Y',
        // 端口
        'hostport'    => '20626',
        // 数据库编码默认采用utf8
        'charset'     => 'utf8mb4',
        // 数据库表前缀
        'prefix'      => '',
    ],
    'pgsql' => [
        // 数据库类型
        'type'        => 'pgsql',
        // 服务器地址
        'hostname'    => 'pgm-7xv383pbm1orihnpfo.pg.rds.aliyuncs.com',
        // 数据库名
        'database'    => 'aggregate_chat_system',
        // 数据库用户名
        'username'    => 'postgres',
        // 数据库密码
        'password'    => 'JYJ4Bz0dbWdPRVgq',
        // 数据库编码默认采用utf8
        'charset'     => 'utf8',
        // 数据库表前缀
        'prefix'      => '',
    ],
    'xm_pgsql' => [
        // 数据库类型
        'type'        => 'pgsql',
        // 服务器地址
        'hostname'    => 'pgm-7xv383pbm1orihnpfo.pg.rds.aliyuncs.com',
        // 数据库名
        'database'    => 'xm_aggregate_chat_system',
        // 数据库用户名
        'username'    => 'postgres',
        // 数据库密码
        'password'    => 'JYJ4Bz0dbWdPRVgq',
        // 数据库编码默认采用utf8
        'charset'     => 'utf8',
        // 数据库表前缀
        'prefix'      => '',
    ],
    'shouyou' => [
        // 数据库类型
        'type'        => 'mysql',
        // 服务器地址
        'hostname'    => 'rm-7xv05155q5pa291l3vo.mysql.rds.aliyuncs.com',
        // 数据库名
        'database'    => 'shouyou',
        // 数据库用户名
        'username'    => 'root',
        // 数据库密码
        'password'    => '320Azai609',
        // 数据库编码默认采用utf8
        'charset'     => 'utf8',
        // 数据库表前缀
        'prefix'      => '',
    ],
];
