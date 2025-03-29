"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Filter, Search, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import type { Device } from "@/types/device"

export default function ScenarioDevicesPage({ params }: { params: { channel: string } }) {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const devicesPerPage = 10
  const maxDevices = 5

  // 获取渠道中文名称
  const getChannelName = (channel: string) => {
    const channelMap: Record<string, string> = {
      douyin: "抖音",
      kuaishou: "快手",
      xiaohongshu: "小红书",
      weibo: "微博",
    }
    return channelMap[channel] || channel
  }

  const channelName = getChannelName(params.channel)

  useEffect(() => {
    // 模拟API调用
    const fetchDevices = async () => {
      const mockDevices = Array.from({ length: 15 }, (_, i) => ({
        id: `device-${i + 1}`,
        imei: `sd${123123 + i}`,
        name: `设备 ${i + 1}`,
        remark: `${channelName}获客设备 ${i + 1}`,
        status: Math.random() > 0.2 ? "online" : "offline",
        battery: Math.floor(Math.random() * 100),
        wechatId: `wxid_${Math.random().toString(36).substr(2, 8)}`,
        friendCount: Math.floor(Math.random() * 1000),
        todayAdded: Math.floor(Math.random() * 50),
        messageCount: Math.floor(Math.random() * 200),
        lastActive: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
        addFriendStatus: Math.random() > 0.2 ? "normal" : "abnormal",
      }))
      setDevices(mockDevices)
    }

    fetchDevices()
  }, [channelName])

  const handleRefresh = () => {
    toast({
      title: "刷新成功",
      description: "设备列表已更新",
    })
  }

  const handleSelectAll = () => {
    if (selectedDevices.length === devices.length || selectedDevices.length === maxDevices) {
      setSelectedDevices([])
    } else {
      const newSelection = devices.slice(0, maxDevices).map((d) => d.id)
      setSelectedDevices(newSelection)
    }
  }

  const handleDeviceSelect = (deviceId: string) => {
    if (selectedDevices.includes(deviceId)) {
      setSelectedDevices(selectedDevices.filter((id) => id !== deviceId))
    } else {
      if (selectedDevices.length >= maxDevices) {
        toast({
          title: "选择超出限制",
          description: `最多可选择${maxDevices}个设备`,
          variant: "destructive",
        })
        return
      }
      setSelectedDevices([...selectedDevices, deviceId])
    }
  }

  const handleSave = async () => {
    try {
      // 这里应该是实际的API调用来保存选中的设备
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "保存成功",
        description: "已更新计划设备",
      })
      router.back()
    } catch (error) {
      toast({
        title: "保存失败",
        description: "更新设备失败，请重试",
        variant: "destructive",
      })
    }
  }

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.imei.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.wechatId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || device.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const paginatedDevices = filteredDevices.slice((currentPage - 1) * devicesPerPage, currentPage * devicesPerPage)

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-blue-600">{channelName}设备</h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
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
              </div>
              <div className="text-sm text-gray-500">
                已选择 {selectedDevices.length}/{maxDevices} 个设备
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={
                  selectedDevices.length > 0 &&
                  (selectedDevices.length === devices.length || selectedDevices.length === maxDevices)
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">全选</span>
            </div>

            <div className="space-y-2">
              {paginatedDevices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无设备</div>
              ) : (
                paginatedDevices.map((device) => (
                  <Card
                    key={device.id}
                    className={`p-3 hover:shadow-md transition-shadow cursor-pointer ${
                      selectedDevices.includes(device.id) ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleDeviceSelect(device.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedDevices.includes(device.id)}
                        className="mt-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeviceSelect(device.id)
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium truncate">{device.name}</div>
                          <Badge variant={device.status === "online" ? "success" : "secondary"}>
                            {device.status === "online" ? "在线" : "离线"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">IMEI: {device.imei}</div>
                        <div className="text-sm text-gray-500">微信号: {device.wechatId}</div>
                        <div className="flex items-center justify-between mt-1 text-sm">
                          <span className="text-gray-500">好友数: {device.friendCount}</span>
                          <span className="text-gray-500">今日新增: +{device.todayAdded}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {filteredDevices.length > devicesPerPage && (
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <span className="text-sm text-gray-500">
                  第 {currentPage} / {Math.ceil(filteredDevices.length / devicesPerPage)} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(Math.ceil(filteredDevices.length / devicesPerPage), prev + 1))
                  }
                  disabled={currentPage === Math.ceil(filteredDevices.length / devicesPerPage)}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={selectedDevices.length === 0}>
            保存 ({selectedDevices.length})
          </Button>
        </div>
      </div>
    </div>
  )
}

