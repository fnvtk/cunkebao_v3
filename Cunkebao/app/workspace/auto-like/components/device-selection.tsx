"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, RefreshCw, Smartphone, Database, Users } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Device {
  id: string
  name: string
  status: "online" | "offline"
  wechatId: string
}

interface DatabaseItem {
  id: string
  name: string
  description: string
  count: number
}

interface AudienceGroup {
  id: string
  name: string
  count: number
  description: string
}

export interface DeviceSelectionData {
  selectedDevices: string[]
  selectedDatabase: string
  selectedAudience: string
}

interface DeviceSelectionProps {
  initialData?: Partial<DeviceSelectionData>
  onSave: (data: DeviceSelectionData) => void
  onBack: () => void
}

export function DeviceSelection({ initialData, onSave, onBack }: DeviceSelectionProps) {
  const [devices, setDevices] = useState<Device[]>([])
  const [databases, setDatabases] = useState<DatabaseItem[]>([])
  const [audienceGroups, setAudienceGroups] = useState<AudienceGroup[]>([])
  const [selectedDevices, setSelectedDevices] = useState<string[]>(initialData?.selectedDevices || [])
  const [selectedDatabase, setSelectedDatabase] = useState<string>(initialData?.selectedDatabase || "")
  const [selectedAudience, setSelectedAudience] = useState<string>(initialData?.selectedAudience || "")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // 模拟获取设备数据
  useEffect(() => {
    // 模拟设备数据
    const mockDevices: Device[] = Array.from({ length: 10 }, (_, i) => ({
      id: `device-${i + 1}`,
      name: `设备 ${i + 1}`,
      status: Math.random() > 0.3 ? "online" : "offline",
      wechatId: `wxid_${Math.random().toString(36).substr(2, 8)}`,
    }))
    setDevices(mockDevices)

    // 模拟数据库数据
    const mockDatabases: DatabaseItem[] = [
      {
        id: "db-1",
        name: "默认数据库",
        description: "系统默认的数据库",
        count: 1250,
      },
      {
        id: "db-2",
        name: "高净值客户",
        description: "高消费能力的客户群体",
        count: 450,
      },
      {
        id: "db-3",
        name: "潜在客户",
        description: "有购买意向的潜在客户",
        count: 780,
      },
    ]
    setDatabases(mockDatabases)

    // 模拟目标人群数据
    const mockAudienceGroups: AudienceGroup[] = [
      {
        id: "audience-1",
        name: "全部好友",
        count: 1250,
        description: "所有微信好友",
      },
      {
        id: "audience-2",
        name: "高频互动好友",
        count: 320,
        description: "经常互动的好友",
      },
      {
        id: "audience-3",
        name: "潜在客户",
        count: 450,
        description: "有购买意向的好友",
      },
      {
        id: "audience-4",
        name: "VIP客户",
        description: "已成交的VIP客户",
      },
    ]
    setAudienceGroups(mockAudienceGroups)

    // 设置默认选中的数据库和目标人群
    if (!initialData?.selectedDatabase) {
      setSelectedDatabase("db-1")
    }
    if (!initialData?.selectedAudience) {
      setSelectedAudience("audience-1")
    }
  }, [initialData?.selectedDatabase, initialData?.selectedAudience])

  // 过滤设备
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.wechatId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "selected" && selectedDevices.includes(device.id)) ||
      (activeTab === "online" && device.status === "online") ||
      (activeTab === "offline" && device.status === "offline")

    return matchesSearch && matchesTab
  })

  // 选择/取消选择单个设备
  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevices(
      selectedDevices.includes(deviceId)
        ? selectedDevices.filter((id) => id !== deviceId)
        : [...selectedDevices, deviceId],
    )
  }

  // 保存选择的设备
  const handleSave = () => {
    onSave({
      selectedDevices,
      selectedDatabase,
      selectedAudience,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>选择执行点赞任务的设备</CardTitle>
          <CardDescription>选择要执行自动点赞任务的设备、数据库和目标人群</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 设备筛选和搜索 */}
          <div className="space-y-4">
            <Label className="font-medium">选择设备</Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索设备名称/微信号"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* 设备分类标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">全部设备</TabsTrigger>
                <TabsTrigger value="selected">已选择 ({selectedDevices.length})</TabsTrigger>
                <TabsTrigger value="online">在线设备</TabsTrigger>
                <TabsTrigger value="offline">离线设备</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 设备列表 */}
            <div className="space-y-3">
              {filteredDevices.map((device) => (
                <Card
                  key={device.id}
                  className={`p-4 hover:shadow-md transition-shadow ${
                    selectedDevices.includes(device.id) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedDevices.includes(device.id)}
                      onCheckedChange={() => handleDeviceSelect(device.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium truncate flex items-center">
                          <Smartphone className="h-4 w-4 mr-1 text-muted-foreground" />
                          {device.name}
                        </div>
                        <Badge variant={device.status === "online" ? "success" : "secondary"} className="text-xs">
                          {device.status === "online" ? "在线" : "离线"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">微信号: {device.wechatId}</div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredDevices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">未找到符合条件的设备</div>
              )}
            </div>
          </div>

          {/* 数据库选择 */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <Label className="font-medium">选择数据库</Label>
            </div>
            <RadioGroup value={selectedDatabase} onValueChange={setSelectedDatabase} className="space-y-3">
              {databases.map((db) => (
                <div key={db.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={db.id} id={db.id} />
                  <div className="flex-1">
                    <Label htmlFor={db.id} className="font-medium">
                      {db.name}
                      <Badge variant="outline" className="ml-2">
                        {db.count}条数据
                      </Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground">{db.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 目标人群选择 */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <Label className="font-medium">选择目标人群</Label>
            </div>
            <RadioGroup value={selectedAudience} onValueChange={setSelectedAudience} className="space-y-3">
              {audienceGroups.map((group) => (
                <div key={group.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={group.id} id={group.id} />
                  <div className="flex-1">
                    <Label htmlFor={group.id} className="font-medium">
                      {group.name}
                      <Badge variant="outline" className="ml-2">
                        {group.count}人
                      </Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          返回上一步
        </Button>
        <Button onClick={handleSave} disabled={selectedDevices.length === 0}>
          完成设置
        </Button>
      </div>
    </div>
  )
}

