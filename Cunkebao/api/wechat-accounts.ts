import { api } from "@/lib/api";
import { 
  ServerWechatAccountsResponse, 
  QueryWechatAccountParams,
  WechatAccountDetailResponse
} from "@/types/wechat-account";

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
  return api.get<ServerWechatAccountsResponse>(`/v1/device/wechats?${queryParams.toString()}`);
};

/**
 * 获取微信账号详情
 * @param id 微信账号ID
 * @returns 微信账号详情响应
 */
export const fetchWechatAccountDetail = async (id: string | number): Promise<WechatAccountDetailResponse> => {
  return api.get<WechatAccountDetailResponse>(`/v1/device/wechats/${id}`);
};

/**
 * 刷新微信账号状态
 * @returns 刷新结果
 */
export const refreshWechatAccounts = async (): Promise<{ code: number; msg: string; data: any }> => {
  return api.put<{ code: number; msg: string; data: any }>('/v1/device/wechats/refresh', {});
};

/**
 * 执行微信好友转移
 * @param sourceId 源微信账号ID
 * @param targetId 目标微信账号ID
 * @returns 转移结果
 */
export const transferWechatFriends = async (sourceId: string | number, targetId: string | number): Promise<{ code: number; msg: string; data: any }> => {
  return api.post<{ code: number; msg: string; data: any }>('/v1/device/wechats/transfer-friends', {
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
    const deviceInfo = serverAccount.deviceInfo.split(' ');
    deviceId = deviceInfo[0] || '';
    deviceName = deviceInfo[1] ? deviceInfo[1].replace(/[()]/g, '') : '';
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