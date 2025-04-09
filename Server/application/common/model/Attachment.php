<?php
namespace app\common\model;

use think\Model;

class Attachment extends Model
{
    // 设置表名
    protected $name = 'attachments';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = 'datetime';
    
    // 定义时间戳字段名
    protected $createTime = 'create_at';
    protected $updateTime = 'update_at';
    protected $deleteTime = 'delete_at';
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'dl_count' => 'integer',
        'size' => 'integer',
        'scene' => 'integer',
        'create_at' => 'datetime',
        'update_at' => 'datetime',
        'delete_at' => 'datetime'
    ];
    
    /**
     * 添加附件记录
     * @param array $data 附件数据
     * @return int|bool
     */
    public static function addAttachment($data)
    {
        $attachment = new self();
        return $attachment->allowField(true)->save($data);
    }
    
    /**
     * 根据hash_key获取附件
     * @param string $hashKey
     * @return array|null
     */
    public static function getByHashKey($hashKey)
    {
        return self::where('hash_key', $hashKey)
            ->where('delete_at', null)
            ->find();
    }
} 