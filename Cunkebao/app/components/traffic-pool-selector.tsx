"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserTag {
  id: string
  name: string
  color: string
}

interface TrafficUser {
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
  tags: UserTag[]
}

interface TrafficPoolSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUsers: TrafficUser[]
  onSelect: (users: TrafficUser[]) => void
}

export function TrafficPoolSelector({ open, onOpenChange, selectedUsers, onSelect }: TrafficPoolSelectorProps) {
  const [users, setUsers] = useState<TrafficUser[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  // 初始化已选用户
  useEffect(() => {
    if (open) {
      setSelectedUserIds(selectedUsers.map((user) => user.id))
    }
  }, [open, selectedUsers])

  // 模拟获取用户数据
  useEffect(() => {
    if (!open) return

    const fetchUsers = async () => {
      setLoading(true)
      try {
        // 模拟API请求
        await new Promise((resolve) => setTimeout(resolve, 800))

        // 生成模拟数据
        const mockUsers: TrafficUser[] = Array.from({ length: 30 }, (_, i) => {
          // 随机标签
          const tagPool = [
            { id: "tag1", name: "潜在客户", color: "bg-blue-100 text-blue-800" },
            { id: "tag2", name: "高意向", color: "bg-green-100 text-green-800" },
            { id: "tag3", name: "已成交", color: "bg-purple-100 text-purple-800" },
            { id: "tag4", name: "需跟进", color: "bg-yellow-100 text-yellow-800" },
            { id: "tag5", name: "活跃用户", color: "bg-indigo-100 text-indigo-800" },
            { id: "tag6", name: "沉默用户", color: "bg-gray-100 text-gray-800" },
            { id: "tag7", name: "企业客户", color: "bg-red-100 text-red-800" },
            { id: "tag8", name: "个人用户", color: "bg-pink-100 text-pink-800" },
          ]

          const randomTags = Array.from(
            { length: Math.floor(Math.random() * 3) + 1 },
            () => tagPool[Math.floor(Math.random() * tagPool.length)],
          )

          // 确保标签唯一
          const uniqueTags = randomTags.filter((tag, index, self) => index === self.findIndex((t) => t.id === tag.id))

          const sources = ["抖音直播", "小红书", "微信朋友圈", "视频号", "公众号"]
          const statuses = ["pending", "added", "failed"] as const

          return {
            id: `user-${i + 1}`,
            avatar: `/placeholder.svg?height=40&width=40`,
            nickname: `用户${i + 1}`,
            wechatId: `wxid_${Math.random().toString(36).substring(2, 10)}`,
            phone: `1${Math.floor(Math.random() * 9 + 1)}${Array(9)
              .fill(0)
              .map(() => Math.floor(Math.random() * 10))
              .join("")}`,
            region: ["北京", "上海", "广州", "深圳", "杭州"][Math.floor(Math.random() * 5)],
            note: Math.random() > 0.7 ? `这是用户${i + 1}的备注信息` : "",
            status: statuses[Math.floor(Math.random() * 3)],
            addTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            source: sources[Math.floor(Math.random() * sources.length)],
            assignedTo: Math.random() > 0.5 ? `销售${Math.floor(Math.random() * 5) + 1}` : "",
            category: ["potential", "customer", "lost"][Math.floor(Math.random() * 3)] as
              | "potential"
              | "customer"
              | "lost",
            tags: uniqueTags,
          }
        })

        setUsers(mockUsers)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [open])

  // 过滤用户
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.wechatId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)

    const matchesCategory = activeCategory === "all" || user.category === activeCategory

    const matchesSource = sourceFilter === "all" || user.source === sourceFilter

    const matchesTag = tagFilter === "all" || user.tags.some((tag) => tag.id === tagFilter)

    return matchesSearch && matchesCategory && matchesSource && matchesTag
  })

  // 处理选择用户
  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  // 处理全选
  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(filteredUsers.map((user) => user.id))
    }
  }

  // 处理确认选择
  const handleConfirm = () => {
    const selectedUsersList = users.filter((user) => selectedUserIds.includes(user.id))
    onSelect(selectedUsersList)
    onOpenChange(false)
  }

  // 获取所有标签选项
  const allTags = Array.from(new Set(users.flatMap((user) => user.tags).map((tag) => JSON.stringify(tag)))).map(
    (tag) => JSON.parse(tag) as UserTag,
  )

  // 获取所有来源选项
  const allSources = Array.from(new Set(users.map((user) => user.source)))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>选择流量池用户</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 搜索和筛选区域 */}
          <div className="space-y-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索用户名/微信号/手机号"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* 分类标签页 */}
            <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="potential">潜在客户</TabsTrigger>
                <TabsTrigger value="customer">已转化</TabsTrigger>
                <TabsTrigger value="lost">已流失</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 筛选器 */}
            <div className="flex space-x-2">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部来源</SelectItem>
                  {allSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="标签" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部标签</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" className="ml-auto" onClick={handleSelectAll}>
                {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? "取消全选" : "全选"}
              </Button>
            </div>
          </div>

          {/* 用户列表 */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery || activeCategory !== "all" || sourceFilter !== "all" || tagFilter !== "all"
                  ? "没有符合条件的用户"
                  : "暂无用户数据"}
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className={`p-3 hover:shadow-md transition-shadow ${
                      selectedUserIds.includes(user.id) ? "border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                        id={`user-${user.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor={`user-${user.id}`} className="font-medium truncate cursor-pointer">
                            {user.nickname}
                          </label>
                          <div
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.status === "added"
                                ? "bg-green-100 text-green-800"
                                : user.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status === "added" ? "已添加" : user.status === "pending" ? "待处理" : "已失败"}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">微信号: {user.wechatId}</div>
                        <div className="text-sm text-gray-500">来源: {user.source}</div>

                        {/* 标签展示 */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.tags.map((tag) => (
                            <span key={tag.id} className={`text-xs px-2 py-0.5 rounded-full ${tag.color}`}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm">
            已选择 <span className="font-medium text-primary">{selectedUserIds.length}</span> 个用户
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleConfirm}>确认</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

