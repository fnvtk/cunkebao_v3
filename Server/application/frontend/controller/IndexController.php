<?php

namespace app\frontend\controller;

use think\Controller;

class IndexController extends Controller {

    /**
     * 跳转至后台登录页
     *
     */
    public function index() {
        return $this->redirect('/admin/');
    }
}