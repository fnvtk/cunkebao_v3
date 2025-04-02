<?php

namespace app\backend\controller;

class BaseLoginController extends BaseController {

    /**
     * 初始化
     *
     */
    protected function initialize() {
        parent::initialize();

        if (empty($this->userModel)) {
            exit($this->jsonFail('尚未登录', 401)->send());
        }
    }
}