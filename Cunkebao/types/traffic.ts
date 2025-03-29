export interface TrafficUser {
  id: string
  avatar: string
  nickname: string
  wechatId: string
  phone: string
  region: string
  note: string
  status: "pending" | "added" | "failed"
  addTime: string
  source: string
  assignedTo: string
  category: "potential" | "customer" | "lost"
}

