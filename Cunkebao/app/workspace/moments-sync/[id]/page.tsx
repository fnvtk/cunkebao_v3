"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, MoreVertical, Clock, Edit, Trash2, Copy, RefreshCw, FileText, MessageSquare, History } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { api, ApiResponse } from "@/lib/api"
import { showToast } from "@/lib/toast"

// 定义任务详情的接口
interface TaskDetail {
  id: string
  name: string
  status: "running" | "paused"
  syncType: number
  accountType: number
  syncCount: number
  syncInterval: number
  startTime: string
  endTime: string
  enabled: boolean
  devices: {
    id: string
    name: string
    avatar: string
  }[]
  contentLibraries: {
    id: string
    name: string
    count: number
  }[]
  lastSyncTime: string
  createTime: string
  creator: string
}

// 定义同步历史的接口
interface SyncHistory {
  id: string
  syncTime: string
  content: string
  contentType: "text" | "image" | "video"
  status: "success" | "failed"
  errorMessage?: string
}

// 新增朋友圈发布记录类型
type MomentRecord = {
  id: number
  workbenchId: number
  publishTime: number
  contentType: number // 1文本 2视频 3图片
  content: string
  resUrls: string[]
  urls: string[]
  operatorName: string
  operatorAvatar: string
}

export default function MomentsSyncDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null)
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [momentRecords, setMomentRecords] = useState<MomentRecord[]>([])
  const [isMomentLoading, setIsMomentLoading] = useState(false)
  
  // 获取任务详情
  useEffect(() => {
    const fetchTaskDetail = async () => {
      setIsLoading(true)
      try {
        const response = await api.get<ApiResponse>(`/v1/workbench/moments-records?workbenchId=${params.id}`)
        if (response.code === 200 && response.data) {
          setTaskDetail(response.data)
          
          // 获取同步历史
          if (activeTab === "history") {
            fetchSyncHistory()
          }
        } else {
          showToast(response.msg || "获取任务详情失败", "error")
          router.push("/workspace/moments-sync")
        }
      } catch (error: any) {
        console.error("获取任务详情失败:", error)
        showToast(error?.message || "获取任务详情失败", "error")
        router.push("/workspace/moments-sync")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskDetail()
  }, [params.id, router])

  // 获取同步历史
  const fetchSyncHistory = async () => {
    try {
      const response = await api.get<ApiResponse>(`/v1/workbench/sync/history?id=${params.id}`)
      if (response.code === 200 && response.data) {
        setSyncHistory(response.data.list || [])
      } else {
        setSyncHistory([])
      }
    } catch (error) {
      console.error("获取同步历史失败:", error)
      setSyncHistory([])
    }
  }

  // 获取朋友圈发布记录
  type MomentsApiResponse = { code: number; msg: string; data: { list: MomentRecord[] } }
  const fetchMomentRecords = async () => {
    setIsMomentLoading(true)
    try {
      const response = await api.get<MomentsApiResponse>(`/v1/workbench/moments-records?workbenchId=${params.id}`)
      if (response.code === 200 && response.data) {
        setMomentRecords(response.data.list || [])
      } else {
        setMomentRecords([])
      }
    } catch (error) {
      setMomentRecords([])
    } finally {
      setIsMomentLoading(false)
    }
  }

  // 切换Tab时加载数据
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "history" && syncHistory.length === 0) {
      fetchSyncHistory()
    }
    if (value === "moments" && momentRecords.length === 0) {
      fetchMomentRecords()
    }
  }

  // 切换任务状态
  const toggleTaskStatus = async () => {
    if (!taskDetail) return

    try {
      const newStatus = taskDetail.status === "running" ? "paused" : "running"
      const response = await api.post<ApiResponse>('/v1/workbench/update/status', {
        id: params.id,
        status: newStatus === "running" ? 1 : 0
      })

      if (response.code === 200) {
        setTaskDetail({
          ...taskDetail,
          status: newStatus
        })
        showToast(`任务已${newStatus === "running" ? "启用" : "暂停"}`, "success")
      } else {
        showToast(response.msg || "操作失败", "error")
      }
    } catch (error: any) {
      console.error("更新任务状态失败:", error)
      showToast(error?.message || "更新任务状态失败", "error")
    }
  }

  // 编辑任务
  const handleEdit = () => {
    router.push(`/workspace/moments-sync/${params.id}/edit`)
  }

  // 确认删除
  const confirmDelete = () => {
    setShowDeleteAlert(true)
  }

  // 执行删除
  const handleDelete = async () => {
    try {
      const response = await api.post<ApiResponse>('/v1/workbench/delete', {
        id: params.id
      })

      if (response.code === 200) {
        showToast("删除成功", "success")
        router.push("/workspace/moments-sync")
      } else {
        showToast(response.msg || "删除失败", "error")
      }
    } catch (error: any) {
      console.error("删除任务失败:", error)
      showToast(error?.message || "删除任务失败", "error")
    } finally {
      setShowDeleteAlert(false)
    }
  }

  // 复制任务
  const handleCopy = async () => {
    try {
      const response = await api.post<ApiResponse>('/v1/workbench/copy', {
        id: params.id
      })

      if (response.code === 200) {
        showToast("复制成功，正在跳转到新任务", "success")
        // 假设后端返回了新任务的ID
        if (response.data?.id) {
          router.push(`/workspace/moments-sync/${response.data.id}`)
        } else {
          router.push("/workspace/moments-sync")
        }
      } else {
        showToast(response.msg || "复制失败", "error")
      }
    } catch (error: any) {
      console.error("复制任务失败:", error)
      showToast(error?.message || "复制任务失败", "error")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (!taskDetail) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex justify-center items-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">任务不存在或已被删除</p>
          <Button onClick={() => router.push("/workspace/moments-sync")}>返回列表</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/workspace/moments-sync")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">任务详情</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              checked={taskDetail.status === "running"} 
              onCheckedChange={toggleTaskStatus} 
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </DropdownMenuItem>
                <DropdownMenuItem onClick={confirmDelete} className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Card className="mb-4">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold">{taskDetail.name}</h2>
                <Badge variant={taskDetail.status === "running" ? "success" : "secondary"}>
                  {taskDetail.status === "running" ? "进行中" : "已暂停"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>创建时间：{taskDetail.createTime}</div>
              <div>创建人：{taskDetail.creator}</div>
              <div>上次同步：{taskDetail.lastSyncTime}</div>
              <div>已同步：{taskDetail.syncCount} 条</div>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview">基本信息</TabsTrigger>
            <TabsTrigger value="devices">设备列表</TabsTrigger>
            <TabsTrigger value="history">同步历史</TabsTrigger>
            <TabsTrigger value="moments">发布记录</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="font-medium mb-1">账号类型</div>
                  <div className="text-gray-600">{taskDetail.accountType === 1 ? "业务号" : "人设号"}</div>
                </div>
                <div>
                  <div className="font-medium mb-1">同步类型</div>
                  <div className="text-gray-600">{taskDetail.syncType === 1 ? "循环同步" : "实时更新"}</div>
                </div>
                <div>
                  <div className="font-medium mb-1">同步间隔</div>
                  <div className="text-gray-600">{taskDetail.syncInterval} 分钟</div>
                </div>
                <div>
                  <div className="font-medium mb-1">每日同步数量</div>
                  <div className="text-gray-600">{taskDetail.syncCount} 条</div>
                </div>
                <div>
                  <div className="font-medium mb-1">允许发布时间段</div>
                  <div className="text-gray-600">{taskDetail.startTime} - {taskDetail.endTime}</div>
                </div>
                <div>
                  <div className="font-medium mb-1">内容库</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {taskDetail.contentLibraries.map((lib) => (
                      <Badge key={lib.id} variant="outline" className="bg-blue-50">
                        {lib.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="devices" className="mt-4">
            <Card className="p-4">
              {taskDetail.devices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无关联设备</div>
              ) : (
                <div className="divide-y">
                  {taskDetail.devices.map((device) => (
                    <div key={device.id} className="flex items-center py-3 first:pt-0 last:pb-0">
                      <Avatar className="h-10 w-10 mr-3">
                        {device.avatar ? (
                          <img src={device.avatar} alt={device.name} />
                        ) : (
                          <div className="bg-blue-100 text-blue-600 h-full w-full flex items-center justify-center">
                            {device.name.charAt(0)}
                          </div>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-xs text-gray-500">ID: {device.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">同步历史</h3>
                <Button variant="outline" size="sm" onClick={fetchSyncHistory}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新
                </Button>
              </div>
              
              {syncHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无同步历史</div>
              ) : (
                <div className="space-y-4">
                  {syncHistory.map((record) => (
                    <div key={record.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {record.contentType === "text" && <FileText className="h-4 w-4 mr-2 text-gray-500" />}
                          {record.contentType === "image" && <img className="h-4 w-4 mr-2" src="/icons/image.svg" alt="图片" />}
                          {record.contentType === "video" && <img className="h-4 w-4 mr-2" src="/icons/video.svg" alt="视频" />}
                          <Badge variant={record.status === "success" ? "success" : "destructive"} className="text-xs">
                            {record.status === "success" ? "成功" : "失败"}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">{record.syncTime}</div>
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-2">{record.content}</div>
                      {record.status === "failed" && record.errorMessage && (
                        <div className="mt-2 text-xs text-red-500">
                          错误信息: {record.errorMessage}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="moments" className="mt-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">朋友圈发布记录</h3>
                <Button variant="outline" size="sm" onClick={fetchMomentRecords} disabled={isMomentLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新
                </Button>
              </div>
              {isMomentLoading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : momentRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无发布记录</div>
              ) : (
                <div className="space-y-4">
                  {momentRecords.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-3 flex gap-3">
                      <Avatar className="h-10 w-10">
                        {rec.operatorAvatar ? (
                          <img src={rec.operatorAvatar} alt={rec.operatorName} />
                        ) : (
                          <div className="bg-blue-100 text-blue-600 h-full w-full flex items-center justify-center">
                            {rec.operatorName?.charAt(0) || "?"}
                          </div>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{rec.operatorName}</span>
                          <span className="text-xs text-gray-400">{rec.publishTime ? new Date(rec.publishTime * 1000).toLocaleString() : "-"}</span>
                        </div>
                        <div className="mb-1 text-gray-800 text-sm">
                          {rec.contentType === 1 && rec.content}
                          {rec.contentType === 3 && rec.content}
                        </div>
                        {/* 图片展示 */}
                        {rec.contentType === 3 && rec.resUrls && rec.resUrls.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-1">
                            {rec.resUrls.map((url, idx) => (
                              <img key={idx} src={url} alt="图片" className="h-20 w-20 object-cover rounded" />
                            ))}
                          </div>
                        )}
                        {/* 视频展示 */}
                        {rec.contentType === 2 && rec.urls && rec.urls.length > 0 && (
                          <div className="mt-1">
                            {rec.urls.map((url, idx) => (
                              <video key={idx} src={url} controls className="h-32 w-48 rounded" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后，此任务将无法恢复。确定要删除吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

