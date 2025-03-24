import Auth from './auth';

// 服务器地址
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080' 
  : 'https://api.example.com';

// 请求超时时间
const TIMEOUT = 10000;

/**
 * 请求拦截器
 * @param {Object} config 请求配置
 * @returns {Object} 处理后的请求配置
 */
function requestInterceptor(config) {
  // 获取 token
  const token = uni.getStorageSync('token');
  
  // 如果有 token，则带上请求头
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    };
  }
  
  // 打印请求日志
  console.log('请求地址:', `${config.baseURL || BASE_URL}${config.url}`);
  
  return config;
}

/**
 * 响应拦截器
 * @param {Object} response 响应数据
 * @returns {Object|Promise} 处理后的响应数据或Promise
 */
function responseInterceptor(response) {
  // 未登录或token失效 - 取消登录拦截
  if (response.data.code === 401) {
    // 只在控制台打印信息，不进行拦截
    console.log('登录已过期，但不进行拦截');
    
    /*
    // 以下代码已注释，取消登录拦截
    // 清除登录信息
    Auth.removeToken();
    Auth.removeUserInfo();
    
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/index'
    });
    
    return Promise.reject(new Error('登录已过期，请重新登录'));
    */
    
    // 直接返回响应，不拦截
    return response.data;
  }
  
  // token需要刷新 - 取消登录拦截
  if (response.data.code === 410) {
    // 只在控制台打印信息，不进行拦截
    console.log('Token需要刷新，但不进行拦截');
    
    /*
    // 以下代码已注释，取消登录拦截
    // 处理token刷新逻辑，这里简化处理
    uni.reLaunch({
      url: '/pages/login/index'
    });
    
    return Promise.reject(new Error('登录已过期，请重新登录'));
    */
    
    // 直接返回响应，不拦截
    return response.data;
  }
  
  return response.data;
}

/**
 * 统一请求函数
 * @param {Object} options 请求选项
 * @returns {Promise} 请求结果
 */
function request(options) {
  // 合并请求选项
  const config = {
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    header: {
      'Content-Type': 'application/json'
    },
    ...options
  };
  
  // 请求拦截
  const interceptedConfig = requestInterceptor(config);
  
  // 发起请求
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${interceptedConfig.baseURL}${interceptedConfig.url}`,
      method: interceptedConfig.method || 'GET',
      data: interceptedConfig.data,
      header: interceptedConfig.header,
      timeout: interceptedConfig.timeout,
      success: (res) => {
        try {
          const result = responseInterceptor(res);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
  });
}

export default request; 