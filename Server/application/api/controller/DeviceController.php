<?php

namespace app\api\controller;

use app\common\model\DeviceModel;
use think\facade\Request;
use think\facade\Env;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\ErrorCorrectionLevel;

class DeviceController extends BaseController
{
    /**
     * 获取设备列表
     * @return \think\response\Json
     */
    public function getlist()
    {
        // 获取授权token
        $authorization = trim($this->request->header('authorization', ''));
        if (empty($authorization)) {
            return errorJson('缺少授权信息');
        }

        try {
            // 构建请求参数
            $params = [
                'accountId' => $this->request->param('accountId', ''),
                'keyword' => $this->request->param('keyword', ''),
                'imei' => $this->request->param('imei', ''),
                'groupId' => $this->request->param('groupId', ''),
                'brand' => $this->request->param('brand', ''),
                'model' => $this->request->param('model', ''),
                'deleteType' => $this->request->param('deleteType', 'unDeleted'),
                'operatingSystem' => $this->request->param('operatingSystem', ''),
                'softwareVersion' => $this->request->param('softwareVersion', ''),
                'phoneAppVersion' => $this->request->param('phoneAppVersion', ''),
                'recorderVersion' => $this->request->param('recorderVersion', ''),
                'contactsVersion' => $this->request->param('contactsVersion', ''),
                'rooted' => $this->request->param('rooted', ''),
                'xPosed' => $this->request->param('xPosed', ''),
                'alive' => $this->request->param('alive', ''),
                'hasWechat' => $this->request->param('hasWechat', ''),
                'departmentId' => $this->request->param('departmentId', ''),
                'pageIndex' => $this->request->param('pageIndex', 0),
                'pageSize' => $this->request->param('pageSize', 20)
            ];

            // 设置请求头
            $headerData = ['client:system'];
            $header = setHeader($headerData, $authorization, 'plain');

            // 发送请求获取设备列表
            $result = requestCurl($this->baseUrl . 'api/device/pageResult', $params, 'GET', $header);
            $response = handleApiResponse($result);
            
            // 保存数据到数据库
            if (!empty($response['results'])) {
                foreach ($response['results'] as $item) {
                    $this->saveDevice($item);
                }
            }
            
            return successJson($response);
        } catch (\Exception $e) {
            return errorJson('获取设备列表失败：' . $e->getMessage());
        }
    }

    /**
     * 保存设备数据到数据库
     * @param array $item 设备数据
     */
    private function saveDevice($item)
    {
        $data = [
            'userName' => isset($item['userName']) ? $item['userName'] : '',
            'nickname' => isset($item['nickname']) ? $item['nickname'] : '',
            'realName' => isset($item['realName']) ? $item['realName'] : '',
            'groupName' => isset($item['groupName']) ? $item['groupName'] : '',
            'wechatAccounts' => isset($item['wechatAccounts']) ? json_encode($item['wechatAccounts']) : json_encode([]),
            'alive' => isset($item['alive']) ? $item['alive'] : false,
            'lastAliveTime' => isset($item['lastAliveTime']) ? $item['lastAliveTime'] : null,
            'tenantId' => isset($item['tenantId']) ? $item['tenantId'] : 0,
            'groupId' => isset($item['groupId']) ? $item['groupId'] : 0,
            'currentAccountId' => isset($item['currentAccountId']) ? $item['currentAccountId'] : 0,
            'imei' => $item['imei'],
            'memo' => isset($item['memo']) ? $item['memo'] : '',
            'createTime' => isset($item['createTime']) ? $item['createTime'] : null,
            'isDeleted' => isset($item['isDeleted']) ? $item['isDeleted'] : false,
            'deletedAndStop' => isset($item['deletedAndStop']) ? $item['deletedAndStop'] : false,
            'deleteTime' => isset($item['deleteTime']) ? $item['deleteTime'] : null,
            'rooted' => isset($item['rooted']) ? $item['rooted'] : false,
            'xPosed' => isset($item['xPosed']) ? $item['xPosed'] : false,
            'brand' => isset($item['brand']) ? $item['brand'] : '',
            'model' => isset($item['model']) ? $item['model'] : '',
            'operatingSystem' => isset($item['operatingSystem']) ? $item['operatingSystem'] : '',
            'softwareVersion' => isset($item['softwareVersion']) ? $item['softwareVersion'] : '',
            'extra' => isset($item['extra']) ? json_encode($item['extra']) : json_encode([]),
            'phone' => isset($item['phone']) ? $item['phone'] : '',
            'lastUpdateTime' => isset($item['lastUpdateTime']) ? $item['lastUpdateTime'] : null
        ];

        // 使用imei作为唯一性判断
        $device = DeviceModel::where('imei', $item['imei'])->find();

        if ($device) {
            $device->save($data);
        } else {
            DeviceModel::create($data);
        }
    }

    /**
     * 生成设备二维码
     * @param int $accountId 账号ID
     * @return \think\response\Json
     */
    public function addDevice($accountId = 0)
    {
        if (empty($accountId)) {
            $accountId = $this->request->param('accountId', 5555);
        }
        
        if (empty($accountId)) {
            return errorJson('账号ID不能为空');
        }

        try {
            // 获取环境配置
            $tenantGuid = Env::get('api.guid', '');
            $deviceSocketHost = Env::get('api.deviceSocketHost', '');
            
            if (empty($tenantGuid) || empty($deviceSocketHost)) {
                return errorJson('环境配置不完整，请检查api.guid和api.deviceSocketHost配置');
            }
            
            // 构建设备配置数据
            $data = [
                'tenantGuid' => $tenantGuid,
                'deviceSocketHost' => $deviceSocketHost,
                'checkVersionUrl' => '',
                'accountId' => intval($accountId)
            ];
            
            // 将数据转换为JSON
            $jsonData = json_encode($data);
            
            // 生成二维码图片
            $qrCode = $this->generateQrCodeImage($jsonData);
            
            return successJson([
                'qrCode' => $qrCode,
                'config' => $data
            ]);
        } catch (\Exception $e) {
            return errorJson('生成设备二维码失败：' . $e->getMessage());
        }
    }
    
    /**
     * 生成二维码图片（base64格式）
     * @param string $data 二维码数据
     * @return string base64编码的图片
     */
    private function generateQrCodeImage($data)
    {
        // 使用endroid/qr-code 2.5版本生成二维码
        $qrCode = new QrCode($data);
        $qrCode->setSize(300);
        $qrCode->setMargin(10);
        $qrCode->setWriterByName('png');
        $qrCode->setEncoding('UTF-8');
        
        // 使用枚举常量而不是字符串
        $qrCode->setErrorCorrectionLevel(ErrorCorrectionLevel::HIGH);
        
        // 直接获取base64内容
        $base64 = 'data:image/png;base64,' . base64_encode($qrCode->writeString());
        
        return $base64;
    }
} 