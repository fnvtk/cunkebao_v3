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
import Image from "next/image"

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
  location: string | null
  lat: string
  lng: string
}

const isImageUrl = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('oss-cn-shenzhen.aliyuncs.com')
}

const ContentDisplay = ({ content, resUrls }: { content: string, resUrls: string[] }) => {
  if (isImageUrl(content)) {
    return (
      <div className="relative w-full h-48 mb-2">
        <Image
          src={content}
          alt="素材图片"
          fill
          className="object-contain rounded-lg"
        />
      </div>
    )
  }

  if (resUrls.length > 0 && resUrls.some(isImageUrl)) {
    return (
      <div className="grid grid-cols-2 gap-2 mb-2">
        {resUrls.filter(isImageUrl).map((url, index) => (
          <div key={index} className="relative w-full h-32">
            <Image
              src={url}
              alt={`素材图片 ${index + 1}`}
              fill
              className="object-contain rounded-lg"
            />
          </div>
        ))}
      </div>
    )
  }

  return <div className="text-sm text-gray-600 mb-2" style={{ whiteSpace: 'pre-line' }}>{content}</div>
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

  const filteredMaterials = materials

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">已采集素材</h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* 已隐藏下载Excel按钮
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              下载Excel
            </Button>
            */}
            <Button onClick={handleNewMaterial}>
              <Plus className="h-4 w-4 mr-2" />
              新建素材
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索素材..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
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

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">暂无数据</p>
                    <Button onClick={handleNewMaterial} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      新建素材
                    </Button>
                  </div>
                </div>
              ) : (
                filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 mb-4 border border-gray-100"
                  >
                    {/* 图片/内容区 */}
                    <ContentDisplay content={material.content} resUrls={material.resUrls} />
                    {/* 资源标签（非图片） */}
                    {material.resUrls.length > 0 && !material.resUrls.some(isImageUrl) && (
                      <div className="flex flex-wrap gap-2 mb-1">
                        {material.resUrls.map((url, index) => (
                          <Badge key={index} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            资源 {index + 1}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {/* 底部信息区 */}
                    <div className="pt-2 border-t border-gray-100 mt-2 text-xs text-gray-500">
                      <div className="flex justify-between items-center">
                        <span>发送者: {material.senderNickname}</span>
                        <span>时间: {material.time}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="px-3 h-8 text-xs"
                            onClick={() => router.push(`/content/${resolvedParams.id}/materials/edit/${material.id}`)}>
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
                        <div>
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
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

