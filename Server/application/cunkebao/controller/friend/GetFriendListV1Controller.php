<?php
namespace app\cunkebao\controller\friend;

use app\common\model\Device as DeviceModel;
use app\common\model\DeviceUser as DeviceUserModel;
use app\common\model\WechatFriend;
use app\cunkebao\controller\BaseController;

/**
 * 设备管理控制器
 */
class GetFriendListV1Controller extends BaseController
{
    

    /**
     * 获取好友列表
     * @return \think\response\Json
     */
    public function index()
    {
        try {

            $where = [];
            if ($this->getUserInfo('isAdmin') == 1) {
                $where['companyId'] = $this->getUserInfo('companyId');
            } else {
                $where['companyId'] = $this->getUserInfo('companyId');
                $where['userId'] = $this->getUserInfo('id');
            }


            $data = WechatFriend::alias('wf')
                ->field(['wa1.nickname','wa1.avatar','wa1.alias','wa1.wechatId','wa2.nickname as ownerNickname','wa2.alias as ownerAlias','wf.createTime'])
                ->leftJoin('wechat_account wa1','wf.wechatId = wa1.wechatId')
                ->leftJoin('wechat_account wa2','wf.ownerWechatId = wa2.wechatId')
                ->where($where);





            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'list' => $data->select(),
                    'total' => $data->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => $e->getCode(),
                'msg' => $e->getMessage()
            ]);
        }
    }
} 