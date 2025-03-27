import Auth from './auth';

// 服务器地址
const BASE_URL = process.env.VUE_APP_BASE_API || 'http://yishi.com'; 

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
  
  // 如果有 token，则带上请求头 Authorization: Bearer + token
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
    console.log('登录已过期，需要重新登录');
    
    // 清除登录信息
    Auth.removeToken();
    Auth.removeUserInfo();
    
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/index'
    });
    
    return Promise.reject(new Error('登录已过期，请重新登录'));
  }
  
  // token需要刷新 - 410 状态码
  if (response.data.code === 410) {
    // 尝试刷新 token
    return Auth.refreshToken()
      .then(res => {
        if (res.code === 200) {
          // 更新本地token
          Auth.setToken(res.data.token, res.data.token_expired - Math.floor(Date.now() / 1000));
          
          // 使用新token重试原请求
          const config = response.config;
          config.header.Authorization = `Bearer ${res.data.token}`;
          
          // 重新发起请求
          return request(config);
        } else {
          // 刷新失败，跳转到登录页
          uni.reLaunch({
            url: '/pages/login/index'
          });
          return Promise.reject(new Error('登录已过期，请重新登录'));
        }
      })
      .catch(err => {
        console.error('刷新token失败', err);
        // 清除登录信息
        Auth.removeToken();
        Auth.removeUserInfo();
        
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/index'
        });
        return Promise.reject(new Error('登录已过期，请重新登录'));
      });
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