"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Plus, Filter, Search, RefreshCw, QrCode } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fetchDeviceList, deleteDevice } from "@/api/devices"
import { ServerDevice } from "@/types/device"

// 设备接口更新为与服务端接口对应的类型
interface Device extends ServerDevice {
  status: "online" | "offline";
}

export default function DevicesPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDevices, setSelectedDevices] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)
  // 使用ref来追踪当前页码，避免依赖effect循环
  const pageRef = useRef(1)

  const devicesPerPage = 20 // 每页显示20条记录

  // 获取设备列表
  const loadDevices = useCallback(async (page: number, refresh: boolean = false) => {
    // 检查是否已经在加载中，避免重复请求
    if (isLoading) return;
    
    try {
      setIsLoading(true)
      const response = await fetchDeviceList(page, devicesPerPage, searchQuery)
      
      if (response.code === 200 && response.data) {
        // 转换数据格式，确保status类型正确
        const serverDevices = response.data.list.map(device => ({
          ...device,
          status: device.alive === 1 ? "online" as const : "offline" as const
        }))
        
        // 更新设备列表
        if (refresh) {
          setDevices(serverDevices)
        } else {
          setDevices(prev => [...prev, ...serverDevices])
        }
        
        // 更新统计信息
        const total = response.data.total
        const online = response.data.list.filter(d => d.alive === 1).length
        setStats({
          totalDevices: total,
          onlineDevices: online
        })
        
        // 更新分页信息
        setTotalCount(response.data.total)
        
        // 更新hasMore状态，确保有更多数据且返回的数据数量等于每页数量
        const hasMoreData = serverDevices.length > 0 && 
                            serverDevices.length === devicesPerPage && 
                            (page * devicesPerPage) < response.data.total;
        setHasMore(hasMoreData)
        
        // 更新当前页码的ref值
        pageRef.current = page
      } else {
        toast({
          title: "获取设备列表失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("获取设备列表失败", error)
      toast({
        title: "获取设备列表失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  // 移除isLoading依赖，只保留真正需要的依赖
  }, [searchQuery, devicesPerPage])

  // 加载下一页数据的函数，使用ref来追踪页码，避免依赖循环
  const loadNextPage = useCallback(() => {
    // 如果正在加载或者没有更多数据，直接返回
    if (isLoading || !hasMore) return;
    
    // 使用ref来获取下一页码，避免依赖currentPage
    const nextPage = pageRef.current + 1;
    // 设置UI显示的当前页
    setCurrentPage(nextPage);
    // 加载下一页数据
    loadDevices(nextPage, false);
  // 只依赖必要的状态
  }, [hasMore, isLoading, loadDevices]);

  // 初始加载和搜索时刷新列表
  useEffect(() => {
    // 重置页码
    setCurrentPage(1)
    pageRef.current = 1
    // 加载第一页数据
    loadDevices(1, true)
  }, [searchQuery, loadDevices])

  // 无限滚动加载实现
  useEffect(() => {
    // 如果没有更多数据或者正在加载，不创建observer
    if (!hasMore || isLoading) return;
    
    let isMounted = true; // 追踪组件是否已挂载

    // 创建观察器观察加载点
    const observer = new IntersectionObserver(
      entries => {
        // 如果交叉了，且有更多数据，且当前不在加载状态，且组件仍然挂载
        if (entries[0].isIntersecting && hasMore && !isLoading && isMounted) {
          loadNextPage();
        }
      },
      { threshold: 0.5 }
    )

    // 只在客户端时观察节点
    if (typeof window !== 'undefined' && observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    // 清理观察器
    return () => {
      isMounted = false;
      observer.disconnect();
    }
  }, [hasMore, isLoading, loadNextPage])

  // 刷新设备列表
  const handleRefresh = () => {
    setCurrentPage(1)
    pageRef.current = 1
    loadDevices(1, true)
    toast({
      title: "刷新成功",
      description: "设备列表已更新",
    })
  }

  // 筛选设备
  const filteredDevices = devices.filter(device => {
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "online" && device.alive === 1) || 
      (statusFilter === "offline" && device.alive === 0)
    return matchesStatus
  })

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedDevices.length === 0) {
      toast({
        title: "请选择设备",
        description: "您需要选择至少一个设备来执行批量删除操作",
        variant: "destructive",
      })
      return
    }

    // 这里需要实现批量删除逻辑
    // 目前只是单个删除的循环
    let successCount = 0
    for (const deviceId of selectedDevices) {
      try {
        const response = await deleteDevice(deviceId)
        if (response.code === 200) {
          successCount++
        }
      } catch (error) {
        console.error(`删除设备 ${deviceId} 失败`, error)
      }
    }

    // 删除后刷新列表
    if (successCount > 0) {
      toast({
        title: "批量删除成功",
        description: `已删除 ${successCount} 个设备`,
      })
      setSelectedDevices([])
      handleRefresh()
    } else {
      toast({
        title: "批量删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 设备详情页跳转
  const handleDeviceClick = (deviceId: number) => {
    router.push(`/devices/${deviceId}`)
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">设备管理</h1>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDeviceOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加设备
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="text-sm text-gray-500">总设备数</div>
            <div className="text-xl font-bold text-blue-600">{stats.totalDevices}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-gray-500">在线设备</div>
            <div className="text-xl font-bold text-green-600">{stats.onlineDevices}</div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索设备IMEI/备注"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="全部状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="online">在线</SelectItem>
                    <SelectItem value="offline">离线</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedDevices.length === filteredDevices.length && filteredDevices.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDevices(filteredDevices.map((d) => d.id))
                      } else {
                        setSelectedDevices([])
                      }
                    }}
                  />
                  <span className="text-sm text-gray-500">全选</span>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                disabled={selectedDevices.length === 0}
              >
                删除
              </Button>
            </div>

            <div className="space-y-2">
              {filteredDevices.map((device) => (
                <Card
                  key={device.id}
                  className="p-3 hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={() => handleDeviceClick(device.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedDevices.includes(device.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDevices([...selectedDevices, device.id])
                        } else {
                          setSelectedDevices(selectedDevices.filter((id) => id !== device.id))
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium truncate">{device.memo}</div>
                        <Badge variant={device.status === "online" ? "default" : "secondary"} className="ml-2">
                          {device.status === "online" ? "在线" : "离线"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">IMEI: {device.imei}</div>
                      <div className="text-sm text-gray-500">微信号: {device.wechatId || "未绑定"}</div>
                      <div className="flex items-center justify-between mt-1 text-sm">
                        <span className="text-gray-500">好友数: {device.totalFriend}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* 加载更多观察点 */}
              <div ref={observerTarget} className="h-10 flex items-center justify-center">
                {isLoading && <div className="text-sm text-gray-500">加载中...</div>}
                {!hasMore && devices.length > 0 && <div className="text-sm text-gray-500">没有更多设备了</div>}
                {!hasMore && devices.length === 0 && <div className="text-sm text-gray-500">暂无设备</div>}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 添加设备对话框 */}
      <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加设备</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">设备名称</label>
              <Input placeholder="请输入设备名称" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">IMEI</label>
              <Input placeholder="请输入设备IMEI" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)}>
                取消
              </Button>
              <Button>添加</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

