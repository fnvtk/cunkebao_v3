import type { ApiResponse, PaginatedResponse } from "@/types/common"
import type { ContentLibrary, ContentItem } from "@/types/content-library"

const API_BASE = "/api/content"

// 内容库API
export const contentApi = {
  // 创建内容库
  async createLibrary(data: Partial<ContentLibrary>): Promise<ApiResponse<ContentLibrary>> {
    const response = await fetch(`${API_BASE}/libraries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // 获取内容库列表
  async getLibraries(params: {
    page?: number
    pageSize?: number
    search?: string
    type?: string
  }): Promise<ApiResponse<PaginatedResponse<ContentLibrary>>> {
    const queryString = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, String(value))
      }
    })

    const response = await fetch(`${API_BASE}/libraries?${queryString.toString()}`)
    return response.json()
  },

  // 获取内容库详情
  async getLibraryById(id: string): Promise<ApiResponse<ContentLibrary>> {
    const response = await fetch(`${API_BASE}/libraries/${id}`)
    return response.json()
  },

  // 更新内容库
  async updateLibrary(id: string, data: Partial<ContentLibrary>): Promise<ApiResponse<ContentLibrary>> {
    const response = await fetch(`${API_BASE}/libraries/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // 删除内容库
  async deleteLibrary(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/libraries/${id}`, {
      method: "DELETE",
    })
    return response.json()
  },

  // 创建内容项
  async createItem(libraryId: string, data: Partial<ContentItem>): Promise<ApiResponse<ContentItem>> {
    const response = await fetch(`${API_BASE}/libraries/${libraryId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // 获取内容项列表
  async getItems(
    libraryId: string,
    params: {
      page?: number
      pageSize?: number
      search?: string
      type?: string
    },
  ): Promise<ApiResponse<PaginatedResponse<ContentItem>>> {
    const queryString = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, String(value))
      }
    })

    const response = await fetch(`${API_BASE}/libraries/${libraryId}/items?${queryString.toString()}`)
    return response.json()
  },

  // 获取内容项详情
  async getItemById(libraryId: string, itemId: string): Promise<ApiResponse<ContentItem>> {
    const response = await fetch(`${API_BASE}/libraries/${libraryId}/items/${itemId}`)
    return response.json()
  },

  // 更新内容项
  async updateItem(libraryId: string, itemId: string, data: Partial<ContentItem>): Promise<ApiResponse<ContentItem>> {
    const response = await fetch(`${API_BASE}/libraries/${libraryId}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // 删除内容项
  async deleteItem(libraryId: string, itemId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/libraries/${libraryId}/items/${itemId}`, {
      method: "DELETE",
    })
    return response.json()
  },
}

