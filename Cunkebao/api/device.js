import request from '@/utils/request'

/**
 * 获取设备列表
 * @param {Object} params 查询参数
 * @param {string} params.keyword 关键词搜索（同时搜索IMEI和备注）
 * @param {number} params.alive 设备在线状态（可选，1:在线 0:离线）
 * @param {number} params.page 页码
 * @param {number} params.limit 每页数量
 * @returns {Promise} 设备列表
 * 
 * 注意: params 参数会被自动添加到URL查询字符串中，如 /v1/devices?keyword=xxx&alive=1&page=1&limit=20
 */
export function getDeviceList(params) {
  return request({
    url: '/v1/devices',
    method: 'GET',
    params
  })
}

/**
 * 获取设备总数
 * @param {Object} params 查询参数
 * @param {number} params.alive 设备在线状态（可选，1:在线 0:离线）
 * @returns {Promise} 设备总数
 */
export function getDeviceCount(params) {
  return request({
    url: '/v1/devices/count',
    method: 'GET',
    params
  })
}

/**
 * 获取设备详情
 * @param {number} id 设备ID
 * @returns {Promise} 设备详情
 */
export function getDeviceDetail(id) {
  return request({
    url: `/v1/devices/${id}`,
    method: 'GET'
  })
}

/**
 * 删除设备
 * @param {number} id 设备ID
 * @returns {Promise} 删除结果
 */
export function deleteDevice(id) {
  return request({
    url: `/v1/devices/${id}`,
    method: 'DELETE'
  })
}

/**
 * 刷新设备状态
 * @returns {Promise} 刷新结果
 */
export function refreshDevices() {
  return request({
    url: '/v1/devices/refresh',
    method: 'PUT'
  })
}

/**
 * 添加设备
 * @param {Object} data 设备数据
 * @param {string} data.imei 设备IMEI
 * @param {string} data.memo 设备备注
 * @returns {Promise} 添加结果
 */
export function addDevice(data) {
  return request({
    url: '/v1/devices',
    method: 'POST',
    data
  })
} 