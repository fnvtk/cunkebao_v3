<?php
namespace app\cunkebao\controller\chatroom;

use app\cunkebao\controller\BaseController;
use app\cunkebao\model\WechatChatroom;
use think\Db;

/**
 * 群聊管理控制器
 */
class GetChatroomListV1Controller extends BaseController
{
    
    /**
     * 获取群聊列表
     * @return \think\response\Json
     */
    public function index()
    {
        $page = $this->request->param('page', 1);
        $limit = $this->request->param('limit', 20);
        $keyword = $this->request->param('keyword', '');
        try {
            
            $where = [];
            if ($this->getUserInfo('isAdmin') == 1) {
                $where[] = ['g.companyId', '=', $this->getUserInfo('companyId')];
                $where[] = ['g.deleteTime', '=', 0];
            } else {
                $where[] = ['g.companyId', '=', $this->getUserInfo('companyId')];
                $where[] = ['g.deleteTime', '=', 0];
                //$where[] = ['g.userId', '=', $this->getUserInfo('id')];
            }
            
            if(!empty($keyword)){
                $where[] = ['g.name', 'like', '%'.$keyword.'%'];
            }
            
            $data = WechatChatroom::alias('g')
                ->field(['g.id', 'g.chatroomId', 'g.name', 'g.avatar','g.ownerWechatId', 'g.identifier', 'g.createTime',
                    'wa.nickname as ownerNickname','wa.avatar as ownerAvatar','wa.alias as ownerAlias'])
                ->Join('wechat_account wa', 'g.ownerWechatId = wa.wechatId', 'LEFT')
                ->where($where);
            
            $total = $data->count();
            $list = $data->page($page, $limit)->order('g.id DESC')->select();
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'list' => $list,
                    'total' => $total,
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => $e->getCode(),
                'msg' => $e->getMessage()
            ]);
        }
    }

    /**
     * 获取群成员列表
     * @return \think\response\Json
     */
    public function getMemberList()
    {
        $page = $this->request->param('page', 1);
        $limit = $this->request->param('limit', 20);
        $keyword = $this->request->param('keyword', '');
        $groupId = $this->request->param('groupId', 0);

        if (empty($groupId)) {
            return json([
                'code' => 400,
                'msg' => '群ID不能为空'
            ]);
        }

        try {
            $where = [];
            $where[] = ['m.groupId', '=', $groupId];
            $where[] = ['m.deleteTime', '=', 0];
            
            // 如果有搜索关键词
            if (!empty($keyword)) {
                $where[] = ['m.nickname|m.identifier', 'like', '%'.$keyword.'%'];
            }
            
            $data = Db::name('wechat_group_member')
                ->alias('m')
                ->field([
                    'm.id', 
                    'm.identifier', 
                    'm.customerIs', 
                    'wa.nickname', 
                    'wa.avatar',
                    'm.groupId', 
                    'm.createTime',
                    'g.name as groupName',
                    'g.chatroomId'
                ])
                ->join('wechat_group g', 'm.groupId = g.id', 'LEFT')
                ->join('wechat_account wa', 'wa.wechatId = m.identifier', 'LEFT')
                ->where($where);
            
            $total = $data->count();
            $list = $data->page($page, $limit)
                ->order('m.id DESC')
                ->select();
            
            // 格式化时间
            foreach ($list as &$item) {
                if (!empty($item['createTime'])) {
                    $item['createTime'] = date('Y-m-d H:i:s', $item['createTime']);
                }
            }
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'list' => $list,
                    'total' => $total,
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => $e->getCode() ?: 500,
                'msg' => $e->getMessage()
            ]);
        }
    }
}
