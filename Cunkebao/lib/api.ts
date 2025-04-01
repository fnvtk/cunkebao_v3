import { handleApiResponse, handleApiError } from "./http-interceptors"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://yishi.com';

// 安全地获取token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// 安全地设置token
const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// 创建请求头
const createHeaders = (withAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (withAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// 基础请求函数
export const request = async <T>(
  url: string,
  method: string = 'GET',
  data?: any,
  withAuth: boolean = true
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: createHeaders(withAuth),
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    const result = await response.json();

    // 使用响应拦截器处理响应
    return handleApiResponse<T>(response, result);
  } catch (error) {
    // 使用错误拦截器处理错误
    return handleApiError(error);
  }
};

// 导出便捷的请求方法
export const api = {
  get: <T>(url: string, withAuth: boolean = true) => 
    request<T>(url, 'GET', undefined, withAuth),
  
  post: <T>(url: string, data: any, withAuth: boolean = true) => 
    request<T>(url, 'POST', data, withAuth),
  
  put: <T>(url: string, data: any, withAuth: boolean = true) => 
    request<T>(url, 'PUT', data, withAuth),
  
  delete: <T>(url: string, withAuth: boolean = true) => 
    request<T>(url, 'DELETE', undefined, withAuth),
};

// 登录API
export const loginApi = {
  // 账号密码登录
  login: (account: string, password: string) => 
    api.post<ApiResponse>('/v1/auth/login', { 
      account, 
      password,
      typeId: 1 // 默认使用用户类型1
    }, false),
  
  // 获取用户信息
  getUserInfo: () => 
    api.get<ApiResponse>('/v1/auth/info'),
    
  // 刷新Token
  refreshToken: () => 
    api.post<ApiResponse>('/v1/auth/refresh', {}),
};

// 验证 Token 是否有效
export const validateToken = async (): Promise<boolean> => {
  // 如果在服务端，直接返回false，避免在服务端发起不必要的请求
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const response = await loginApi.getUserInfo();
    return response.code === 200;
  } catch (error) {
    return false;
  }
};

// 刷新令牌
export const refreshAuthToken = async (): Promise<boolean> => {
  // 如果在服务端，直接返回false
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const response = await loginApi.refreshToken();
    if (response.code === 200 && response.data?.token) {
      // 更新本地存储的token
      setToken(response.data.token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('刷新Token失败:', error);
    return false;
  }
};

// 定义响应类型接口
export interface ApiResponse {
  code: number;
  msg: string;
  data?: any;
} 