"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle2, AlertCircle, Smartphone, Laptop } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 模拟设备数据
const mockDevices = Array.from({ length: 20 }).map((_, i) => ({
  id: `device-${i + 1}`,
  name: `设备 ${i + 1}`,
  model: i % 3 === 0 ? "iPhone 13" : i % 3 === 1 ? "Xiaomi 12" : "Huawei P40",
  status: i % 5 === 0 ? "offline" : i % 7 === 0 ? "busy" : "online",
  account: `wxid_${100 + i}`,
  type: i % 2 === 0 ? "mobile" : "emulator",
  group: i % 3 === 0 ? "常用设备" : i % 3 === 1 ? "备用设备" : "测试设备",
  successRate: Math.floor(70 + Math.random() * 30),
  restrictCount: Math.floor(Math.random() * 5),
}))

interface DeviceSelectionProps {
  onNext: () => void
  onPrevious: () => void
  initialSelectedDevices?: string[]
  onDevicesChange: (deviceIds: string[]) => void
}

export function DeviceSelection({
  onNext,
  onPrevious,
  initialSelectedDevices = [],
  onDevicesChange,
}: DeviceSelectionProps) {
  const [selectedDevices, setSelectedDevices] = useState<string[]>(initialSelectedDevices)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [groupFilter, setGroupFilter] = useState<string>("all")

  // 使用ref来跟踪是否已经通知了父组件初始选择
  const initialNotificationRef = useRef(false)

  const deviceGroups = Array.from(new Set(mockDevices.map((device) => device.group)))

  const filteredDevices = mockDevices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.account.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || device.status === statusFilter
    const matchesType = typeFilter === "all" || device.type === typeFilter
    const matchesGroup = groupFilter === "all" || device.group === groupFilter

    return matchesSearch && matchesStatus && matchesType && matchesGroup
  })

  // 只在选择变化时通知父组件，使用防抖
  useEffect(() => {
    if (!initialNotificationRef.current) {
      initialNotificationRef.current = true
      return
    }

    const timer = setTimeout(() => {
      onDevicesChange(selectedDevices)
    }, 300)

    return () => clearTimeout(timer)
  }, [selectedDevices, onDevicesChange])

  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices((prev) => (prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]))
  }

  const handleSelectAll = () => {
    setSelectedDevices(filteredDevices.map((device) => device.id))
  }

  const handleDeselectAll = () => {
    setSelectedDevices([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-gray-500"
      case "busy":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "在线"
      case "offline":
        return "离线"
      case "busy":
        return "繁忙"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索设备名称或账号"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="online">在线</SelectItem>
                  <SelectItem value="offline">离线</SelectItem>
                  <SelectItem value="busy">繁忙</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="设备类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="mobile">手机设备</SelectItem>
                  <SelectItem value="emulator">模拟器</SelectItem>
                </SelectContent>
              </Select>

              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="设备分组" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分组</SelectItem>
                  {deviceGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                已选择 <span className="font-medium text-blue-600">{selectedDevices.length}</span> 台设备
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  全选
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                  取消全选
                </Button>
              </div>
            </div>

            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-60 grid-cols-2">
                <TabsTrigger value="list">列表视图</TabsTrigger>
                <TabsTrigger value="grid">网格视图</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-2">
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="divide-y">
                    {filteredDevices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={device.id}
                            checked={selectedDevices.includes(device.id)}
                            onCheckedChange={() => handleDeviceToggle(device.id)}
                            disabled={device.status === "offline"}
                          />
                          {device.type === "mobile" ? (
                            <Smartphone className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Laptop className="h-5 w-5 text-gray-500" />
                          )}
                          <div>
                            <div className="font-medium">{device.name}</div>
                            <div className="text-sm text-gray-500">
                              {device.model} | {device.account}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-sm">
                            成功率:{" "}
                            <span className={device.successRate > 90 ? "text-green-600" : "text-yellow-600"}>
                              {device.successRate}%
                            </span>
                          </div>
                          <div className="text-sm">
                            限制次数:{" "}
                            <span className={device.restrictCount === 0 ? "text-green-600" : "text-red-600"}>
                              {device.restrictCount}
                            </span>
                          </div>
                          <Badge className={`${getStatusColor(device.status)} text-white`}>
                            {getStatusText(device.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {filteredDevices.length === 0 && (
                      <div className="p-4 text-center text-gray-500">没有找到符合条件的设备</div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="grid" className="mt-2">
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {filteredDevices.map((device) => (
                      <div
                        key={device.id}
                        className={`border rounded-md p-3 ${
                          selectedDevices.includes(device.id) ? "border-blue-500 bg-blue-50" : ""
                        } ${device.status === "offline" ? "opacity-60" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            {device.type === "mobile" ? (
                              <Smartphone className="h-4 w-4 text-gray-500 mr-1" />
                            ) : (
                              <Laptop className="h-4 w-4 text-gray-500 mr-1" />
                            )}
                            <span className="font-medium truncate">{device.name}</span>
                          </div>
                          <Badge className={`${getStatusColor(device.status)} text-white text-xs`}>
                            {getStatusText(device.status)}
                          </Badge>
                        </div>

                        <div className="text-xs text-gray-500 mb-2">{device.model}</div>
                        <div className="text-xs text-gray-500 mb-3">{device.account}</div>

                        <div className="flex justify-between text-xs mb-3">
                          <div>
                            成功率:{" "}
                            <span className={device.successRate > 90 ? "text-green-600" : "text-yellow-600"}>
                              {device.successRate}%
                            </span>
                          </div>
                          <div>
                            限制:{" "}
                            <span className={device.restrictCount === 0 ? "text-green-600" : "text-red-600"}>
                              {device.restrictCount}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant={selectedDevices.includes(device.id) ? "default" : "outline"}
                          size="sm"
                          className="w-full"
                          onClick={() => handleDeviceToggle(device.id)}
                          disabled={device.status === "offline"}
                        >
                          {selectedDevices.includes(device.id) ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" /> 已选择
                            </>
                          ) : (
                            "选择设备"
                          )}
                        </Button>
                      </div>
                    ))}

                    {filteredDevices.length === 0 && (
                      <div className="col-span-full p-4 text-center text-gray-500">没有找到符合条件的设备</div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {selectedDevices.length === 0 && (
              <div className="flex items-center p-3 bg-yellow-50 rounded-md text-yellow-800">
                <AlertCircle className="h-4 w-4 mr-2" />
                请至少选择一台设备来执行建群任务
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          上一步
        </Button>
        <Button onClick={onNext} className="bg-blue-500 hover:bg-blue-600" disabled={selectedDevices.length === 0}>
          下一步
        </Button>
      </div>
    </div>
  )
}

