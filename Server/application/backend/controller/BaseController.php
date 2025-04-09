<?php

namespace app\backend\controller;

use app\common\model\UserModel;
use app\common\model\UserTokenModel;
use think\Controller;

class BaseController extends Controller {

    /**
     * 用户对象
     *
     * @var UserModel
     */
    protected $userModel = NULL;

    /**
     * 令牌对象
     *
     * @var UserTokenModel
     */
    protected $tokenModel = NULL;

    /**
     * 令牌
     *
     * @var string
     */
    protected $token = '';

    protected function initialize() {
        parent::initialize();
        // 允许跨域
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: *');
        header('Access-Control-Allow-Headers: *');

        $this->token = !empty($_SERVER['HTTP_TOKEN'])
            ? trim($_SERVER['HTTP_TOKEN'])
            : trim($this->request->param('token'));
        if (!empty($this->token)) {
            $this->tokenModel = UserTokenModel::get(['token' => $this->token]);
            if (!empty($this->tokenModel)) {
                $this->userModel = UserModel::get($this->tokenModel->user_id);
            }
        }
    }

    /**
     * 获取会员JSON
     *
     * @param UserModel $model
     * @return array
     */
    protected function userJson(UserModel $model) {
        return array_merge($model->toArray(), [
            'password' => '',
        ]);
    }

    /**
     * 接口调用成功 JSON
     *
     * @param null $data
     * @return \think\response\Json
     */
    public function jsonSucc($data = NULL) {
        return json([
            'code' => 200,
            'msg'  => '操作成功',
            'data' => $data,
        ]);
    }

    /**
     * 接口调用错误 JSON
     *
     * @param $error
     * @param int $code
     * @return \think\response\Json
     */
    public function jsonFail($error, $code = 500) {
        return json([
            'code' => $code,
            'msg'  => $error,
        ]);
    }

    /**
     * 获取URL
     *
     * @param $url
     * @return string
     */
    protected function absoluteUrl($url) {
        return (!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . ($url{0} === '/' ? $url : '/' . $url);
    }

    /**
     * 小数格式化
     *
     * @param $float
     * @return float
     */
    protected function floatFormat($float) {
        return floatval($float);
    }

    /**
     * 关联数组转列表
     *
     * @param array $assoc
     * @param string $valueKey
     * @param string $labelKey
     * @return array
     */
    protected function assocToList(array $assoc, $valueKey = 'value', $labelKey = 'label') {
        $list = [];
        foreach ($assoc as $value => $label) {
            $list[] = [
                $valueKey => $value,
                $labelKey => $label,
            ];
        }
        return $list;
    }
}
