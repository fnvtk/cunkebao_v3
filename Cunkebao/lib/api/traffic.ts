import type { ApiResponse, PaginatedResponse } from "@/types/common"
import type { TrafficPool, TrafficDistribution } from "@/types/traffic"

const API_BASE = "/api/traffic"

// 流量池API
export const trafficApi = {
  // 创建流量池
  async createPool(data: Partial<TrafficPool>): Promise<ApiResponse<TrafficPool>> {
    const response = await fetch(`${API_BASE}/pools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // 获取流量池列表
  async getPools(params: {
    page?: number
    pageSize?: number
    search?: string
    type?: string
  }): Promise<ApiResponse<PaginatedResponse<TrafficPool>>> {
    const queryString = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, String(value))
      }
    })

    const response = await fetch(`${API_BASE}/pools?${queryString.toString()}`)
    return response.json()
  },

  // 获取流量池详情
  async getPoolById(id: string): Promise<ApiResponse<TrafficPool>> {
    const response = await fetch(`${API_BASE}/pools/${id}`)
    return response.json()
  },

  // 更新流量池
  async updatePool(id: string, data: Partial<TrafficPool>): Promise<ApiResponse<TrafficPool>> {
    const response = await fetch(`${API_BASE}/pools/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // 删除流量池
  async deletePool(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/pools/${id}`, {
      method: "DELETE",
    })
    return response.json()
  },

  // 创建流量分配
  async createDistribution(data: Partial<TrafficDistribution>): Promise<ApiResponse<TrafficDistribution>> {
    const response = await fetch(`${API_BASE}/distributions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // 获取流量分配列表
  async getDistributions(params: {
    page?: number
    pageSize?: number
    search?: string
    poolId?: string
  }): Promise<ApiResponse<PaginatedResponse<TrafficDistribution>>> {
    const queryString = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, String(value))
      }
    })

    const response = await fetch(`${API_BASE}/distributions?${queryString.toString()}`)
    return response.json()
  },

  // 获取流量分配详情
  async getDistributionById(id: string): Promise<ApiResponse<TrafficDistribution>> {
    const response = await fetch(`${API_BASE}/distributions/${id}`)
    return response.json()
  },

  // 更新流量分配
  async updateDistribution(id: string, data: Partial<TrafficDistribution>): Promise<ApiResponse<TrafficDistribution>> {
    const response = await fetch(`${API_BASE}/distributions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // 删除流量分配
  async deleteDistribution(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/distributions/${id}`, {
      method: "DELETE",
    })
    return response.json()
  },
}

