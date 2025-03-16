import axios from 'axios'
import config from '@/config/config'
import { getToken, removeAll } from '@/utils/auth'

import { Notification } from 'element-ui'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: config.BASE_API_URL,

  // 请求超时时间
  timeout: 20000,
})

// 输出当前环境和API基础URL（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  console.log('当前环境:', process.env.NODE_ENV)
  console.log('API基础URL:', config.BASE_API_URL)
}

/**
 * 异常拦截处理器
 *
 * @param {*} error
 */
const errorHandler = error => {
  // 判断是否是响应错误信息
  if (error.response) {
    if (error.response.status == 401) {
      removeAll()
      location.reload()
    } else {
      Notification({
        message: '网络异常,请稍后再试...',
        position: 'top-right',
      })
    }
  }

  return Promise.reject(error)
}

// 请求拦截器
request.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    // 设置JWT认证头
    config.headers['Authorization'] = 'Bearer ' + token
  }

  return config
}, errorHandler)

// 响应拦截器
request.interceptors.response.use(response => {
  return response.data
}, errorHandler)

/**
 * GET 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const get = (url, data = {}, options = {}) => {
  return request({
    url,
    params: data,
    method: 'get',
    ...options,
  })
}

/**
 * POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'post',
    data: data,
    ...options,
  })
}

/**
 * 上传文件 POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const upload = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'post',
    data: data,
    ...options,
  })
}
