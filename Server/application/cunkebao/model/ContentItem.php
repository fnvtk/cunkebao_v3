<?php

namespace app\cunkebao\model;

use think\Model;

class ContentItem extends Model
{
    protected $pk = 'id';
    protected $name = 'content_items';

    // 内容类型
    const TYPE_TEXT = 1;    // 文本
    const TYPE_IMAGE = 2;   // 图片
    const TYPE_VIDEO = 3;   // 视频
    const TYPE_LINK = 4;    // 链接

    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';

    // 定义关联的内容库
    public function library()
    {
        return $this->belongsTo('ContentLibrary', 'libraryId', 'id');
    }

    // 内容类型获取器
    public function getTypeTextAttr($value, $data)
    {
        $types = [
            self::TYPE_TEXT => '文本',
            self::TYPE_IMAGE => '图片',
            self::TYPE_VIDEO => '视频',
            self::TYPE_LINK => '链接'
        ];
        return isset($types[$data['type']]) ? $types[$data['type']] : '未知';
    }

    // 内容数据获取器
    public function getContentDataAttr($value)
    {
        return json_decode($value, true);
    }

    // 内容数据修改器
    public function setContentDataAttr($value)
    {
        return is_array($value) ? json_encode($value) : $value;
    }
} 