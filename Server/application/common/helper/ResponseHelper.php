<?php
namespace app\common\helper;

class ResponseHelper
{
    /**
     * 成功响应
     * @param mixed $data 响应数据
     * @param string $msg 响应消息
     * @param int $code 响应代码
     * @return \think\response\Json
     */
    public static function success($data = null, $msg = '操作成功', $code = 200)
    {
        return json([
            'code' => $code,
            'msg' => $msg,
            'data' => $data
        ]);
    }

    /**
     * 错误响应
     * @param string $msg 错误消息
     * @param int $code 错误代码
     * @param mixed $data 错误数据
     * @return \think\response\Json
     */
    public static function error($msg = '操作失败', $code = 400, $data = null)
    {
        return json([
            'code' => $code,
            'msg' => $msg,
            'data' => $data
        ]);
    }

    /**
     * 未授权响应
     * @param string $msg 错误消息
     * @return \think\response\Json
     */
    public static function unauthorized($msg = '未授权访问')
    {
        return self::error($msg, 401);
    }

    /**
     * 禁止访问响应
     * @param string $msg 错误消息
     * @return \think\response\Json
     */
    public static function forbidden($msg = '禁止访问')
    {
        return self::error($msg, 403);
    }
} 