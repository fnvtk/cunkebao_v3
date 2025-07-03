"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, X, Image as ImageIcon, UploadCloud, Link, Video, FileText, Layers, CalendarDays, ChevronDown } from "lucide-react"
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
  const [materialType, setMaterialType] = useState<number>(1)
  const [url, setUrl] = useState<string>("")
  const [desc, setDesc] = useState<string>("")
  const [image, setImage] = useState<string>("")
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [publishTime, setPublishTime] = useState("")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 图片上传
  const handleUploadImage = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (images.length >= 9) {
      showToast("最多只能上传9张图片", "error")
      return
    }
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast("请选择图片文件", "error")
      return
    }

    const loadingToast = showToast("正在上传图片...", "loading", true)
    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        // 浏览器会自动为 FormData 设置 Content-Type 为 multipart/form-data，无需手动设置
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/attachment/upload`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      const result: ApiResponse = await response.json();

      if (result.code === 200 && result.data?.url) {
        setImages((prev) => [...prev, result.data.url]);
        setPreviewUrls((prev) => [...prev, result.data.url]);
        showToast("图片上传成功", "success");
      } else {
        showToast(result.msg || "图片上传失败", "error");
      }
    } catch (error: any) {
      showToast(error?.message || "图片上传失败", "error")
    } finally {
      loadingToast.remove && loadingToast.remove()
      setLoading(false)
      // 清空文件输入框，以便再次上传同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove))
    setPreviewUrls(previewUrls.filter((_, index) => index !== indexToRemove))
  }

  // 创建素材
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 校验
    if (!content) {
      showToast("请输入内容", "error")
      return
    }
    // if (!comment) {
    //   showToast("请输入评论内容", "error")
    //   return
    // }
    if (materialType === 1 && images.length === 0) {
      showToast("请上传图片", "error")
      return
    } else if (materialType === 2 && (!url || !desc)) {
      showToast("请输入描述和链接地址", "error")
      return
    } else if (materialType === 3 && (!url && !videoUrl)) {
      showToast("请填写视频链接或上传视频", "error")
      return
    }
    setLoading(true)
    const loadingToast = showToast("正在创建素材...", "loading", true)
    try {
      const payload: any = {
        libraryId: params.id,
        type: materialType,
        content: content,
        comment: comment,
        sendTime: publishTime,
      }
      if (materialType === 1) {
        payload.resUrls = images
      } else if (materialType === 2) {
        payload.urls = [{ desc, image, url }]
      } else if (materialType === 3) {
        payload.urls = videoUrl ? [videoUrl] : []
      }
      const response = await api.post<ApiResponse>('/v1/content/library/create-item', payload)
      if (response.code === 200) {
        showToast("创建成功", "success")
      router.push(`/content/${params.id}/materials`)
      } else {
        showToast(response.msg || "创建失败", "error")
      }
    } catch (error: any) {
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
        <Card className="p-8 rounded-3xl shadow-xl bg-white max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基础信息分组 */}
            <div className="mb-6">
              <div className="text-xs text-gray-400 mb-2 tracking-widest">基础信息</div>
              <div className="mb-4">
                <Label className="font-bold flex items-center mb-2">发布时间</Label>
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
                  <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
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
            {/* 内容信息分组（所有类型都展示内容和评论） */}
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
            {(materialType === 2 || materialType === 3) && (
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2 tracking-widest">内容信息</div>
                {materialType === 2 && (
                  <div className="mb-4">
                    <Label htmlFor="desc" className="font-bold flex items-center mb-2">
                      <span className="text-red-500 mr-1">*</span>描述
                    </Label>
                    <Input
                      id="desc"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="请输入描述"
                      className="w-full h-12 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 text-base placeholder:text-gray-300"/>
                    {/* 封面图上传 */}
                    <div className="mt-4">
                      <Label className="font-bold mb-2">封面图</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-dashed border-2 border-blue-300 bg-white hover:bg-blue-50 h-28 w-28 flex flex-col items-center justify-center p-0"
                          onClick={() => {
                            const mock = [
                              "https://cdn-icons-png.flaticon.com/512/732/732212.png",
                              "https://cdn-icons-png.flaticon.com/512/5968/5968764.png",
                              "https://cdn-icons-png.flaticon.com/512/5968/5968705.png"
                            ];
                            const random = mock[Math.floor(Math.random() * mock.length)];
                            setImage(random);
                          }}
                        >
                          {image ? (
                            <Image src={image} alt="封面图" width={80} height={80} className="object-contain rounded-xl mx-auto my-auto" />
                          ) : (
                            <>
                              <UploadCloud className="h-8 w-8 mb-2 text-gray-400 mx-auto" />
                              <span className="text-sm text-gray-500">上传封面图</span>
                            </>
                          )}
                        </Button>
                        {image && (
                          <Button type="button" variant="destructive" size="sm" className="h-8 px-2 rounded-lg" onClick={() => setImage("")}>删除</Button>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">建议尺寸 80x80，支持 PNG/JPG</div>
                    </div>
                  </div>
                )}
                {materialType === 2 && (
                  <>
                    <Label htmlFor="url" className="font-bold flex items-center mb-2">
                      <span className="text-red-500 mr-1">*</span>链接地址
                    </Label>
                <Input
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="请输入链接地址"
                      className="w-full h-12 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 text-base placeholder:text-gray-300"
                    />
                  </>
                )}
                {materialType === 3 && (
                  <div className="mt-4">
                    <Label className="font-bold mb-2">上传视频</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl border-dashed border-2 border-blue-300 bg-white hover:bg-blue-50 h-28 w-44 flex flex-col items-center justify-center p-0"
                        onClick={() => {
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
                        disabled={loading || images.length >= 9}
                      >
                        <UploadCloud className="h-8 w-8 mb-2 text-gray-400" />
                        <span>点击上传图片</span>
                        <span className="text-xs text-gray-500 mt-1">{`已上传${images.length}张，最多可上传9张`}</span>
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
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
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = handleUploadImage;
                            input.click();
                          }}
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
            <Button type="submit" className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-base font-bold mt-12 shadow" disabled={loading}>
              {loading ? "创建中..." : "保存素材"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

