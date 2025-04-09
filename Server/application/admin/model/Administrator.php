<?php

namespace app\admin\model;

use think\Model;

/**
 * 超级管理员模型
 */
class Administrator extends Model
{
    // 设置表名
    protected $name = 'tk_administrators';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    
    /**
     * 获取管理员列表
     * @param array $where 查询条件
     * @param int $page 页码
     * @param int $limit 每页显示数量
     * @return array
     */
    public static function getList($where = [], $page = 1, $limit = 10)
    {
        $count = self::where($where)->count();
        $list = self::where($where)
            ->page($page, $limit)
            ->order('id', 'desc')
            ->select();
            
        $data = [];
        foreach ($list as $item) {
            $data[] = [
                'id' => $item['id'],
                'name' => $item['name'],
                'account' => $item['account'],
                'status' => $item['status'],
                'lastLoginTime' => $item['lastLoginTime'] ? date('Y-m-d H:i:s', $item['lastLoginTime']) : '',
                'lastLoginIp' => $item['lastLoginIp'],
                'createTime' => date('Y-m-d H:i:s', $item['createTime']),
                'updateTime' => date('Y-m-d H:i:s', $item['updateTime'])
            ];
        }
        
        return [
            'count' => $count,
            'list' => $data
        ];
    }
    
    /**
     * 创建管理员
     * @param array $data 管理员数据
     * @return array
     */
    public static function createAdmin($data)
    {
        // 检查账号是否已存在
        $exists = self::where('account', $data['account'])->find();
        if ($exists) {
            return ['code' => 400, 'msg' => '账号已存在'];
        }
        
        // 创建管理员
        $admin = new self;
        $admin->name = $data['name'];
        $admin->account = $data['account'];
        $admin->password = md5($data['password']);
        $admin->status = isset($data['status']) ? $data['status'] : 1;
        $admin->save();
        
        return ['code' => 200, 'msg' => '创建成功', 'data' => $admin];
    }
    
    /**
     * 修改管理员信息
     * @param int $id 管理员ID
     * @param array $data 管理员数据
     * @return array
     */
    public static function updateAdmin($id, $data)
    {
        // 查询管理员
        $admin = self::where('id', $id)->find();
        if (!$admin) {
            return ['code' => 400, 'msg' => '管理员不存在'];
        }
        
        // 如果修改账号，检查账号是否已存在
        if (isset($data['account']) && $data['account'] != $admin['account']) {
            $exists = self::where('account', $data['account'])->find();
            if ($exists) {
                return ['code' => 400, 'msg' => '账号已存在'];
            }
            $admin->account = $data['account'];
        }
        
        // 修改信息
        if (isset($data['name'])) {
            $admin->name = $data['name'];
        }
        
        if (isset($data['password']) && !empty($data['password'])) {
            $admin->password = md5($data['password']);
        }
        
        if (isset($data['status'])) {
            $admin->status = $data['status'];
        }
        
        $admin->save();
        
        return ['code' => 200, 'msg' => '修改成功'];
    }
} 