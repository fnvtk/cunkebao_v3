"use client"

import { useState, useEffect, useRef } from "react"
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

// 恢复Task接口定义
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

interface PlanItem {
  id: number;
  name: string;
  status: number;
  statusText: string;
  createTime: number;
  createTimeFormat: string;
  deviceCount: number;
  customerCount: number;
  addedCount: number;
  passRate: number;
  lastExecutionTime: string;
  nextExecutionTime: string;
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
  
  // 从URL query参数获取场景ID
  const [sceneId, setSceneId] = useState<number | null>(null);
  // 使用ref追踪sceneId值，避免重复请求
  const sceneIdRef = useRef<number | null>(null);
  // 追踪组件是否已挂载
  const isMounted = useRef(true);
  
  // 组件卸载时更新挂载状态
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // 获取URL中的查询参数
  useEffect(() => {
    // 组件未挂载，不执行操作
    if (!isMounted.current) return;
    
    // 从URL获取id参数
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    
    if (idParam && !isNaN(Number(idParam))) {
      setSceneId(Number(idParam));
      sceneIdRef.current = Number(idParam);
    } else {
      // 如果没有传递有效的ID，使用函数获取默认ID
      const defaultId = getSceneIdFromChannel(channel);
      setSceneId(defaultId);
      sceneIdRef.current = defaultId;
    }
  }, [channel]);

  const initialTasks = [
    {
      id: "1",
      name: `${channelName}直播获客计划`,
      status: "running" as const,
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
      status: "paused" as const,
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
  ] as Task[];

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // 修改API数据处理部分
  useEffect(() => {
    // 组件未挂载，不执行操作
    if (!isMounted.current) return;
    
    // 防止重复请求：如果sceneId没有变化且已经加载过数据，则不重新请求
    if (sceneId === sceneIdRef.current && tasks.length > 0 && !loading) {
      return;
    }
    
    const fetchPlanList = async () => {
      try {
        setLoading(true);
        // 如果sceneId还未确定，则等待
        if (sceneId === null) return;
        
        // 调用API获取计划列表
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/plan/list?id=${sceneId}`, 
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const data = await response.json();
        
        if (data.code === 1 && data.data && data.data.list) {
          // 将API返回的数据转换为前端展示格式
          const transformedTasks = data.data.list.map((item: PlanItem) => {
            // 确保返回的对象完全符合Task类型
            const status: "running" | "paused" | "completed" = 
              item.status === 1 ? "running" : "paused";
            
            return {
              id: item.id.toString(),
              name: item.name,
              status: status,
              stats: {
                devices: item.deviceCount,
                acquired: item.customerCount,
                added: item.addedCount,
              },
              lastUpdated: item.createTimeFormat,
              executionTime: item.lastExecutionTime || "--",
              nextExecutionTime: item.nextExecutionTime || "--",
              trend: Array.from({ length: 7 }, (_, i) => ({
                date: `2月${String(i + 1)}日`,
                customers: Math.floor(Math.random() * 20) + 10, // 模拟数据
              })),
            };
          });
          
          // 使用类型断言解决类型冲突
          setTasks(transformedTasks as Task[]);
          setError(null);
        } else {
          setError(data.msg || "获取计划列表失败");
          // 如果API返回错误，使用初始数据
          setTasks(initialTasks);
        }
      } catch (err) {
        console.error("获取计划列表失败:", err);
        setError("网络错误，无法获取计划列表");
        // 出错时使用初始数据
        setTasks(initialTasks);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlanList();
  }, [sceneId]); // 只依赖sceneId变化触发请求

  // 辅助函数：根据渠道获取场景ID
  const getSceneIdFromChannel = (channel: string): number => {
    const channelMap: Record<string, number> = {
      'douyin': 1,
      'xiaohongshu': 2,
      'weixinqun': 3,
      'gongzhonghao': 4,
      'kuaishou': 5,
      'weibo': 6,
      'haibao': 7,
      'phone': 8,
      'api': 9
    };
    return channelMap[channel] || 6;
  };

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
        {loading ? (
          // 添加加载状态
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-500">加载计划中...</div>
          </div>
        ) : error ? (
          // 添加错误提示
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-red-500 mb-4">{error}</div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </div>
        ) : tasks.length > 0 ? (
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
                      variant: "default",
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

