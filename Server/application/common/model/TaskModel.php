<?php

namespace app\common\model;

use think\Model;

class TaskModel extends Model {

    const PLATFORM_XIANYU = 'XIANYU';

    const TYPE_PRODUCT_RELEASE = 'PRODUCT_RELEASE';
    const TYPE_PRODUCT_POLISH = 'PRODUCT_POLISH';
    const TYPE_PRODUCT_ON = 'PRODUCT_ON';
    const TYPE_PRODUCT_OFF = 'PRODUCT_OFF';
    const TYPE_COIN_SIGN = 'COIN_SIGN';
    const TYPE_COIN_DEDUCT = 'COIN_DEDUCT';
    const TYPE_PRICE_CUT = 'PRICE_CUT';
    const TYPE_COMMENT_REMOVE = 'COMMENT_REMOVE';
    const TYPE_PRODUCT_RE_RELEASE = 'PRODUCT_RE_RELEASE';
    const TYPE_RAISE_XY = 'RAISE_XY';
    const TYPE_RAISE_XY_TZ = 'RAISE_XY_TZ';
    const TYPE_RAISE_XY_UNITY = 'RAISE_XY_UNITY';
    const TYPE_SYNC_USER = 'SYNC_USER';
    const TYPE_SYNC_SHOP = 'SYNC_SHOP';
    const TYPE_UPDATE_USER = 'UPDATE_USER';
    const TYPE_PRODUCT_WELFARE = 'PRODUCT_WELFARE';
    const TYPE_MESSAGE_REPLY = 'MESSAGE_REPLY';

    const RUN_TYPE_ONCE = 'ONCE';
    const RUN_TYPE_TIMER = 'TIMER';
    const RUN_TYPE_DAILY = 'DAILY';

    const STATUS_AWAIT = 0;
    const STATUS_ALLOC = 10;
    const STATUS_COMPLETE = 20;

    const IS_DELETED_NO = 0;
    const IS_DELETED_YES = 10;

    protected $json = ['params'];
    protected $jsonAssoc = TRUE;

    /**
     * 获取类型
     *
     * @return string[]
     */
    static public function typeAssoc() {
        return [
            static::TYPE_PRODUCT_RELEASE => '[闲鱼]发布商品',
            static::TYPE_PRODUCT_POLISH  => '[闲鱼]擦亮商品',
            static::TYPE_PRODUCT_ON      => '[闲鱼]上架商品',
            static::TYPE_PRODUCT_OFF     => '[闲鱼]下架商品',
            static::TYPE_COIN_SIGN       => '[闲鱼]签到鱼币',
            static::TYPE_COIN_DEDUCT     => '[闲鱼]鱼币抵扣',
            static::TYPE_PRICE_CUT       => '[闲鱼]一键降价',
            static::TYPE_COMMENT_REMOVE  => '[闲鱼]删除留言',
            static::TYPE_PRODUCT_RE_RELEASE => '[闲鱼]编辑重复',
            static::TYPE_RAISE_XY           => '[闲鱼]养号',
            static::TYPE_RAISE_XY_UNITY     => '[闲鱼]互助养号',
            static::TYPE_RAISE_XY_TZ        => '[闲鱼]会玩养号',
            static::TYPE_SYNC_USER          => '[闲鱼]采集账号信息',
            static::TYPE_SYNC_SHOP          => '[闲鱼]采集店铺信息',
            static::TYPE_UPDATE_USER        => '[闲鱼]修改账号信息',
            static::TYPE_PRODUCT_WELFARE    => '[闲鱼]公益宝贝',
            static::TYPE_MESSAGE_REPLY      => '[闲鱼]消息回复',
        ];
    }

    /**
     * 获取状态
     *
     * @return string[]
     */
    static public function statusAssoc() {
        return [
            static::STATUS_AWAIT    => '加入队列',
            static::STATUS_ALLOC    => '准备运行',
            static::STATUS_COMPLETE => '运行成功',
        ];
    }

    /**
     * 获取执行方式
     *
     * @return string[]
     */
    static public function runTypeAssoc() {
        return [
            static::RUN_TYPE_ONCE  => '立刻执行',
            static::RUN_TYPE_TIMER => '定时执行',
            static::RUN_TYPE_DAILY => '每天执行',
        ];
    }

    /**
     * 平台
     *
     * @return string[]
     */
    static public function platformAssoc() {
        return [
            static::PLATFORM_XIANYU => '闲鱼',
        ];
    }

    /**
     * 任务类
     *
     * @return string[]
     */
    static public function taskClasses() {
        return [
            static::TYPE_PRODUCT_RELEASE => '\app\common\task\ProductReleaseTask',
            static::TYPE_PRODUCT_POLISH  => '\app\common\task\ProductPolishTask',
            static::TYPE_PRODUCT_ON      => '\app\common\task\ProductOnTask',
            static::TYPE_PRODUCT_OFF     => '\app\common\task\ProductOffTask',
            static::TYPE_COIN_SIGN       => '\app\common\task\CoinSignTask',
            static::TYPE_COIN_DEDUCT     => '\app\common\task\CoinDeductTask',
            static::TYPE_PRICE_CUT       => '\app\common\task\PriceCutTask',
            static::TYPE_COMMENT_REMOVE  => '\app\common\task\CommentRemoveTask',
            static::TYPE_PRODUCT_RE_RELEASE => '\app\common\task\ProductReReleaseTask',
            static::TYPE_RAISE_XY           => '\app\common\task\RaiseXyTask',
            static::TYPE_RAISE_XY_UNITY     => '\app\common\task\RaiseXyUnityTask',
            static::TYPE_RAISE_XY_TZ        => '\app\common\task\RaiseXyTzTask',
            static::TYPE_SYNC_USER        => '\app\common\task\SyncUserTask',
            static::TYPE_SYNC_SHOP        => '\app\common\task\SyncShopTask',
            static::TYPE_UPDATE_USER      => '\app\common\task\UpdateUserTask',
            static::TYPE_PRODUCT_WELFARE  => '\app\common\task\ProductWelfareTask',
            static::TYPE_MESSAGE_REPLY    => '\app\common\task\MessageReplyTask',
        ];
    }

    /**
     * 分配到详情
     *
     * @param TaskModel $model
     * @return bool
     */
    static public function toDetail(TaskModel $model) {
        $detail = new TaskDetailModel();
        $detail->setAttr('task_id', $model->getAttr('id'));
        $detail->setAttr('device_id', $model->getAttr('device_id'));
        $detail->setAttr('platform', $model->getAttr('platform'));
        $detail->setAttr('type', $model->getAttr('type'));
        $detail->setAttr('params', $model->getAttr('params'));
        $detail->setAttr('info', new \stdClass());
        return $detail->save();
    }

    /**
     * 获取设备
     *
     * @return DeviceModel
     */
    public function device() {
        return DeviceModel::get($this->getAttr('device_id'));
    }
}