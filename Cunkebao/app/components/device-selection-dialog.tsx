"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImeiDisplay } from "@/components/ImeiDisplay"

interface WechatAccount {
  wechatId: string
  nickname: string
  remainingAdds: number
  maxDailyAdds: number
  todayAdded: number
}

interface Device {
  id: string
  imei: string
  name: string
  status: "online" | "offline"
  wechatAccounts: WechatAccount[]
  usedInPlans: number
  tags?: string[]
}

interface DeviceSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDevices: string[]
  onSelect: (deviceIds: string[]) => void
  excludeUsedDevices?: boolean
}

export function DeviceSelectionDialog({
  open,
  onOpenChange,
  selectedDevices,
  onSelect,
  excludeUsedDevices = false,
}: DeviceSelectionDialogProps) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // 初始化已选设备
  useEffect(() => {
    if (open) {
      setSelectedDeviceIds(selectedDevices)
    }
  }, [open, selectedDevices])

  // 模拟获取设备数据
  useEffect(() => {
    if (!open) return

    const fetchDevices = async () => {
      setLoading(true)
      try {
        // 模拟API请求
        await new Promise((resolve) => setTimeout(resolve, 800))

        // 生成模拟数据
        const deviceTags = ["高性能", "稳定", "新设备", "已配置", "测试中", "备用"]

        const mockDevices: Device[] = Array.from({ length: 30 }, (_, i) => {
          // 随机生成1-3个标签
          const tags = Array.from(
            { length: Math.floor(Math.random() * 3) + 1 },
            () => deviceTags[Math.floor(Math.random() * deviceTags.length)],
          )

          // 确保标签唯一
          const uniqueTags = Array.from(new Set(tags))

          return {
            id: `device-${i + 1}`,
            imei: `IMEI-${Math.random().toString(36).substr(2, 9)}`,
            name: `设备 ${i + 1}`,
            status: Math.random() > 0.3 ? "online" : "offline",
            wechatAccounts: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (_, j) => ({
              wechatId: `wxid_${Math.random().toString(36).substr(2, 8)}`,
              nickname: `微信号 ${j + 1}`,
              remainingAdds: Math.floor(Math.random() * 10) + 5,
              maxDailyAdds: 20,
              todayAdded: Math.floor(Math.random() * 15),
            })),
            usedInPlans: Math.floor(Math.random() * 3),
            tags: uniqueTags,
          }
        })

        setDevices(mockDevices)
      } catch (error) {
        console.error("Failed to fetch devices:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [open])

  // 过滤设备
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      searchQuery === "" ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.imei.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.wechatAccounts.some(
        (account) =>
          account.wechatId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          account.nickname.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    const matchesStatus = statusFilter === "all" || device.status === statusFilter

    const matchesUsage = !excludeUsedDevices || device.usedInPlans === 0

    const matchesTag = tagFilter === "all" || (device.tags && device.tags.includes(tagFilter))

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "online" && device.status === "online") ||
      (activeTab === "offline" && device.status === "offline") ||
      (activeTab === "unused" && device.usedInPlans === 0)

    return matchesSearch && matchesStatus && matchesUsage && matchesTag && matchesTab
  })

  // 处理选择设备
  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId],
    )
  }

  // 处理全选
  const handleSelectAll = () => {
    if (selectedDeviceIds.length === filteredDevices.length) {
      setSelectedDeviceIds([])
    } else {
      setSelectedDeviceIds(filteredDevices.map((device) => device.id))
    }
  }

  // 处理确认选择
  const handleConfirm = () => {
    onSelect(selectedDeviceIds)
    onOpenChange(false)
  }

  // 获取所有标签选项
  const allTags = Array.from(new Set(devices.flatMap((device) => device.tags || [])))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>选择设备</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 搜索和筛选区域 */}
          <div className="space-y-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索设备IMEI/备注/微信号"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* 分类标签页 */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="online">在线</TabsTrigger>
                <TabsTrigger value="offline">离线</TabsTrigger>
                <TabsTrigger value="unused">未使用</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 筛选器 */}
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="online">在线</SelectItem>
                  <SelectItem value="offline">离线</SelectItem>
                </SelectContent>
              </Select>

              {allTags.length > 0 && (
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="标签" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部标签</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button variant="outline" className="ml-auto" onClick={handleSelectAll}>
                {selectedDeviceIds.length === filteredDevices.length && filteredDevices.length > 0
                  ? "取消全选"
                  : "全选"}
              </Button>
            </div>
          </div>

          {/* 设备列表 */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery || statusFilter !== "all" || tagFilter !== "all" || activeTab !== "all"
                  ? "没有符合条件的设备"
                  : "暂无设备数据"}
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {filteredDevices.map((device) => (
                  <Card
                    key={device.id}
                    className={`p-3 hover:shadow-md transition-shadow ${
                      selectedDeviceIds.includes(device.id) ? "border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedDeviceIds.includes(device.id)}
                        onCheckedChange={() => handleSelectDevice(device.id)}
                        id={`device-${device.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor={`device-${device.id}`} className="font-medium truncate cursor-pointer">
                            {device.name}
                          </label>
                          <div
                            className={`px-2 py-1 rounded-full text-xs ${
                              device.status === "online" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {device.status === "online" ? "在线" : "离线"}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <span className="mr-1">IMEI:</span>
                          <ImeiDisplay imei={device.imei} containerWidth={160} />
                        </div>

                        {/* 微信账号信息 */}
                        <div className="mt-2 space-y-2">
                          {device.wechatAccounts.map((account) => (
                            <div key={account.wechatId} className="bg-gray-50 rounded-lg p-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{account.nickname}</span>
                                <span className="text-gray-500">{account.wechatId}</span>
                              </div>
                              <div className="mt-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>今日可添加：{account.remainingAdds}</span>
                                  <span className="text-sm text-gray-500">
                                    {account.todayAdded}/{account.maxDailyAdds}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 标签展示 */}
                        {device.tags && device.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {device.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {device.usedInPlans > 0 && (
                          <div className="text-sm text-orange-500 mt-2">已用于 {device.usedInPlans} 个计划</div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm">
            已选择 <span className="font-medium text-primary">{selectedDeviceIds.length}</span> 个设备
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleConfirm}>确认</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

