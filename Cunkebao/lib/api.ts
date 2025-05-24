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
    
    // 检查网络响应状态
    if (!response.ok) {
      // 只有当响应状态码为401时才特殊处理为认证错误
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          // 直接调用handleTokenExpired而不是handleApiError，以处理401错误
          // 因为有响应体的情况下，我们应该让handleApiResponse处理401
          // 在这里只处理没有响应体的401网络错误
          const errorMessage = `Unauthorized: ${response.statusText}`;
          console.error('授权错误:', errorMessage);
          
          // 尝试解析响应，如果无法解析才直接处理token过期
          try {
            await response.json();
            // 如果能够解析，让后续代码处理
          } catch (e) {
            // 如果无法解析，说明是纯网络层401错误，直接处理token过期
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
              throw new Error(errorMessage);
            }
          }
        }
      }
      // 其他HTTP错误正常返回，让上层组件自行处理
    }
    
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      // 处理JSON解析错误
      console.error('无法解析响应JSON:', parseError);
      throw new Error('服务器响应格式错误');
    }

    // 使用响应拦截器处理响应
    if (result && result.code === 401) {
      if (typeof window !== 'undefined') {
        // 只清除 token，不进行重定向
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        // 使用 window.location 进行一次性重定向
          window.location.href = '/login';
      }
      throw new Error(result.msg || '登录已过期，请重新登录');
    }
    
    // 返回结果而不调用可能会清除token的handleApiResponse
    return result;
  } catch (error) {
    // 使用错误拦截器处理错误
    // 只有在确认是401错误时才清除token
    if (error instanceof Error && 
        (error.message.includes('401') || 
         (error.message.toLowerCase().includes('unauthorized') && 
          error.message.toLowerCase().includes('token')))) {
      if (typeof window !== 'undefined') {
        // 只清除 token，不进行重定向
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        // 重定向逻辑由 AuthProvider 统一处理
      }
    }
    
    // 其他错误直接抛出但不调用handleApiError
    console.error('API请求错误:', error);
    throw error;
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
    // 直接使用fetch而不是通过api调用，以便捕获具体错误
    const token = getToken();
    if (!token) return false;
    
    const response = await fetch(`${API_BASE_URL}/v1/auth/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // 如果状态码是401，明确是认证问题
    if (response.status === 401) {
      return false;
    }
    
    // 如果是其他HTTP错误，我们不确定是否是认证问题
    if (!response.ok) {
      // 对于非401错误，不要立即判定token无效
      console.warn(`验证token时收到HTTP错误: ${response.status} ${response.statusText}`);
      
      // 尝试读取响应内容
      try {
        const result = await response.json();
        // 只有明确返回code为401才判断为token无效
        if (result && result.code === 401) {
          return false;
        }
        // 其他错误代码视为服务端问题，不影响token有效性
        return true;
      } catch (parseError) {
        // 无法解析响应，视为网络或服务器问题，不影响token
        console.error('无法解析验证token的响应:', parseError);
        return true;
      }
    }
    
    // 正常情况下，尝试解析响应并检查code
    try {
      const result = await response.json();
      return result.code === 200;
    } catch (parseError) {
      // 无法解析响应，视为网络或服务器问题，不影响token
      console.error('无法解析验证token的响应:', parseError);
      return true;
    }
  } catch (error) {
    // 网络错误或其他异常不应该导致token被视为无效
    console.error('验证token时发生异常:', error);
    // 对于网络连接问题，不直接判定为token无效
    return true;
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