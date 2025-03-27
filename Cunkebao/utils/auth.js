/**
 * 认证相关工具函数
 */
import { refreshToken } from '@/api/user';

const TOKEN_KEY = 'token';
const TOKEN_EXPIRES_KEY = 'token_expires';
const USER_INFO_KEY = 'user_info';

/**
 * 设置Token
 * @param {string} token 令牌
 * @param {number} expires 过期时间(秒)
 */
function setToken(token, expires = 7200) {
  uni.setStorageSync(TOKEN_KEY, token);
  
  // 计算过期时间点(当前时间 + 有效期)
  const expiresTime = Math.floor(Date.now() / 1000) + expires;
  uni.setStorageSync(TOKEN_EXPIRES_KEY, expiresTime);
}

/**
 * 获取Token
 * @returns {string} token值
 */
function getToken() {
  return uni.getStorageSync(TOKEN_KEY);
}

/**
 * 移除Token
 */
function removeToken() {
  uni.removeStorageSync(TOKEN_KEY);
  uni.removeStorageSync(TOKEN_EXPIRES_KEY);
}

/**
 * 设置用户信息
 * @param {Object} userInfo 用户信息
 */
function setUserInfo(userInfo) {
  uni.setStorageSync(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * 获取用户信息
 * @returns {Object} 用户信息
 */
function getUserInfo() {
  const userInfo = uni.getStorageSync(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * 移除用户信息
 */
function removeUserInfo() {
  uni.removeStorageSync(USER_INFO_KEY);
}

/**
 * 移除所有认证信息
 */
function removeAll() {
  removeToken();
  removeUserInfo();
}

/**
 * 刷新Token
 * @returns {Promise} 刷新结果
 */
function refreshTokenAsync() {
  return new Promise((resolve, reject) => {
    refreshToken()
      .then(res => {
        if (res.code === 200) {
          // 更新Token
          setToken(res.data.token, res.data.token_expired - Math.floor(Date.now() / 1000));
          resolve(res);
        } else {
          reject(res);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 判断是否已登录
 * @returns {boolean} 是否已登录
 */
function isLogin() {
  const token = getToken();
  // 如果没有token，直接返回未登录
  if (!token) return false;
  
  // 检查token是否过期
  const expiresTime = uni.getStorageSync(TOKEN_EXPIRES_KEY) || 0;
  const nowTime = Math.floor(Date.now() / 1000);
  
  // 如果当前时间超过过期时间，则返回未登录
  return nowTime < expiresTime;
}

/**
 * 获取用户类型
 * @returns {number} 用户类型ID
 */
function getUserType() {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.typeId || 0 : 0;
}

/**
 * 是否为管理员
 * @returns {boolean} 是否为管理员
 */
function isAdmin() {
  const userInfo = getUserInfo();
  return userInfo ? !!userInfo.isAdmin : false;
}

export default {
  setToken,
  getToken,
  removeToken,
  setUserInfo,
  getUserInfo,
  removeUserInfo,
  removeAll,
  isLogin,
  refreshToken: refreshTokenAsync,
  getUserType,
  isAdmin
};