"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Users, Database, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import StepIndicator from "./components/step-indicator"
import BasicInfoStep from "./components/basic-info-step"
import TargetSettingsStep from "./components/target-settings-step"
import TrafficPoolStep from "./components/traffic-pool-step"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface FormData {
  basicInfo: {
    name: string
    source?: string
    sourceIcon?: string
    description?: string
    distributeType: number
    maxPerDay: number
    timeType: number
    startTime: string
    endTime: string
  }
  targetSettings: {
    targetGroups: string[]
    targets: string[]
    devices?: string[]
  }
  trafficPool: {
    deviceIds: number[]
    poolIds: number[]
  }
}

interface ApiResponse {
  code: number
  msg: string
  data: any
}

export default function NewTrafficDistribution() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    basicInfo: {
      name: "",
      distributeType: 1,
      maxPerDay: 100,
      timeType: 2,
      startTime: "08:00",
      endTime: "22:00",
      source: "",
      sourceIcon: "",
      description: "",
    },
    targetSettings: {
      targetGroups: [],
      targets: [],
    },
    trafficPool: {
      deviceIds: [],
      poolIds: [],
    },
  })
  const [devices, setDevices] = useState<string[]>([])

  const steps = [
    { id: 1, title: "基本信息", icon: <Plus className="h-6 w-6" /> },
    { id: 2, title: "目标设置", icon: <Users className="h-6 w-6" /> },
    { id: 3, title: "流量池选择", icon: <Database className="h-6 w-6" /> },
  ]

  const handleBasicInfoNext = (data: FormData["basicInfo"]) => {
    setFormData((prev) => ({ ...prev, basicInfo: data }))
    setCurrentStep(1)
  }

  const handleTargetSettingsNext = (data: FormData["targetSettings"]) => {
    setFormData((prev) => ({ ...prev, targetSettings: { ...data } }))
    setDevices(data.devices || [])
    setCurrentStep(2)
  }

  const handleTargetSettingsBack = () => {
    setCurrentStep(0)
  }

  const handleTrafficPoolBack = () => {
    setCurrentStep(1)
  }

  const handleSubmit = async (data: FormData["trafficPool"]) => {
    const finalData = {
      ...formData,
      trafficPool: data,
    }

    const loadingToast = showToast("正在创建分发计划...", "loading", true);
    try {
      const response = await api.post<ApiResponse>('/v1/workbench/create', {
        type: 5, // 5表示流量分发任务
        name: finalData.basicInfo.name,
        source: finalData.basicInfo.source,
        sourceIcon: finalData.basicInfo.sourceIcon,
        description: finalData.basicInfo.description,
        distributeType: finalData.basicInfo.distributeType,
        maxPerDay: finalData.basicInfo.maxPerDay,
        timeType: finalData.basicInfo.timeType,
        startTime: finalData.basicInfo.startTime,
        endTime: finalData.basicInfo.endTime,
        targetGroups: finalData.targetSettings.targetGroups,
        devices: finalData.targetSettings.devices,
        pools: finalData.trafficPool.poolIds,
        enabled: true, // 默认启用
      })

      if (response.code === 200) {
        loadingToast.remove();
        showToast(response.msg || "创建成功", "success")
        router.push("/workspace/traffic-distribution")
      } else {
        loadingToast.remove();
        showToast(response.msg || "创建失败，请稍后重试", "error")
      }
    } catch (error: any) {
      console.error("创建分发计划失败:", error)
      loadingToast.remove();
      showToast(error?.message || "请检查网络连接", "error")
    }
  }

  return (
    <div className="container max-w-md mx-auto pb-20">
      <div className="sticky top-0 bg-white z-10 pb-2">
        <div className="flex items-center py-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">新建流量分发</h1>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <StepIndicator currentStep={currentStep} steps={steps} />
      </div>

      <div className="mt-4">
        {currentStep === 0 && <BasicInfoStep onNext={handleBasicInfoNext} initialData={formData.basicInfo} />}

        {currentStep === 1 && (
          <TargetSettingsStep
            onNext={handleTargetSettingsNext}
            onBack={handleTargetSettingsBack}
            initialData={formData.targetSettings}
            setDevices={setDevices}
          />
        )}

        {currentStep === 2 && (
          <TrafficPoolStep
            onSubmit={handleSubmit}
            onBack={handleTrafficPoolBack}
            initialData={formData.trafficPool}
            devices={devices}
          />
        )}
      </div>
    </div>
  )
}
