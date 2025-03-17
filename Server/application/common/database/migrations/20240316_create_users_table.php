<?php

use think\migration\Migrator;
use think\migration\db\Column;

class CreateUsersTable extends Migrator
{
    /**
     * 创建用户表
     */
    public function up()
    {
        $table = $this->table('users', [
            'engine' => 'InnoDB',
            'comment' => '用户表',
            'id' => 'id',
            'signed' => false,
        ]);
        
        $table->addColumn('username', 'string', [
                'limit' => 50,
                'null' => false,
                'comment' => '用户名',
            ])
            ->addColumn('password', 'string', [
                'limit' => 60,
                'null' => false,
                'comment' => '密码',
            ])
            ->addColumn('mobile', 'string', [
                'limit' => 11,
                'null' => true,
                'comment' => '登录手机号',
            ])
            ->addColumn('identity_id', 'integer', [
                'limit' => 10,
                'null' => true,
                'comment' => '身份信息',
            ])
            ->addColumn('auth_id', 'integer', [
                'limit' => 10,
                'null' => true,
                'comment' => '权限id',
            ])
            ->addColumn('create_at', 'timestamp', [
                'null' => false,
                'default' => 'CURRENT_TIMESTAMP',
                'comment' => '创建时间',
            ])
            ->addColumn('update_at', 'timestamp', [
                'null' => false,
                'default' => 'CURRENT_TIMESTAMP',
                'update' => 'CURRENT_TIMESTAMP',
                'comment' => '修改时间',
            ])
            ->addColumn('delete_at', 'timestamp', [
                'null' => true,
                'default' => null,
                'comment' => '删除时间',
            ])
            ->addIndex(['username'], [
                'unique' => true,
                'name' => 'idx_username',
            ])
            ->addIndex(['mobile'], [
                'unique' => true,
                'name' => 'idx_mobile',
            ])
            ->create();
    }

    /**
     * 删除用户表
     */
    public function down()
    {
        $this->dropTable('users');
    }
} 