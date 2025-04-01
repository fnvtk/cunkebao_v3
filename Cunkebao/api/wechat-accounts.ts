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

/**
 * 将服务端的微信账号详情转换为前端详情页面所需的格式
 * @param detailResponse 服务端微信账号详情响应
 * @returns 前端页面所需的微信账号详情格式
 */
export const transformWechatAccountDetail = (detailResponse: WechatAccountDetailResponse): any => {
  if (!detailResponse || !detailResponse.data) {
    return null;
  }

  const { basicInfo, statistics, accountInfo, restrictions, friends } = detailResponse.data;
  
  // 设备信息处理
  let deviceId = '';
  let deviceName = '';
  
  if (basicInfo.deviceInfo) {
    const deviceInfoParts = basicInfo.deviceInfo.split(' ');
    deviceId = deviceInfoParts[0] || '';
    deviceName = deviceInfoParts[1] ? deviceInfoParts[1].replace(/[()]/g, '') : '';
  }
  
  // 账号年龄计算
  let accountAgeYears = 0;
  let accountAgeMonths = 0;
  
  if (accountInfo.createTime) {
    const createDate = new Date(accountInfo.createTime);
    const currentDate = new Date();
    const diffInMonths = (currentDate.getFullYear() - createDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - createDate.getMonth());
    
    accountAgeYears = Math.floor(diffInMonths / 12);
    accountAgeMonths = diffInMonths % 12;
  }
  
  // 转换限制记录
  const restrictionRecords = restrictions?.map((restriction, index) => ({
    id: `${index}`,
    date: restriction.startTime,
    reason: restriction.reason,
    recoveryTime: restriction.endTime,
    type: mapRestrictionType(restriction.type)
  })) || [];
  
  // 转换好友数据
  const transformedFriends = friends?.map(friend => ({
    id: friend.id.toString(),
    avatar: friend.avatar || `/placeholder.svg?height=40&width=40&text=${friend.nickname?.[0] || ''}`,
    nickname: friend.nickname,
    wechatId: friend.wechatId,
    remark: '', // 服务端未提供
    addTime: friend.createTime,
    lastInteraction: '', // 服务端未提供
    tags: [], // 服务端未提供
    region: friend.region || '',
    source: '', // 服务端未提供
    notes: '', // 服务端未提供
  })) || [];
  
  // 创建每周统计数据（模拟数据，服务端未提供）
  const weeklyStats = Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    friends: Math.floor(Math.random() * 50) + 50,
    messages: Math.floor(Math.random() * 100) + 100,
  }));
  
  return {
    id: basicInfo.id.toString(),
    avatar: basicInfo.avatar || '',
    nickname: basicInfo.nickname || '',
    wechatId: basicInfo.wechatId || '',
    deviceId,
    deviceName,
    friendCount: statistics.totalFriend || 0,
    todayAdded: 0, // 服务端未提供，默认为0
    status: basicInfo.status === '在线' ? 'normal' : 'abnormal',
    lastActive: accountInfo.lastUpdateTime || new Date().toLocaleString(),
    messageCount: statistics.thirtyDayMsgCount || 0,
    activeRate: 0, // 服务端未提供，默认为0
    accountAge: {
      years: accountAgeYears,
      months: accountAgeMonths,
    },
    totalChats: statistics.sevenDayMsgCount + statistics.yesterdayMsgCount || 0,
    chatFrequency: Math.floor((statistics.sevenDayMsgCount || 0) / 7), // 每日平均聊天次数
    restrictionRecords,
    isVerified: true, // 服务端未提供，默认为true
    firstMomentDate: accountInfo.createTime || '',
    accountWeight: accountInfo.weight || 50,
    weightFactors: {
      restrictionFactor: restrictionRecords.length > 0 ? 0.8 : 1.0,
      verificationFactor: 1.0,
      ageFactor: Math.min(1.0, accountAgeYears * 0.1 + 0.5),
      activityFactor: statistics.totalFriend > 0 ? 0.9 : 0.7,
    },
    weeklyStats,
    friends: transformedFriends,
  };
};

/**
 * 将服务端的限制类型映射为前端类型
 * @param type 服务端限制类型
 * @returns 前端限制类型
 */
const mapRestrictionType = (type: string): "friend_limit" | "marketing" | "spam" | "other" => {
  const typeMap: Record<string, "friend_limit" | "marketing" | "spam" | "other"> = {
    'friend': 'friend_limit',
    'marketing': 'marketing',
    'spam': 'spam'
  };
  
  return typeMap[type] || 'other';
}; 