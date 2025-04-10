"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Users, Target, Settings, ArrowRight, ArrowLeft, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { TrafficPoolSelector } from "@/app/components/traffic-pool-selector"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

export default function NewTrafficDistributionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "high",
    autoDistribute: true,
    createAsPackage: false,
    packagePrice: 0,
    allDevices: false,
    newDevices: false,
    targetDevices: [] as string[],
    showDeviceSelector: false,
    selectedPool: "",
    isPoolSelectorOpen: false,
    selectedUsers: [],
  })

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
    if (currentStep === 1 && !formData.name) {
      toast({
        title: "请填写规则名称",
        description: "规则名称为必填项",
        variant: "destructive",
      })
      return
    }

    if (currentStep === 2 && !formData.allDevices && (!formData.targetDevices || formData.targetDevices.length === 0)) {
      toast({
        title: "请选择设备",
        description: "请选择至少一台设备或选择所有设备",
        variant: "destructive",
      })
      return
    }

    if (currentStep === 3 && !formData.selectedPool) {
      toast({
        title: "请选择流量池",
        description: "请选择一个流量池进行分发",
        variant: "destructive",
      })
      return
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    } else {
      router.back()
    }
  }

  const handleSubmit = () => {
    toast({
      title: "创建成功",
      description: "流量分发规则已创建",
    })
    router.push("/workspace/traffic-distribution")
  }

  return (
    <div className="flex-1 bg-white min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">新建流量分发</h1>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto">
        {/* 步骤指示器 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: "规则设定", icon: <Settings className="h-4 w-4" /> },
              { step: 2, title: "选择设备", icon: <Smartphone className="h-4 w-4" /> },
              { step: 3, title: "选择流量池", icon: <Users className="h-4 w-4" /> },
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

        {/* 步骤1：规则设定 */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>规则设定</CardTitle>
              <CardDescription>设置流量分发的基本规则和优先级</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  规则名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="输入分发规则名称"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">规则描述</Label>
                <Textarea
                  id="description"
                  placeholder="简要描述该分发规则的目标和用途"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">优先级</h3>
                <RadioGroup
                  value={formData.priority || "high"}
                  onValueChange={(value) => updateFormData("priority", value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high-priority" />
                    <Label htmlFor="high-priority" className="cursor-pointer">
                      高优先
                    </Label>
                    <span className="text-xs text-gray-500 ml-2">(高优先级规则将优先执行)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low-priority" />
                    <Label htmlFor="low-priority" className="cursor-pointer">
                      低优先
                    </Label>
                    <span className="text-xs text-gray-500 ml-2">(当高优先级规则不匹配时执行)</span>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoDistribute">自动分发</Label>
                  <Switch
                    id="autoDistribute"
                    checked={formData.autoDistribute !== false}
                    onCheckedChange={(checked) => updateFormData("autoDistribute", checked)}
                  />
                </div>
                <p className="text-xs text-gray-500">启用后，系统将自动按规则分发流量；关闭则需手动触发分发</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="createAsPackage">创建为流量包</Label>
                  <Switch
                    id="createAsPackage"
                    checked={formData.createAsPackage || false}
                    onCheckedChange={(checked) => updateFormData("createAsPackage", checked)}
                  />
                </div>
                <p className="text-xs text-gray-500">启用后，可创建为可售卖流量包并设置价格</p>
              </div>

              {formData.createAsPackage && (
                <div className="space-y-2 pl-4 border-l-2 border-blue-100">
                  <Label htmlFor="packagePrice">流量包价格 (元/包)</Label>
                  <Input
                    id="packagePrice"
                    type="number"
                    placeholder="输入价格"
                    value={formData.packagePrice || ""}
                    onChange={(e) => updateFormData("packagePrice", Number.parseFloat(e.target.value))}
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button onClick={handleNext}>
                  下一步
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤2：选择设备 */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>选择设备</CardTitle>
              <CardDescription>选择需要接收流量的设备</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allDevices"
                    checked={formData.allDevices || false}
                    onCheckedChange={(checked) => {
                      updateFormData("allDevices", checked === true)
                      if (checked) updateFormData("targetDevices", [])
                    }}
                  />
                  <Label htmlFor="allDevices" className="font-medium">
                    所有设备
                  </Label>
                  <span className="text-xs text-gray-500">(系统自动分配流量到所有在线设备)</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newDevices"
                    checked={formData.newDevices || false}
                    onCheckedChange={(checked) => updateFormData("newDevices", checked === true)}
                    disabled={formData.allDevices}
                  />
                  <Label htmlFor="newDevices" className="font-medium">
                    新添加设备
                  </Label>
                  <span className="text-xs text-gray-500">(仅针对新添加设备进行流量分发)</span>
                </div>

                <div className="space-y-2 pt-4">
                  <Label className="font-medium">指定设备</Label>
                  <p className="text-xs text-gray-500 mb-2">选择特定的设备进行流量分发</p>

                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={formData.allDevices}
                    onClick={() => updateFormData("showDeviceSelector", true)}
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    选择设备
                    {formData.targetDevices?.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        已选 {formData.targetDevices.length} 台
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  上一步
                </Button>
                <Button onClick={handleNext}>
                  下一步
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤3：选择流量池 */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>选择流量池</CardTitle>
              <CardDescription>选择需要分发的流量池</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 普通流量包 */}
                <Card
                  className={`cursor-pointer hover:border-blue-400 transition-colors ${
                    formData.selectedPool === "normal" ? "border-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => updateFormData("selectedPool", "normal")}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">普通流量包</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">价格:</span>
                        <span className="font-medium">0.50元/流量包</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">总添加人数:</span>
                        <span className="font-medium">10人</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline">新用户</Badge>
                        <Badge variant="outline">低活跃度</Badge>
                        <Badge variant="outline">全国</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 高质量流量 */}
                <Card
                  className={`cursor-pointer hover:border-blue-400 transition-colors ${
                    formData.selectedPool === "high" ? "border-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => updateFormData("selectedPool", "high")}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">高质量流量</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">价格:</span>
                        <span className="font-medium">2.50元/流量包</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">总添加人数:</span>
                        <span className="font-medium">25人</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline">高消费</Badge>
                        <Badge variant="outline">高活跃度</Badge>
                        <Badge variant="outline">一线城市</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 精准营销流量 */}
                <Card
                  className={`cursor-pointer hover:border-blue-400 transition-colors ${
                    formData.selectedPool === "precise" ? "border-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => updateFormData("selectedPool", "precise")}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">精准营销流量</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">价格:</span>
                        <span className="font-medium">3.80元/流量包</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">总添加人数:</span>
                        <span className="font-medium">50人</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline">潜在客户</Badge>
                        <Badge variant="outline">有购买意向</Badge>
                        <Badge variant="outline">华东地区</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => updateFormData("isPoolSelectorOpen", true)}>
                  <Target className="mr-2 h-4 w-4" />
                  从流量池中挑选特定标签用户
                </Button>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  上一步
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.selectedPool}>
                  完成创建
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
