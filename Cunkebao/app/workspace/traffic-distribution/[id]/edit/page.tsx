"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Info, Users, Target, Settings, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { TrafficPoolSelector } from "@/app/components/traffic-pool-selector"

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
    userFilters: [],
    excludeTags: [],
  },
  selectedUsers: [],
}

export default function EditTrafficDistributionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    source: "",
    distributionMethod: "even", // even, priority, ratio
    targetGroups: [] as string[],
    targetDevices: [] as string[],
    autoTag: true,
    activeStatus: true,
    priorityOrder: [] as string[],
    ratioSettings: {} as Record<string, number>,
    rules: {
      maxPerDay: 50,
      timeRestriction: "all", // all, custom
      customTimeStart: "09:00",
      customTimeEnd: "21:00",
      userFilters: [] as string[],
      excludeTags: [] as string[],
    },
    selectedUsers: [],
    isPoolSelectorOpen: false,
  })

  // 加载计划详情
  useEffect(() => {
    // 模拟API请求
    setFormData({
      name: planDetails.name,
      description: planDetails.description || "",
      source: planDetails.source,
      distributionMethod: planDetails.distributionMethod,
      targetGroups: planDetails.targetGroups,
      targetDevices: planDetails.devices,
      autoTag: true,
      activeStatus: planDetails.status === "active",
      priorityOrder: planDetails.targetGroups,
      ratioSettings: planDetails.targetGroups.reduce(
        (acc, group, index, arr) => {
          acc[group] = Math.floor(100 / arr.length)
          return acc
        },
        {} as Record<string, number>,
      ),
      rules: planDetails.rules,
      selectedUsers: planDetails.selectedUsers || [],
      isPoolSelectorOpen: false,
    })
  }, [params.id])

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value,
          },
        }
      }
      return { ...prev, [field]: value }
    })
  }

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    } else {
      router.back()
    }
  }

  const handleSubmit = () => {
    // 这里处理表单提交逻辑
    console.log("提交表单数据:", formData)
    router.push(`/workspace/traffic-distribution/${params.id}`)
  }

  const isStep1Valid = formData.name && formData.source
  const isStep2Valid = formData.targetGroups.length > 0 || formData.targetDevices.length > 0
  const isStep3Valid = true // 规则设置可以有默认值

  return (
    <div className="flex-1 bg-white min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">编辑流量分发</h1>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto">
        {/* 步骤指示器 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: "基本信息", icon: <Info className="h-4 w-4" /> },
              { step: 2, title: "目标设置", icon: <Target className="h-4 w-4" /> },
              { step: 3, title: "规则配置", icon: <Settings className="h-4 w-4" /> },
            ].map(({ step, title, icon }) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step === currentStep
                      ? "bg-blue-600 text-white"
                      : step < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step < currentStep ? "✓" : icon}
                </div>
                <span className="text-xs mt-1">{title}</span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200"></div>
            <div
              className="absolute top-0 left-0 h-1 bg-blue-600 transition-all"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 步骤1：基本信息 */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>设置流量分发计划的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  计划名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="输入分发计划名称"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">计划描述</Label>
                <Textarea
                  id="description"
                  placeholder="简要描述该分发计划的目标和用途"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">
                  流量来源 <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.source} onValueChange={(value) => updateFormData("source", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择流量来源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="douyin">抖音</SelectItem>
                    <SelectItem value="xiaohongshu">小红书</SelectItem>
                    <SelectItem value="wechat">微信</SelectItem>
                    <SelectItem value="weibo">微博</SelectItem>
                    <SelectItem value="other">其他来源</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleNext} disabled={!isStep1Valid}>
                  下一步
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤2：目标设置 */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>目标设置</CardTitle>
              <CardDescription>选择流量分发的目标人群或设备</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="groups">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="groups">目标人群</TabsTrigger>
                  <TabsTrigger value="devices">目标设备</TabsTrigger>
                </TabsList>
                <TabsContent value="groups" className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {["新客户", "潜在客户", "老客户", "会员", "高价值用户", "流失用户"].map((group) => (
                        <Card
                          key={group}
                          className={`cursor-pointer hover:border-blue-400 transition-colors ${
                            formData.targetGroups.includes(group) ? "border-blue-500 bg-blue-50" : ""
                          }`}
                          onClick={() => {
                            const newGroups = formData.targetGroups.includes(group)
                              ? formData.targetGroups.filter((g) => g !== group)
                              : [...formData.targetGroups, group]
                            updateFormData("targetGroups", newGroups)
                          }}
                        >
                          <CardContent className="p-3 text-center">{group}</CardContent>
                        </Card>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">选择需要分发流量的目标人群，可多选</p>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => updateFormData("isPoolSelectorOpen", true)}
                        className="w-full"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        从流量池选择特定用户
                      </Button>

                      {formData.selectedUsers.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">已选择 {formData.selectedUsers.length} 个用户</p>
                          <div className="flex flex-wrap gap-1">
                            {formData.selectedUsers.slice(0, 3).map((user: any) => (
                              <Badge key={user.id} variant="secondary">
                                {user.nickname}
                              </Badge>
                            ))}
                            {formData.selectedUsers.length > 3 && (
                              <Badge variant="secondary">+{formData.selectedUsers.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="devices" className="pt-4">
                  <div className="space-y-4">
                    <p className="text-sm">选择需要接收流量的设备</p>
                    <Button variant="outline" className="w-full">
                      选择设备
                    </Button>
                    <p className="text-xs text-gray-500">您可以选择特定设备接收分发的流量</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  上一步
                </Button>
                <Button onClick={handleNext} disabled={!isStep2Valid}>
                  下一步
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤3：规则配置 */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>规则配置</CardTitle>
              <CardDescription>设置流量分发的规则和限制</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">分发方式</h3>
                <RadioGroup
                  value={formData.distributionMethod}
                  onValueChange={(value) => updateFormData("distributionMethod", value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="even" id="even" />
                    <Label htmlFor="even" className="cursor-pointer">
                      均匀分发
                    </Label>
                    <span className="text-xs text-gray-500 ml-2">(流量将均匀分配给所有目标)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="priority" id="priority" />
                    <Label htmlFor="priority" className="cursor-pointer">
                      优先级分发
                    </Label>
                    <span className="text-xs text-gray-500 ml-2">(按目标优先级顺序分发)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ratio" id="ratio" />
                    <Label htmlFor="ratio" className="cursor-pointer">
                      比例分发
                    </Label>
                    <span className="text-xs text-gray-500 ml-2">(按设定比例分配流量)</span>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium">分发限制</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maxPerDay">每日最大分发量</Label>
                    <span className="text-sm font-medium">{formData.rules.maxPerDay} 人/天</span>
                  </div>
                  <Slider
                    id="maxPerDay"
                    min={10}
                    max={200}
                    step={10}
                    value={[formData.rules.maxPerDay]}
                    onValueChange={(value) => updateFormData("rules.maxPerDay", value[0])}
                  />
                  <p className="text-xs text-gray-500">限制每天最多分发的流量数量</p>
                </div>

                <div className="space-y-2">
                  <Label>时间限制</Label>
                  <RadioGroup
                    value={formData.rules.timeRestriction}
                    onValueChange={(value) => updateFormData("rules.timeRestriction", value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all-time" />
                      <Label htmlFor="all-time" className="cursor-pointer">
                        全天分发
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom-time" />
                      <Label htmlFor="custom-time" className="cursor-pointer">
                        自定义时间段
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.rules.timeRestriction === "custom" && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label htmlFor="timeStart" className="text-xs">
                          开始时间
                        </Label>
                        <Input
                          id="timeStart"
                          type="time"
                          value={formData.rules.customTimeStart}
                          onChange={(e) => updateFormData("rules.customTimeStart", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="timeEnd" className="text-xs">
                          结束时间
                        </Label>
                        <Input
                          id="timeEnd"
                          type="time"
                          value={formData.rules.customTimeEnd}
                          onChange={(e) => updateFormData("rules.customTimeEnd", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoTag">自动标记</Label>
                  <Switch
                    id="autoTag"
                    checked={formData.autoTag}
                    onCheckedChange={(checked) => updateFormData("autoTag", checked)}
                  />
                </div>
                <p className="text-xs text-gray-500">启用后，系统将自动为分发的流量添加来源标签</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="activeStatus">立即激活</Label>
                  <Switch
                    id="activeStatus"
                    checked={formData.activeStatus}
                    onCheckedChange={(checked) => updateFormData("activeStatus", checked)}
                  />
                </div>
                <p className="text-xs text-gray-500">启用后，创建完成后立即开始流量分发</p>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  上一步
                </Button>
                <Button onClick={handleSubmit} disabled={!isStep3Valid}>
                  保存修改
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 流量池选择器 */}
      <TrafficPoolSelector
        open={formData.isPoolSelectorOpen}
        onOpenChange={(open) => updateFormData("isPoolSelectorOpen", open)}
        selectedUsers={formData.selectedUsers}
        onSelect={(users) => updateFormData("selectedUsers", users)}
      />
    </div>
  )
}

