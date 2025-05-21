"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, X, Image as ImageIcon, UploadCloud, Link, Video, FileText, Layers, CalendarDays, ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
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
  comment: string | null
  icon: string | null
  videoUrl?: string
}

const isImageUrl = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('oss-cn-shenzhen.aliyuncs.com')
}

// 素材类型枚举
const MATERIAL_TYPES = [
  { id: 1, name: "图片", icon: ImageIcon },
  { id: 2, name: "链接", icon: Link },
  { id: 3, name: "视频", icon: Video },
  { id: 4, name: "文本", icon: FileText },
  { id: 5, name: "小程序", icon: Layers }
]

export default function EditMaterialPage({ params }: { params: Promise<{ id: string, materialId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [originalMaterial, setOriginalMaterial] = useState<Material | null>(null)
  const [materialType, setMaterialType] = useState<number>(1) // 默认为图片类型
  const [url, setUrl] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [iconUrl, setIconUrl] = useState<string>("")
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [publishTime, setPublishTime] = useState("")
  const [comment, setComment] = useState("")

  // 获取素材详情
  useEffect(() => {
    const fetchMaterialDetail = async () => {
      setIsLoading(true)
      try {
        const response = await api.get<ApiResponse<Material>>(`/v1/content/library/get-item-detail?id=${resolvedParams.materialId}`)
        
        if (response.code === 200 && response.data) {
          const material = response.data
          setOriginalMaterial(material)
          setContent(material.content)
          setTitle(material.title || "")
          setIconUrl(material.icon || "")
          setVideoUrl(material.videoUrl || "")
          setComment(material.comment || "")
          
          // 设置素材类型
          setMaterialType(Number(material.type) || 1)
          
          // 如果是链接类型，设置URL
          if (material.type === "2" && material.urls && material.urls.length > 0) {
            setUrl(material.urls[0])
          }
          
          // 处理图片
          const imageUrls: string[] = []
          
          // 检查内容本身是否为图片链接
          if (isImageUrl(material.content)) {
            if (!imageUrls.includes(material.content)) {
              imageUrls.push(material.content)
            }
          }
          
          // 添加资源URL中的图片
          material.resUrls.forEach(url => {
            if (isImageUrl(url) && !imageUrls.includes(url)) {
              imageUrls.push(url)
            }
          })
          
          setImages(imageUrls)
          setPreviewUrls(imageUrls)
        } else {
          showToast(response.msg || "获取素材详情失败", "error")
          router.back()
        }
      } catch (error: any) {
        console.error("Failed to fetch material detail:", error)
        showToast(error?.message || "请检查网络连接", "error")
        router.back()
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMaterialDetail()
  }, [resolvedParams.materialId, router])

  // 模拟上传图片
  const handleUploadImage = () => {
    // 这里应该是真实的图片上传逻辑
    // 为了演示，这里模拟添加一些示例图片URL
    const mockImageUrls = [
      "https://picsum.photos/id/237/200/300",
      "https://picsum.photos/id/238/200/300",
      "https://picsum.photos/id/239/200/300"
    ]
    
    const randomIndex = Math.floor(Math.random() * mockImageUrls.length)
    const newImage = mockImageUrls[randomIndex]
    
    if (!images.includes(newImage)) {
      setImages([...images, newImage])
      setPreviewUrls([...previewUrls, newImage])
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove))
    setPreviewUrls(previewUrls.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 根据不同类型校验不同字段
    if (materialType === 1 && images.length === 0) {
      showToast("请上传图片", "error")
      return
    } else if (materialType === 2 && !url) {
      showToast("请输入链接地址", "error")
      return
    } else if ((materialType === 4 || materialType === 6) && !content) {
      showToast("请输入文本内容", "error")
      return
    }

    const loadingToast = showToast("正在更新素材...", "loading", true)
    try {
      const payload: any = {
        id: resolvedParams.materialId,
        type: materialType,
        content: content,
        title: materialType === 2 ? title : undefined,
        icon: materialType === 2 ? iconUrl : undefined,
        videoUrl: materialType === 3 ? videoUrl : undefined,
        comment: comment,
      }
      
      // 根据类型添加不同的字段
      if (materialType === 1) {
        payload.resUrls = images
      } else if (materialType === 2) {
        payload.urls = [url]
      } else if (materialType === 3) {
        payload.urls = [url]
      }
      
      const response = await api.post<ApiResponse>('/v1/content/library/update-item', payload)

      if (response.code === 200) {
        showToast("素材更新成功", "success")
        router.push(`/content/${resolvedParams.id}/materials`)
      } else {
        showToast(response.msg || "更新失败", "error")
      }
    } catch (error: any) {
      console.error("Failed to update material:", error)
      showToast(error?.message || "更新失败", "error")
    } finally {
      loadingToast.remove && loadingToast.remove()
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">编辑素材</h1>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Card className="p-8 rounded-3xl shadow-xl bg-white max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基础信息分组 */}
            <div className="mb-6">
              <div className="text-xs text-gray-400 mb-2 tracking-widest">基础信息</div>
              <div className="mb-4">
                <Label className="font-bold flex items-center mb-2">
                  发布时间
                </Label>
                <div className="relative">
                  <Input
                    id="publish-time"
                    type="datetime-local"
                    step="60"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    className="w-full h-12 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 text-base placeholder:text-gray-300"
                    placeholder="请选择发布时间"
                    style={{ width: 'auto' }}
                  />
                </div>
              </div>
              <div>
                <Label className="font-bold flex items-center mb-2">
                  <span className="text-red-500 mr-1">*</span>类型
                </Label>
                <div className="relative">
                  <select
                    style={{ border: '1px solid #e0e0e0' }}
                    className="appearance-none w-full h-12 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 pr-10 text-base bg-white placeholder:text-gray-300"
                    value={materialType}
                    onChange={e => setMaterialType(Number(e.target.value))}
                  >
                    {MATERIAL_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="border-b border-gray-100 my-4" />
            {/* 内容信息分组 */}
            {(materialType === 4 || materialType === 6 || (materialType === 1 && !isImageUrl(content))) && (
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2 tracking-widest">内容信息</div>
                <Label htmlFor="content" className="font-bold flex items-center mb-2">
                  <span className="text-red-500 mr-1">*</span>内容
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="请输入内容"
                  className="w-full rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 text-base min-h-[120px] bg-gray-50 placeholder:text-gray-300"
                  rows={10}
                />
                <div className="mt-4">
                  <Label htmlFor="comment" className="font-bold mb-2">评论</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="请输入评论内容"
                    className="w-full rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 text-base min-h-[80px] bg-gray-50 placeholder:text-gray-300"
                    rows={4}
                  />
                </div>
              </div>
            )}
            {(materialType === 2 || materialType === 3) && (
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2 tracking-widest">内容信息</div>
                {materialType === 2 && (
                  <div className="mb-4">
                    <Label htmlFor="title" className="font-bold flex items-center mb-2">
                      <span className="text-red-500 mr-1">*</span>标题
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="请输入标题"
                      className="w-full h-12 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 text-base placeholder:text-gray-300"/>
                    {/* 图标上传 */}
                    <div className="mt-4">
                      <Label className="font-bold mb-2">图标</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-dashed border-2 border-blue-300 bg-white hover:bg-blue-50 h-28 w-28 flex flex-col items-center justify-center p-0"
                          onClick={() => {
                            // 模拟上传，实际应对接上传接口
                            const mock = [
                              "https://cdn-icons-png.flaticon.com/512/732/732212.png",
                              "https://cdn-icons-png.flaticon.com/512/5968/5968764.png",
                              "https://cdn-icons-png.flaticon.com/512/5968/5968705.png"
                            ];
                            const random = mock[Math.floor(Math.random() * mock.length)];
                            setIconUrl(random);
                          }}
                        >
                          {iconUrl ? (
                            <Image src={iconUrl} alt="图标" width={80} height={80} className="object-contain rounded-xl mx-auto my-auto" />
                          ) : (
                            <>
                              <UploadCloud className="h-8 w-8 mb-2 text-gray-400 mx-auto" />
                              <span className="text-sm text-gray-500">上传图标</span>
                            </>
                          )}
                        </Button>
                        {iconUrl && (
                          <Button type="button" variant="destructive" size="sm" className="h-8 px-2 rounded-lg" onClick={() => setIconUrl("")}>删除</Button>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">建议尺寸 80x80，支持 PNG/JPG</div>
                    </div>
                  </div>
                )}
                <Label htmlFor="url" className="font-bold flex items-center mb-2">
                  <span className="text-red-500 mr-1">*</span>{materialType === 2 ? "链接地址" : "视频链接"}
                </Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={materialType === 2 ? "请输入链接地址" : "请输入视频链接"}
                  className="w-full h-12 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 text-base placeholder:text-gray-300"
                />
                {/* 视频类型上传视频 */}
                {materialType === 3 && (
                  <div className="mt-4">
                    <Label className="font-bold mb-2">上传视频</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl border-dashed border-2 border-blue-300 bg-white hover:bg-blue-50 h-28 w-44 flex flex-col items-center justify-center p-0"
                        onClick={() => {
                          // 模拟上传，实际应对接上传接口
                          const mock = [
                            "https://www.w3schools.com/html/mov_bbb.mp4",
                            "https://www.w3schools.com/html/movie.mp4"
                          ];
                          const random = mock[Math.floor(Math.random() * mock.length)];
                          setVideoUrl(random);
                        }}
                      >
                        {videoUrl ? (
                          <video src={videoUrl} controls className="object-contain rounded-xl h-24 w-40 mx-auto my-auto" />
                        ) : (
                          <>
                            <UploadCloud className="h-8 w-8 mb-2 text-gray-400 mx-auto" />
                            <span className="text-sm text-gray-500">上传视频</span>
                          </>
                        )}
                      </Button>
                      {videoUrl && (
                        <Button type="button" variant="destructive" size="sm" className="h-8 px-2 rounded-lg" onClick={() => setVideoUrl("")}>删除</Button>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">支持MP4，建议不超过20MB</div>
                  </div>
                )}
                <div className="mt-4">
                  <Label htmlFor="comment" className="font-bold mb-2">评论</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="请输入评论内容"
                    className="w-full rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 text-base min-h-[80px] bg-gray-50 placeholder:text-gray-300"
                    rows={4}
                  />
                </div>
              </div>
            )}
            {/* 素材上传分组（仅图片类型和小程序类型） */}
            {(materialType === 1 || materialType === 5) && (
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2 tracking-widest">素材上传</div>
                {materialType === 1 && (
                  <>
                    <Label className="font-bold mb-2">素材</Label>
                    <div className="border border-dashed border-gray-300 rounded-2xl p-4 text-center bg-gray-50">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleUploadImage} 
                        className="w-full py-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50"
                      >
                        <UploadCloud className="h-8 w-8 mb-2 text-gray-400" />
                        <span>点击上传图片</span>
                        <span className="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式</span>
                      </Button>
                    </div>
                    {previewUrls.length > 0 && (
                      <div className="mt-2">
                        <Label className="font-bold mb-2">已上传图片</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square relative rounded-2xl overflow-hidden border border-gray-200">
                                <Image
                                  src={url}
                                  alt={`图片 ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 rounded-full"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {materialType === 5 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="appTitle" className="font-bold mb-2">小程序名称</Label>
                      <Input
                        id="appTitle"
                        placeholder="请输入小程序名称"
                        className="w-full h-12 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 text-base placeholder:text-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="appId" className="font-bold mb-2">AppID</Label>
                      <Input
                        id="appId"
                        placeholder="请输入AppID"
                        className="w-full h-12 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 text-base placeholder:text-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="font-bold mb-2">小程序封面图</Label>
                      <div className="border border-dashed border-gray-300 rounded-2xl p-4 text-center bg-gray-50">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleUploadImage} 
                          className="w-full py-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50"
                        >
                          <UploadCloud className="h-6 w-6 mb-2 text-gray-400" />
                          <span>上传小程序封面图</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <Button type="submit" className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-base font-bold mt-12 shadow">
              保存修改
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
} 