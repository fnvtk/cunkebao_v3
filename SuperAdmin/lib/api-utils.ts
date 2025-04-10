import { getConfig } from './config';

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T | null;
}

/**
 * API请求函数
 * @param endpoint API端点
 * @param method HTTP方法
 * @param data 请求数据
 * @returns API响应
 */
export async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<ApiResponse<T>> {
  // 获取API基础URL
  const { apiBaseUrl } = getConfig();
  const url = `${apiBaseUrl}${endpoint}`;
  
  // 构建请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // 添加认证信息（如果有）
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // 设置Cookie中的认证信息
      document.cookie = `admin_token=${token}; path=/`;
    }
  }
  
  // 构建请求选项
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // 包含跨域请求的Cookie
  };
  
  // 添加请求体（针对POST、PUT请求）
  if (method !== 'GET' && data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    // 发送请求
    const response = await fetch(url, options);
    
    // 解析响应
    const result = await response.json();
    
    // 如果响应状态码不是2xx，或者接口返回的code不是200，抛出错误
    if (!response.ok || (result && result.code !== 200)) {
      // 如果是认证错误，清除登录信息
      if (result.code === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_id');
          localStorage.removeItem('admin_name');
          localStorage.removeItem('admin_account');
          localStorage.removeItem('admin_token');
        }
      }
      
      throw result; // 抛出响应结果作为错误
    }
    
    return result;
  } catch (error) {
    // 直接抛出错误，由调用方处理
    throw error;
  }
} 