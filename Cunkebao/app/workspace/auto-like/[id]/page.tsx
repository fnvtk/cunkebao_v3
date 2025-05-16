"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Search, Filter, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { useRouter, useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

// API响应数据接口
interface LikeRecord {
  id: number
  workbenchId: number
  momentsId: number
  snsId: string
  wechatAccountId: number
  wechatFriendId: number
  likeTime: string
  content: string
  resUrls: string[]
  momentTime: string
  userName: string
  operatorName: string
  operatorAvatar: string
  friendName: string
  friendAvatar: string
}

interface LikeRecordsResponse {
  code: number
  msg: string
  data: {
    list: LikeRecord[]
    total: number
  }
}

export default function LikeRecordsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const workbenchId = params?.id || ""
  
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [records, setRecords] = useState<LikeRecord[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // 加载点赞记录数据
  const fetchRecords = async (page: number, searchTerm?: string) => {
    if (!workbenchId) {
      showToast("任务ID无效", "error")
      return
    }
    
    const loadingToast = showToast("正在加载点赞记录...", "loading", true);
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        workbenchId: workbenchId,
        page: page.toString(),
        limit: pageSize.toString()
      })
      
      if (searchTerm) {
        queryParams.append('keyword', searchTerm)
      }
      
      const response = await api.get<LikeRecordsResponse>(`/v1/workbench/like-records?${queryParams.toString()}`)
      
      if (response.code === 200) {
        setRecords(response.data.list)
        setTotal(response.data.total)
      } else {
        showToast(response.msg || "获取点赞记录失败", "error")
      }
    } catch (error: any) {
      console.error("获取点赞记录失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
      loadingToast.remove();
      setLoading(false)
    }
  }

  useEffect(() => {
    if (workbenchId) {
      fetchRecords(currentPage, searchTerm)
    }
  }, [currentPage, workbenchId])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchRecords(1, searchTerm)
  }

  const handleRefresh = () => {
    fetchRecords(currentPage, searchTerm)
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">点赞记录</h1>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Card className="p-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="搜索好友昵称或内容" 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </Card>

        {loading ? (
          // 加载状态
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex space-x-2 mt-3">
                    <Skeleton className="h-20 w-20" />
                    <Skeleton className="h-20 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // 记录列表
          <div className="space-y-4">
            {records.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                暂无点赞记录
              </Card>
            ) : (
              records.map(record => (
                <Card key={record.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 max-w-[65%]">
                      <Avatar>
                        <Image 
                          src={record.friendAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} 
                          alt={record.friendName}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate" title={record.friendName}>{record.friendName}</div>
                        <div className="text-sm text-gray-500">内容发布者</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 whitespace-nowrap shrink-0">
                      {format(new Date(record.momentTime || record.likeTime), 'yyyy-MM-dd HH:mm')}
                    </Badge>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="mb-3">
                    {record.content && (
                      <p className="text-gray-700 mb-3 whitespace-pre-line">
                        {record.content}
                      </p>
                    )}
                    
                    {record.resUrls && record.resUrls.length > 0 && (
                      <div className={cn(
                        "grid gap-2", 
                        record.resUrls.length === 1 ? "grid-cols-1" : 
                        record.resUrls.length === 2 ? "grid-cols-2" :
                        record.resUrls.length <= 3 ? "grid-cols-3" :
                        record.resUrls.length <= 6 ? "grid-cols-3 grid-rows-2" :
                        "grid-cols-3 grid-rows-3"
                      )}>
                        {record.resUrls.slice(0, 9).map((image, idx) => (
                          <div key={idx} className="relative aspect-square rounded-md overflow-hidden">
                            <Image
                              src={image}
                              alt={`内容图片 ${idx + 1}`}
                              width={300}
                              height={300}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-4 p-2 bg-gray-50 rounded-md">
                    <Avatar className="h-8 w-8 mr-2 shrink-0">
                      <Image 
                        src={record.operatorAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=operator"} 
                        alt={record.operatorName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </Avatar>
                    <div className="text-sm min-w-0">
                      <span className="font-medium truncate inline-block max-w-full" title={record.operatorName}>{record.operatorName}</span>
                      <span className="text-gray-500 ml-2">点赞了这条内容</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
        
        {!loading && total > pageSize && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="mx-1"
            >
              上一页
            </Button>
            <span className="mx-4 py-2 text-sm text-gray-500">
              第 {currentPage} 页，共 {Math.ceil(total / pageSize)} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= Math.ceil(total / pageSize)}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="mx-1"
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 