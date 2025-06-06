"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlusCircle, MoreVertical, Edit, Trash2, ArrowLeft, Clock, Search, Filter, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface GroupPushTask {
  id: string
  name: string
  status: number
  config: {
    maxPerDay: number
    pushOrder: number
    isLoop: number
    groups: any[]
    contentLibraries: any[]
    lastPushTime: string
    createTime: string
  }
}

export default function GroupPushPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<GroupPushTask[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // 拉取数据
  const fetchTasks = async (page = 1, search = "") => {
    setLoading(true)
    const loadingToast = showToast("正在加载...", "loading", true)
    try {
      const params = new URLSearchParams({
        type: "3",
        page: page.toString(),
        limit: pageSize.toString(),
      })
      if (search) params.append("keyword", search)
      const res = await api.get(`/v1/workbench/list?${params.toString()}`) as any
      loadingToast.remove()
      if (res.code === 200) {
        setTasks(res.data.list)
        setTotal(res.data.total)
      } else {
        showToast(res.msg || "获取失败", "error")
      }
    } catch (e) {
      loadingToast.remove()
      showToast((e as any)?.message || "网络错误", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks(currentPage, searchTerm)
    // eslint-disable-next-line
  }, [currentPage])

  const handleDelete = (id: string) => {
    setTaskToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (taskToDelete) {
      const loadingToast = showToast("正在删除...", "loading", true)
      try {
        const res = await api.delete(`/v1/workbench/delete?id=${taskToDelete}`) as any
        loadingToast.remove()
        if (res.code === 200) {
          showToast("删除成功", "success")
          fetchTasks(currentPage, searchTerm)
        } else {
          showToast(res.msg || "删除失败", "error")
        }
      } catch (e) {
        loadingToast.remove()
        showToast((e as any)?.message || "网络错误", "error")
      }
      setTaskToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const handleToggleStatus = async (id: string, enabled: boolean) => {
    const loadingToast = showToast("正在更新状态...", "loading", true)
    try {
      const res = await api.post('/v1/workbench/update-status', {
        id,
        status: enabled ? 1 : 0
      }) as any
      loadingToast.remove()
      if (res.code === 200) {
        showToast("状态已更新", "success")
        fetchTasks(currentPage, searchTerm)
      } else {
        showToast(res.msg || "操作失败", "error")
      }
    } catch (e) {
      loadingToast.remove()
      showToast((e as any)?.message || "网络错误", "error")
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchTasks(1, searchTerm)
  }

  const handleRefresh = () => {
    fetchTasks(currentPage, searchTerm)
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/workspace")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">社群推送</h1>
          </div>
          <Link href="/workspace/group-push/new">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              新建任务
            </Button>
          </Link>
        </div>
      </header>

      {/* 搜索栏 */}
      <div className="p-4">
        <Card className="p-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索任务名称"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </Card>

        {/* 任务列表 */}
        {loading ? (
        <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Clock className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">暂无社群推送任务</h3>
            <p className="text-gray-500 mb-4">点击"新建任务"按钮创建您的第一个社群推送任务</p>
            <Link href="/workspace/group-push/new">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                新建任务
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {tasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{task.name}</h3>
                    <Badge variant={task.status === 1 ? "success" : "secondary"}>
                      {task.status === 1 ? "进行中" : "已暂停"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                      checked={task.status === 1}
                    onCheckedChange={(checked) => handleToggleStatus(task.id, checked)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/workspace/group-push/${task.id}`}>
                        <DropdownMenuItem>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          查看
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/workspace/group-push/${task.id}/edit`}>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => handleDelete(task.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-sm text-gray-500">
                    <div>推送群数：{task.config.groups?.length || 0} 个</div>
                    <div>内容库：{task.config.contentLibraries?.length || 0} 个</div>
                </div>
                <div className="text-sm text-gray-500">
                    <div>每日推送：{task.config.maxPerDay} 条</div>
                    <div>推送顺序：{task.config.pushOrder === 2 ? "按最新" : "按最早"}</div>
                    <div>循环推送：{task.config.isLoop === 1 ? "是" : "否"}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                    上次推送：{task.config.lastPushTime || "--"}
                </div>
                  <div>创建时间：{task.config.createTime || "--"}</div>
              </div>
            </Card>
          ))}
        </div>
        )}

        {/* 分页 */}
        {!loading && total > pageSize && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              上一页
            </Button>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-500">第 {currentPage} 页</span>
              <span className="text-sm text-gray-500">共 {Math.ceil(total / pageSize)} 页</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(total / pageSize), prev + 1))}
              disabled={currentPage >= Math.ceil(total / pageSize) || loading}
            >
              下一页
              </Button>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>您确定要删除这个社群推送任务吗？此操作无法撤销。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

