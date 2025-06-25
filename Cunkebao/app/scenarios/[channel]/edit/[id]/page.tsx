"use client"

import { useState, useEffect, use } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BasicSettings } from "../../../new/steps/BasicSettings"
import { FriendRequestSettings } from "../../../new/steps/FriendRequestSettings"
import { MessageSettings } from "../../../new/steps/MessageSettings"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { api, ApiResponse } from "@/lib/api"

const steps = [
  { id: 1, title: "步骤一", subtitle: "基础设置" },
  { id: 2, title: "步骤二", subtitle: "好友申请设置" },
  { id: 3, title: "步骤三", subtitle: "消息设置" },
]

export default function EditAcquisitionPlan({ params }: { params: Promise<{ channel: string; id: string }> }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [scenes, setScenes] = useState<any[]>([])
  const [formData, setFormData] = useState({
    planName: "",
    posters: [],
    device: [],
    remarkType: "default",
    greeting: "",
    addInterval: 60,
    startTime: "09:00",
    endTime: "18:00",
    enabled: true,
    sceneId: "",
    scenario: "",
    planNameEdited: false
  })
  const [planNameEdited, setPlanNameEdited] = useState(false);

  const resolvedParams = use(params);
  const { id, channel } = resolvedParams;

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const [planRes, scenesRes] = await Promise.all([
          api.get<ApiResponse>(`/v1/plan/detail?planId=${id}`),
          api.get<ApiResponse>("/v1/plan/scenes")
        ])

        if (planRes.code === 200 && planRes.data) {
          setFormData({
            ...planRes.data,
            device: planRes.data.device || [],
            selectedDevices: planRes.data.device || [],
            planNameEdited: false
          })
        }

        if (scenesRes.code === 200 && Array.isArray(scenesRes.data)) {
          setScenes(scenesRes.data)
        }

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
  }, [id])

  const handleSave = async () => {
    try {
      const submitData = {
        ...formData,
        device: formData.selectedDevices || formData.device,
        posters: formData.materials || formData.posters,
      };
      const { selectedDevices, materials, ...finalData } = submitData;
      const res = await api.put<ApiResponse>(`/v1/plan/update?planId=${id}`, finalData);
      if (res.code === 200) {
      toast({
        title: "保存成功",
        description: "获客计划已更新",
      })
        router.push(`/scenarios/${channel}`)
      } else {
        toast({
          title: "保存失败",
          description: res.msg || "更新计划失败，请重试",
          variant: "destructive",
        })
      }
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
    if (currentStep === steps.length) {
      handleSave()
    } else {
      setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length))
    }
  }

  const onChange = (data: any) => {
    if ('planName' in data) setPlanNameEdited(true);
    setFormData(prev => ({ ...prev, ...data }))
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
        return <BasicSettings formData={formData} onChange={onChange} onNext={handleNext} scenarios={scenes} loadingScenes={loading} planNameEdited={planNameEdited} />
      case 2:
        return <FriendRequestSettings formData={formData} onChange={onChange} onNext={handleNext} onPrev={handlePrev} />
      case 3:
        return <MessageSettings formData={formData} onChange={onChange} onNext={handleSave} onPrev={handlePrev} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[390px] mx-auto bg-white min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center h-14 px-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/scenarios/${channel}`)}>
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

      
        </div>
      </div>
    </div>
  )
}
