"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Filter, Search, RefreshCw, Tag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useToast } from "@/components/ui/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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

export default function TrafficPoolPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<TrafficUser[]>([])
  const [loading, setLoading] = useState(true) // Start with loading state
  const [activeCategory, setActiveCategory] = useState("potential") // Changed default from "all" to "potential"
  const [sourceFilter, setSourceFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    todayNew: 0,
  })
  const [selectedUser, setSelectedUser] = useState<TrafficUser | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)

  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const fetchUsers = useCallback(async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: "10",
        search: debouncedSearchQuery,
        category: activeCategory,
        source: sourceFilter,
        status: statusFilter,
      })

      // 检查是否有来源参数
      const sourceParam = searchParams?.get("source")
      if (sourceParam) {
        params.append("wechatSource", sourceParam)
      }

      const response = await fetch(`/api/users?${params}`, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) throw new Error("请求失败")

      const data = await response.json()

      // 为每个用户添加标签
      const usersWithTags = data.users.map((user: TrafficUser) => {
        // 生成随机标签
        const tagPool = [
          { name: "潜在客户", color: "bg-blue-100 text-blue-800" },
          { name: "高意向", color: "bg-green-100 text-green-800" },
          { name: "已成交", color: "bg-purple-100 text-purple-800" },
          { name: "需跟进", color: "bg-yellow-100 text-yellow-800" },
          { name: "活跃用户", color: "bg-indigo-100 text-indigo-800" },
          { name: "沉默用户", color: "bg-gray-100 text-gray-800" },
          { name: "企业客户", color: "bg-red-100 text-red-800" },
          { name: "个人用户", color: "bg-pink-100 text-pink-800" },
          { name: "新增好友", color: "bg-emerald-100 text-emerald-800" },
          { name: "老客户", color: "bg-amber-100 text-amber-800" },
        ]

        const tags = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => {
          const randomTag = tagPool[Math.floor(Math.random() * tagPool.length)]
          return {
            id: `tag-${Math.random().toString(36).substring(2, 9)}`,
            name: randomTag.name,
            color: randomTag.color,
          }
        })

        return {
          ...user,
          tags,
        }
      })

      setUsers(usersWithTags)
      setTotalPages(data.pagination.totalPages)
      setStats(data.stats)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return
      }

      toast({
        title: "错误",
        description: "获取数据失败，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearchQuery, activeCategory, sourceFilter, statusFilter, toast, searchParams])

  useEffect(() => {
    fetchUsers()
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchUsers])

  const handleUserClick = (user: TrafficUser) => {
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  return (
    <div className="flex-1 bg-white min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">流量池</h1>
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchUsers()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* 搜索和筛选区域 */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索用户"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-500">流量池总数</div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">今日新增</div>
              <div className="text-2xl font-bold text-green-600">{stats.todayNew}</div>
            </Card>
          </div>

          {/* 分类标签页 */}
          <Tabs
            defaultValue="potential"
            value={activeCategory}
            onValueChange={(value) => {
              setActiveCategory(value)
              setCurrentPage(1)
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="potential">潜在客户</TabsTrigger>
              <TabsTrigger value="customer">已转化</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 筛选器 */}
          <div className="flex space-x-2">
            <Select
              value={sourceFilter}
              onValueChange={(value) => {
                setSourceFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                <SelectItem value="抖音直播">抖音直播</SelectItem>
                <SelectItem value="小红书">小红书</SelectItem>
                <SelectItem value="微信朋友圈">朋友圈</SelectItem>
                <SelectItem value="视频号">视频号</SelectItem>
                <SelectItem value="公众号">公众号</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="added">已添加</SelectItem>
                <SelectItem value="failed">已失败</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 用户列表 */}
          <div className="space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <div className="text-gray-500">加载中...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-500">暂无数据</div>
                <Button variant="outline" className="mt-4" onClick={fetchUsers}>
                  刷新
                </Button>
              </div>
            ) : (
              users.map((user) => (
                <Card
                  key={user.id}
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-center space-x-3">
                    <img src={user.avatar || "/placeholder.svg"} alt="" className="w-10 h-10 rounded-full bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">{user.nickname}</div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
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
                      <div className="text-sm text-gray-500">添加时间: {new Date(user.addTime).toLocaleString()}</div>

                      {/* 标签展示 */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.tags.slice(0, 2).map((tag) => (
                          <span key={tag.id} className={`text-xs px-2 py-0.5 rounded-full ${tag.color}`}>
                            {tag.name}
                          </span>
                        ))}
                        {user.tags.length > 2 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                            +{user.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* 分页 */}
          {!loading && users.length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(page)
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      {/* 用户详情弹窗 */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>{selectedUser.nickname[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xl font-medium">{selectedUser.nickname}</div>
                  <div className="text-sm text-gray-500">{selectedUser.wechatId}</div>
                  <Badge
                    className={`mt-1 ${
                      selectedUser.status === "added"
                        ? "bg-green-100 text-green-800"
                        : selectedUser.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedUser.status === "added"
                      ? "已添加"
                      : selectedUser.status === "pending"
                        ? "待处理"
                        : "已失败"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">手机号码</div>
                  <div className="font-medium">{selectedUser.phone}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">地区</div>
                  <div className="font-medium">{selectedUser.region}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">来源</div>
                  <div className="font-medium">{selectedUser.source}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">添加时间</div>
                  <div className="font-medium">{new Date(selectedUser.addTime).toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-500 flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  标签
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.tags.map((tag) => (
                    <span key={tag.id} className={`text-sm px-2 py-1 rounded-full ${tag.color}`}>
                      {tag.name}
                    </span>
                  ))}
                  {selectedUser.tags.length === 0 && <span className="text-sm text-gray-500">暂无标签</span>}
                </div>
              </div>

              {selectedUser.note && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">备注信息</div>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">{selectedUser.note}</div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUserDetail(false)}>
                  关闭
                </Button>
                <Button>编辑标签</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

