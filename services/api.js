/**
 * API 服务层 - 统一处理前后端数据交互
 * 基于 Fetch API 封装，支持 JWT 认证、错误处理和请求/响应拦截
 */

// API 基础配置
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'http://8.215.85.10/api';

// 存储键名
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_info';

/**
 * 获取存储的令牌
 */
const getToken = () => localStorage.getItem(TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

/**
 * 设置令牌
 */
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * 获取用户信息
 */
const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * 设置用户信息
 */
const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * 清除所有认证信息
 */
const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * 构建请求头
 */
const buildHeaders = (requiresAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

/**
 * 处理 API 响应
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // 处理特定错误状态
    if (response.status === 401) {
      // 令牌过期，尝试刷新
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        clearAuth();
        window.location.href = '/pages/login.html';
        throw new Error('登录已过期，请重新登录');
      }
      // 刷新成功，重新发起原请求
      throw new Error('RETRY_REQUEST');
    }
    
    throw new Error(data.message || '请求失败');
  }
  
  return data;
};

/**
 * 发送 HTTP 请求
 */
const request = async (method, endpoint, data = null, requiresAuth = true) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: buildHeaders(requiresAuth),
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    if (error.message === 'RETRY_REQUEST') {
      // 重试请求
      const retryOptions = {
        method,
        headers: buildHeaders(requiresAuth),
      };
      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        retryOptions.body = JSON.stringify(data);
      }
      const retryResponse = await fetch(url, retryOptions);
      return await handleResponse(retryResponse);
    }
    throw error;
  }
};

/**
 * 刷新访问令牌
 */
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setToken(data.data.tokens.accessToken);
      setRefreshToken(data.data.tokens.refreshToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('刷新令牌失败:', error);
    return false;
  }
};

/**
 * API 方法封装
 */
const api = {
  // GET 请求
  get: (endpoint, requiresAuth = true) => 
    request('GET', endpoint, null, requiresAuth),
  
  // POST 请求
  post: (endpoint, data, requiresAuth = true) => 
    request('POST', endpoint, data, requiresAuth),
  
  // PUT 请求
  put: (endpoint, data, requiresAuth = true) => 
    request('PUT', endpoint, data, requiresAuth),
  
  // DELETE 请求
  delete: (endpoint, requiresAuth = true) => 
    request('DELETE', endpoint, null, requiresAuth),
  
  // 认证相关方法
  auth: {
    // 登录
    login: async (email, password) => {
      const data = await api.post('/auth/login', { email, password }, false);
      if (data.success) {
        setToken(data.data.tokens.accessToken);
        setRefreshToken(data.data.tokens.refreshToken);
        setUser(data.data.user);
      }
      return data;
    },
    
    // 注册
    register: async (userData) => {
      const data = await api.post('/auth/register', userData, false);
      if (data.success) {
        setToken(data.data.tokens.accessToken);
        setRefreshToken(data.data.tokens.refreshToken);
        setUser(data.data.user);
      }
      return data;
    },
    
    // 登出
    logout: async () => {
      try {
        await api.post('/auth/logout', { refreshToken: getRefreshToken() });
      } finally {
        clearAuth();
      }
    },
    
    // 获取当前用户
    getMe: () => api.get('/auth/me'),
    
    // 更新个人资料
    updateProfile: (profile) => api.put('/auth/me', profile),
    
    // 修改密码
    changePassword: (passwords) => api.put('/auth/password', passwords),
    
    // 检查是否已登录
    isAuthenticated: () => !!getToken(),
    
    // 获取当前用户
    getUser,
    
    // 获取令牌
    getToken
  },
  
  // 用户管理（管理员）
  users: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get(`/users?${query}`);
    },
    getStats: () => api.get('/users/stats'),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`)
  },
  
  // 题库管理
  banks: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get(`/banks?${query}`, false);
    },
    getById: (id) => api.get(`/banks/${id}`, false),
    create: (data) => api.post('/banks', data),
    update: (id, data) => api.put(`/banks/${id}`, data),
    delete: (id) => api.delete(`/banks/${id}`),
    getQuestions: (id, count = 10) => api.get(`/banks/${id}/questions?count=${count}`),
    addQuestion: (id, data) => api.post(`/banks/${id}/questions`, data),
    updateQuestion: (id, questionId, data) => api.put(`/banks/${id}/questions/${questionId}`, data),
    deleteQuestion: (id, questionId) => api.delete(`/banks/${id}/questions/${questionId}`)
  },
  
  // 考试管理
  exams: {
    start: (bankId, mode = 'practice') => api.post('/exams/start', { bankId, mode }),
    submitAnswer: (examId, answerData) => api.post(`/exams/records/${examId}/answer`, answerData),
    complete: (examId) => api.post(`/exams/records/${examId}/complete`),
    getRecords: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get(`/exams/records?${query}`);
    },
    getRecordById: (id) => api.get(`/exams/records/${id}`),
    getErrorBook: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get(`/exams/error-book?${query}`);
    },
    getStats: () => api.get('/exams/stats')
  }
};

// 导出 API 对象和工具函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
