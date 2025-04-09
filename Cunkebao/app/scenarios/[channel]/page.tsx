"use client"

import { useState } from "react"
import { ChevronLeft, Copy, Link, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { ScenarioAcquisitionCard } from "@/app/components/acquisition/ScenarioAcquisitionCard"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// 获取渠道中文名称
const getChannelName = (channel: string) => {
  const channelMap: Record<string, string> = {
    douyin: "抖音",
    kuaishou: "快手",
    xiaohongshu: "小红书",
    weibo: "微博",
    haibao: "海报",
    phone: "电话",
    gongzhonghao: "公众号",
    weixinqun: "微信群",
    payment: "付款码",
    api: "API",
  }
  return channelMap[channel] || channel
}

interface Task {
  id: string
  name: string
  status: "running" | "paused" | "completed"
  stats: {
    devices: number
    acquired: number
    added: number
  }
  lastUpdated: string
  executionTime: string
  nextExecutionTime: string
  trend: { date: string; customers: number }[]
}

interface DeviceStats {
  active: number
}

// API文档提示组件
function ApiDocumentationTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">
            计划接口允许您通过API将外部系统的客户数据直接导入到存客宝。支持多种编程语言和第三方平台集成。
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function ChannelPage({ params }: { params: { channel: string } }) {
  const router = useRouter()
  const channel = params.channel
  const channelName = getChannelName(params.channel)

  const initialTasks = [
    {
      id: "1",
      name: `${channelName}直播获客计划`,
      status: "running",
      stats: {
        devices: 5,
        acquired: 31,
        added: 25,
      },
      lastUpdated: "2024-02-09 15:30",
      executionTime: "2024-02-09 17:24:10",
      nextExecutionTime: "2024-02-09 17:25:36",
      trend: Array.from({ length: 7 }, (_, i) => ({
        date: `2月${String(i + 1)}日`,
        customers: Math.floor(Math.random() * 30) + 30,
      })),
    },
    {
      id: "2",
      name: `${channelName}评论区获客计划`,
      status: "paused",
      stats: {
        devices: 3,
        acquired: 15,
        added: 12,
      },
      lastUpdated: "2024-02-09 14:00",
      executionTime: "2024-02-09 16:30:00",
      nextExecutionTime: "2024-02-09 16:45:00",
      trend: Array.from({ length: 7 }, (_, i) => ({
        date: `2月${String(i + 1)}日`,
        customers: Math.floor(Math.random() * 20) + 20,
      })),
    },
  ]

  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    active: 5,
  })

  const [showApiDialog, setShowApiDialog] = useState(false)
  const [currentApiSettings, setCurrentApiSettings] = useState({
    apiKey: "",
    webhookUrl: "",
    taskId: "",
  })

  const handleEditPlan = (taskId: string) => {
    router.push(`/scenarios/${channel}/edit/${taskId}`)
  }

  const handleCopyPlan = (taskId: string) => {
    const taskToCopy = tasks.find((task) => task.id === taskId)
    if (taskToCopy) {
      const newTask = {
        ...taskToCopy,
        id: `${Date.now()}`,
        name: `${taskToCopy.name} (副本)`,
        status: "paused" as const,
      }
      setTasks([...tasks, newTask])
      toast({
        title: "计划已复制",
        description: `已成功复制"${taskToCopy.name}"`,
        variant: "success",
      })
    }
  }

  const handleDeletePlan = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId)
    if (taskToDelete) {
      setTasks(tasks.filter((t) => t.id !== taskId))
      toast({
        title: "计划已删除",
        description: `已成功删除"${taskToDelete.name}"`,
        variant: "success",
      })
    }
  }

  const handleStatusChange = (taskId: string, newStatus: "running" | "paused") => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))

    toast({
      title: newStatus === "running" ? "计划已启动" : "计划已暂停",
      description: `已${newStatus === "running" ? "启动" : "暂停"}获客计划`,
      variant: "success",
    })
  }

  const handleOpenApiSettings = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setCurrentApiSettings({
        apiKey: `api_${taskId}_${Math.random().toString(36).substring(2, 10)}`,
        webhookUrl: `${window.location.origin}/api/scenarios/${channel}/${taskId}/webhook`,
        taskId,
      })
      setShowApiDialog(true)
    }
  }

  const handleCopyApiUrl = (url: string, withParams = false) => {
    let copyUrl = url
    if (withParams) {
      copyUrl = `${url}?name=张三&phone=13800138000&source=外部系统&remark=测试数据`
    }
    navigator.clipboard.writeText(copyUrl)
    toast({
      title: "已复制",
      description: withParams ? "接口地址（含示例参数）已复制到剪贴板" : "接口地址已复制到剪贴板",
      variant: "success",
    })
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-blue-600">{channelName}获客</h1>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-7xl mx-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="mb-6">
              <ScenarioAcquisitionCard
                task={task}
                channel={channel}
                onEdit={() => handleEditPlan(task.id)}
                onCopy={handleCopyPlan}
                onDelete={handleDeletePlan}
                onStatusChange={handleStatusChange}
                onOpenSettings={handleOpenApiSettings}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 mb-4">暂无获客计划</div>
          </div>
        )}
      </div>
      {/* API接口设置对话框 */}
      <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>计划接口</DialogTitle>
              <ApiDocumentationTooltip />
            </div>
            <DialogDescription>使用此接口直接导入客资到该获客计划，支持多种编程语言。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API密钥</Label>
              <div className="flex items-center space-x-2">
                <Input id="api-key" value={currentApiSettings.apiKey} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(currentApiSettings.apiKey)
                    toast({
                      title: "已复制",
                      description: "API密钥已复制到剪贴板",
                      variant: "success",
                    })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="webhook-url">接口地址</Label>
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => handleCopyApiUrl(currentApiSettings.webhookUrl, true)}
                >
                  复制（含示例参数）
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <Input id="webhook-url" value={currentApiSettings.webhookUrl} readOnly className="flex-1" />
                <Button variant="outline" size="icon" onClick={() => handleCopyApiUrl(currentApiSettings.webhookUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">支持GET/POST请求，必要参数：name（姓名）、phone（电话）</p>
            </div>

            <div className="space-y-2">
              <Label>接口文档</Label>
              <div className="flex items-center justify-between">
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    window.open(`/api/docs/scenarios/${channel}/${currentApiSettings.taskId}`, "_blank")
                  }}
                >
                  <Link className="h-4 w-4" />
                  查看详细接口文档与集成指南
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                <a
                  href={`/api/docs/scenarios/${channel}/${currentApiSettings.taskId}#examples`}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                  rel="noreferrer"
                >
                  查看Python、Java等多语言示例代码
                </a>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

