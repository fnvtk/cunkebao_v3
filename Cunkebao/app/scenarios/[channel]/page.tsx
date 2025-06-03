"use client"

import { use, useState } from "react"
import { Copy, Link, HelpCircle, Shield, ChevronLeft, Plus } from "lucide-react"
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
    poster: "海报",
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

// export default function ChannelPage({ params }: { params: { channel: string } }) {
  export default function ChannelPage({ params }: { params: Promise<{ channel: string }> }) {
  const router = useRouter()
  // const unwrappedParams = use(params)
  const resolvedParams = use(params)
  // const channel = params.channel
  // const channelName = getChannelName(params.channel)
  // const channel = unwrappedParams.channel
  // const channelName = getChannelName(unwrappedParams.channel)
  const channel = resolvedParams.channel
  const channelName = getChannelName(resolvedParams.channel)

  const initialTasks: Task[] = [
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
        variant: "default",
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
        variant: "default",
      })
    }
  }

  const handleStatusChange = (taskId: string, newStatus: "running" | "paused") => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))

    toast({
      title: newStatus === "running" ? "计划已启动" : "计划已暂停",
      description: `已${newStatus === "running" ? "启动" : "暂停"}获客计划`,
      variant: "default",
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
      variant: "default",
    })
  }

  const handleCreateNewPlan = () => {
    // router.push(`/plans/new?type=${channel}`)
    router.push(`/scenarios/new?type=${channel}`)
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/scenarios")} className="h-8 w-8">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-blue-600">{channelName}获客</h1>
          </div>
          <Button onClick={handleCreateNewPlan} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1" />
            新建{channelName}计划
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id}>
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
            <div className="text-center py-12 bg-white rounded-lg shadow-sm md:col-span-2 lg:col-span-3">
              <div className="text-gray-400 mb-4">暂无获客计划</div>
              <Button onClick={handleCreateNewPlan} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-1" />
                新建{channelName}计划
              </Button>
            </div>
          )}
        </div>
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

          <div className="space-y-5 py-4">
            {/* API密钥部分 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="api-key" className="text-sm font-medium flex items-center gap-1">
                  API密钥
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">API密钥用于身份验证，请妥善保管，不要在客户端代码中暴露它</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <span className="text-xs text-gray-500">用于接口身份验证</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    value={currentApiSettings.apiKey}
                    readOnly
                    className="pr-10 font-mono text-sm bg-gray-50"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => {
                      navigator.clipboard.writeText(currentApiSettings.apiKey)
                      toast({
                        title: "已复制",
                        description: "API密钥已复制到剪贴板",
                        variant: "default",
                      })
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 接口地址部分 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="webhook-url" className="text-sm font-medium">
                  接口地址
                </Label>
                <button
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  onClick={() => handleCopyApiUrl(currentApiSettings.webhookUrl, true)}
                >
                  <Copy className="h-3 w-3" />
                  复制（含示例参数）
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="webhook-url"
                    value={currentApiSettings.webhookUrl}
                    readOnly
                    className="pr-10 font-mono text-sm bg-gray-50 text-gray-700"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => handleCopyApiUrl(currentApiSettings.webhookUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-blue-50 p-2 rounded-md">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">必要参数：</span>name（姓名）、phone（电话）
                  <br />
                  <span className="font-medium">可选参数：</span>source（来源）、remark（备注）、tags（标签）
                </p>
              </div>
            </div>

            {/* 接口文档部分 */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">接口文档</Label>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex flex-col space-y-3">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 bg-white"
                    onClick={() => {
                      window.open(`/api/docs/scenarios/${channel}/${currentApiSettings.taskId}`, "_blank")
                    }}
                  >
                    <Link className="h-4 w-4" />
                    查看详细接口文档与集成指南
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        window.open(`/api/docs/scenarios/${channel}/${currentApiSettings.taskId}#examples`, "_blank")
                      }}
                    >
                      <span className="text-blue-600">查看代码示例</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        window.open(`/api/docs/scenarios/${channel}/${currentApiSettings.taskId}#integration`, "_blank")
                      }}
                    >
                      <span className="text-blue-600">查看集成指南</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 快速测试部分 */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">快速测试</Label>
              </div>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                <p className="text-xs text-gray-600 mb-2">使用以下URL可以快速测试接口是否正常工作：</p>
                <div className="text-xs font-mono bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                  {`${currentApiSettings.webhookUrl}?name=测试客户&phone=13800138000`}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <span className="inline-flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                接口安全加密传输
              </span>
            </div>
            <Button onClick={() => setShowApiDialog(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
