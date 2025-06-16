"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { StepIndicator } from "@/app/components/ui-templates/step-indicator"
import { BasicSettings } from "./steps/BasicSettings"
import { FriendRequestSettings } from "./steps/FriendRequestSettings"
import { MessageSettings } from "./steps/MessageSettings"
import { api, ApiResponse } from "@/lib/api"

// 步骤定义 - 只保留三个步骤
const steps = [
  { id: 1, title: "步骤一", subtitle: "基础设置" },
  { id: 2, title: "步骤二", subtitle: "好友申请设置" },
  { id: 3, title: "步骤三", subtitle: "消息设置" },
]

export default function NewPlan() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    planName: "",
    posters: [],
    device: [],
    remarkType: "phone",
    greeting: "你好，请通过",
    addInterval: 1,
    startTime: "09:00",
    endTime: "18:00",
    enabled: true,
  })

  // 场景数据
  const [scenes, setScenes] = useState<any[]>([])
  const [loadingScenes, setLoadingScenes] = useState(true)

  useEffect(() => {
    api.get<ApiResponse>("/v1/plan/scenes")
      .then(res => {
        if (res.code === 200 && Array.isArray(res.data)) {
          setScenes(res.data)
        }
      })
      .finally(() => setLoadingScenes(false))
  }, [])

  // 更新表单数据
  const onChange = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  // 处理保存
  const handleSave = async () => {
    try {
      // 先赋值再去除多余字段
      const submitData = {
        ...formData,
        device: formData.selectedDevices || formData.device,
        posters: formData.materials || formData.posters,
      };
      const { selectedDevices, materials, ...finalData } = submitData;
      const res = await api.post<ApiResponse>("/v1/plan/create", finalData);
      if (res.code === 200) {
        toast({
          title: "创建成功",
          description: "获客计划已创建",
        })
        router.push("/scenarios")
      } else {
        toast({
          title: "创建失败",
          description: res.msg || "创建计划失败，请重试",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "创建失败",
        description: error?.message || "创建计划失败，请重试",
        variant: "destructive",
      })
    }
  }

  // 下一步
  const handleNext = () => {
    if (currentStep === steps.length) {
      handleSave()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  // 上一步
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicSettings formData={formData} onChange={onChange} onNext={handleNext} scenarios={scenes} />
      case 2:
        return <FriendRequestSettings formData={formData} onChange={onChange} onNext={handleNext} onPrev={handlePrev} />
      case 3:
        return <MessageSettings formData={formData} onChange={onChange} onNext={handleSave} onPrev={handlePrev} />
      default:
        return null
    }
  }

  if (loadingScenes) {
    return <div className="flex justify-center items-center h-40">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[390px] mx-auto bg-white min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => router.push("/scenarios")}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="ml-2 text-lg font-medium">新建获客计划</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          <div className="px-4 py-6">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          <div className="flex-1 px-4 pb-20">{renderStepContent()}</div>
        </div>
      </div>
    </div>
  )
}
