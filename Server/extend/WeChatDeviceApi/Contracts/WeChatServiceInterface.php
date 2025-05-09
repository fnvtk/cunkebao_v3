<?php
namespace WeChatDeviceApi\Contracts;

interface WeChatServiceInterface
{
    /**
     * 添加好友
     * @param string $deviceId 设备ID
     * @param string $targetWxId 目标微信ID
     * @return bool 是否成功
     * @throws \WeChatDeviceApi\Exceptions\ApiException
//     * @throws \WeChatDeviceApi\Exceptions\DeviceOfflineException
     */
    public function addFriend(string $deviceId, string $targetWxId): bool;

    /**
     * 朋友圈点赞
     * @param string $deviceId 设备ID
     * @param string $momentId 朋友圈ID
     * @return bool 是否成功
     */
    public function likeMoment(string $deviceId, string $momentId): bool;

    /**
     * 获取群列表
     * @param string $deviceId 设备ID
     * @return array 群信息列表
     */
    public function getGroupList(string $deviceId): array;

    /**
     * 获取好友列表
     * @param string $deviceId 设备ID
     * @return array 好友信息列表
     */
    public function getFriendList(string $deviceId): array;

    /**
     * 获取设备信息
     * @param string $deviceId 设备ID
     * @return array 设备详情
     */
    public function getDeviceInfo(string $deviceId): array;

    /**
     * 绑定设备到公司
     * @param string $deviceId 设备ID
     * @param string $companyId 公司ID
     * @return bool 是否成功
     */
    public function bindDeviceToCompany(string $deviceId, string $companyId): bool;

    // ... 其他方法定义
}