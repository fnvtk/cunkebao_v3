"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, ArrowLeft } from "lucide-react"
import { StepIndicator } from "./components/step-indicator"
import { GroupSettings } from "./components/group-settings"
import { DeviceSelection } from "./components/device-selection"
import { TagSelection } from "./components/tag-selection"
import { useToast } from "@/components/ui/use-toast"

// 保留原有的卡片列表视图
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Settings, RefreshCcw } from "lucide-react"

interface Plan {
  id: string
  name: string
  groupCount: number
  groupSize: number
  totalFriends: number
  tags: string[]
  status: "running" | "stopped" | "completed"
  lastUpdated: string
}

const mockPlans: Plan[] = [
  {
    id: "1",
    name: "品牌推广群",
    groupCount: 6,
    groupSize: 38,
    totalFriends: 228,
    tags: ["品牌", "推广"],
    status: "running",
    lastUpdated: "2024-02-24 10:30",
  },
  {
    id: "2",
    name: "客户服务群",
    groupCount: 4,
    groupSize: 38,
    totalFriends: 152,
    tags: ["客服", "售后"],
    status: "stopped",
    lastUpdated: "2024-02-23 15:45",
  },
]

const steps = [
  { title: "群配置", description: "设置群人数与组数" },
  { title: "设备选择", description: "选择执行设备" },
  { title: "人群标签", description: "选择目标人群" },
]

export default function AutoGroupPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "新建群计划",
    fixedWechatIds: [] as string[],
    groupingOption: "all" as "all" | "fixed",
    fixedGroupCount: 5,
    selectedDevices: [] as string[],
    audienceTags: [] as string[],
    trafficTags: [] as string[],
    matchLogic: "or" as "and" | "or",
    excludeTags: ["已拉群"] as string[],
  })

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => prev + 1)
  }, [])

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => prev - 1)
  }, [])

  const handleComplete = useCallback(() => {
    // 这里可以添加表单提交逻辑
    console.log("Form submitted:", formData)
    toast({
      title: "计划创建成功",
      description: `已成功创建"${formData.name}"计划`,
    })
    setIsCreating(false)
    setCurrentStep(0)
    // 重置表单数据
    setFormData({
      name: "新建群计划",
      fixedWechatIds: [],
      groupingOption: "all",
      fixedGroupCount: 5,
      selectedDevices: [],
      audienceTags: [],
      trafficTags: [],
      matchLogic: "or",
      excludeTags: ["已拉群"],
    })
  }, [formData, toast])

  const handleCancel = useCallback(() => {
    setIsCreating(false)
    setCurrentStep(0)
  }, [])

  // 使用useCallback包装回调函数，避免不必要的重新创建
  const handleGroupSettingsChange = useCallback(
    (values: {
      name: string
      fixedWechatIds: string[]
      groupingOption: "all" | "fixed"
      fixedGroupCount: number
    }) => {
      setFormData((prev) => ({ ...prev, ...values }))
    },
    [],
  )

  const handleDevicesChange = useCallback((devices: string[]) => {
    setFormData((prev) => ({ ...prev, selectedDevices: devices }))
  }, [])

  const handleTagsChange = useCallback(
    (values: {
      audienceTags: string[]
      trafficTags: string[]
      matchLogic: "and" | "or"
      excludeTags: string[]
    }) => {
      setFormData((prev) => ({ ...prev, ...values }))
    },
    [],
  )

  const getStatusColor = (status: Plan["status"]) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-500"
      case "stopped":
        return "bg-red-500/10 text-red-500"
      case "completed":
        return "bg-blue-500/10 text-blue-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getStatusText = (status: Plan["status"]) => {
    switch (status) {
      case "running":
        return "运行中"
      case "stopped":
        return "已停止"
      case "completed":
        return "已完成"
      default:
        return status
    }
  }

  if (isCreating) {
    return (
      <div className="container p-4 mx-auto max-w-7xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-xl font-semibold">新建自动拉群计划</h1>
        </div>

        <div className="mb-8">
          <StepIndicator currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />
        </div>

        {currentStep === 0 && (
          <GroupSettings
            onNext={handleNext}
            initialValues={{
              name: formData.name,
              fixedWechatIds: formData.fixedWechatIds,
              groupingOption: formData.groupingOption,
              fixedGroupCount: formData.fixedGroupCount,
            }}
            onValuesChange={handleGroupSettingsChange}
          />
        )}

        {currentStep === 1 && (
          <DeviceSelection
            onNext={handleNext}
            onPrevious={handlePrevious}
            initialSelectedDevices={formData.selectedDevices}
            onDevicesChange={handleDevicesChange}
          />
        )}

        {currentStep === 2 && (
          <TagSelection
            onPrevious={handlePrevious}
            onComplete={handleComplete}
            initialValues={{
              audienceTags: formData.audienceTags,
              trafficTags: formData.trafficTags,
              matchLogic: formData.matchLogic,
              excludeTags: formData.excludeTags,
            }}
            onValuesChange={handleTagsChange}
          />
        )}
      </div>
    )
  }

  return (
    <div className="container p-4 mx-auto max-w-7xl">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">微信自动拉群</h1>
          <Button onClick={() => setIsCreating(true)} className="bg-blue-500 hover:bg-blue-600">
            <PlusCircle className="w-4 h-4 mr-2" />
            新建计划
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">进行中</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPlans.map((plan) => (
                <Card key={plan.id} className="border border-gray-100">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">{plan.name}</CardTitle>
                      <Badge className={getStatusColor(plan.status)}>{getStatusText(plan.status)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        已建群数：{plan.groupCount}
                      </div>
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        群规模：{plan.groupSize}
                      </div>
                      <div className="flex items-center">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        更新时间：{plan.lastUpdated}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {plan.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        编辑
                      </Button>
                      <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600">
                        停止
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="h-[calc(100vh-200px)] flex items-center justify-center text-gray-500">暂无已完成的计划</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

