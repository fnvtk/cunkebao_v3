import CryptoJS from 'crypto-js'

/**
 * 密码加密工具类
 */
export default {
  /**
   * MD5加密
   * @param {string} text 需要加密的文本
   * @returns {string} 加密后的文本
   */
  md5(text) {
    return CryptoJS.MD5(text).toString()
  },

  /**
   * SHA256加密
   * @param {string} text 需要加密的文本
   * @returns {string} 加密后的文本
   */
  sha256(text) {
    return CryptoJS.SHA256(text).toString()
  },

  /**
   * 密码加密
   * 使用SHA256加密，可以根据需要修改为其他算法
   * @param {string} password 原始密码
   * @returns {string} 加密后的密码
   */
  encryptPassword(password) {
    // 可以添加自定义的盐值增加安全性
    const salt = 'yishi_salt_2024'
    return this.sha256(password + salt)
  }
} 