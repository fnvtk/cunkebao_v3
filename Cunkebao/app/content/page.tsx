"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, Filter, Search, RefreshCw, Plus, Edit, Trash2, Eye, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

interface LibraryListResponse {
  list: ContentLibrary[]
  total: number
}

interface ContentLibrary {
  id: string
  name: string
  source: "friends" | "groups"
  targetAudience: {
    id: string
    nickname: string
    avatar: string
  }[]
  creator: string
  creatorName?: string
  itemCount: number
  lastUpdated: string
  enabled: boolean
  // 新增字段
  sourceFriends: string[]
  sourceGroups: string[]
  keywordInclude: string[]
  keywordExclude: string[]
  isEnabled: number
  aiPrompt: string
  timeEnabled: number
  timeStart: string
  timeEnd: string
  status: number
  createTime: string
  updateTime: string
  sourceType: number
}

export default function ContentLibraryPage() {
  const router = useRouter()
  const [libraries, setLibraries] = useState<ContentLibrary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(false)

  // 获取内容库列表
  const fetchLibraries = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(searchQuery ? { keyword: searchQuery } : {}),
        ...(activeTab !== 'all' ? { sourceType: activeTab === 'friends' ? '1' : '2' } : {})
      })
      const response = await api.get<ApiResponse<LibraryListResponse>>(`/v1/content/library/list?${queryParams.toString()}`)

      if (response.code === 200 && response.data) {
        // 转换数据格式以匹配原有UI
        const transformedLibraries = response.data.list.map((item: any) => {
          const transformedItem: ContentLibrary = {
            id: item.id,
            name: item.name,
            source: item.sourceType === 1 ? "friends" : "groups",
            targetAudience: [
              ...(item.sourceFriends || []).map((id: string) => ({ id, nickname: `好友${id}`, avatar: "/placeholder.svg" })),
              ...(item.sourceGroups || []).map((id: string) => ({ id, nickname: `群组${id}`, avatar: "/placeholder.svg" }))
            ],
            creator: item.creatorName || "系统",
            creatorName: item.creatorName,
            itemCount: 0,
            lastUpdated: item.updateTime,
            enabled: item.isEnabled === 1,
            // 新增字段
            sourceFriends: item.sourceFriends || [],
            sourceGroups: item.sourceGroups || [],
            keywordInclude: item.keywordInclude || [],
            keywordExclude: item.keywordExclude || [],
            isEnabled: item.isEnabled,
            aiPrompt: item.aiPrompt || '',
            timeEnabled: item.timeEnabled,
            timeStart: item.timeStart || '',
            timeEnd: item.timeEnd || '',
            status: item.status,
            createTime: item.createTime,
            updateTime: item.updateTime,
            sourceType: item.sourceType
          }
          return transformedItem
        })
        setLibraries(transformedLibraries)
      } else {
        showToast(response.msg || "获取内容库列表失败", "error")
      }
    } catch (error: any) {
      console.error("获取内容库列表失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, activeTab])

  // 首次加载和搜索条件变化时获取列表
  useEffect(() => {
    fetchLibraries()
  }, [searchQuery, activeTab, fetchLibraries])

  const handleCreateNew = () => {
    router.push('/content/new')
  }

  const handleEdit = (id: string) => {
    router.push(`/content/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete<ApiResponse>(`/v1/content/library/delete?id=${id}`)
      if (response.code === 200) {
        showToast("删除成功", "success")
        fetchLibraries()
      } else {
        showToast(response.msg || "删除失败", "error")
      }
    } catch (error: any) {
      console.error("删除内容库失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    }
  }

  const handleViewMaterials = (id: string) => {
    router.push(`/content/${id}/materials`)
  }

  const handleSearch = () => {
    fetchLibraries()
  }

  const handleRefresh = () => {
    fetchLibraries()
  }

  const filteredLibraries = libraries.filter(
    (library) =>
      library.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      library.targetAudience.some((target) => target.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">内容库</h1>
          </div>
          <Button onClick={() => router.push('/content/new')}>
            <Plus className="h-4 w-4 mr-2" />
            新建
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索内容库..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="friends">微信好友</TabsTrigger>
                <TabsTrigger value="groups">聊天群</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredLibraries.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">暂无数据</p>
                    <Button onClick={() => router.push('/content/new')} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      新建内容库
                    </Button>
                  </div>
                </div>
              ) : (
                filteredLibraries.map((library) => (
                  <Card key={library.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-base">{library.name}</h3>
                          <Badge variant={library.isEnabled === 1 ? "default" : "secondary"} className="text-xs">
                            已启用
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center space-x-1">
                            <span>来源：</span>
                            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                          </div>
                          <div>创建人：{library.creator}</div>
                          <div>内容数量：{library.itemCount}</div>
                          <div>更新时间：{new Date(library.updateTime).toLocaleString('zh-CN', { 
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(library.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(library.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewMaterials(library.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            查看素材
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

