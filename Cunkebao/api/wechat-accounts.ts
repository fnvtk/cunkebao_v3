import { api } from "@/lib/api";
import { 
  ServerWechatAccountsResponse, 
  QueryWechatAccountParams,
} from "@/types/wechat-account";

// 添加接口返回数据类型定义
interface WechatAccountSummary {
  accountAge: string;
  activityLevel: {
    allTimes: number;
    dayTimes: number;
  };
  accountWeight: {
    scope: number;
    ageWeight: number;
    activityWeigth: number;
    restrictWeight: number;
    realNameWeight: number;
  };
  statistics: {
    todayAdded: number;
    addLimit: number;
  };
  restrictions: {
    id: number;
    level: string;
    reason: string;
    date: string;
  }[];
}

interface WechatAccountSummaryResponse {
  code: number;
  msg: string;
  data: WechatAccountSummary;
}

/**
 * 获取微信账号列表
 * @param params 查询参数
 * @returns 微信账号列表响应
 */
export const fetchWechatAccountList = async (params: QueryWechatAccountParams = {}): Promise<ServerWechatAccountsResponse> => {
  const queryParams = new URLSearchParams();
  
  // 添加查询参数
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.keyword) queryParams.append('nickname', params.keyword); // 使用nickname作为关键词搜索参数
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.order) queryParams.append('order', params.order);
  
  // 发起API请求
  return api.get<ServerWechatAccountsResponse>(`/v1/wechats?${queryParams.toString()}`);
};

/**
 * 刷新微信账号状态
 * @returns 刷新结果
 */
export const refreshWechatAccounts = async (): Promise<{ code: number; msg: string; data: any }> => {
  return api.put<{ code: number; msg: string; data: any }>('/v1/wechats/refresh', {});
};

/**
 * 执行微信好友转移
 * @param sourceId 源微信账号ID
 * @param targetId 目标微信账号ID
 * @returns 转移结果
 */
export const transferWechatFriends = async (sourceId: string | number, targetId: string | number): Promise<{ code: number; msg: string; data: any }> => {
  return api.post<{ code: number; msg: string; data: any }>('/v1/wechats/transfer-friends', {
    source_id: sourceId,
    target_id: targetId
  });
};

/**
 * 将服务器返回的微信账号数据转换为前端使用的格式
 * @param serverAccount 服务器返回的微信账号数据
 * @returns 前端使用的微信账号数据
 */
export const transformWechatAccount = (serverAccount: any): import("@/types/wechat-account").WechatAccount => {
  // 从deviceInfo中提取设备信息
  let deviceId = '';
  let deviceName = '';
  
  if (serverAccount.deviceInfo) {
    // 尝试解析设备信息字符串
    const deviceInfo = serverAccount.deviceInfo.split(' ');
    if (deviceInfo.length > 0) {
      // 提取数字部分作为设备ID，确保是整数
      const possibleId = deviceInfo[0].trim();
      // 验证是否为数字
      deviceId = /^\d+$/.test(possibleId) ? possibleId : '';
      
      // 提取设备名称
      if (deviceInfo.length > 1) {
        deviceName = deviceInfo[1] ? deviceInfo[1].replace(/[()]/g, '').trim() : '';
      }
    }
  }
  
  // 如果从deviceInfo无法获取有效的设备ID，使用imei作为备选
  if (!deviceId && serverAccount.imei) {
    deviceId = serverAccount.imei;
  }
  
  // 如果仍然没有设备ID，使用微信账号的ID作为最后的备选
  if (!deviceId && serverAccount.id) {
    deviceId = serverAccount.id.toString();
  }
  
  // 如果没有设备名称，使用备用名称
  if (!deviceName) {
    deviceName = serverAccount.deviceMemo || '未命名设备';
  }
  
  // 假设每天最多可添加20个好友
  const maxDailyAdds = 20;
  const todayAdded = serverAccount.todayNewFriendCount || 0;
  
  return {
    id: serverAccount.id.toString(),
    avatar: serverAccount.avatar || '',
    nickname: serverAccount.nickname || serverAccount.accountNickname || '未命名',
    wechatId: serverAccount.wechatId || '',
    deviceId,
    deviceName,
    friendCount: serverAccount.totalFriend || 0,
    todayAdded,
    remainingAdds: serverAccount.canAddFriendCount || (maxDailyAdds - todayAdded),
    maxDailyAdds,
    status: serverAccount.wechatAlive === 1 ? "normal" : "abnormal" as "normal" | "abnormal",
    lastActive: new Date().toLocaleString() // 服务端未提供，使用当前时间
  };
};

/**
 * 获取微信好友列表
 * @param wechatId 微信账号ID
 * @param page 页码
 * @param pageSize 每页数量
 * @param searchQuery 搜索关键词
 * @returns 好友列表数据
 */
export const fetchWechatFriends = async (wechatId: string, page: number = 1, pageSize: number = 20, searchQuery: string = '') => {
  try {
    return api.get(`/v1/wechats/${wechatId}/friends?page=${page}&limit=${pageSize}${searchQuery ? `&search=${searchQuery}` : ''}`, true);
  } catch (error) {
    console.error("获取好友列表失败:", error);
    throw error;
  }
};

/**
 * 获取微信账号概览信息
 * @param id 微信账号ID
 * @returns 微信账号概览信息
 */
export const fetchWechatAccountSummary = async (id: string): Promise<WechatAccountSummaryResponse> => {
  try {
    return api.get<WechatAccountSummaryResponse>(`/v1/wechats/${id}/summary`);
  } catch (error) {
    console.error("获取账号概览失败:", error);
    throw error;
  }
};

/**
 * 获取好友详情信息
 * @param wechatId 微信账号ID
 * @param friendId 好友ID
 * @returns 好友详情信息
 */
export interface WechatFriendDetail {
  id: number;
  avatar: string;
  nickname: string;
  region: string;
  wechatId: string;
  addDate: string;
  tags: string[];
  playDate: string;
  memo: string;
  source: string;
}

interface WechatFriendDetailResponse {
  code: number;
  msg: string;
  data: WechatFriendDetail;
}

export const fetchWechatFriendDetail = async (wechatId: string, friendId: string): Promise<WechatFriendDetailResponse> => {
  try {
    return api.get<WechatFriendDetailResponse>(`/v1/wechats/${wechatId}/friend/${friendId}`);
  } catch (error) {
    console.error("获取好友详情失败:", error);
    throw error;
  }
}; 