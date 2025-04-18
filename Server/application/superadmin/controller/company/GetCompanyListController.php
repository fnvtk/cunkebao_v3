<?php

namespace app\superadmin\controller\company;

use app\common\model\Company as CompanyModel;
use app\common\model\User as usersModel;
use app\superadmin\controller\BaseController;

/**
 * 公司控制器
 */
class GetCompanyListController extends BaseController
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

        // 如果有搜索关键词
        if (!empty($keyword = $this->request->param('keyword/s', ''))) {
            $where[] = ['name', 'like', "%{$keyword}%"];
        }

        return array_merge($params, $where);
    }

    /**
     * 获取项目列表
     *
     * @param array $where 查询条件
     * @param int $page 页码
     * @param int $limit 每页数量
     * @return \think\Paginator 分页对象
     */
    protected function getCompanyList(array $where): \think\Paginator
    {
        $query = CompanyModel::alias('c')
            ->field(
                'id, name, status, companyId, memo, createTime'
            );

        foreach ($where as $key => $value) {
            if (is_numeric($key) && is_array($value) && isset($value[0]) && $value[0] === 'exp') {
                $query->whereExp('', $value[1]);
                continue;
            }

            $query->where($key, $value);
        }

        return $query->order('id', 'desc')
            ->paginate($this->request->param('limit/d', 10), false, ['page' => $this->request->param('page/d', 1)]);
    }

    /**
     * 统计项目下的用户数量
     *
     * @param int $companyId
     * @return int
     */
    protected function countUserInCompany(int $companyId): int
    {
        return UsersModel::where('companyId', $companyId)->count('id');
    }

    /**
     * 构建返回数据
     *
     * @param \think\Paginator $list
     * @return array
     */
    protected function makeReturnedResult(\think\Paginator $list): array
    {
        $result = [];

        foreach ($list->items() as $item) {
            $item->userCount = $this->countUserInCompany($item->companyId);

            array_push($result, $item->toArray());
        }

        return $result;
    }

    /**
     * 获取项目列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        $where = $this->makeWhere();
        $result = $this->getCompanyList($where);

        return json([
            'code' => 200,
            'msg' => '获取成功',
            'data' => [
                'list' => $this->makeReturnedResult($result),
                'total' => $result->total(),
            ]
        ]);
    }
} 