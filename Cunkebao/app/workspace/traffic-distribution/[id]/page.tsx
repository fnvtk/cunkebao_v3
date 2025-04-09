"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Settings, Users, BarChart3, Download, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 模拟数据
const planDetails = {
  id: "1",
  name: "抖音直播引流计划",
  description: "从抖音直播间获取的潜在客户流量分发",
  status: "active",
  source: "douyin",
  sourceIcon: "🎬",
  distributionMethod: "even",
  targetGroups: ["新客户", "潜在客户"],
  devices: ["iPhone 13", "华为 P40", "小米 11"],
  totalUsers: 1250,
  dailyAverage: 85,
  weeklyData: [42, 56, 78, 64, 85, 92, 76],
  createdAt: "2024-03-10T08:30:00Z",
  lastUpdated: "2024-03-18T10:30:00Z",
  rules: {
    maxPerDay: 50,
    timeRestriction: "custom",
    customTimeStart: "09:00",
    customTimeEnd: "21:00",
  },
}

// 模拟流量数据
const trafficData = [
  { id: "1", name: "张三", source: "抖音直播", time: "2024-03-20 09:45", target: "新客户", device: "iPhone 13" },
  { id: "2", name: "李四", source: "抖音评论", time: "2024-03-20 10:12", target: "潜在客户", device: "华为 P40" },
  { id: "3", name: "王五", source: "抖音私信", time: "2024-03-20 11:30", target: "新客户", device: "小米 11" },
  { id: "4", name: "赵六", source: "抖音直播", time: "2024-03-20 13:15", target: "潜在客户", device: "iPhone 13" },
  { id: "5", name: "孙七", source: "抖音评论", time: "2024-03-20 14:22", target: "新客户", device: "华为 P40" },
]

export default function TrafficDistributionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isActive, setIsActive] = useState(planDetails.status === "active")
  const [timeRange, setTimeRange] = useState("7days")

  return (
    <div className="flex-1 bg-white min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">{planDetails.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center mr-4">
              <span className="mr-2 text-sm">状态:</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span className="ml-2 text-sm">{isActive ? "进行中" : "已暂停"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/workspace/traffic-distribution/${params.id}/edit`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              编辑
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="traffic">流量记录</TabsTrigger>
            <TabsTrigger value="rules">分发规则</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 数据卡片 */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">总流量</p>
                      <p className="text-2xl font-bold text-blue-600">{planDetails.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">日均获取</p>
                      <p className="text-2xl font-bold text-green-600">{planDetails.dailyAverage}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 图表 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>流量趋势</CardTitle>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="选择时间范围" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">近7天</SelectItem>
                      <SelectItem value="30days">近30天</SelectItem>
                      <SelectItem value="90days">近90天</SelectItem>
                      <SelectItem value="custom">自定义</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  {/* 这里可以放置实际的图表组件 */}
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">流量趋势图表</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">流量来源</p>
                    <p className="font-medium">{planDetails.sourceIcon} 抖音</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">分发方式</p>
                    <p className="font-medium">
                      {planDetails.distributionMethod === "even"
                        ? "均匀分发"
                        : planDetails.distributionMethod === "priority"
                          ? "优先级分发"
                          : "比例分发"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">创建时间</p>
                    <p className="font-medium">{new Date(planDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">最近更新</p>
                    <p className="font-medium">{new Date(planDetails.lastUpdated).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">目标人群</p>
                  <div className="flex flex-wrap gap-2">
                    {planDetails.targetGroups.map((group) => (
                      <Badge key={group} variant="outline">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">目标设备</p>
                  <div className="flex flex-wrap gap-2">
                    {planDetails.devices.map((device) => (
                      <Badge key={device} variant="outline">
                        {device}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 流量记录标签页 */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">流量记录</h2>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出数据
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">用户</th>
                        <th className="text-left p-3">来源</th>
                        <th className="text-left p-3">时间</th>
                        <th className="text-left p-3">目标</th>
                        <th className="text-left p-3">设备</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trafficData.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{item.name}</td>
                          <td className="p-3">{item.source}</td>
                          <td className="p-3">{item.time}</td>
                          <td className="p-3">{item.target}</td>
                          <td className="p-3">{item.device}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button variant="outline">加载更多</Button>
            </div>
          </TabsContent>

          {/* 分发规则标签页 */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>分发规则</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">分发方式</p>
                    <p className="font-medium">
                      {planDetails.distributionMethod === "even"
                        ? "均匀分发"
                        : planDetails.distributionMethod === "priority"
                          ? "优先级分发"
                          : "比例分发"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">每日最大分发量</p>
                    <p className="font-medium">{planDetails.rules.maxPerDay} 人/天</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">时间限制</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {planDetails.rules.timeRestriction === "all" ? (
                      <p className="font-medium">全天分发</p>
                    ) : (
                      <p className="font-medium">
                        {planDetails.rules.customTimeStart} - {planDetails.rules.customTimeEnd}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">目标人群优先级</p>
                  {planDetails.distributionMethod === "priority" ? (
                    <div className="space-y-2">
                      {planDetails.targetGroups.map((group, index) => (
                        <div key={group} className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {index + 1}
                          </Badge>
                          <span>{group}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">当前分发方式不使用优先级</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">分发比例设置</p>
                  {planDetails.distributionMethod === "ratio" ? (
                    <div className="space-y-2">
                      {planDetails.targetGroups.map((group) => (
                        <div key={group} className="flex items-center justify-between">
                          <span>{group}</span>
                          <Badge>{Math.floor(100 / planDetails.targetGroups.length)}%</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">当前分发方式不使用比例设置</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

