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
  status: number
  addTime: string
  source: string
  assignedTo: string
  category: "potential" | "customer" | "lost"
  tags: UserTag[]
}

interface StatusType {
  id: number
  name: string
  code: string
}

interface SourceType {
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
}

interface Statistics {
  totalCount: number
  todayAddCount: number
}

export default function TrafficPoolPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<TrafficUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("potential")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [statusTypes, setStatusTypes] = useState<StatusType[]>([])
  const [sourceTypes, setSourceTypes] = useState<SourceType[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [stats, setStats] = useState<Statistics>({
    totalCount: 0,
    todayAddCount: 0
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
        limit: "30"
      })

      // 只有在有搜索关键词时才添加 keyword 参数
      if (debouncedSearchQuery) {
        params.append("keyword", debouncedSearchQuery)
      }

      // 只有在选择了特定来源时才添加 fromd 参数
      if (sourceFilter !== "all") {
        const selectedSource = sourceTypes.find(source => source.id.toString() === sourceFilter)
        if (selectedSource) {
          params.append("fromd", selectedSource.name)
        }
      }

      // 只有在选择了特定状态时才添加 status 参数
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await api.get<ApiResponse<TrafficPoolResponse>>(`/v1/traffic/pool?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      } as any)

      if (response.code === 200) {
        const { list, pagination } = response.data
        
        const transformedUsers = list.map(user => ({
          id: user.id.toString(),
          avatar: user.avatar,
          nickname: user.name || user.nickname || '未知用户',
          wechatId: user.wechatId,
          phone: user.phone,
          region: user.region,
          note: user.note,
          status: user.status,
          addTime: formatDateTime(user.createTime),
          source: user.fromd || '未知来源',
          assignedTo: user.assignedTo,
          category: user.category || "potential",
          tags: user.tags || []
        }))

        setUsers(prev => isNewSearch ? transformedUsers : [...prev, ...transformedUsers])
        setCurrentPage(page)
        setHasMore(list.length > 0 && page < pagination.totalPages)
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
  }, [debouncedSearchQuery, sourceFilter, statusFilter, sourceTypes])

  const fetchStatusTypes = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<StatusType[]>>('/v1/traffic/pool/types', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      } as any)
      
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

  const fetchSourceTypes = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<SourceType[]>>('/v1/traffic/pool/sources', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      } as any)
      
      if (response.code === 200) {
        setSourceTypes(response.data)
      } else {
        toast({
          title: "获取来源列表失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("获取来源列表失败:", error)
      toast({
        title: "获取来源列表失败",
        description: "请检查网络连接或稍后重试",
        variant: "destructive",
      })
    }
  }, [])

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<Statistics>>('/v1/traffic/pool/statistics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      } as any)
      
      if (response.code === 200) {
        setStats(response.data)
      } else {
        toast({
          title: "获取统计数据失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("获取统计数据失败:", error)
      toast({
        title: "获取统计数据失败",
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

  // 初始化 IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          fetchUsers(currentPage + 1)
        }
      },
      { threshold: 0.5 }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current)
      }
    }
  }, [hasMore, isFetching, currentPage, fetchUsers])

  // 初始化数据
  useEffect(() => {
    fetchStatusTypes()
    fetchSourceTypes()
    fetchStatistics()
    fetchUsers(1, true)
  }, [])

  // 监听筛选条件变化
  useEffect(() => {
    setUsers([])
    setCurrentPage(1)
    setHasMore(true)
    fetchUsers(1, true)
  }, [activeCategory, sourceFilter, statusFilter, debouncedSearchQuery])

  const handleUserClick = (user: TrafficUser) => {
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  // 添加状态码转换函数
  const getStatusFromCode = (statusCode: number): number => {
    return statusCode;
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
              <div className="text-2xl font-bold text-blue-600">{stats.totalCount}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">今日新增</div>
              <div className="text-2xl font-bold text-green-600">{stats.todayAddCount}</div>
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
                {sourceTypes.map((source) => (
                  <SelectItem key={source.id} value={source.id.toString()}>
                    {source.name}
                  </SelectItem>
                ))}
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
                              user.status === 2
                                ? "bg-green-100 text-green-800"
                                : user.status === 1
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status === 2 ? "已添加" : user.status === 1 ? "待处理" : "已失败"}
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
                
                {/* 加载状态显示 */}
                <div ref={loadingRef} className="flex justify-center py-4">
                  {isFetching && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">加载中...</span>
                    </div>
                  )}
                  {!hasMore && users.length > 0 && (
                    <span className="text-gray-500">已加载全部数据</span>
                  )}
                  {!isFetching && users.length === 0 && (
                    <span className="text-gray-500">暂无数据</span>
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
                      selectedUser.status === 2
                        ? "bg-green-100 text-green-800"
                        : selectedUser.status === 1
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedUser.status === 2 ? "已添加" : selectedUser.status === 1 ? "待处理" : "已失败"}
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

