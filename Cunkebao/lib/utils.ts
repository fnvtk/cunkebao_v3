import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 用于在客户端和服务器端获取一致的日期格式
// 避免因为时区差异导致的水合不匹配
export function getFormattedDate(date: Date | string | number, format: Intl.DateTimeFormatOptions = {}) {
  // 使用传入的日期创建一个新的日期对象
  const dateObj = new Date(date);
  
  // 使用en-US区域设置创建字符串，确保客户端和服务器端一致
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...format
  });
}

// 安全的客户端检查
export function isClient() {
  return typeof window !== 'undefined';
}

// 防止在服务端使用Math.random导致水合不匹配
export function getClientRandomId(prefix = '') {
  if (isClient()) {
    return `${prefix}${Math.random().toString(36).substring(2, 9)}`;
  }
  return `${prefix}placeholder`;
}

