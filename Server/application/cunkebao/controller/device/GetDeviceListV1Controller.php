<?php

namespace app\cunkebao\controller\device;

use app\common\model\Device as DeviceModel;
use app\common\model\DeviceUser as DeviceUserModel;
use app\common\model\User as UserModel;
use app\common\model\WechatFriend;
use app\cunkebao\controller\BaseController;
use library\ResponseHelper;

/**
 * 设备管理控制器
 */
class GetDeviceListV1Controller extends BaseController
{
    /**
     * 构建查询条件
     *
     * @param array $params
     * @return array
     */
    protected function makeWhere(array $params = []): array
    {
        $where = [];

        // 关键词搜索（同时搜索IMEI和备注）
        if (!empty($keyword = $this->request->param('keyword'))) {
            $where[] = ['exp', "d.imei LIKE '%{$keyword}%' OR d.memo LIKE '%{$keyword}%'"];
        }

        // 设备在线状态
        if (is_numeric($alive = $this->request->param('alive'))) {
            $where['d.alive'] = $alive;
        }

        $where['d.companyId'] = $this->getUserInfo('companyId');

        return array_merge($params, $where);
    }

    /**
     * 获取指定用户的所有设备ID
     *
     * @return array
     */
    protected function makeDeviceIdsWhere(): array
    {
        $deviceIds = DeviceUserModel::where(
            $this->getUserInfo('id'),
            $this->getUserInfo('companyId')
        )
            ->column('deviceId');

        if (empty($deviceIds)) {
            throw new \Exception('请联系管理员绑定设备', 403);
        }

        $where['d.id'] = ['in', $deviceIds];

        return $where;
    }

    /**
     * 获取设备列表
     *
     * @param array $where 查询条件
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return \think\Paginator 分页对象
     */
    protected function getDeviceList(array $where, int $page = 1, int $limit = 10): \think\Paginator
    {
        $query = DeviceModel::alias('d')
            ->field([
                'd.id', 'd.imei', 'd.memo', 'd.alive',
                'l.wechatId',
                'wa.nickname', 'wa.alias', '0 totalFriend'
            ])
            ->leftJoin('device_wechat_login l', 'd.id = l.deviceId')
            ->leftJoin('wechat_account wa', 'l.wechatId = wa.wechatId')
            ->order('d.id desc');

        foreach ($where as $key => $value) {
            if (is_numeric($key) && is_array($value) && isset($value[0]) && $value[0] === 'exp') {
                $query->whereExp('', $value[1]);
                continue;
            }

            $query->where($key, $value);
        }

        return $query->paginate($this->request->param('limit/d', 10), false, ['page' => $this->request->param('page/d', 1)]);
    }

    /**
     * 统计微信好友
     *
     * @param \think\Paginator $list
     * @return array
     */
    protected function countFriend(\think\Paginator $list): array
    {
        $result = [];

        foreach ($list->items() as $item) {
            $section = $item->toArray();

            if ($item->wechatId) {
                $section['totalFriend'] = WechatFriend::where(['ownerWechatId' => $section['wechatId']])->count();
            }

            array_push($result, $section);
        }

        return $result;
    }

    /**
     * 获取设备列表
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            if ($this->getUserInfo('isAdmin') == UserModel::ADMIN_STP) {
                $where = $this->makeWhere();
                $result = $this->getDeviceList($where);
            } else {
                $where = $this->makeWhere($this->makeDeviceIdsWhere());
                $result = $this->getDeviceList($where);
            }

            return ResponseHelper::success(
                [
                    'list'  => $this->countFriend($result),
                    'total' => $result->total(),
                ]
            );
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 