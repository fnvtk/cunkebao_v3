import { request } from "@/lib/api"

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T | null;
}

// 服务器返回的场景数据类型
export interface SceneItem {
  id: number;
  name: string;
  image: string;
  status: number;
  createTime: number;
  updateTime: number | null;
  deleteTime: number | null;
}

// 服务器返回的场景列表响应类型
export interface ScenesResponse {
  code: number;
  msg: string;
  data: SceneItem[];
}

// 前端使用的场景数据类型
export interface Channel {
  id: string;
  name: string;
  icon: string;
  stats: {
    daily: number;
    growth: number;
  };
  link?: string;
  plans?: Plan[];
}

// 计划类型
export interface Plan {
  id: string;
  name: string;
  isNew?: boolean;
  status: "active" | "paused" | "completed";
  acquisitionCount: number;
}

/**
 * 获取获客场景列表
 * 
 * @param params 查询参数
 * @returns 获客场景列表
 */
export const fetchScenes = async (params: {
  page?: number;
  limit?: number;
  keyword?: string;
} = {}): Promise<ScenesResponse> => {
  const { page = 1, limit = 10, keyword = "" } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));
  
  if (keyword) {
    queryParams.append("keyword", keyword);
  }
  
  try {
    return await request<ScenesResponse>(`/v1/plan/scenes?${queryParams.toString()}`);
  } catch (error) {
    console.error("Error fetching scenes:", error);
    // 返回一个错误响应
    return {
      code: 500,
      msg: "获取场景列表失败",
      data: []
    };
  }
};

/**
 * 将服务器返回的场景数据转换为前端展示需要的格式
 * 
 * @param item 服务器返回的场景数据
 * @returns 前端展示的场景数据
 */
export const transformSceneItem = (item: SceneItem): Channel => {
  // 为每个场景生成随机的"今日"数据和"增长百分比"
  const dailyCount = Math.floor(Math.random() * 100);
  const growthPercent = Math.floor(Math.random() * 40) - 10; // -10% 到 30% 的随机值
  
  // 默认图标(如果服务器没有返回)
  const defaultIcon = "/assets/icons/poster-icon.svg";
  
  return {
    id: String(item.id),
    name: item.name,
    icon: item.image || defaultIcon,
    stats: {
      daily: dailyCount,
      growth: growthPercent
    }
  };
};

/**
 * 获取场景详情
 * 
 * @param id 场景ID
 * @returns 场景详情
 */
export const fetchSceneDetail = async (id: string | number): Promise<ApiResponse<SceneItem>> => {
  try {
    return await request<ApiResponse<SceneItem>>(`/v1/plan/scenes/${id}`);
  } catch (error) {
    console.error("Error fetching scene detail:", error);
    return {
      code: 500,
      msg: "获取场景详情失败",
      data: null
    };
  }
};

