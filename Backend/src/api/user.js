import { post, get } from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data 登录数据
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @param {boolean} data.is_encrypted 密码是否已加密
 * @returns {Promise} 登录结果
 */
export function ServeLogin(data) {
  return post('/api/auth/login', data)
}

/**
 * 手机号验证码登录
 * @param {Object} data 登录数据
 * @param {string} data.mobile 手机号
 * @param {string} data.code 验证码
 * @param {boolean} data.is_encrypted 验证码是否已加密
 * @returns {Promise} 登录结果
 */
export function ServeMobileLogin(data) {
  return post('/api/auth/mobile-login', data)
}

// 发送验证码
export const ServeSendCode = data => {
  return post('/api/auth/code', data)
}

// 获取用户信息
export const ServeGetUser = () => {
  return get('/api/auth/info')
}

// 刷新token
export const ServeRefreshToken = () => {
  return post('/api/auth/refresh')
}

export const ServeSetUserPassword = (data) => {
  return post('/backend/user/password', data)
}

// 退出登录服务接口
export const ServeLogout = () => {
  // JWT不需要服务端登出，直接清除本地token即可
  return Promise.resolve({ code: 200, msg: '退出成功' })
}

export const UserIndex = data => {
  return post('/backend/user/index', data)
}

export const UserGetUsername = data => {
  return post('/backend/user/username', data)
}

export const UserSave = data => {
  return post('/backend/user/save', data)
}

export const UserPassword = data => {
  return post('/backend/user/password', data)
}