export interface ContentLibrary {
  id: string
  name: string
  type: "moments" | "group"
  source: string
  sourceType?: number  // 1: friends, 2: groups
  creator: string
  contentCount: number
  lastUpdated: string
  status: "active" | "inactive"
  
  // 新增字段
  sourceFriends?: string[]
  sourceGroups?: string[]
  selectedFriends?: any[]
  selectedGroupMembers?: any[]
  keywordInclude?: string[]
  keywordExclude?: string[]
  isEnabled?: number
  aiPrompt?: string
  timeEnabled?: number
  timeStart?: string
  timeEnd?: string
  createTime?: string
  updateTime?: string
}

export interface ContentLibraryResponse {
  code: number
  message: string
  data: {
    libraries: ContentLibrary[]
    total: number
  }
}

export interface ContentLibrarySelectResponse {
  code: number
  message: string
  data: {
    success: boolean
    libraryId: string
    name: string
  }
}

// 群成员类型定义
export interface WechatGroupMember {
  id: string
  nickname: string
  wechatId: string
  avatar: string
  gender?: "male" | "female"
  role?: "owner" | "admin" | "member"
  joinTime?: string
}

