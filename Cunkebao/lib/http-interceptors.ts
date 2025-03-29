import { useRouter } from "next/navigation";

// Token过期处理
export const handleTokenExpired = () => {
  if (typeof window !== 'undefined') {
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 跳转到登录页
    window.location.href = '/login';
  }
};

// 响应拦截器
export const handleApiResponse = <T>(response: Response, result: any): T => {
  // 处理token过期情况
  if (result && (result.code === 401 || result.msg?.includes('token'))) {
    handleTokenExpired();
    throw new Error(result.msg || '登录已过期，请重新登录');
  }
  
  return result;
};

// 处理API错误
export const handleApiError = (error: unknown): never => {
  console.error('API请求错误:', error);
  
  if (error instanceof Error) {
    // 如果是未授权错误，可能是token过期
    if (error.message.includes('401') || error.message.includes('token') || error.message.includes('授权')) {
      handleTokenExpired();
    }
    throw error;
  }
  
  throw new Error('未知错误，请稍后重试');
}; 