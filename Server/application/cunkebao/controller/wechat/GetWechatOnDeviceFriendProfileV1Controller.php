<?php

namespace app\cunkebao\controller\wechat;

use app\cunkebao\controller\BaseController;
use app\cunkebao\model\WechatAccount as WechatAccountModel;
use library\ResponseHelper;

/**
 * 设备微信控制器
 */
class GetWechatOnDeviceFriendProfileV1Controller extends BaseController
{
    /**
     * 获取最近互动时间
     *
     * @param string $wechatId
     * @return string
     */
    protected function getLastPlayTime(string $wechatId): string
    {
        return date('Y-m-d', strtotime('-1 day'));
    }

    /**
     * 获取微信账号
     *
     * @param int $id
     * @return array
     * @throws \Exception
     */
    protected function getWechatAccountProfileById(int $id): array
    {
        $account = WechatAccountModel::alias('w')
            ->field(
                [
                    'w.id', 'w.avatar', 'w.nickname', 'w.region', 'w.wechatId',
                    'CASE WHEN w.alias IS NULL OR w.alias = "" THEN w.wechatId ELSE w.alias END AS wechatId',
                    'f.createTime addTime', 'f.tags', 'f.memo'
                ]
            )
            ->join('wechat_friendship f', 'w.wechatId=f.wechatId')
            ->find($id);

        if (is_null($account)) {
            throw new \Exception('未获取到微信账号数据', 404);
        }

        return $account->toArray();
    }

    /**
     * 获取微信好友详情
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $results = $this->getWechatAccountProfileById(
                $this->request->param('aId/d')
            );

            return ResponseHelper::success(
                array_merge($results, [
                    'playDate' => $this->getLastPlayTime($results['wechatId']),
                    'tags'     => json_decode($results['tags'], true),
                    'addDate'  => date('Y-m-d', $results['addTime']),
                ])
            );
        } catch (\Exception $e) {
            return ResponseHelper::error($e->getMessage(), $e->getCode());
        }
    }
} 