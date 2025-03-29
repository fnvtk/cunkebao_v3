"use client"

import { useState, useEffect } from "react"
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

interface Device {
  id: string
  imei: string
  name: string
  remark: string
  status: "online" | "offline"
  battery: number
  wechatId: string
  friendCount: number
  todayAdded: number
  messageCount: number
  lastActive: string
  addFriendStatus: "normal" | "abnormal"
  avatar?: string
}

export default function DevicesPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [stats, setStats] = useState({
    totalDevices: 42,
    onlineDevices: 35,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const devicesPerPage = 10

  useEffect(() => {
    // 模拟API调用
    const fetchDevices = async () => {
      const mockDevices = Array.from({ length: 42 }, (_, i) => ({
        id: `device-${i + 1}`,
        imei: `sd${123123 + i}`,
        name: `设备 ${i + 1}`,
        remark: `备注 ${i + 1}`,
        status: Math.random() > 0.2 ? "online" : "offline",
        battery: Math.floor(Math.random() * 100),
        wechatId: `wxid_${Math.random().toString(36).substr(2, 8)}`,
        friendCount: Math.floor(Math.random() * 1000),
        todayAdded: Math.floor(Math.random() * 50),
        messageCount: Math.floor(Math.random() * 200),
        lastActive: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
        addFriendStatus: Math.random() > 0.2 ? "normal" : "abnormal",
        avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kYhfQsrrByfbzefv6MEV7W7ogz0IRt.png",
      }))
      setDevices(mockDevices)
    }

    fetchDevices()
  }, [])

  const handleRefresh = () => {
    toast({
      title: "刷新成功",
      description: "设备列表已更新",
    })
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

  const handleBatchDelete = () => {
    if (selectedDevices.length === 0) {
      toast({
        title: "请选择设备",
        description: "您需要选择至少一个设备来执行批量删除操作",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "批量删除成功",
      description: `已删除 ${selectedDevices.length} 个设备`,
    })
    setSelectedDevices([])
  }

  const handleDeviceClick = (deviceId: string) => {
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
                    checked={selectedDevices.length === paginatedDevices.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDevices(paginatedDevices.map((d) => d.id))
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
              {paginatedDevices.map((device) => (
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
                        <div className="font-medium truncate">{device.name}</div>
                        <Badge variant={device.status === "online" ? "success" : "secondary"} className="ml-2">
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
              ))}
            </div>

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
          </div>
        </Card>
      </div>

      <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
        <DialogContent className="sm:max-w-[390px]">
          <DialogHeader>
            <DialogTitle>添加设备</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 text-center">
              请使用设备扫描二维码进行添加
              <br />
              或手动输入设备ID
            </p>
            <Input placeholder="请输入设备ID" className="max-w-[280px]" />
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)}>
                取消
              </Button>
              <Button>确认添加</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

