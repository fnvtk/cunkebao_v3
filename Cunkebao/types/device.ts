// 设备状态枚举
export enum DeviceStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  BUSY = "busy",
  ERROR = "error",
}

// 设备类型枚举
export enum DeviceType {
  ANDROID = "android",
  IOS = "ios",
}

// 设备基础信息
export interface Device {
  id: string
  name: string
  imei: string
  type: DeviceType
  status: DeviceStatus
  wechatId: string
  friendCount: number
  battery: number
  lastActive: string
  addFriendStatus: "normal" | "abnormal"
  remark?: string
}

// 设备统计信息
export interface DeviceStats {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  todayNewFriends: number
  totalNewFriends: number
  onlineTime: number // 在线时长(分钟)
}

// 设备任务记录
export interface DeviceTaskRecord {
  id: string
  deviceId: string
  taskType: string
  status: "pending" | "running" | "completed" | "failed"
  startTime: string
  endTime?: string
  result?: string
  error?: string
}

// API响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
}

// 分页响应格式
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 设备查询参数
export interface QueryDeviceParams {
  keyword?: string
  status?: DeviceStatus
  type?: DeviceType
  tags?: string[]
  page?: number
  pageSize?: number
  dateRange?: {
    start: string
    end: string
  }
}

// 创建设备参数
export interface CreateDeviceParams {
  name: string
  imei: string
  type: DeviceType
  wechatId?: string
  remark?: string
  tags?: string[]
}

// 更新设备参数
export interface UpdateDeviceParams {
  id: string
  name?: string
  wechatId?: string
  remark?: string
  tags?: string[]
}

export interface DeviceResponse {
  code: number
  message: string
  data: {
    devices: Device[]
    total: number
  }
}

export interface DeviceSelectResponse {
  code: number
  message: string
  data: {
    success: boolean
    deviceIds: string[]
  }
}

