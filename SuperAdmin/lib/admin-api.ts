import { getConfig } from './config';

// 管理员接口数据类型定义
export interface Administrator {
  id: number;
  username: string;
  name: string;
  role: string;
  status: number;
  createdAt: string;
  lastLogin: string;
  permissions: string[];
}

// 管理员详情接口
export interface AdministratorDetail {
  id: number;
  username: string;
  name: string;
  authId: number;
  roleName: string;
  status: number;
  createdAt: string;
  lastLogin: string;
  permissions: string[];
}

// 分页响应数据类型
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}

// API响应数据结构
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T | null;
}

/**
 * 获取管理员列表
 * @param page 页码
 * @param limit 每页数量
 * @param keyword 搜索关键词
 * @returns 管理员列表
 */
export async function getAdministrators(
  page: number = 1,
  limit: number = 10,
  keyword: string = ''
): Promise<ApiResponse<PaginatedResponse<Administrator>>> {
  const { apiBaseUrl } = getConfig();
  
  // 构建查询参数
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (keyword) {
    params.append('keyword', keyword);
  }
  
  try {
    // 发送请求
    const response = await fetch(`${apiBaseUrl}/administrator/list?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`请求失败，状态码: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    return {
      code: 500,
      msg: '获取管理员列表失败',
      data: null
    };
  }
}

/**
 * 获取管理员详情
 * @param id 管理员ID
 * @returns 管理员详情
 */
export async function getAdministratorDetail(id: number | string): Promise<ApiResponse<AdministratorDetail>> {
  const { apiBaseUrl } = getConfig();
  
  try {
    // 发送请求
    const response = await fetch(`${apiBaseUrl}/administrator/detail/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`请求失败，状态码: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取管理员详情失败:', error);
    return {
      code: 500,
      msg: '获取管理员详情失败',
      data: null
    };
  }
} 