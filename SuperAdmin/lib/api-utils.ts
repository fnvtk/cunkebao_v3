import { getConfig } from './config';
import { getAdminInfo, clearAdminInfo } from './utils';

/**
 * API响应数据结构
 */
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T | null;
}

/**
 * 通用API请求函数
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
  const { apiBaseUrl } = getConfig();
  const url = `${apiBaseUrl}${endpoint}`;
  
  // 获取认证信息
  const adminInfo = getAdminInfo();
  
  // 请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // 如果有认证信息，添加Cookie头
  if (adminInfo?.token) {
    // 添加认证令牌，作为Cookie发送
    document.cookie = `admin_id=${adminInfo.id}; path=/`;
    document.cookie = `admin_token=${adminInfo.token}; path=/`;
  }
  
  // 请求配置
  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // 包含跨域请求的Cookie
  };
  
  // 如果有请求数据，转换为JSON
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json() as ApiResponse<T>;
    
    // 如果返回未授权错误，清除登录信息
    if (result.code === 401) {
      clearAdminInfo();
      // 如果在浏览器环境，跳转到登录页
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return result;
  } catch (error) {
    console.error('API请求错误:', error);
    
    return {
      code: 500,
      msg: error instanceof Error ? error.message : '未知错误',
      data: null
    };
  }
} 