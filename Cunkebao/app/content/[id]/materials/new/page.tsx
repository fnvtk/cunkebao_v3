"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, X, Image as ImageIcon, UploadCloud, Link, Video, FileText, Layers } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

// 素材类型枚举
const MATERIAL_TYPES = [
  { id: 1, name: "图片", icon: ImageIcon },
  { id: 2, name: "链接", icon: Link },
  { id: 3, name: "视频", icon: Video },
  { id: 4, name: "文本", icon: FileText },
  { id: 5, name: "小程序", icon: Layers }
]

export default function NewMaterialPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [materialType, setMaterialType] = useState<number>(1) // 默认为图片类型
  const [url, setUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)

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
    
    setLoading(true)
    const loadingToast = showToast("正在创建素材...", "loading", true)
    
    try {
      // 构建API请求参数
      const payload: any = {
        libraryId: params.id,
        type: materialType,
        content: content,
      }
      
      // 根据类型添加不同的字段
      if (materialType === 1) {
        payload.resUrls = images
      } else if (materialType === 2) {
        payload.urls = [url]
      } else if (materialType === 3) {
        payload.urls = [url]
      }
      
      const response = await api.post<ApiResponse>('/v1/content/library/create-item', payload)
      
      if (response.code === 200) {
        showToast("创建成功", "success")
        router.push(`/content/${params.id}/materials`)
      } else {
        showToast(response.msg || "创建失败", "error")
      }
    } catch (error: any) {
      console.error("Failed to create new material:", error)
      showToast(error?.message || "创建素材失败", "error")
    } finally {
      loadingToast.remove && loadingToast.remove()
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">新建素材</h1>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 素材类型选择器 */}
            <div>
              <Label className="text-base required">类型</Label>
              <div className="flex items-center mt-2 border border-gray-200 rounded-md overflow-hidden">
                {MATERIAL_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={cn(
                      "flex-1 py-2 px-4 flex items-center justify-center gap-1 text-sm transition-colors",
                      materialType === type.id
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    )}
                    onClick={() => setMaterialType(type.id)}
                  >
                    <type.icon className="h-4 w-4" />
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 根据不同类型显示不同的编辑区域 */}
            {(materialType === 4 || materialType === 6) && (
              <div>
                <Label htmlFor="content">素材内容</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="请输入素材内容"
                  className="mt-1"
                  rows={10}
                />
              </div>
            )}

            {/* 链接或视频类型 */}
            {(materialType === 2 || materialType === 3) && (
              <div>
                <Label htmlFor="url">{materialType === 2 ? "链接地址" : "视频链接"}</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={materialType === 2 ? "请输入链接地址" : "请输入视频链接"}
                  className="mt-1"
                />
              </div>
            )}

            {/* 图片类型 */}
            {materialType === 1 && (
              <div>
                <Label>图片集</Label>
                <div className="mt-2 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleUploadImage} 
                    className="w-full py-8 flex flex-col items-center justify-center"
                  >
                    <UploadCloud className="h-8 w-8 mb-2 text-gray-400" />
                    <span>点击上传图片</span>
                    <span className="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式</span>
                  </Button>
                </div>

                {previewUrls.length > 0 && (
                  <div className="mt-4">
                    <Label>已上传图片</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
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
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 小程序类型 */}
            {materialType === 5 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="appTitle">小程序名称</Label>
                  <Input
                    id="appTitle"
                    placeholder="请输入小程序名称"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="appId">AppID</Label>
                  <Input
                    id="appId"
                    placeholder="请输入AppID"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>小程序封面图</Label>
                  <div className="mt-2 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleUploadImage} 
                      className="w-full py-4 flex flex-col items-center justify-center"
                    >
                      <UploadCloud className="h-6 w-6 mb-2 text-gray-400" />
                      <span>上传小程序封面图</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "创建中..." : "保存素材"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

