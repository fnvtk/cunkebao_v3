"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ImeiDisplayProps {
  imei: string
  className?: string
  containerWidth?: string | number // 可以接受字符串或数字类型的容器宽度配置
}

export function ImeiDisplay({ imei, className = "", containerWidth = "max-w-[calc(100%-40px)]" }: ImeiDisplayProps) {
  // 初始状态设为false，确保服务端渲染和客户端水合时状态一致
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 确保只在客户端执行的初始化逻辑
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = () => {
    // 只在客户端执行
    if (typeof navigator === 'undefined') return

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(imei)
        toast({
          title: "已复制",
          description: "IMEI已复制到剪贴板",
        })
      } else {
        // 备用复制方法
        const textArea = document.createElement("textarea")
        textArea.value = imei
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
          toast({
            title: "已复制",
            description: "IMEI已复制到剪贴板",
          })
        } catch (err) {
          toast({
            title: "复制失败",
            description: "您的浏览器不支持自动复制",
            variant: "destructive"
          })
        }
        
        document.body.removeChild(textArea)
      }
    } catch (err) {
      toast({
        title: "复制失败",
        description: "您的浏览器不支持自动复制",
        variant: "destructive"
      })
    }
  }

  // 处理containerWidth为数字的情况
  const widthStyle = typeof containerWidth === 'number' 
    ? `max-w-[${containerWidth}px]` 
    : containerWidth

  // 服务端渲染时，仅返回静态内容
  if (!mounted) {
    return <span className={`truncate inline-block ${widthStyle} ${className}`}>{imei}</span>
  }

  return (
    <>
      <span 
        className={`cursor-pointer hover:text-blue-600 truncate inline-block ${widthStyle} ${className}`}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        title={imei}
      >
        {imei}
      </span>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>设备IMEI</DialogTitle>
            <DialogDescription>
              完整的设备唯一标识符
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
            <code className="flex-1 text-sm break-all">{imei}</code>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopy} 
              title="复制IMEI"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 