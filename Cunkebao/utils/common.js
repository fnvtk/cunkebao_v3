/**
 * 通用工具函数集合
 */

/**
 * 格式化日期
 * @param {Date|string|number} date 日期对象/日期字符串/时间戳
 * @param {string} format 格式化模板，如：YYYY-MM-DD HH:mm:ss
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  // 如果是时间戳或字符串，转为日期对象
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }
  
  // 定义替换规则
  const rules = {
    'YYYY': date.getFullYear(),
    'MM': padZero(date.getMonth() + 1),
    'DD': padZero(date.getDate()),
    'HH': padZero(date.getHours()),
    'mm': padZero(date.getMinutes()),
    'ss': padZero(date.getSeconds())
  };
  
  // 替换
  return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, function(key) {
    return rules[key];
  });
}

/**
 * 补零
 * @param {number} num 数字
 * @returns {string} 补零后的字符串
 */
function padZero(num) {
  return String(num).padStart(2, '0');
}

/**
 * 格式化手机号
 * @param {string} mobile 手机号
 * @returns {string} 格式化后的手机号，如：138****8888
 */
function formatMobile(mobile) {
  if (!mobile) return '';
  return mobile.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
}

/**
 * 生成UUID
 * @returns {string} UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 深度克隆对象
 * @param {Object} obj 需要克隆的对象
 * @returns {Object} 克隆后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理日期
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // 处理数组
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  // 处理对象
  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  
  return clonedObj;
}

/**
 * 防抖函数
 * @param {Function} fn 需要防抖的函数
 * @param {number} delay 延迟时间，单位ms
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay = 300) {
  let timer = null;
  
  return function(...args) {
    if (timer) clearTimeout(timer);
    
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn 需要节流的函数
 * @param {number} delay 延迟时间，单位ms
 * @returns {Function} 节流后的函数
 */
function throttle(fn, delay = 300) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

export default {
  formatDate,
  formatMobile,
  generateUUID,
  deepClone,
  debounce,
  throttle
}; 