"use client"
import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BasicSettings } from "./steps/BasicSettings"
import { FriendRequestSettings } from "./steps/FriendRequestSettings"
import { MessageSettings } from "./steps/MessageSettings"
import { TagSettings } from "./steps/TagSettings"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

const steps = [
  { id: 1, title: "步骤一", subtitle: "基础设置" },
  { id: 2, title: "步骤二", subtitle: "好友申请" },
  { id: 3, title: "步骤三", subtitle: "消息设置" },
  { id: 4, title: "步骤四", subtitle: "流量标签" },
]

// 场景分类规则
const scenarioRules = {
  LIVE: ["直播", "直播间", "主播", "抖音"],
  COMMENT: ["评论", "互动", "回复", "小红书"],
  GROUP: ["群", "社群", "群聊", "微信群"],
  ARTICLE: ["文章", "笔记", "内容", "公众号"],
}

// 根据计划名称和标签自动判断场景
const determineScenario = (planName: string, tags: any[]) => {
  // 优先使用标签进行分类
  if (tags && tags.length > 0) {
    const firstTag = tags[0]
    if (firstTag.name?.includes("直播") || firstTag.name?.includes("抖音")) return "douyin"
    if (firstTag.name?.includes("评论") || firstTag.name?.includes("小红书")) return "xiaohongshu"
    if (firstTag.name?.includes("群") || firstTag.name?.includes("微信")) return "weixinqun"
    if (firstTag.name?.includes("文章") || firstTag.name?.includes("公众号")) return "gongzhonghao"
  }

  // 如果没有标签，使用计划名称进行分类
  const planNameLower = planName.toLowerCase()
  if (planNameLower.includes("直播") || planNameLower.includes("抖音")) return "douyin"
  if (planNameLower.includes("评论") || planNameLower.includes("小红书")) return "xiaohongshu"
  if (planNameLower.includes("群") || planNameLower.includes("微信")) return "weixinqun"
  if (planNameLower.includes("文章") || planNameLower.includes("公众号")) return "gongzhonghao"
  return "other"
}

