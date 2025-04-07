<?php
namespace app\plan\model;

use think\Model;

/**
 * 标签模型
 */
class Tag extends Model
{
    // 设置表名
    protected $name = 'tag';
    protected $prefix = 'tk_';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = 'int';
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'count' => 'integer',
        'status' => 'integer',
        'createTime' => 'integer',
        'updateTime' => 'integer'
    ];
    
    /**
     * 获取或创建标签
     * @param string $name 标签名
     * @param string $type 标签类型
     * @param string $color 标签颜色
     * @return int 标签ID
     */
    public static function getOrCreate($name, $type = 'traffic', $color = '')
    {
        $tag = self::where([
            ['name', '=', $name],
            ['type', '=', $type]
        ])->find();
        
        if ($tag) {
            return $tag['id'];
        } else {
            $model = new self();
            $model->save([
                'name' => $name,
                'type' => $type,
                'color' => $color ?: self::getRandomColor(),
                'count' => 0,
                'status' => 1
            ]);
            return $model->id;
        }
    }
    
    /**
     * 更新标签使用次数
     * @param int $id 标签ID
     * @param int $increment 增量
     * @return bool 更新结果
     */
    public static function updateCount($id, $increment = 1)
    {
        return self::where('id', $id)->inc('count', $increment)->update();
    }
    
    /**
     * 获取标签列表
     * @param string $type 标签类型
     * @param array $where 额外条件
     * @return array 标签列表
     */
    public static function getTagsByType($type = 'traffic', $where = [])
    {
        $conditions = array_merge([
            ['type', '=', $type],
            ['status', '=', 1]
        ], $where);
        
        return self::where($conditions)
            ->order('count DESC, id DESC')
            ->select();
    }
    
    /**
     * 根据ID获取标签名称
     * @param array $ids 标签ID数组
     * @return array 标签名称数组
     */
    public static function getTagNames($ids)
    {
        if (empty($ids)) {
            return [];
        }
        
        $tagIds = is_array($ids) ? $ids : explode(',', $ids);
        
        $tags = self::where('id', 'in', $tagIds)->column('name');
        
        return $tags;
    }
    
    /**
     * 获取随机颜色
     * @return string 颜色代码
     */
    private static function getRandomColor()
    {
        $colors = [
            '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
            '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
            '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
            '#ff5722', '#795548', '#9e9e9e', '#607d8b'
        ];
        
        return $colors[array_rand($colors)];
    }
} 