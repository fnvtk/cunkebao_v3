"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardFooter } from "@/components/ui/card"
import {
  Upload,
  PenTool,
  Type,
  QrCode,
  ChevronRight,
  ArrowRight,
  Smartphone,
  Monitor,
  Tablet,
  Save,
  Share2,
  Eye,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const DEFAULT_TEMPLATES = [
  {
    id: "register",
    name: "点击报名",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%80%9B%E6%A8%BA%EE%85%B9%E7%80%B9%E6%BF%87%E6%8D%A3%E9%8E%B6_%E9%90%90%E7%91%B0%E5%9A%AE%E9%8E%B6%E3%83%A5%E6%82%95-vJDCYhJ9ENr8jN3YGP9jVeQ5Ub3czl.gif",
    color: "#d32121",
    textColor: "#ffffff",
  },
  {
    id: "claim",
    name: "点击领取",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%80%9B%E6%A8%BA%EE%85%B9%E7%80%B9%E6%BF%87%E6%8D%A3%E9%8E%B6_%E9%90%90%E7%91%B0%E5%9A%AE%E6%A3%B0%E5%97%97%E5%BD%871-cskUmYR6oO0n4uHdZVeB4naKUSUilb.gif",
    color: "#d32121",
    textColor: "#ffffff",
  },
  {
    id: "consult",
    name: "点击咨询",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%80%9B%E6%A8%BA%EE%85%B9%E7%80%B9%E6%BF%87%E6%8D%A3%E9%8E%B6_%E9%90%90%E7%91%B0%E5%9A%AE%E9%8D%9C%E3%84%A8%EE%87%97-OUtJxwRbr4ydYRjt8FLOCMELC16Vw6.gif",
    color: "#d32121",
    textColor: "#ffffff",
  },
  {
    id: "checkin",
    name: "点击签到",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%80%9B%E6%A8%BA%EE%85%B9%E7%80%B9%E6%BF%87%E6%8D%A3%E9%8E%B6_%E9%90%90%E7%91%B0%E5%9A%AE%E7%BB%9B%E6%83%A7%E5%9F%8C-bYcTocSdNrcykfBXmt51q6D4Yzh26h.gif",
    color: "#d32121",
    textColor: "#ffffff",
  },
  {
    id: "cooperation",
    name: "点击合作",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%80%9B%E6%A8%BA%EE%85%B9%E7%80%B9%E6%BF%87%E6%8D%A3%E9%8E%B6_%E9%90%90%E7%91%B0%E5%9A%AE%E9%8D%9A%E5%A0%9C%E7%B6%94-kisPT3kV9A0aB7YpxO6AHUZ8aHvFLT.gif",
    color: "#d32121",
    textColor: "#ffffff",
  },
  {
    id: "learn",
    name: "点击了解",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%80%9B%E6%A8%BA%EE%85%B9%E7%80%B9%E6%BF%87%E6%8D%A3%E9%8E%B6_%E9%90%90%E7%91%B0%E5%9A%AE%E6%B5%9C%E5%97%9A%D0%92-iE654sFFuO1PuvwmccV67yVLQZoLcx.gif",
    color: "#d32121",
    textColor: "#ffffff",
  },
  {
    id: "claim_static",
    name: "点击领取(静态)",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%80%9B%E6%A8%BA%EE%85%B9%E7%80%B9%E6%BF%87%E6%8D%A3%E9%8E%B6_%E9%90%90%E7%91%B0%E5%9A%AE%E6%A3%B0%E5%97%97%E5%BD%87-jO6FPRCCzz6Irkm5suKeNkUDd98Y0f.png",
    color: "#d32121",
    textColor: "#ffffff",
  },
]

export function PosterEditor({
  onChange,
  initialValue = null,
}: {
  onChange: (value: any) => void
  initialValue?: any
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(initialValue?.template || DEFAULT_TEMPLATES[0])
  const [customText, setCustomText] = useState(initialValue?.customText || selectedTemplate.name)
  const [mainColor, setMainColor] = useState(initialValue?.mainColor || selectedTemplate.color)
  const [textColor, setTextColor] = useState(initialValue?.textColor || selectedTemplate.textColor)
  const [hasQrCode, setHasQrCode] = useState(initialValue?.hasQrCode || false)
  const [qrCodeUrl, setQrCodeUrl] = useState(initialValue?.qrCodeUrl || "")
  const [offerText, setOfferText] = useState(initialValue?.offerText || "")
  const [previewDevice, setPreviewDevice] = useState("mobile")
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 当任何相关状态变化时更新父组件
  useEffect(() => {
    onChange({
      template: selectedTemplate,
      customText,
      mainColor,
      textColor,
      hasQrCode,
      qrCodeUrl,
      offerText,
    })
  }, [selectedTemplate, customText, mainColor, textColor, hasQrCode, qrCodeUrl, offerText, onChange])

  // 预览海报的渲染
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 获取原始海报图像
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = selectedTemplate.src

    img.onload = () => {
      // 绘制原始海报
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 自定义文本
      if (customText !== selectedTemplate.name) {
        // 首先绘制一个半透明背景，盖住原文字
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)"
        ctx.fillRect(20, 30, canvas.width - 40, 150)

        // 绘制自定义文字
        ctx.fillStyle = mainColor
        ctx.font = "bold 42px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(customText, canvas.width / 2, 100)
      }

      // 如果添加了二维码
      if (hasQrCode) {
        // 添加一个二维码占位背景
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(canvas.width - 120, canvas.height - 120, 100, 100)
        ctx.strokeStyle = "#dddddd"
        ctx.lineWidth = 1
        ctx.strokeRect(canvas.width - 120, canvas.height - 120, 100, 100)

        // 添加二维码图标占位
        ctx.fillStyle = "#888888"
        ctx.fillRect(canvas.width - 100, canvas.height - 100, 60, 60)

        // 添加"扫码获取"文本
        ctx.fillStyle = "#333333"
        ctx.font = "14px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("扫码获取", canvas.width - 70, canvas.height - 20)
      }

      // 如果添加了优惠文本
      if (offerText) {
        // 添加一个醒目的优惠信息标签
        ctx.fillStyle = "#ffeb3b"
        ctx.beginPath()
        ctx.moveTo(0, canvas.height - 200)
        ctx.lineTo(200, canvas.height - 200)
        ctx.lineTo(170, canvas.height - 150)
        ctx.lineTo(0, canvas.height - 150)
        ctx.closePath()
        ctx.fill()

        // 添加优惠文本
        ctx.fillStyle = "#d32121"
        ctx.font = "bold 18px sans-serif"
        ctx.textAlign = "left"
        ctx.fillText(offerText, 15, canvas.height - 175)
      }
    }
  }, [selectedTemplate, customText, mainColor, hasQrCode, offerText])

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-medium">海报编辑器</h2>

      <Tabs defaultValue="design" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="design" className="flex items-center gap-1">
            <PenTool className="h-4 w-4" />
            设计
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <Type className="h-4 w-4" />
            内容
          </TabsTrigger>
          <TabsTrigger value="interactive" className="flex items-center gap-1">
            <QrCode className="h-4 w-4" />
            互动
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            预览
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-4 pt-4">
          <div>
            <Label>选择模板</Label>
            <div className="mt-2 flex justify-between">
              <div className="w-24 h-40 bg-gray-100 rounded relative overflow-hidden">
                {selectedTemplate && (
                  <img
                    src={selectedTemplate.src || "/placeholder.svg"}
                    alt={selectedTemplate.name}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>

              <div className="ml-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-medium">{selectedTemplate?.name || "请选择模板"}</h4>
                  <p className="text-sm text-gray-500 mt-1">点击右侧按钮选择其他模板</p>
                </div>

                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-2">
                      更换模板
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>选择海报模板</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
                      {DEFAULT_TEMPLATES.map((template) => (
                        <Card
                          key={template.id}
                          className={cn(
                            "overflow-hidden cursor-pointer transition-all transform hover:scale-105",
                            selectedTemplate.id === template.id && "ring-2 ring-blue-500",
                          )}
                          onClick={() => {
                            setSelectedTemplate(template)
                            setCustomText(template.name)
                            setMainColor(template.color)
                            setTextColor(template.textColor)
                            setIsTemplateDialogOpen(false)
                          }}
                        >
                          <div className="aspect-[9/16] bg-gray-100 relative">
                            <img
                              src={template.src || "/placeholder.svg"}
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardFooter className="p-2">
                            <p className="text-sm text-center w-full">{template.name}</p>
                          </CardFooter>
                        </Card>
                      ))}

                      <Card className="overflow-hidden cursor-pointer transition-all transform hover:scale-105">
                        <div className="aspect-[9/16] bg-gray-100 flex flex-col items-center justify-center text-gray-500">
                          <Upload className="h-8 w-8 mb-2" />
                          <p className="text-sm">上传自定义模板</p>
                        </div>
                        <CardFooter className="p-2">
                          <p className="text-sm text-center w-full">自定义上传</p>
                        </CardFooter>
                      </Card>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mainColor">主色调</Label>
              <div className="flex mt-2">
                <div className="w-10 h-8 rounded-l border" style={{ backgroundColor: mainColor }}></div>
                <Input
                  id="mainColor"
                  type="text"
                  value={mainColor}
                  onChange={(e) => setMainColor(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="textColor">文字颜色</Label>
              <div className="flex mt-2">
                <div className="w-10 h-8 rounded-l border" style={{ backgroundColor: textColor }}></div>
                <Input
                  id="textColor"
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm">
              重置样式
            </Button>
            <Button variant="outline" size="sm">
              保存为模板
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 pt-4">
          <div>
            <Label htmlFor="customText">海报文字</Label>
            <Input
              id="customText"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="offerText">优惠信息(选填)</Label>
            <Input
              id="offerText"
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              className="mt-2"
              placeholder="例如: 限时8.5折 | 新人专享"
            />
            <p className="text-xs text-gray-500 mt-1">添加醒目的优惠信息，提升用户点击欲望</p>
          </div>

          <div>
            <Label>推荐措辞</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {["限时特惠", "新人专享", "首单立减", "买一送一", "折扣优惠", "免费领取"].map((tag) => (
                <Button key={tag} variant="outline" size="sm" onClick={() => setOfferText(tag)}>
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="interactive" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="qrcode-switch" className="cursor-pointer">
                添加二维码
              </Label>
              <p className="text-xs text-gray-500 mt-1">添加二维码提高用户转化率</p>
            </div>
            <Switch id="qrcode-switch" checked={hasQrCode} onCheckedChange={setHasQrCode} />
          </div>

          {hasQrCode && (
            <div>
              <Label htmlFor="qrcode-url">二维码链接(选填)</Label>
              <Input
                id="qrcode-url"
                value={qrCodeUrl}
                onChange={(e) => setQrCodeUrl(e.target.value)}
                className="mt-2"
                placeholder="输入链接或小程序路径"
              />
              <div className="mt-3 flex justify-between items-center">
                <p className="text-sm">上传自定义二维码</p>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Upload className="h-3 w-3 mr-1" />
                  上传
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">点击行为</h4>
            <Select defaultValue="form">
              <SelectTrigger>
                <SelectValue placeholder="选择点击行为" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="form">填写表单</SelectItem>
                <SelectItem value="qrcode">扫码添加</SelectItem>
                <SelectItem value="call">拨打电话</SelectItem>
                <SelectItem value="link">访问链接</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">设置用户点击海报后的行为</p>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4 pt-4">
          <div className="flex justify-center space-x-2">
            <Button
              variant={previewDevice === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewDevice("mobile")}
              className="flex items-center"
            >
              <Smartphone className="h-4 w-4 mr-1" />
              手机
            </Button>
            <Button
              variant={previewDevice === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewDevice("tablet")}
              className="flex items-center"
            >
              <Tablet className="h-4 w-4 mr-1" />
              平板
            </Button>
            <Button
              variant={previewDevice === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewDevice("desktop")}
              className="flex items-center"
            >
              <Monitor className="h-4 w-4 mr-1" />
              电脑
            </Button>
          </div>

          <div className="flex justify-center">
            <div
              className={cn(
                "bg-gray-100 border flex items-center justify-center p-2",
                previewDevice === "mobile" && "w-[320px] h-[568px]",
                previewDevice === "tablet" && "w-[480px] h-[640px]",
                previewDevice === "desktop" && "w-[640px] h-[480px] max-w-full",
              )}
            >
              <canvas
                ref={canvasRef}
                width={300}
                height={534}
                className={cn("w-full h-full object-contain", previewDevice === "desktop" && "max-h-[90%]")}
              />
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <Save className="h-4 w-4 mr-1" />
              保存
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Share2 className="h-4 w-4 mr-1" />
              分享
            </Button>
            <Button className="flex items-center">
              确认使用
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

