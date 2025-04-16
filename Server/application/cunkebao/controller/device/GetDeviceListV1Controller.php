<?php
namespace app\cunkebao\controller\device;

use app\cunkebao\model\Device as DeviceModel;
use app\cunkebao\model\DeviceUser as DeviceUserModel;
use app\cunkebao\model\WechatFriend;
use think\Controller;
use think\facade\Request;

/**
 * 设备管理控制器
 */
class GetDeviceListV1Controller extends Controller
{
    /**
     * 用户信息
     * @var object
     */
    protected $user;
    
    /**
     * 初始化
     */
    protected function initialize()
    {
        parent::initialize();

        date_default_timezone_set('Asia/Shanghai');

        $this->user = request()->userInfo;;
    }

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
        if (!empty($keyword = Request::param('keyword'))) {
            $where[] = ['exp', "d.imei LIKE '%{$keyword}%' OR d.memo LIKE '%{$keyword}%'"];
        }

        // 设备在线状态
        if (is_numeric($alive = Request::param('alive'))) {
            $where['d.alive'] = $alive;
        }

        $where['d.companyId'] = $this->user['companyId'];
        $where['d.deleteTime'] = 0;

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
            $this->user['id'],
            $this->user['companyId']
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
     * @param array $where 查询条件
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return \think\Paginator 分页对象
     */
    protected function getDeviceList($where, $page = 1, $limit = 10)
    {
        $query = DeviceModel::alias('d')
            ->field(['d.id', 'd.imei', 'd.memo', 'l.wechatId', 'd.alive', '0 totalFriend'])
            ->leftJoin('device_wechat_login l', 'd.id = l.deviceId');

        foreach ($where as $key => $value) {
            if (is_numeric($key) && is_array($value) && isset($value[0]) && $value[0] === 'exp') {
                $query->whereExp('', $value[1]);
                continue;
            }

            $query->where($key, $value);
        }

        return $query->paginate($limit, false, ['page' => $page]);
    }

    /**
     * 统计微信好友
     *
     * @param object $list
     * @return array
     */
    protected function countFriend(object $list): array
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
            $page = (int)Request::param('page', 1);
            $limit = (int)Request::param('limit', 10);

            if ($this->user['isAdmin'] == 1) {
                $where = $this->makeWhere();
                $result = $this->getDeviceList($where, $page, $limit);
            } else {
                $where = $this->makeWhere($this->makeDeviceIdsWhere());
                $result = $this->getDeviceList($where, $page, $limit);
            }

            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => [
                    'list'  => $this->countFriend($result),
                    'total' => $result->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return json([
                'code' => $e->getCode(),
                'msg'  => $e->getMessage()
            ]);
        }
    }
} 