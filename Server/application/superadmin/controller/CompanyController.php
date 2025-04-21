<?php
namespace app\superadmin\controller;

use app\library\s2\CurlHandle;
use app\superadmin\model\Company as companyModel;
use app\superadmin\model\Users;
use GuzzleHttp\Client;
use think\Controller;
use think\Db;
use think\facade\Config;
use think\facade\Request;
use think\facade\Session;

/**
 * 公司控制器
 */
class CompanyController extends Controller
{
    /**
     * 删除项目
     * @return \think\response\Json
     */
    public function delete()
    {
        if (!$this->request->isPost()) {
            return json(['code' => 405, 'msg' => '请求方法不允许']);
        }
        
        $id = $this->request->post('id/d', 0);
        if (empty($id)) {
            return json(['code' => 400, 'msg' => '请指定要删除的项目']);
        }
        
        // 查询项目
        $company = companyModel::get($id);
        if (!$company) {
            return json(['code' => 404, 'msg' => '项目不存在']);
        }
        
        // 检查是否有关联的子账号
        $userCount = Users::where('companyId', $id)
            ->where('deleteTime', 0)
            ->count();
        if ($userCount > 0) {
            return json(['code' => 400, 'msg' => '该项目下还有关联的子账号，无法删除']);
        }
        
        // 执行删除
        if ($company->delete()) {
            return json([
                'code' => 200,
                'msg' => '删除成功'
            ]);
        }
        
        return json(['code' => 500, 'msg' => '删除失败']);
    }
} 