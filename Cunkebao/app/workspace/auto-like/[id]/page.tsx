"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Search, Filter, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { cn } from "@/lib/utils"

// 模拟数据接口
interface LikeRecord {
  id: number
  user: {
    avatar: string
    nickname: string
  }
  likedBy: {
    avatar: string
    nickname: string
  }
  likeTime: string
  content: {
    type: 'text' | 'image' | 'text-image'
    text?: string
    images?: string[]
  }
}

// 模拟数据
const mockLikeRecords: LikeRecord[] = [
  {
    id: 1,
    user: {
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      nickname: "小红花"
    },
    likedBy: {
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      nickname: "蓝色海洋"
    },
    likeTime: "2023-12-15T10:30:00",
    content: {
      type: "text",
      text: "今天天气真好，阳光明媚！想出去走走看看这个美丽的世界。"
    }
  },
  {
    id: 2,
    user: {
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
      nickname: "绿野仙踪"
    },
    likedBy: {
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      nickname: "快乐精灵"
    },
    likeTime: "2023-12-14T15:45:00",
    content: {
      type: "image",
      images: ["https://picsum.photos/id/237/300/200", "https://picsum.photos/id/238/300/200"]
    }
  },
  {
    id: 3,
    user: {
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
      nickname: "紫色梦想"
    },
    likedBy: {
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
      nickname: "阳光男孩"
    },
    likeTime: "2023-12-13T09:15:00",
    content: {
      type: "text-image",
      text: "分享一下我的旅行照片，希望大家喜欢！",
      images: ["https://picsum.photos/id/239/300/200"]
    }
  },
  {
    id: 4,
    user: {
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
      nickname: "月光星辰"
    },
    likedBy: {
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Henry",
      nickname: "风之子"
    },
    likeTime: "2023-12-12T18:20:00",
    content: {
      type: "text",
      text: "学习编程真的很有趣，每天都有新发现。希望能和大家一起进步！"
    }
  },
  {
    id: 5,
    user: {
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ivy",
      nickname: "彩虹糖果"
    },
    likedBy: {
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
      nickname: "幸运草"
    },
    likeTime: "2023-12-11T11:05:00",
    content: {
      type: "text-image",
      text: "今天做了一道新菜，味道超级赞！分享食谱：先准备好所有食材...",
      images: ["https://picsum.photos/id/240/300/200", "https://picsum.photos/id/241/300/200"]
    }
  }
];

export default function LikeRecordsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [records, setRecords] = useState<LikeRecord[]>(mockLikeRecords)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(mockLikeRecords.length)
  const pageSize = 10

  // 模拟加载数据
  const fetchRecords = async (page: number, searchTerm?: string) => {
    setLoading(true)
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 实际项目中这里应该调用真实API
    let filteredRecords = [...mockLikeRecords]
    if (searchTerm) {
      filteredRecords = mockLikeRecords.filter(record => 
        record.user.nickname.includes(searchTerm) || 
        record.likedBy.nickname.includes(searchTerm) ||
        (record.content.text && record.content.text.includes(searchTerm))
      )
    }
    
    setRecords(filteredRecords)
    setTotal(filteredRecords.length)
    setLoading(false)
  }

  useEffect(() => {
    fetchRecords(currentPage, searchTerm)
  }, [currentPage])

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
                placeholder="搜索用户昵称或内容" 
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
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <Image 
                          src={record.user.avatar} 
                          alt={record.user.nickname}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </Avatar>
                      <div>
                        <div className="font-medium">{record.user.nickname}</div>
                        <div className="text-sm text-gray-500">内容发布者</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50">
                      {format(new Date(record.likeTime), 'yyyy-MM-dd HH:mm')}
                    </Badge>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="mb-3">
                    {record.content.text && (
                      <p className="text-gray-700 mb-3 whitespace-pre-line">
                        {record.content.text}
                      </p>
                    )}
                    
                    {record.content.images && record.content.images.length > 0 && (
                      <div className={cn(
                        "grid gap-2", 
                        record.content.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                      )}>
                        {record.content.images.map((image, idx) => (
                          <div key={idx} className="relative rounded-md overflow-hidden">
                            <Image
                              src={image}
                              alt={`内容图片 ${idx + 1}`}
                              width={300}
                              height={200}
                              className="object-cover w-full h-auto"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-4 p-2 bg-gray-50 rounded-md">
                    <Avatar className="h-8 w-8 mr-2">
                      <Image 
                        src={record.likedBy.avatar} 
                        alt={record.likedBy.nickname}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </Avatar>
                    <div className="text-sm">
                      <span className="font-medium">{record.likedBy.nickname}</span>
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