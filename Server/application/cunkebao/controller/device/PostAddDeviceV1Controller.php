<?php
namespace app\cunkebao\controller\device;

use app\common\model\Device as DeviceModel;
use app\common\model\DeviceHandleLog as DeviceHandleLogModel;
use app\cunkebao\controller\BaseController;
use library\s2\CurlHandle;
use think\Db;
use think\Validate;

/**
 * 设备管理控制器
 */
class PostAddDeviceV1Controller extends BaseController
{
    /**
     * 验证IMEI是否已存在
     *
     * @return void
     * @throws \Exception
     */
    protected function checkDeviceIsExist(): void
    {
        if ($this->request->param('imei')) {
            $where = [
                'imei' => $this->request->param('imei'),
                'companyId' => $this->getUserInfo('companyId'),
                'deleteTime' => 0
            ];

            $exist = DeviceModel::where($where)->count() > 0;

            if ($exist) {
                throw new \Exception('设备IMEI已存在', 400);
            }
        } else {
            throw new \Exception('设备IMEI不能为空', 400);
        }
    }


    protected function addDeviceToS2()
    {
        $curl = CurlHandle::getInstant();

     //   $curl->setMethod()
    }

    /**
     * 添加设备
     *
     * @return void
     */
    protected function addDevice()
    {

        $id = DeviceModel::addDevice(
            $this->request->post()
        );
    }

    /**
     * 添加设备操作记录
     *
     * @param int $deviceId
     * @return void
     * @throws \Exception
     */
    protected function addDeviceHandleLog(int $deviceId): void
    {
        DeviceHandleLogModel::addLog(
            [
                'deviceId' => $deviceId,
                'content' => '添加设备',
                'userId' => $this->getUserInfo('id'),
                'companyId' => $this->getUserInfo('companyId'),
            ]
        );
    }

    /**
     * 数据验证
     *
     * @return $this
     * @throws \Exception
     */
    protected function dataValidate(): self
    {
        $validate = Validate::make([
            'imei' => 'require|length:32',
            'memo' => 'require|/\S+/'
        ]);

        if (!$validate->check($this->request->post())) {
            throw new \Exception($validate->getError(), 400);
        }

        return $this;
    }

    /**
     * 添加设备
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $this->dataValidate()->checkDeviceIsExist();

            Db::startTrans();

            $deviceId = $this->addDevice();
            $this->addDeviceHandleLog($deviceId);

            Db::commit();

            return json([
                'code' => 200,
                'msg' => '添加成功'
            ]);
        } catch (\Exception $e) {
            Db::rollback();

            return json([
                'code' => $e->getCode(),
                'msg' => $e->getMessage()
            ]);
        }
    }
} 