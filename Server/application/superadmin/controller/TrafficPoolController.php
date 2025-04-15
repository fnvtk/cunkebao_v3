<?php
namespace app\superadmin\controller;

use app\superadmin\model\TrafficPool as TrafficPoolModel;
use app\superadmin\model\TrafficSource;
use app\superadmin\model\Company;
use app\superadmin\model\WechatAccount;
use app\superadmin\model\WechatTag;
use think\Controller;
use think\facade\Request;
use think\facade\Session;
use think\facade\Validate;

/**
 * 客户池控制器
 */
class TrafficPoolController extends Controller
{
    /**
     * 获取客户池列表
     * @return \think\response\Json
     */
    public function getList()
    {
        // 获取分页参数
        $page = Request::param('page/d', 1);
        $limit = Request::param('limit/d', 30);
        
        // 构建查询
        $query = TrafficPoolModel::alias('tp')
            ->join('traffic_source ts', 'tp.identifier = ts.identifier', 'INNER')
            ->join('company c', 'ts.companyId = c.id', 'LEFT')
            ->join('wechat_account wa', 'tp.wechatId = wa.wechatId', 'LEFT')
            ->join('wechat_tag wt', 'wa.wechatId = wt.wechatId')
            ->field([
                'ts.id',
                'tp.wechatId',
                'ts.createTime as addTime',
                'ts.fromd as source',
                'c.name as projectName',
                'wa.avatar',
                'wa.gender',
                'wa.nickname',
                'wa.region',
                'wt.tags'
            ])
            ->order('tp.createTime DESC');
        
        // 执行分页查询
        $list = $query->paginate([
            'list_rows' => $limit,
            'page' => $page
        ]);
        
        // 处理性别显示
        $list->each(function($item) {
            // 处理性别显示
            switch($item['gender']) {
                case 1:
                    $item['gender'] = '男';
                    break;
                case 2:
                    $item['gender'] = '女';
                    break;
                default:
                    $item['gender'] = '保密';
            }

            $item['addTime'] = $item['addTime'] ? date('Y-m-d H:i:s', $item['addTime']) : null;

            // 处理标签显示
            if (is_string($item['tags'])) {
                $item['tags'] = json_decode($item['tags'], true);
            }
            
            return $item;
        });
        
        // 返回结果
        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'total' => $list->total(),
                'list' => $list->items(),
                'page' => $list->currentPage(),
                'limit' => $list->listRows()
            ]
        ]);
    }

    /**
     * 获取客户详情
     * @return \think\response\Json
     */
    public function getDetail()
    {
        // 获取参数
        $id = Request::param('id/d');
        if (!$id) {
            return json(['code' => 400, 'msg' => '参数错误']);
        }

        try {
            // 查询流量来源信息
            $sourceInfo = TrafficSource::alias('ts')
                ->join('company c', 'ts.companyId = c.id', 'LEFT')
                ->field([
                    'ts.fromd as source',
                    'ts.createTime as addTime',
                    'c.name as projectName',
                    'ts.identifier'
                ])
                ->where('ts.id', $id)
                ->find();

            if (!$sourceInfo) {
                return json(['code' => 404, 'msg' => '记录不存在']);
            }

            // 查询客户池信息
            $poolInfo = TrafficPoolModel::where('identifier', $sourceInfo['identifier'])
                ->field('wechatId')
                ->find();

            $result = [
                'source' => $sourceInfo['source'],
                'addTime' => $sourceInfo['addTime'] ? date('Y-m-d H:i:s', $sourceInfo['addTime']) : null,
                'projectName' => $sourceInfo['projectName']
            ];

            // 如果存在微信ID，查询微信账号信息
            if ($poolInfo && $poolInfo['wechatId']) {
                // 查询微信账号信息
                $wechatInfo = WechatAccount::where('wechatId', $poolInfo['wechatId'])
                    ->field('avatar,nickname,region,gender')
                    ->find();

                if ($wechatInfo) {
                    $result = array_merge($result, [
                        'avatar' => $wechatInfo['avatar'],
                        'nickname' => $wechatInfo['nickname'],
                        'region' => $wechatInfo['region'],
                        'gender' => $this->formatGender($wechatInfo['gender'])
                    ]);

                    // 查询标签信息
                    $tagInfo = WechatTag::where('wechatId', $poolInfo['wechatId'])
                        ->field('tags')
                        ->find();

                    if ($tagInfo) {
                        $result['tags'] = is_string($tagInfo['tags']) ? 
                            json_decode($tagInfo['tags'], true) : 
                            $tagInfo['tags'];
                    } else {
                        $result['tags'] = [];
                    }
                }
            } else {
                $result = array_merge($result, [
                    'avatar' => '',
                    'nickname' => '未知',
                    'region' => '未知',
                    'gender' => $this->formatGender(0),
                    'tags' => []
                ]);
            }

            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '系统错误：' . $e->getMessage()
            ]);
        }
    }

    /**
     * 格式化性别显示
     * @param int $gender
     * @return string
     */
    protected function formatGender($gender)
    {
        switch($gender) {
            case 1:
                return '男';
            case 2:
                return '女';
            default:
                return '保密';
        }
    }

    /**
     * 检查登录状态
     * @return bool
     */
    protected function checkLogin()
    {
        return Session::has('admin_id');
    }
} 