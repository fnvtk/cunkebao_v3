import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data 登录数据
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @param {boolean} data.is_encrypted 密码是否已加密
 * @returns {Promise} 登录结果
 */
export function login(data) {
  return request({
    url: '/api/auth/login',
    method: 'POST',
    data
  })
}

/**
 * 手机号验证码登录
 * @param {Object} data 登录数据
 * @param {string} data.mobile 手机号
 * @param {string} data.code 验证码
 * @returns {Promise} 登录结果
 */
export function mobileLogin(data) {
  return request({
    url: '/api/auth/mobile-login',
    method: 'POST',
    data
  })
}

/**
 * 发送验证码
 * @param {Object} data 数据
 * @param {string} data.mobile 手机号
 * @param {string} data.type 验证码类型(login:登录,register:注册)
 * @returns {Promise} 发送结果
 */
export function sendCode(data) {
  return request({
    url: '/api/auth/code',
    method: 'POST',
    data
  })
}

/**
 * 获取用户信息
 * @returns {Promise} 用户信息
 */
export function getUserInfo() {
  return request({
    url: '/api/auth/info',
    method: 'GET'
  })
}

/**
 * 刷新token
 * @returns {Promise} 刷新结果
 */
export function refreshToken() {
  return request({
    url: '/api/auth/refresh',
    method: 'POST'
  })
}

/**
 * 退出登录
 * @returns {Promise} 退出结果
 */
export function logout() {
  return new Promise(resolve => {
    resolve({ code: 200, msg: '退出成功' })
  })
}

/**
 * 微信登录
 * @param {Object} data 登录数据
 * @param {string} data.code 微信授权码
 * @returns {Promise} 登录结果
 */
export function wechatLogin(data) {
  return request({
    url: '/api/auth/wechat-login',
    method: 'POST',
    data
  })
}

/**
 * Apple登录
 * @param {Object} data 登录数据
 * @param {string} data.identityToken Apple身份令牌
 * @returns {Promise} 登录结果
 */
export function appleLogin(data) {
  return request({
    url: '/api/auth/apple-login',
    method: 'POST',
    data
  })
} 