// 服务端返回的微信账号数据结构
export interface ServerWechatAccount {
  id: number;
  wechatId: string;
  wechatAccount: string;
  nickname: string;
  accountNickname: string;
  avatar: string;
  accountUserName: string;
  status: string;
  deviceStatus: string;
  totalFriend: number;
  canAddFriendCount: number;
  deviceInfo: string;
  todayNewFriendCount: number;
  wechatAlive: number;
  deviceAlive: number;
  imei: string;
  deviceMemo: string;
}

// 服务器响应结构
export interface ServerWechatAccountsResponse {
  code: number;
  msg: string;
  data: {
    total: number;
    list: ServerWechatAccount[];
  };
}

// 前端使用的微信账号数据结构
export interface WechatAccount {
  id: string;
  avatar: string;
  nickname: string;
  wechatId: string;
  deviceId: string;
  deviceName: string;
  friendCount: number;
  todayAdded: number;
  remainingAdds: number;
  maxDailyAdds: number;
  status: "normal" | "abnormal";
  lastActive: string;
}

// 微信账号查询参数
export interface QueryWechatAccountParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}

// 微信好友数据结构
export interface WechatFriend {
  id: string;
  wechatId: string;
  nickname: string;
  avatar: string;
  gender: number;
  region: string;
  signature: string;
  labels: string;
  createTime: string;
}

// 微信账号详情数据结构
export interface WechatAccountDetail {
  basicInfo: {
    id: number;
    wechatId: string;
    nickname: string;
    avatar: string;
    status: string;
    deviceStatus: string;
    deviceInfo: string;
    gender: number;
    region: string;
    signature: string;
  };
  statistics: {
    totalFriend: number;
    maleFriend: number;
    femaleFriend: number;
    canAddFriendCount: number;
    yesterdayMsgCount: number;
    sevenDayMsgCount: number;
    thirtyDayMsgCount: number;
  };
  accountInfo: {
    age: number;
    activityLevel: string;
    weight: number;
    createTime: string;
    lastUpdateTime: string;
  };
  restrictions: Array<{
    type: string;
    reason: string;
    startTime: string;
    endTime: string;
  }>;
  friends: WechatFriend[];
}

// 微信账号详情响应
export interface WechatAccountDetailResponse {
  code: number;
  msg: string;
  data: WechatAccountDetail;
} 