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
import { api } from "@/lib/api"

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

interface StatusType {
  id: number
  name: string
}

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 修改流量池数据类型定义
interface TrafficPoolUser {
  id: string
  avatar: string
  nickname: string
  name: string
  wechatId: string
  phone: string
  region: string
  note: string
  status: number
  createTime: string
  fromd: string
  assignedTo: string
  category: "potential" | "customer" | "lost"
  tags: UserTag[]
}

interface TrafficPoolResponse {
  list: TrafficPoolUser[]
  pagination: {
    total: number
    current: number
    pageSize: number
    totalPages: number
  }
  statistics: {
    total: number
    todayNew: number
  }
}

export default function TrafficPoolPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<TrafficUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("potential")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [statusTypes, setStatusTypes] = useState<StatusType[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    todayNew: 0,
  })
  const [selectedUser, setSelectedUser] = useState<TrafficUser | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)

  const { toast } = useToast()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // 添加格式化时间的函数
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-');
    } catch (error) {
      return dateString;
    }
  };

  const fetchUsers = useCallback(async (page: number = 1, isNewSearch: boolean = false) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setIsFetching(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "30", // 设置每页显示30条
        search: debouncedSearchQuery,
        category: activeCategory,
        source: sourceFilter !== "all" ? sourceFilter : "",
        status: statusFilter === "all" ? "" : statusFilter,
      })

      // 检查是否有来源参数
      const sourceParam = searchParams?.get("source")
      if (sourceParam) {
        params.append("wechatSource", sourceParam)
      }

      const response = await api.get<ApiResponse<TrafficPoolResponse>>(`/v1/traffic/pool?${params.toString()}`)

      if (response.code === 200) {
        const { list, pagination, statistics } = response.data
        
        // 转换数据格式
        const transformedUsers = list.map(user => ({
          ...user,
          id: user.id.toString(),
          status: getStatusFromCode(user.status),
          tags: user.tags || [],
          category: user.category || "potential",
          addTime: formatDateTime(user.createTime),
          source: user.fromd || '未知来源',
          nickname: user.name || user.nickname || '未知用户'
        }))

        // 更新用户列表
        setUsers(prev => isNewSearch ? transformedUsers : [...prev, ...transformedUsers])
        setCurrentPage(page)
        setHasMore(list.length > 0 && page < pagination.totalPages)
        setStats({
          total: statistics.total,
          todayNew: statistics.todayNew
        })
      } else {
        toast({
          title: "获取数据失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return
      }

      toast({
        title: "获取数据失败",
        description: "请检查网络连接或稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsFetching(false)
      setLoading(false)
    }
  }, [debouncedSearchQuery, activeCategory, sourceFilter, statusFilter, searchParams])

  const fetchStatusTypes = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<StatusType[]>>('/v1/traffic/pool/types')
      
      if (response.code === 200) {
        setStatusTypes(response.data)
      } else {
        toast({
          title: "获取状态列表失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("获取状态列表失败:", error)
      toast({
        title: "获取状态列表失败",
        description: "请检查网络连接或稍后重试",
        variant: "destructive",
      })
    }
  }, [])

  // 处理搜索
  const handleSearch = useCallback(() => {
    setUsers([])
    setCurrentPage(1)
    setHasMore(true)
    fetchUsers(1, true)
  }, [fetchUsers])

  // 设置 IntersectionObserver
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          fetchUsers(currentPage + 1)
        }
      },
      { threshold: 0.5 }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [fetchUsers, currentPage, hasMore, isFetching])

  // 观察加载指示器
  useEffect(() => {
    if (loadingRef.current && observerRef.current) {
      observerRef.current.observe(loadingRef.current)
    }

    return () => {
      if (loadingRef.current && observerRef.current) {
        observerRef.current.unobserve(loadingRef.current)
      }
    }
  }, [loadingRef.current, observerRef.current])

  // 初始加载
  useEffect(() => {
    fetchUsers(1, true)
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

  // 添加状态码转换函数
  const getStatusFromCode = (statusCode: number): "pending" | "added" | "failed" => {
    const statusMap: Record<number, "pending" | "added" | "failed"> = {
      1: "pending", // 待处理
      2: "pending", // 处理中
      3: "added",   // 已添加
      4: "failed",  // 已拒绝
      5: "failed",  // 已过期
      6: "failed",  // 已取消
    }
    return statusMap[statusCode] || "pending"
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
                {statusTypes.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 用户列表 */}
          <div className="space-y-2">
            {loading && users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <div className="text-gray-500">加载中...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-500">暂无数据</div>
                <Button variant="outline" className="mt-4" onClick={() => fetchUsers(1, true)}>
                  刷新
                </Button>
              </div>
            ) : (
              <>
                {users.map((user) => (
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
                        <div className="text-sm text-gray-500">添加时间: {user.addTime}</div>

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
                ))}
                
                {/* 加载更多指示器 */}
                {hasMore && (
                  <div ref={loadingRef} className="py-4 flex justify-center">
                    {isFetching && <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />}
                  </div>
                )}

                {/* 显示加载状态和总数 */}
                <div className="text-sm text-gray-500 text-center">
                  {stats.total > 0 && (
                    <span>
                      已加载 {users.length} / {stats.total} 条记录
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
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
                  <div className="font-medium">{selectedUser.addTime}</div>
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

