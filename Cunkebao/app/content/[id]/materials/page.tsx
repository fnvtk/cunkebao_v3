"use client"

import { useState, useEffect, useCallback, use } from "react"
import { ChevronLeft, Download, Plus, Search, Tag, Trash2, BarChart, RefreshCw, Image as ImageIcon, Edit } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

interface MaterialListResponse {
  list: Material[]
  total: number
}

interface Material {
  id: number
  type: string
  title: string
  content: string
  coverImage: string | null
  resUrls: string[]
  urls: string[]
  createTime: string
  createMomentTime: number
  time: string
  wechatId: string
  friendId: string | null
  wechatChatroomId: number
  senderNickname: string
  senderAvatar: string  // 发布朋友圈用户的头像
  location: string | null
  lat: string
  lng: string
}

const isImageUrl = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('oss-cn-shenzhen.aliyuncs.com')
}

export default function MaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [materials, setMaterials] = useState<Material[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null)

  const fetchMaterials = useCallback(async () => {
      setIsLoading(true)
      try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        libraryId: resolvedParams.id,
        ...(searchQuery ? { keyword: searchQuery } : {})
      })
      const response = await api.get<ApiResponse<MaterialListResponse>>(`/v1/content/library/item-list?${queryParams.toString()}`)
      
      if (response.code === 200 && response.data) {
        setMaterials(response.data.list)
        setTotal(response.data.total)
      } else {
        showToast(response.msg || "获取素材数据失败", "error")
      }
    } catch (error: any) {
        console.error("Failed to fetch materials:", error)
      showToast(error?.message || "请检查网络连接", "error")
      } finally {
        setIsLoading(false)
      }
  }, [page, searchQuery, resolvedParams.id])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  const handleDownload = () => {
    showToast("正在将素材导出为Excel格式", "loading")
  }

  const handleNewMaterial = () => {
    router.push(`/content/${resolvedParams.id}/materials/new`)
  }

  const handleAIAnalysis = async (material: Material) => {
    try {
      // 模拟AI分析过程
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const analysis = "这是一条" + material.title + "相关的内容，情感倾向积极。"
      setSelectedMaterial(material)
      showToast("AI分析完成", "success")
    } catch (error) {
      console.error("AI analysis failed:", error)
      showToast("AI分析失败", "error")
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchMaterials()
  }

  const handleRefresh = () => {
    fetchMaterials()
  }

  const handleDelete = async (id: number) => {
    const loadingToast = showToast("正在删除...", "loading", true)
    try {
      const response = await api.delete<ApiResponse>(`/v1/content/library/delete-item?id=${id}`)
      if (response.code === 200) {
        showToast("删除成功", "success")
        fetchMaterials()
      } else {
        showToast(response.msg || "删除失败", "error")
      }
    } catch (error: any) {
      showToast(error?.message || "删除失败", "error")
    } finally {
      loadingToast.remove && loadingToast.remove()
      setDeleteDialogOpen(null)
    }
  }

  // 新增：根据类型渲染内容
  const renderMaterialByType = (material: any) => {
    const type = Number(material.contentType || material.type);
    // 链接类型
    if (type === 2 && material.urls && material.urls.length > 0) {
      const first = material.urls[0];
      return (
        <a
          href={first.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-white rounded p-2 hover:bg-gray-50 transition group"
          style={{ textDecoration: 'none' }}
        >
          {first.image && (
            <div className="flex-shrink-0 w-14 h-14 rounded overflow-hidden mr-3 bg-gray-100">
              <Image
                src={first.image}
                alt="封面图"
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-base font-medium truncate group-hover:text-blue-600">{first.desc}</div>
          </div>
        </a>
      );
    }
    // 视频类型
    if (type === 3 && material.urls && material.urls.length > 0) {
      const first = material.urls[0];
      const videoUrl = typeof first === "string" ? first : (first.url || "");
      return videoUrl ? (
        <div className="mb-3">
          <video src={videoUrl} controls className="rounded w-full max-w-md" />
        </div>
      ) : null;
    }
    // 文本类型
    if (type === 4 || type === 6) {
      return (
        <div className="mb-3">
          <p className="text-gray-700 whitespace-pre-line">{material.content}</p>
        </div>
      );
    }
    // 小程序类型
    if (type === 5 && material.urls && material.urls.length > 0) {
      const first = material.urls[0];
      return (
        <div className="mb-3">
          <div>小程序名称：{first.appTitle}</div>
          <div>AppID：{first.appId}</div>
          {first.image && (
            <div className="mb-2">
              <Image src={first.image} alt="小程序封面图" width={80} height={80} className="rounded" />
            </div>
          )}
        </div>
      );
    }
    // 图片类型
    if (type === 1) {
      return (
        <div className="mb-3">
          {/* 内容字段（如有） */}
          {material.content && (
            <div className="mb-2 text-base font-medium text-gray-800 whitespace-pre-line">
              {material.content}
            </div>
          )}
          {/* 图片资源 */}
          {renderImageResources(material)}
        </div>
      );
    }
    // 其它类型
    return null;
  }

  // 处理图片资源
  const renderImageResources = (material: Material) => {
    const imageUrls = material.resUrls.filter(isImageUrl)
    // 如果内容本身是图片，也添加到图片数组中
    if (isImageUrl(material.content) && !imageUrls.includes(material.content)) {
      imageUrls.unshift(material.content)
    }
    
    if (imageUrls.length === 0) return null
    
    // 微信朋友圈风格的图片布局
    if (imageUrls.length === 1) {
      // 单张图片：大图显示
      return (
        <div className="relative rounded-md overflow-hidden">
          <Image
            src={imageUrls[0]}
            alt="图片内容"
            width={600}
            height={400}
            className="object-cover w-full h-auto"
          />
        </div>
      )
    } else if (imageUrls.length === 2) {
      // 两张图片：横向排列
      return (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-md overflow-hidden">
              <Image
                src={url}
                alt={`图片 ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )
    } else if (imageUrls.length === 3) {
      // 三张图片：使用3x3网格的前三个格子
      return (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-md overflow-hidden">
              <Image
                src={url}
                alt={`图片 ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )
    } else if (imageUrls.length === 4) {
      // 四张图片：2x2网格
      return (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-md overflow-hidden">
              <Image
                src={url}
                alt={`图片 ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )
    } else {
      // 五张及以上：3x3网格
      const displayImages = imageUrls.slice(0, 9)
      const hasMore = imageUrls.length > 9
      
      return (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {displayImages.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-md overflow-hidden">
              <Image
                src={url}
                alt={`图片 ${idx + 1}`}
                fill
                className="object-cover"
              />
              {idx === 8 && hasMore && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">+{imageUrls.length - 9}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }
  }

  const handleSubmit = async () => {
    fetchMaterials()
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">已采集素材</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleNewMaterial}>
              <Plus className="h-4 w-4 mr-2" />
              新建素材
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Card className="p-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索素材..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </Card>

        {isLoading ? (
          // 加载状态
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="my-3 h-0.5 bg-gray-100"></div>
            <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="flex space-x-2 mt-3">
                    <div className="h-20 w-20 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-20 w-20 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // 素材列表
          <div className="space-y-4">
            {materials.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                暂无素材数据
              </Card>
            ) : (
              materials.map(material => (
                <Card key={material.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <Image 
                          src={material.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${material.senderNickname}`} 
                          alt={material.senderNickname}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </Avatar>
                      <div>
                        <div className="font-medium">{material.senderNickname}</div>
                        <div className="text-sm text-gray-500">
                          {material.time && format(new Date(material.time), 'yyyy-MM-dd HH:mm')}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50">
                      ID: {material.id}
                    </Badge>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  {/* 类型分发内容渲染 */}
                  {renderMaterialByType(material)}
                  
                  {/* 非图片资源标签 */}
                  {material.resUrls.length > 0 && !material.resUrls.some(isImageUrl) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {material.resUrls.map((url, index) => (
                        <Badge key={index} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          资源 {index + 1}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="px-3 h-8 text-xs"
                        onClick={() => router.push(`/content/${resolvedParams.id}/materials/edit/${material.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="px-3 h-8 text-xs">
                          <BarChart className="h-4 w-4 mr-1" />
                          AI分析
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>AI 分析结果</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <p>正在分析中...</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Dialog open={deleteDialogOpen === material.id} onOpenChange={(open) => setDeleteDialogOpen(open ? material.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="px-3 h-8 text-xs">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>确认删除</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 mb-4 text-sm text-gray-700">确定要删除该素材吗？此操作不可恢复。</div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(null)}>取消</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(material.id)}>确认删除</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))
            )}
                </div>
        )}
        
        {!isLoading && total > limit && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className="mx-1"
            >
              上一页
            </Button>
            <span className="mx-4 py-2 text-sm text-gray-500">
              第 {page} 页，共 {Math.ceil(total / limit)} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(prev => prev + 1)}
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

