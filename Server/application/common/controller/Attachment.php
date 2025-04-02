<?php
namespace app\common\controller;

use think\Controller;
use think\facade\Request;
use app\common\model\Attachment as AttachmentModel;
use app\common\util\AliyunOSS;

class Attachment extends Controller
{
    /**
     * 上传文件
     * @return \think\response\Json
     */
    public function upload()
    {
        try {
            // 获取上传文件
            $file = Request::file('file');
            if (!$file) {
                return json([
                    'code' => 400,
                    'msg' => '请选择要上传的文件'
                ]);
            }
            
            // 验证文件
            $validate = \think\facade\Validate::rule([
                'file' => [
                    'fileSize' => 10485760, // 10MB
                    'fileExt' => 'jpg,jpeg,png,gif,doc,docx,pdf,zip,rar',
                    'fileMime' => 'image/jpeg,image/png,image/gif,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/zip,application/x-rar-compressed'
                ]
            ]);
            
            if (!$validate->check(['file' => $file])) {
                return json([
                    'code' => 400,
                    'msg' => $validate->getError()
                ]);
            }
            
            // 生成文件hash
            $hashKey = md5_file($file->getRealPath());
            
            // 检查文件是否已存在
            $existFile = AttachmentModel::getByHashKey($hashKey);
            if ($existFile) {
                return json([
                    'code' => 200,
                    'msg' => '文件已存在',
                    'data' => [
                        'id' => $existFile['id'],
                        'name' => $existFile['name'],
                        'url' => $existFile['source']
                    ]
                ]);
            }
            
            // 生成OSS对象名称
            $objectName = AliyunOSS::generateObjectName($file->getOriginalName());
            
            // 上传到OSS
            $result = AliyunOSS::uploadFile($file->getRealPath(), $objectName);
            
            if (!$result['success']) {
                return json([
                    'code' => 500,
                    'msg' => '文件上传失败：' . $result['error']
                ]);
            }
            
            // 保存到数据库
            $attachmentData = [
                'name' => Request::param('name') ?: $file->getOriginalName(),
                'hash_key' => $hashKey,
                'server' => 'aliyun_oss',
                'source' => $result['url'],
                'size' => $result['size'],
                'suffix' => pathinfo($file->getOriginalName(), PATHINFO_EXTENSION)
            ];
            
            $attachmentId = AttachmentModel::addAttachment($attachmentData);
            
            if (!$attachmentId) {
                return json([
                    'code' => 500,
                    'msg' => '保存附件信息失败'
                ]);
            }
            
            return json([
                'code' => 200,
                'msg' => '上传成功',
                'data' => [
                    'id' => $attachmentId,
                    'name' => $attachmentData['name'],
                    'url' => $attachmentData['source']
                ]
            ]);
            
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '上传失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取附件信息
     * @param int $id 附件ID
     * @return \think\response\Json
     */
    public function info($id)
    {
        try {
            $attachment = AttachmentModel::find($id);
            
            if (!$attachment) {
                return json([
                    'code' => 404,
                    'msg' => '附件不存在'
                ]);
            }
            
            return json([
                'code' => 200,
                'msg' => '获取成功',
                'data' => $attachment
            ]);
            
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
} 