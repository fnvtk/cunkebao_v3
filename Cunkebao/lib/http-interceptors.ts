import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

// Token过期处理
export const handleTokenExpired = () => {
  if (typeof window !== 'undefined') {
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 使用客户端导航而不是直接修改window.location
    // 避免在服务端渲染时执行
    setTimeout(() => {
      window.location.href = '/login';
    }, 0);
  }
};

// 显示API错误，但不会重定向
export const showApiError = (error: any, defaultMessage: string = '请求失败') => {
  if (typeof window === 'undefined') return; // 服务端不处理
  
  let errorMessage = defaultMessage;
  
  // 尝试从各种可能的错误格式中获取消息
  if (error) {
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message || defaultMessage;
    } else if (typeof error === 'object') {
      // 尝试从API响应中获取错误消息
      errorMessage = error.msg || error.message || error.error || defaultMessage;
    }
  }
  
  // 显示错误消息
  if (typeof toast !== 'undefined') {
    toast({
      title: "请求错误",
      description: errorMessage,
      variant: "destructive"
    });
  } else {
    console.error('API错误:', errorMessage);
  }
};

// 响应拦截器 - 此函数已不再使用，保留仅用于兼容性
export const handleApiResponse = <T>(response: Response, result: any): T => {
  // 不再处理401响应，而是直接返回结果
  // 401的处理已移至api.ts中直接处理
  console.warn('handleApiResponse已弃用，请直接在api.ts中处理响应');
  
  return result;
};

// 处理API错误 - 此函数已不再使用，保留仅用于兼容性
export const handleApiError = (error: unknown): never => {
  console.error('API请求错误:', error);
  console.warn('handleApiError已弃用，请直接在api.ts中处理错误');
  
  throw new Error('未知错误，请稍后重试');
}; 