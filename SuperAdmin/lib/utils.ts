import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * MD5加密函数
 */
export function md5(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex")
}

/**
 * 管理员信息
 */
export interface AdminInfo {
  id: number;
  name: string;
  account: string;
  token: string;
}

/**
 * 保存管理员信息到本地存储
 * @param adminInfo 管理员信息
 */
export function saveAdminInfo(adminInfo: AdminInfo): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_id', adminInfo.id.toString());
    localStorage.setItem('admin_name', adminInfo.name);
    localStorage.setItem('admin_account', adminInfo.account);
    localStorage.setItem('admin_token', adminInfo.token);
  }
}

/**
 * 获取管理员信息
 * @returns 管理员信息
 */
export function getAdminInfo(): AdminInfo | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const id = localStorage.getItem('admin_id');
  const name = localStorage.getItem('admin_name');
  const account = localStorage.getItem('admin_account');
  const token = localStorage.getItem('admin_token');
  
  if (!id || !name || !account || !token) {
    return null;
  }
  
  return {
    id: parseInt(id, 10),
    name,
    account,
    token
  };
}

/**
 * 清除管理员信息
 */
export function clearAdminInfo(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_id');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_account');
    localStorage.removeItem('admin_token');
  }
}
