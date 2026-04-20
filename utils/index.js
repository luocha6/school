/**
 * 工具函数库
 * 提供通用的前端工具函数
 */

const utils = {
  /**
   * 格式化日期
   * @param {Date|string} date - 日期对象或字符串
   * @param {string} format - 格式模板，默认 'YYYY-MM-DD HH:mm'
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date, format = 'YYYY-MM-DD HH:mm') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 防抖函数
   * @param {Function} func - 要执行的函数
   * @param {number} wait - 等待时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * 节流函数
   * @param {Function} func - 要执行的函数
   * @param {number} limit - 限制时间（毫秒）
   * @returns {Function} 节流后的函数
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 深拷贝对象
   * @param {any} obj - 要拷贝的对象
   * @returns {any} 拷贝后的对象
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  },

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  isValidEmail(email) {
    const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  },

  /**
   * 验证手机号格式（中国大陆）
   * @param {string} phone - 手机号
   * @returns {boolean} 是否有效
   */
  isValidPhone(phone) {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
  },

  /**
   * 截断文本
   * @param {string} text - 原文本
   * @param {number} maxLength - 最大长度
   * @param {string} suffix - 后缀，默认 '...'
   * @returns {string} 截断后的文本
   */
  truncateText(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * 获取URL参数
   * @param {string} name - 参数名
   * @returns {string|null} 参数值
   */
  getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  /**
   * 设置URL参数
   * @param {Object} params - 参数对象
   * @param {boolean} replace - 是否替换当前历史记录
   */
  setUrlParams(params, replace = false) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, params[key]);
      }
    });
    
    if (replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
  },

  /**
   * 显示提示消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型：success, error, warning, info
   * @param {number} duration - 显示时长（毫秒）
   */
  showToast(message, type = 'info', duration = 3000) {
    // 创建 toast 元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 样式
    const colors = {
      success: '#52c41a',
      error: '#ff4d4f',
      warning: '#faad14',
      info: '#1890ff'
    };
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: ${colors[type] || colors.info};
      color: white;
      border-radius: 4px;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideDown 0.3s ease;
    `;
    
    // 添加动画样式
    if (!document.getElementById('toast-style')) {
      const style = document.createElement('style');
      style.id = 'toast-style';
      style.textContent = `
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // 自动移除
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * 确认对话框
   * @param {string} message - 确认消息
   * @returns {Promise<boolean>} 用户选择结果
   */
  confirm(message) {
    return new Promise((resolve) => {
      const result = window.confirm(message);
      resolve(result);
    });
  },

  /**
   * 存储数据到 localStorage
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('存储失败:', e);
    }
  },

  /**
   * 从 localStorage 获取数据
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值
   */
  getStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  /**
   * 从 localStorage 移除数据
   * @param {string} key - 键名
   */
  removeStorage(key) {
    localStorage.removeItem(key);
  },

  /**
   * 计算百分比
   * @param {number} value - 当前值
   * @param {number} total - 总值
   * @param {number} decimals - 小数位数
   * @returns {number} 百分比
   */
  calculatePercentage(value, total, decimals = 0) {
    if (total === 0) return 0;
    const percentage = (value / total) * 100;
    return Number(percentage.toFixed(decimals));
  },

  /**
   * 随机打乱数组
   * @param {Array} array - 原数组
   * @returns {Array} 打乱后的数组
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * 分页计算
   * @param {Array} array - 数组
   * @param {number} page - 当前页
   * @param {number} limit - 每页数量
   * @returns {Object} 分页结果
   */
  paginate(array, page = 1, limit = 10) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: array.slice(start, end),
      total: array.length,
      page,
      limit,
      totalPages: Math.ceil(array.length / limit)
    };
  }
};

// 导出工具对象
if (typeof module !== 'undefined' && module.exports) {
  module.exports = utils;
}
