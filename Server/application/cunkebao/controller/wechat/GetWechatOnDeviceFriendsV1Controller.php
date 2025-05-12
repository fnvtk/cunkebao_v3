<?php

namespace app\cunkebao\controller\wechat;

use app\common\model\WechatAccount as WechatAccountModel;
use app\common\model\WechatFriendShip as WechatFriendShipModel;
use library\ResponseHelper;
use think\Controller;

/**
 * 设备微信控制器
 */
class GetWechatOnDeviceFriendsV1Controller extends Controller
{
    /**
     * 构建返回数据
     *
     * @param \think\Paginator $result
     * @return array
     */
    protected function makeResultedSet(\think\Paginator $result): array
    {
        $resultSets = [];

        foreach ($result->items() as $item) {


            dd($item);

            $sections = $item->toArray() + [];

            array_push($resultSets, $sections);
        }

        return $resultSets;
    }

    /**
     * 根据微信账号ID获取好友列表
     *
     * @param array $where
     * @return \think\Paginator 分页对象
     */
    protected function getFriendsByWechatIdAndQueryParams(array $where): \think\Paginator
    {
        $query = WechatFriendShipModel::alias('f')
            ->field(
                [
                    'w.id', 'w.nickname', 'w.avatar',
                    'CASE WHEN w.alias IS NULL OR w.alias = "" THEN w.wechatId ELSE w.alias END AS wechatId',
                    'f.memo', 'f.tags'
                ]
            )
            ->join('wechat_account w', 'w.wechatId = f.wechatId');

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
     * 获取原始的64位的微信id
     *
     * @return string
     * @throws \Exception
     */
    protected function getStringWechatIdByNumberId(): string
    {
        $account = WechatAccountModel::find(
            $this->request->param('id/d')
        );

        if (is_null($account)) {
            throw new \Exception('微信账号不存在', 404);
        }

        return 'udbfnvtk';

        return $account->wechatId;
    }

    /**
     * 构建查询条件
     *
     * @param array $params
     * @return array
     */
    protected function makeWhere(array $params = []): array
    {
        // 关键词搜索（同时搜索好友备注和标签）
        if (!empty($keyword = $this->request->param('keyword'))) {
            $where[] = ['exp', "f.memo LIKE '%{$keyword}%' OR f.tags LIKE '%{$keyword}%'"];
        }

        $where['f.ownerWechatId'] = $this->getStringWechatIdByNumberId();

        return array_merge($where, $params);
    }

    /**
     * 获取微信好友列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $result = $this->getFriendsByWechatIdAndQueryParams(
                $this->makeWhere()
            );

            return ResponseHelper::success(
                [
                    'list'  => $this->makeResultedSet($result),
                    'total' => $result->total(),
                ]
            );
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 