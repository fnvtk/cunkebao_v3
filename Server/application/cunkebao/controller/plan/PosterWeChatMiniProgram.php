<?php

namespace app\cunkebao\controller\plan;

use think\Controller;
use think\Request;
use EasyWeChat\Factory;
// use EasyWeChat\Kernel\Exceptions\DecryptException;
use EasyWeChat\Kernel\Http\StreamResponse;
use think\Db;
class PosterWeChatMiniProgram extends Controller
{
    public function index()
    {
        return 'Hello, World!';
    }

    const MINI_PROGRAM_CONFIG = [
        'app_id' => 'wx12345678',
        'secret' => 'your-app-secret',
        
        'response_type' => 'array'
    ];


    // 生成小程序码，存客宝-操盘手调用
    public function generateMiniProgramCodeWithScene() {

        $taskId = request()->param('id');

        $app = Factory::miniProgram(self::MINI_PROGRAM_CONFIG);
        
        // scene参数长度限制为32位
        // $scene = 'taskId=' . $taskId;
        $scene = 'id=' . $taskId;
        
        // 调用接口生成小程序码
        $response = $app->app_code->getUnlimit($scene, [
            'page' => 'pages/poster/index',  // 必须是已经发布的小程序页面
            'width' => 430,  // 二维码的宽度，默认430
            // 'auto_color' => false,  // 自动配置线条颜色
            // 'line_color' => ['r' => 0, 'g' => 0, 'b' => 0],  // 颜色设置
            // 'is_hyaline' => false,  // 是否需要透明底色
        ]);
        
        // 保存小程序码到文件
        if ($response instanceof StreamResponse) {
            // $filename = 'minicode_' . $taskId . '.png';
            // $response->saveAs('path/to/codes', $filename);
            // return 'path/to/codes/' . $filename;

            $img = $response->getBody()->getContents();//获取图片二进制流
            $img_base64 = 'data:image/png;base64,' .base64_encode($img);//转化base64
            return $img_base64;
        }
        
        // return false;
        return null;
    }

    // getPhoneNumber
    public function getPhoneNumber() {

        $taskId = request()->param('id');
        $code = request()->param('code');
        // code 不能为空
        if (!$code) {
            return json([
                'code' => 400,
                'message' => 'code不能为空'
            ]);
        }

        $task = Db::name('customer_acquisition_task')->where('id', $taskId)->find();
        if (!$task) {
            return json([
                'code' => 400,
                'message' => '任务不存在'
            ]);
        }

        $app = Factory::miniProgram(self::MINI_PROGRAM_CONFIG);

        $result = $app->phone_number->getUserPhoneNumber($code);

        if ($result['errcode'] == 0 && isset($result['phone_info']['phoneNumber'])) {

            // TODO 拿到手机号之后的后续操作： 
            // 1. 先写入 ck_traffic_pool 表 identifier  mobile 都是 用 phone字段的值
            $trafficPool = Db::name('traffic_pool')->where('identifier', $result['phone_info']['phoneNumber'])->find();
            if (!$trafficPool) {
                Db::name('traffic_pool')->insert([
                    'identifier' => $result['phone_info']['phoneNumber'],
                    'mobile' => $result['phone_info']['phoneNumber']
                ]);
            }
            // 2. 写入 ck_task_customer: 以 task_id ~~identifier~~ phone 为条件，如果存在则忽略，使用类似laravel的firstOrcreate（但我不知道thinkphp5.1里的写法）
            // $taskCustomer = Db::name('task_customer')->where('task_id', $taskId)->where('identifier', $result['phone_info']['phoneNumber'])->find();
            $taskCustomer = Db::name('task_customer')->where('task_id', $taskId)->where('phone', $result['phone_info']['phoneNumber'])->find();
            if (!$taskCustomer) {
                Db::name('task_customer')->insert([
                    'task_id' => $taskId,
                    // 'identifier' => $result['phone_info']['phoneNumber'],
                    'phone' => $result['phone_info']['phoneNumber']
                ]);
            }
            // return $result['phone_info']['phoneNumber'];
            return json([
                'code' => 0,
                'message' => '获取手机号成功',
                'data' => $result['phone_info']['phoneNumber']
            ]);
        } else {
            // return null;
            return json([
                'code' => 400,
                'message' => '获取手机号失败: ' . $result['errmsg'] ?? '未知错误'
            ]);
        }

        // return $result;
        
    }

    // todo 获取海报获客任务的任务/海报数据 -- 表还没设计好，不急 ck_customer_acquisition_task
    public function getPosterTaskData() {
        $id = request()->param('id');
        $task = Db::name('customer_acquisition_task')->where('id', $id)->find();
        // todo 只需 返回 poster_url  success_tip
        return json([
            'code' => 0,
            'message' => '获取海报获客任务数据成功',
            'data' => $task
        ]);
    }


}