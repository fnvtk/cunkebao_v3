<?php

namespace app\backend\controller;

class UploadController extends BaseLoginController {

    // 上传图片
    public function index() {
        if (!empty($_FILES)
                AND !empty($_FILES['file'])
                AND is_uploaded_file($_FILES['file']['tmp_name'])) {
            $ext  = strtolower(trim(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION)));
            $dir  = ROOT_PATH . DS . 'public' . DS;
            $path = 'upload/' . $ext . '/' . date('Y-m-d') . '/' . time() . '-' . uniqid() . '.' . $ext;
            if (is_dir(dirname($dir . $path)) OR @mkdir(dirname($dir . $path), 0777, TRUE)) {
                if (move_uploaded_file($_FILES['file']['tmp_name'], $dir . $path)) {
                    return json([
                        'name' => $_FILES['file']['name'],
                        'path' => $path,
                        'url'  => $this->absoluteUrl($path),
                    ], 200);
                }
            }
        }
        if (!empty($_FILES)) {
            return json([
                'url'  => '',
            ], 500);
        }
    }

    public function editor() {
        if (!empty($_FILES)
            AND !empty($_FILES['upload'])
            AND is_uploaded_file($_FILES['upload']['tmp_name'])) {
            $ext  = strtolower(trim(pathinfo($_FILES['upload']['name'], PATHINFO_EXTENSION)));
            $dir  = ROOT_PATH . DS . 'public' . DS;
            $path = 'upload/' . $ext . '/' . date('Y-m-d') . '/' . time() . '-' . uniqid() . '.' . $ext;
            if (is_dir(dirname($dir . $path)) OR @mkdir(dirname($dir . $path), 0777, TRUE)) {
                if (move_uploaded_file($_FILES['upload']['tmp_name'], $dir . $path)) {
                    return json([
                        'uploaded' => true,
                        'url' => $this->absoluteUrl($path),
                    ]);
                }
            }
        }

        return json([
            'uploaded' => false,
            'url' => '',
        ]);
    }
}
