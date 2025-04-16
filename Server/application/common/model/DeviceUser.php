<?php

namespace app\common\model;

use think\Model;

/**
 * 设备用户关联模型
 * 用于管理设备与操盘手（用户）的关联关系
 */
class DeviceUser extends Model
{
    /**
     * 数据表名
     * @var string
     */
    protected $name = 'device_user';

    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';

    /**
     * 关联用户模型
     * @return \think\model\relation\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('User', 'userId', 'id');
    }

    /**
     * 关联设备模型
     * @return \think\model\relation\BelongsTo
     */
    public function device()
    {
        return $this->belongsTo('app\common\model\Device', 'deviceId', 'id');
    }

    /**
     * 关联公司模型
     * @return \think\model\relation\BelongsTo
     */
    public function company()
    {
        return $this->belongsTo('app\common\model\Company', 'companyId', 'id');
    }
} 