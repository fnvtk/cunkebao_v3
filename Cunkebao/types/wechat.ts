// 微信好友类型定义
export interface WechatFriend {
  id: string
  nickname: string
  wechatId: string
  avatar: string
  gender?: "male" | "female"
  customer?: string
  alias?: string
  ownerNickname?: string
  ownerAlias?: string
  createTime?: string
}

// 微信群组类型定义 
export interface WechatGroup {
  id: string
  name: string
  memberCount: number
  avatar: string
  owner: string
  customer: string
}

// 微信群成员类型定义
export interface WechatGroupMember {
  id: string
  nickname: string
  wechatId: string
  avatar: string
  gender?: "male" | "female"
  role?: "owner" | "admin" | "member"
  joinTime?: string
  groupId?: string
} 