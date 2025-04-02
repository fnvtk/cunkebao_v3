"use client"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BasicSettings } from "../../../new/steps/BasicSettings"
import { FriendRequestSettings } from "../../../new/steps/FriendRequestSettings"
import { MessageSettings } from "../../../new/steps/MessageSettings"
import { TagSettings } from "../../../new/steps/TagSettings"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

const steps = [
  { id: 1, title: "步骤一", subtitle: "基础设置" },
  { id: 2, title: "步骤二", subtitle: "好友申请设置" },
  { id: 3, title: "步骤三", subtitle: "消息设置" },
  { id: 4, title: "步骤四", subtitle: "流量标签设置" },
]

export default function EditAcquisitionPlan({ params }: { params: { channel: string; id: string } }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    planName: "",
    accounts: [],
    dailyLimit: 10,
    enabled: true,
    remarkType: "phone",
    remarkKeyword: "",
    greeting: "",
    addFriendTimeStart: "09:00",
    addFriendTimeEnd: "18:00",
    addFriendInterval: 1,
    maxDailyFriends: 20,
    messageInterval: 1,
    messageContent: "",
  })

  useEffect(() => {
    // 模拟从API获取计划数据
    const fetchPlanData = async () => {
      try {
        // 这里应该是实际的API调用
        const mockData = {
          planName: "测试计划",
          accounts: ["account1"],
          dailyLimit: 15,
          enabled: true,
          remarkType: "phone",
          remarkKeyword: "测试",
          greeting: "你好",
          addFriendTimeStart: "09:00",
          addFriendTimeEnd: "18:00",
          addFriendInterval: 2,
          maxDailyFriends: 25,
          messageInterval: 2,
          messageContent: "欢迎",
        }
        setFormData(mockData)
        setLoading(false)
      } catch (error) {
        toast({
          title: "加载失败",
          description: "获取计划数据失败，请重试",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchPlanData()
  }, [])

  const handleSave = async () => {
    try {
      // 这里应该是实际的API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "保存成功",
        description: "获客计划已更新",
      })
      router.push(`/scenarios/${params.channel}`)
    } catch (error) {
      toast({
        title: "保存失败",
        description: "更新计划失败，请重试",
        variant: "destructive",
      })
    }
  }

  const handlePrev = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1))
  }

  const handleNext = () => {
    if (isStepValid()) {
      if (currentStep === steps.length) {
        handleSave()
      } else {
        setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length))
      }
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        if (!formData.planName.trim() || formData.accounts.length === 0) {
          toast({
            title: "请完善信息",
            description: "请填写计划名称并选择至少一个账号",
            variant: "destructive",
          })
          return false
        }
        return true
      case 2:
        if (!formData.greeting.trim()) {
          toast({
            title: "请完善信息",
            description: "请填写好友申请信息",
            variant: "destructive",
          })
          return false
        }
        return true
      case 3:
        if (!formData.messageContent.trim()) {
          toast({
            title: "请完善信息",
            description: "请填写消息内容",
            variant: "destructive",
          })
          return false
        }
        return true
      case 4:
        return true
      default:
        return true
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicSettings formData={formData} onChange={setFormData} onNext={handleNext} isEdit />
      case 2:
        return (
          <FriendRequestSettings formData={formData} onChange={setFormData} onNext={handleNext} onPrev={handlePrev} />
        )
      case 3:
        return <MessageSettings formData={formData} onChange={setFormData} onNext={handleNext} onPrev={handlePrev} />
      case 4:
        return <TagSettings formData={formData} onChange={setFormData} onNext={handleSave} onPrev={handlePrev} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[390px] mx-auto bg-white min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center h-14 px-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="ml-2 text-lg font-medium">编辑获客计划</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          <div className="px-4 py-6">
            <div className="relative flex justify-between">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center relative z-10",
                    currentStep >= step.id ? "text-blue-600" : "text-gray-400",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                      currentStep >= step.id
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-gray-400",
                    )}
                  >
                    {step.id}
                  </div>
                  <div className="text-xs mt-1">{step.title}</div>
                  <div className="text-xs mt-0.5 font-medium">{step.subtitle}</div>
                </div>
              ))}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 pb-20">{renderStepContent()}</div>

          <div className="sticky bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="flex justify-between max-w-[390px] mx-auto">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrev}>
                  上一步
                </Button>
              )}
              <Button className={cn("min-w-[120px]", currentStep === 1 ? "w-full" : "ml-auto")} onClick={handleNext}>
                {currentStep === steps.length ? "保存" : "下一步"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

