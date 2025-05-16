"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Battery, Smartphone, MessageCircle, Users, Clock, Search, Power, RefreshCcw, Settings, AlertTriangle } from "lucide-react"
import { ImeiDisplay } from "@/components/ImeiDisplay"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface Device {
  id: string
  imei: string
  name: string
  status: "online" | "offline"
  battery: number
  wechatId: string
  friendCount: number
  todayAdded: number
  messageCount: number
  lastActive: string
  addFriendStatus: "normal" | "abnormal"
}

interface DeviceGridProps {
  devices: Device[]
  selectable?: boolean
  selectedDevices?: string[]
  onSelect?: (deviceIds: string[]) => void
  itemsPerRow?: number
}

export function DeviceGrid({
  devices,
  selectable = false,
  selectedDevices = [],
  onSelect,
  itemsPerRow = 2,
}: DeviceGridProps) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDevices, setFilteredDevices] = useState(devices)

  useEffect(() => {
    const filtered = devices.filter(
      (device) =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.imei.includes(searchTerm) ||
        device.wechatId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDevices(filtered)
  }, [searchTerm, devices])

  const handleSelectAll = () => {
    if (selectedDevices.length === filteredDevices.length) {
      onSelect?.([])
    } else {
      onSelect?.(filteredDevices.map((d) => d.id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="搜索设备..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {selectable && (
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedDevices.length === filteredDevices.length && filteredDevices.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">全选</span>
            </div>
            <span className="text-sm text-gray-500 ml-4">已选择 {selectedDevices.length} 个设备</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => (
          <Card
            key={device.id}
            className={`p-4 hover:shadow-md transition-all cursor-pointer ${
              selectedDevices.includes(device.id) ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => {
              if (selectable) {
                const newSelection = selectedDevices.includes(device.id)
                  ? selectedDevices.filter((id) => id !== device.id)
                  : [...selectedDevices, device.id]
                onSelect?.(newSelection)
              } else {
                setSelectedDevice(device)
              }
            }}
          >
            <div className="flex items-start space-x-3">
              {selectable && (
                <Checkbox
                  checked={selectedDevices.includes(device.id)}
                  className="mt-1"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="font-medium flex items-center">
                      <span>{device.name}</span>
                      {device.addFriendStatus === "abnormal" && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          加友异常
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-0 right-0">
                      <Badge 
                        variant={device.status === "online" ? "default" : "secondary"}
                        className={`${
                          device.status === "online" 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            device.status === "online" ? "bg-green-500" : "bg-gray-500"
                          }`} />
                          <span>{device.status === "online" ? "在线" : "离线"}</span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                    <Battery className={`w-4 h-4 ${
                      device.battery < 20 
                        ? "text-red-500" 
                        : device.battery < 50 
                        ? "text-yellow-500" 
                        : "text-green-500"
                    }`} />
                    <span className={`${
                      device.battery < 20 
                        ? "text-red-700" 
                        : device.battery < 50 
                        ? "text-yellow-700" 
                        : "text-green-700"
                    }`}>{device.battery}%</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-700">{device.friendCount}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                    <MessageCircle className="w-4 h-4 text-purple-500" />
                    <span className="text-purple-700">{device.messageCount}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-indigo-700">+{device.todayAdded}</span>
                  </div>
                </div>

                <div className="text-sm space-y-1.5 mt-3">
                  <div className="flex items-center text-gray-600">
                    <span className="w-16">IMEI:</span>
                    <ImeiDisplay imei={device.imei} containerWidth={120} />
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-16">微信号:</span>
                    <span className="font-mono">{device.wechatId}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>设备详情</DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    selectedDevice.status === "online" 
                      ? "bg-green-100" 
                      : "bg-gray-100"
                  }`}>
                    <Smartphone className={`w-6 h-6 ${
                      selectedDevice.status === "online"
                        ? "text-green-700"
                        : "text-gray-700"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center space-x-2">
                      <span>{selectedDevice.name}</span>
                      <Badge 
                        variant={selectedDevice.status === "online" ? "default" : "secondary"}
                        className={`${
                          selectedDevice.status === "online" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedDevice.status === "online" ? "bg-green-500" : "bg-gray-500"
                          }`} />
                          <span>{selectedDevice.status === "online" ? "在线" : "离线"}</span>
                        </div>
                      </Badge>
                    </h3>
                    <div className="text-sm text-gray-500 mt-1 space-x-4">
                      <span>IMEI: <ImeiDisplay imei={selectedDevice.imei} containerWidth={160} /></span>
                      <span>微信号: {selectedDevice.wechatId}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="space-x-1">
                    <RefreshCcw className="w-4 h-4" />
                    <span>刷新</span>
                  </Button>
                  <Button variant="outline" size="sm" className="space-x-1">
                    <Power className="w-4 h-4" />
                    <span>重启</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="status" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="status">状态信息</TabsTrigger>
                  <TabsTrigger value="stats">统计数据</TabsTrigger>
                  <TabsTrigger value="tasks">任务管理</TabsTrigger>
                  <TabsTrigger value="logs">运行日志</TabsTrigger>
                </TabsList>
                <TabsContent value="status" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1 bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">电池电量</div>
                      <div className="flex items-center space-x-2">
                        <Battery className={`w-5 h-5 ${
                          selectedDevice.battery < 20 
                            ? "text-red-500" 
                            : selectedDevice.battery < 50 
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`} />
                        <span className={`font-medium ${
                          selectedDevice.battery < 20 
                            ? "text-red-700" 
                            : selectedDevice.battery < 50 
                            ? "text-yellow-700"
                            : "text-green-700"
                        }`}>{selectedDevice.battery}%</span>
                      </div>
                    </div>
                    <div className="space-y-1 bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">好友数量</div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-blue-700">{selectedDevice.friendCount}</span>
                      </div>
                    </div>
                    <div className="space-y-1 bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">今日新增</div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-700">+{selectedDevice.todayAdded}</span>
                      </div>
                    </div>
                    <div className="space-y-1 bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">消息数量</div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-purple-700">{selectedDevice.messageCount}</span>
                      </div>
                    </div>
                  </div>

                  {selectedDevice.addFriendStatus === "abnormal" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center space-x-2 text-red-800">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">加友异常警告</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">
                        该设备当前存在加友异常情况，请检查设备状态和相关配置。
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="stats">
                  <div className="text-center text-gray-500 py-8">
                    统计数据开发中...
                  </div>
                </TabsContent>
                <TabsContent value="tasks">
                  <div className="text-center text-gray-500 py-8">
                    任务管理开发中...
                  </div>
                </TabsContent>
                <TabsContent value="logs">
                  <div className="text-center text-gray-500 py-8">
                    运行日志开发中...
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

