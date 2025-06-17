"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Users, Database, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import StepIndicator from "../../new/components/step-indicator"
import BasicInfoStep from "../../new/components/basic-info-step"
import TargetSettingsStep from "../../new/components/target-settings-step"
import TrafficPoolStep from "../../new/components/traffic-pool-step"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface BasicInfoData {
  name: string
  distributeType: number
  maxPerDay: number
  timeType: number
  startTime: string
  endTime: string
  account?: string[]
  accounts?: string[]
}

interface TargetSettingsData extends Omit<FormData['targetSettings'], 'account'> {
  accounts?: string[]
}

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
    devices: string[]
    account?: string[]
  }
  trafficPool: {
    poolIds: string[]
  }
}

interface ApiResponse {
  code: number
  msg: string
  data: any
}

export default function EditTrafficDistributionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
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
      devices: [],
    },
    trafficPool: {
      poolIds: [],
    },
  })
  const [devices, setDevices] = useState<string[]>([])

  useEffect(() => {
    setDevices(formData.targetSettings.devices || [])
  }, [formData.targetSettings.devices])

  const steps = [
    { id: 1, title: "基本信息", icon: <Plus className="h-6 w-6" /> },
    { id: 2, title: "目标设置", icon: <Users className="h-6 w-6" /> },
    { id: 3, title: "流量池选择", icon: <Database className="h-6 w-6" /> },
  ]

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        showToast("任务ID无效", "error")
        return
      }
      setLoading(true)
      const loadingToast = showToast("正在加载分发规则...", "loading", true)
      try {
        const response = await api.get<ApiResponse>(`/v1/workbench/detail?id=${id}`)
        if (response.code === 200 && response.data) {
          const data = response.data
          setFormData({
            basicInfo: {
              name: data.name || "",
              distributeType: data.config?.distributeType || 1,
              maxPerDay: data.config?.maxPerDay || 100,
              timeType: data.config?.timeType || 2,
              startTime: data.config?.startTime || "08:00",
              endTime: data.config?.endTime || "22:00",
              source: data.source || "",
              sourceIcon: data.sourceIcon || "",
              description: data.description || "",
            },
            targetSettings: {
              targetGroups: data.config?.targetGroups || [],
              devices: (data.config?.devices || []).map(String),
              account: (data.config?.account || []).map(String),
            },
            trafficPool: {
              poolIds: (data.config?.pools || []).map(String),
            },
          })
        } else {
          showToast(response.msg || "获取分发规则失败", "error")
        }
      } catch (error: any) {
        console.error("获取分发规则失败:", error)
        showToast(error?.message || "请检查网络连接", "error")
      } finally {
        loadingToast.remove()
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleBasicInfoNext = (data: BasicInfoData) => {
    setFormData((prev) => ({ 
      ...prev, 
      basicInfo: {
        name: data.name,
        distributeType: data.distributeType,
        maxPerDay: data.maxPerDay,
        timeType: data.timeType,
        startTime: data.startTime,
        endTime: data.endTime,
        source: prev.basicInfo.source,
        sourceIcon: prev.basicInfo.sourceIcon,
        description: prev.basicInfo.description,
      },
      targetSettings: {
        ...prev.targetSettings,
        account: data.account || data.accounts
      }
    }))
    setCurrentStep(1)
  }

  const handleTargetSettingsNext = (data: TargetSettingsData) => {
    setFormData((prev) => ({ 
      ...prev, 
      targetSettings: {
        ...data,
        account: data.accounts || prev.targetSettings.account
      }
    }))
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
    const loadingToast = showToast("正在保存分发计划...", "loading", true)
    try {
      const response = await api.post<ApiResponse>("/v1/workbench/update", {
        id: id,
        type: 5,
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
        account: finalData.targetSettings.account,
        pools: finalData.trafficPool.poolIds,
        enabled: true,
      })
      if (response.code === 200) {
        loadingToast.remove()
        showToast(response.msg || "保存成功", "success")
        router.push("/workspace/traffic-distribution")
      } else {
        loadingToast.remove()
        showToast(response.msg || "保存失败，请稍后重试", "error")
      }
    } catch (error: any) {
      console.error("保存分发计划失败:", error)
      loadingToast.remove()
      showToast(error?.message || "请检查网络连接", "error")
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">加载中...</div>
  }

  return (
    <div className="container max-w-md mx-auto pb-20">
      <div className="sticky top-0 bg-white z-10 pb-2">
        <div className="flex items-center py-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">编辑流量分发</h1>
         
        </div>
        <StepIndicator currentStep={currentStep} steps={steps} />
      </div>
      <div className="mt-4">
        {currentStep === 0 && (
          <BasicInfoStep 
            onNext={handleBasicInfoNext} 
            initialData={{ 
              ...formData.basicInfo,
              accounts: formData.targetSettings.account,
              account: formData.targetSettings.account
            }} 
          />
        )}
        {currentStep === 1 && (
          <TargetSettingsStep
            onNext={handleTargetSettingsNext}
            onBack={handleTargetSettingsBack}
            initialData={{ 
              ...formData.targetSettings, 
              devices,
              accounts: formData.targetSettings.account
            }}
            setDevices={setDevices}
          />
        )}
        {currentStep === 2 && (
          <TrafficPoolStep onSubmit={handleSubmit} onBack={handleTrafficPoolBack} initialData={formData.trafficPool} devices={devices} />
        )}
      </div>
    </div>
  )
  }
