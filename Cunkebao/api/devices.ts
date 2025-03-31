import { api } from "@/lib/api";
import type {
  ApiResponse,
  Device,
  DeviceStats,
  DeviceTaskRecord,
  PaginatedResponse,
  QueryDeviceParams,
  CreateDeviceParams,
  UpdateDeviceParams,
  DeviceStatus,
  ServerDevice,
  ServerDevicesResponse
} from "@/types/device"

const API_BASE = "/api/devices"

// 获取设备列表 - 连接到服务器/v1/devices接口
export const fetchDeviceList = async (page: number = 1, limit: number = 20, keyword?: string): Promise<ServerDevicesResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (keyword) {
    params.append('keyword', keyword);
  }
  
  return api.get<ServerDevicesResponse>(`/v1/devices?${params.toString()}`);
};

// 获取设备详情 - 连接到服务器/v1/devices/:id接口
export const fetchDeviceDetail = async (id: string | number): Promise<ApiResponse<any>> => {
  return api.get<ApiResponse<any>>(`/v1/devices/${id}`);
};

// 更新设备任务配置
export const updateDeviceTaskConfig = async (
  id: string | number, 
  config: {
    autoAddFriend?: boolean;
    autoReply?: boolean;
    momentsSync?: boolean;
    aiChat?: boolean;
  }
): Promise<ApiResponse<any>> => {
  return api.post<ApiResponse<any>>(`/v1/devices/task-config`, {
    id,
    ...config
  });
};

// 删除设备
export const deleteDevice = async (id: number): Promise<ApiResponse<any>> => {
  return api.delete<ApiResponse<any>>(`/v1/devices/${id}`);
};

// 设备管理API
export const deviceApi = {
  // 创建设备
  async create(params: CreateDeviceParams): Promise<ApiResponse<Device>> {
    const response = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
    return response.json()
  },

  // 更新设备
  async update(params: UpdateDeviceParams): Promise<ApiResponse<Device>> {
    const response = await fetch(`${API_BASE}/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
    return response.json()
  },

  // 获取设备详情
  async getById(id: string): Promise<ApiResponse<Device>> {
    const response = await fetch(`${API_BASE}/${id}`)
    return response.json()
  },

  // 查询设备列表
  async query(params: QueryDeviceParams): Promise<ApiResponse<PaginatedResponse<Device>>> {
    // 创建一个新对象，用于构建URLSearchParams
    const queryParams: Record<string, string> = {};
    
    // 按需将params中的属性添加到queryParams
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.status) queryParams.status = params.status;
    if (params.type) queryParams.type = params.type;
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    
    // 特殊处理需要JSON序列化的属性
    if (params.tags) queryParams.tags = JSON.stringify(params.tags);
    if (params.dateRange) queryParams.dateRange = JSON.stringify(params.dateRange);
    
    // 构建查询字符串
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`${API_BASE}?${queryString}`)
    return response.json()
  },

  // 删除设备
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    })
    return response.json()
  },

  // 重启设备
  async restart(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/${id}/restart`, {
      method: "POST",
    })
    return response.json()
  },

  // 解绑设备
  async unbind(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/${id}/unbind`, {
      method: "POST",
    })
    return response.json()
  },

  // 获取设备统计数据
  async getStats(id: string): Promise<ApiResponse<DeviceStats>> {
    const response = await fetch(`${API_BASE}/${id}/stats`)
    return response.json()
  },

  // 获取设备任务记录
  async getTaskRecords(id: string, page = 1, pageSize = 20): Promise<ApiResponse<PaginatedResponse<DeviceTaskRecord>>> {
    const response = await fetch(`${API_BASE}/${id}/tasks?page=${page}&pageSize=${pageSize}`)
    return response.json()
  },

  // 批量更新设备标签
  async updateTags(ids: string[], tags: string[]): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceIds: ids, tags }),
    })
    return response.json()
  },

  // 批量导出设备数据
  async exportDevices(ids: string[]): Promise<Blob> {
    const response = await fetch(`${API_BASE}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceIds: ids }),
    })
    return response.blob()
  },

  // 检查设备在线状态
  async checkStatus(ids: string[]): Promise<ApiResponse<Record<string, DeviceStatus>>> {
    const response = await fetch(`${API_BASE}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceIds: ids }),
    })
    return response.json()
  },
}