export default function NewAcquisitionPlan() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type")
  const source = searchParams.get("source")

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    planName: "",
    scenario: type === "order" ? "order" : "",
    accounts: [],
    materials: [],
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
    tags: [],
    selectedDevices: [],
    messagePlans: [],
    importedTags: [],
    sourceWechatId: source || "",
    teams: [], // 添加 teams 字段
  })

  // 如果是从微信号好友转移过来，自动设置计划名称
  useEffect(() => {
    if (type === "order" && source) {
      const today = new Date().toLocaleDateString("zh-CN").replace(/\//g, "")
      setFormData((prev) => ({
        ...prev,
        planName: `${source}好友转移${today}`,
        scenario: "order",
      }))

      // 模拟加载好友数据
      setTimeout(() => {
        toast({
          title: "好友数据加载成功",
          description: `已从微信号 ${source} 导入好友数据`,
        })
      }, 1000)
    }
  }, [type, source])

  // 根据URL参数设置场景类型
  useEffect(() => {
    if (type && type !== "order" && !formData.scenario) {
      const validScenarios = [
        "douyin",
        "kuaishou",
        "xiaohongshu",
        "weibo",
        "haibao",
        "phone",
        "weixinqun",
        "gongzhonghao",
      ]
      if (validScenarios.includes(type)) {
        const today = new Date().toLocaleDateString("zh-CN").replace(/\//g, "")
        setFormData((prev) => ({
          ...prev,
          scenario: type,
          planName: `${type === "phone" ? "电话获客" : type}${today}`,
        }))
      }
    }
  }, [type, formData.scenario])

  const handleSave = () => {
    // 根据标签和计划名称自动判断场景
    const scenario = formData.scenario || determineScenario(formData.planName, formData.tags)

    // 准备请求数据
    const requestData = {
      sceneId: getSceneIdFromScenario(scenario), // 获取场景ID
      name: formData.planName,
      status: formData.enabled ? 1 : 0,
      reqConf: JSON.stringify({
        remarkType: formData.remarkType,
        remarkKeyword: formData.remarkKeyword,
        greeting: formData.greeting,
        addFriendTimeStart: formData.addFriendTimeStart,
        addFriendTimeEnd: formData.addFriendTimeEnd,
        addFriendInterval: formData.addFriendInterval,
        maxDailyFriends: formData.maxDailyFriends,
        selectedDevices: formData.selectedDevices,
      }),
      msgConf: JSON.stringify({
        messageInterval: formData.messageInterval,
        messagePlans: formData.messagePlans,
      }),
      tagConf: JSON.stringify({
        tags: formData.tags,
        importedTags: formData.importedTags,
      })
    }

    // 调用API创建获客计划
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/plan/scenes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        toast({
          title: "创建成功",
          description: "获客计划已创建完成",
        })
        // 跳转到首页
        router.push("/")
      } else {
        toast({
          title: "创建失败",
          description: data.msg || "服务器错误，请稍后重试",
          variant: "destructive"
        })
      }
    })
    .catch(error => {
      console.error("创建获客计划失败:", error);
      toast({
        title: "创建失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    })
  }

  // 将场景类型转换为场景ID
  const getSceneIdFromScenario = (scenario: string): number => {
    const scenarioMap: Record<string, number> = {
      'douyin': 1,
      'xiaohongshu': 2,
      'weixinqun': 3,
      'gongzhonghao': 4,
      'kuaishou': 5,
      'weibo': 6,
      'haibao': 7,
      'phone': 8,
      'order': 9,
      'other': 10
    }
    return scenarioMap[scenario] || 1 // 默认返回1
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
        if (!formData.planName.trim()) {
          toast({
            title: "请完善信息",
            description: "请填写计划名称",
            variant: "destructive",
          })
          return false
        }
        return true
      case 2:
        // 如果是订单导入场景，跳过好友申请设置验证
        if (formData.scenario === "order") {
          return true
        }
        // 修改：不再要求必须选择设备
        if (!formData.greeting?.trim()) {
          toast({
            title: "请完善信息",
            description: "请填写好友申请信息",
            variant: "destructive",
          })
          return false
        }
        return true
      case 3:
        // 如果是订单导入场景，跳过消息设置验证
        if (formData.scenario === "order") {
          return true
        }
        if (formData.messagePlans?.length === 0) {
          toast({
            title: "请完善信息",
            description: "请设置至少一条消息",
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicSettings formData={formData} onChange={setFormData} onNext={handleNext} />
      case 2:
        return (
          <FriendRequestSettings formData={formData} onChange={setFormData} onNext={handleNext} onPrev={handlePrev} />
        )
      case 3:
        return <MessageSettings formData={formData} onChange={setFormData} onNext={handleNext} onPrev={handlePrev} />
      case 4:
        return <TagSettings formData={formData} onNext={handleSave} onPrev={handlePrev} onChange={setFormData} />
      default:
        return null
    }
  }

  // 如果是订单导入场景，直接跳到标签设置步骤
  useEffect(() => {
    // 只有在订单场景下，才自动开启步骤1，而不是直接跳到步骤4
    if (formData.scenario === "order" && currentStep === 1 && formData.planName) {
      // 保持在步骤1，不再自动跳转到步骤4
      // 之前的逻辑是直接跳到步骤4：setCurrentStep(4)
    }
  }, [formData.scenario, currentStep, formData.planName])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[390px] mx-auto bg-white min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center h-14 px-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="ml-2 text-lg font-medium">{formData.sourceWechatId ? "好友转移" : "新建获客计划"}</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          {/* 步骤指示器样式 */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-4">
              <div className="flex justify-between">
                {steps.map((step) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        currentStep >= step.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.id}
                    </div>
                    <div className="text-xs font-medium mt-2 text-center">{step.subtitle}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1 px-4">
                {steps.slice(0, steps.length - 1).map((step, index) => (
                  <div
                    key={`line-${step.id}`}
                    className={`h-1 w-full ${currentStep > step.id ? "bg-blue-600" : "bg-gray-200"}`}
                    style={{
                      width: `${100 / (steps.length - 1)}%`,
                      marginLeft: index === 0 ? "10px" : "0",
                      marginRight: index === steps.length - 2 ? "10px" : "0",
                    }}
                  ></div>
                ))}
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
                {currentStep === steps.length ? "完成" : "下一步"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

