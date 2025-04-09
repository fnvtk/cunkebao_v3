import type { ApiResponse, PaginatedResponse } from "@/types/common"
import type { MomentsSync, GroupSync, GroupPush, AutoLike, AutoGroup } from "@/types/workspace"

const API_BASE = "/api/workspace"

// 工作区API
export const workspaceApi = {
  // 朋友圈同步API
  moments: {
    // 创建朋友圈同步任务
    async create(data: Partial<MomentsSync>): Promise<ApiResponse<MomentsSync>> {
      const response = await fetch(`${API_BASE}/moments-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    // 获取朋友圈同步任务列表
    async getList(params: {
      page?: number
      pageSize?: number
      status?: string
    }): Promise<ApiResponse<PaginatedResponse<MomentsSync>>> {
      const queryString = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryString.append(key, String(value))
        }
      })

      const response = await fetch(`${API_BASE}/moments-sync?${queryString.toString()}`)
      return response.json()
    },

    // 获取朋友圈同步任务详情
    async getById(id: string): Promise<ApiResponse<MomentsSync>> {
      const response = await fetch(`${API_BASE}/moments-sync/${id}`)
      return response.json()
    },

    // 更新朋友圈同步任务
    async update(id: string, data: Partial<MomentsSync>): Promise<ApiResponse<MomentsSync>> {
      const response = await fetch(`${API_BASE}/moments-sync/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    // 删除朋友圈同步任务
    async delete(id: string): Promise<ApiResponse<void>> {
      const response = await fetch(`${API_BASE}/moments-sync/${id}`, {
        method: "DELETE",
      })
      return response.json()
    },

    // 启动朋友圈同步任务
    async start(id: string): Promise<ApiResponse<void>> {
      const response = await fetch(`${API_BASE}/moments-sync/${id}/start`, {
        method: "POST",
      })
      return response.json()
    },

    // 暂停朋友圈同步任务
    async pause(id: string): Promise<ApiResponse<void>> {
      const response = await fetch(`${API_BASE}/moments-sync/${id}/pause`, {
        method: "POST",
      })
      return response.json()
    },
  },

  // 群同步API
  groupSync: {
    // 创建群同步任务
    async create(data: Partial<GroupSync>): Promise<ApiResponse<GroupSync>> {
      const response = await fetch(`${API_BASE}/group-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    // 获取群同步任务列表
    async getList(params: {
      page?: number
      pageSize?: number
      status?: string
    }): Promise<ApiResponse<PaginatedResponse<GroupSync>>> {
      const queryString = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryString.append(key, String(value))
        }
      })

      const response = await fetch(`${API_BASE}/group-sync?${queryString.toString()}`)
      return response.json()
    },

    // 获取群同步任务详情
    async getById(id: string): Promise<ApiResponse<GroupSync>> {
      const response = await fetch(`${API_BASE}/group-sync/${id}`)
      return response.json()
    },

    // 更新群同步任务
    async update(id: string, data: Partial<GroupSync>): Promise<ApiResponse<GroupSync>> {
      const response = await fetch(`${API_BASE}/group-sync/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    // 删除群同步任务
    async delete(id: string): Promise<ApiResponse<void>> {
      const response = await fetch(`${API_BASE}/group-sync/${id}`, {
        method: "DELETE",
      })
      return response.json()
    },
  },

  // 群发API
  groupPush: {
    // 创建群发任务
    async create(data: Partial<GroupPush>): Promise<ApiResponse<GroupPush>> {
      const response = await fetch(`${API_BASE}/group-push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    // 获取群发任务列表
    async getList(params: {
      page?: number
      pageSize?: number
      status?: string
    }): Promise<ApiResponse<PaginatedResponse<GroupPush>>> {
      const queryString = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryString.append(key, String(value))
        }
      })

      const response = await fetch(`${API_BASE}/group-push?${queryString.toString()}`)
      return response.json()
    },

    // 获取群发任务详情
    async getById(id: string): Promise<ApiResponse<GroupPush>> {
      const response = await fetch(`${API_BASE}/group-push/${id}`)
      return response.json()
    },

    // 更新群发任务
    async update(id: string, data: Partial<GroupPush>): Promise<ApiResponse<GroupPush>> {
      const response = await fetch(`${API_BASE}/group-push/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    // 删除群发任务
    async delete(id: string): Promise<ApiResponse<void>> {
      const response = await fetch(`${API_BASE}/group-push/${id}`, {
        method: "DELETE",
      })
      return response.json()
    },
  },

  // 自动点赞API
  autoLike: {
    // 创建自动点赞任务
    async create(data: Partial<AutoLike>): Promise<ApiResponse<AutoLike>> {
      const response = await fetch(`${API_BASE}/auto-like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    // 获取自动点赞任务列表
    async getList(params: {
      page?: number
      pageSize?: number
      status?: string
    }): Promise<ApiResponse<PaginatedResponse<AutoLike>>> {
      const queryString = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryString.append(key, String(value))
        }
      })

      const response = await fetch(`${API_BASE}/auto-like?${queryString.toString()}`)
      return response.json()
    },

    // 获取自动点赞任务详情
    async getById(id: string): Promise<ApiResponse<AutoLike>> {
      const response = await fetch(`${API_BASE}/auto-like/${id}`)
      return response.json()
    },

    // 更新自动点赞任务
    async update(id: string, data: Partial<AutoLike>): Promise<ApiResponse<AutoLike>> {
      const response = await fetch(`${API_BASE}/auto-like/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    // 删除自动点赞任务
    async delete(id: string): Promise<ApiResponse<void>> {
      const response = await fetch(`${API_BASE}/auto-like/${id}`, {
        method: "DELETE",
      })
      return response.json()
    },
  },

  // 自动建群API
  autoGroup: {
    // 创建自动建群任务
    async create(data: Partial<AutoGroup>): Promise<ApiResponse<AutoGroup>> {
      const response = await fetch(`${API_BASE}/auto-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    // 获取自动建群任务列表
    async getList(params: {
      page?: number
      pageSize?: number
      status?: string
    }): Promise<ApiResponse<PaginatedResponse<AutoGroup>>> {
      const queryString = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryString.append(key, String(value))
        }
      })

      const response = await fetch(`${API_BASE}/auto-group?${queryString.toString()}`)
      return response.json()
    },

    // 获取自动建群任务详情
    async getById(id: string): Promise<ApiResponse<AutoGroup>> {
      const response = await fetch(`${API_BASE}/auto-group/${id}`)
      return response.json()
    },

    // 更新自动建群任务
    async update(id: string, data: Partial<AutoGroup>): Promise<ApiResponse<AutoGroup>> {
      const response = await fetch(`${API_BASE}/auto-group/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return response.json()
    },

    // 删除自动建群任务
    async delete(id: string): Promise<ApiResponse<void>> {
      const response = await fetch(`${API_BASE}/auto-group/${id}`, {
        method: "DELETE",
      })
      return response.json()
    },
  },
}

