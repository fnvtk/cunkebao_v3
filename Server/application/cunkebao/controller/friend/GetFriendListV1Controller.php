<?php
namespace app\cunkebao\controller\friend;

use app\common\model\Device as DeviceModel;
use app\common\model\DeviceUser as DeviceUserModel;
use app\common\model\WechatFriendShip as WechatFriendShipModel;
use app\cunkebao\controller\BaseController;
use think\Db;

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
        $page = $this->request->param('page',1);
        $limit = $this->request->param('limit',20);
        $keyword = $this->request->param('keyword','');
        $deviceIds = $this->request->param('deviceIds','');

        if(!empty($deviceIds)){
            $deviceIds = explode(',',$deviceIds);
        }

        try {

            $where = [];
            if ($this->getUserInfo('isAdmin') == 1) {
                $where[] = ['isDeleted','=',0];
            } else {
                $where[] = ['isDeleted','=',0];
            }

            
            if(!empty($keyword)){
                $where[] = ['nickname|alias|wechatId','like','%'.$keyword.'%'];
            }


            $devices = Db::name('device_wechat_login')
                ->where(['companyId' => $this->getUserInfo('companyId'),'alive' => 1])
                ->order('id desc')
                ->group('wechatId');

            if(!empty($deviceIds) && is_array($deviceIds)){
                $devices = $devices->whereIn('deviceId',$deviceIds);
            }
            $devices = $devices->column('wechatId');

            $where[] = ['ownerWechatId','in',$devices];

            $data = Db::table('s2_wechat_friend')
                ->field(['nickname','avatar','alias','id','wechatId','ownerNickname','ownerAlias','ownerWechatId','createTime'])
                ->where($where);
            $total = $data->count();
            $list = $data->page($page, $limit)->order('id DESC')->select();


//            $data = WechatFriendShipModel::alias('wf')
//                ->field(['wa1.nickname','wa1.avatar','wa1.alias','wf.id','wf.wechatId','wa2.nickname as ownerNickname','wa2.alias as ownerAlias','wa2.wechatId as ownerWechatId','wf.createTime'])
//                ->Join('wechat_account wa1','wf.wechatId = wa1.wechatId')
//                ->Join('wechat_account wa2','wf.ownerWechatId = wa2.wechatId')
//                ->where($where);
//
//            $total = $data->count();
//            $list = $data->page($page, $limit)->order('wf.id DESC')->group('wf.id')->select();

           


            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'list' => $list,
                    'total' => $total,
                    'companyId' => $this->getUserInfo('companyId')
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