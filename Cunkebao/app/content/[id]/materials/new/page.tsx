"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, X, Image as ImageIcon, UploadCloud } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function NewMaterialPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

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
    if (!content && images.length === 0) {
      toast({
        title: "错误",
        description: "请输入素材内容或上传图片",
        variant: "destructive",
      })
      return
    }
    try {
      // 模拟保存新素材
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "成功",
        description: "新素材已创建",
      })
      router.push(`/content/${params.id}/materials`)
    } catch (error) {
      console.error("Failed to create new material:", error)
      toast({
        title: "错误",
        description: "创建新素材失败",
        variant: "destructive",
      })
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

            <Button type="submit" className="w-full">
              保存素材
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

