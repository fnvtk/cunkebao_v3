import { apiRequest, ApiResponse } from './api-utils';

/**
 * 客户数据接口
 */
export interface Customer {
  id: number;
  avatar: string;
  nickname: string;
  wechatId: string;
  gender: string;
  region: string;
  tags: string[];
  source: string;
  projectName: string;
  addTime: string;
  mobile: number;
}

/**
 * 分页响应数据类型
 */
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 获取客户池列表
 * @param page 页码
 * @param limit 每页数量
 * @param keyword 搜索关键词
 * @returns 客户列表
 */
export async function getTrafficPoolList(
  page: number = 1,
  limit: number = 10,
  keyword: string = ''
): Promise<ApiResponse<PaginatedResponse<Customer>>> {
  // 构建查询参数
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (keyword) {
    params.append('keyword', keyword);
  }
  
  return apiRequest(`/trafficPool/list?${params.toString()}`);
} 