import type {
  ApiResponse,
  Device,
  DeviceStats,
  DeviceTaskRecord,
  PaginatedResponse,
  QueryDeviceParams,
  CreateDeviceParams,
  UpdateDeviceParams,
  DeviceStatus, // Added DeviceStatus import
} from "@/types/device"

const API_BASE = "/api/devices"

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
    const queryString = new URLSearchParams({
      ...params,
      tags: params.tags ? JSON.stringify(params.tags) : "",
      dateRange: params.dateRange ? JSON.stringify(params.dateRange) : "",
    }).toString()

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

