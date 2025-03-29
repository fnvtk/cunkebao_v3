"use client"

import { AlertDescription } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, TagIcon, Users, Filter, AlertCircle, UserMinus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

// 模拟人群标签数据
const mockAudienceTags = [
  { id: "tag-1", name: "高价值客户", description: "消费能力强的客户", count: 120 },
  { id: "tag-2", name: "潜在客户", description: "有购买意向但未成交", count: 350 },
  { id: "tag-3", name: "教师", description: "教育行业从业者", count: 85 },
  { id: "tag-4", name: "医生", description: "医疗行业从业者", count: 64 },
  { id: "tag-5", name: "企业白领", description: "企业中高层管理人员", count: 210 },
  { id: "tag-6", name: "摄影爱好者", description: "对摄影有浓厚兴趣", count: 175 },
  { id: "tag-7", name: "运动达人", description: "经常参与体育运动", count: 230 },
  { id: "tag-8", name: "美食爱好者", description: "对美食有特别偏好", count: 320 },
  { id: "tag-9", name: "20-30岁", description: "年龄在20-30岁之间", count: 450 },
  { id: "tag-10", name: "30-40岁", description: "年龄在30-40岁之间", count: 380 },
  { id: "tag-11", name: "高消费", description: "消费水平较高", count: 150 },
  { id: "tag-12", name: "中等消费", description: "消费水平中等", count: 420 },
]

// 模拟流量词数据
const mockTrafficTags = [
  { id: "traffic-1", name: "健身器材", description: "对健身器材有兴趣", count: 95 },
  { id: "traffic-2", name: "减肥产品", description: "对减肥产品有需求", count: 130 },
  { id: "traffic-3", name: "护肤品", description: "对护肤品有兴趣", count: 210 },
  { id: "traffic-4", name: "旅游度假", description: "有旅游度假需求", count: 180 },
  { id: "traffic-5", name: "教育培训", description: "对教育培训有需求", count: 160 },
  { id: "traffic-6", name: "投资理财", description: "对投资理财有兴趣", count: 110 },
  { id: "traffic-7", name: "房产购买", description: "有购房需求", count: 75 },
  { id: "traffic-8", name: "汽车购买", description: "有购车需求", count: 90 },
]

// 模拟排除标签数据
const mockExcludeTags = [
  { id: "exclude-1", name: "已拉群", description: "已被拉入群聊的用户", count: 320 },
  { id: "exclude-2", name: "黑名单", description: "被标记为黑名单的用户", count: 45 },
  { id: "exclude-3", name: "已转化", description: "已完成转化的用户", count: 180 },
]

interface TagSelectionProps {
  onPrevious: () => void
  onComplete: () => void
  initialValues?: {
    audienceTags: string[]
    trafficTags: string[]
    matchLogic: "and" | "or"
    excludeTags: string[]
  }
  onValuesChange: (values: {
    audienceTags: string[]
    trafficTags: string[]
    matchLogic: "and" | "or"
    excludeTags: string[]
  }) => void
}

export function TagSelection({ onPrevious, onComplete, initialValues, onValuesChange }: TagSelectionProps) {
  const [audienceTags, setAudienceTags] = useState<string[]>(initialValues?.audienceTags || [])
  const [trafficTags, setTrafficTags] = useState<string[]>(initialValues?.trafficTags || [])
  const [matchLogic, setMatchLogic] = useState<"and" | "or">(initialValues?.matchLogic || "or")
  const [excludeTags, setExcludeTags] = useState<string[]>(initialValues?.excludeTags || ["exclude-1"])
  const [audienceSearchQuery, setAudienceSearchQuery] = useState("")
  const [trafficSearchQuery, setTrafficSearchQuery] = useState("")
  const [excludeSearchQuery, setExcludeSearchQuery] = useState("")
  const [autoTagEnabled, setAutoTagEnabled] = useState(true)

  // 使用ref来跟踪是否已经通知了父组件初始选择
  const initialNotificationRef = useRef(false)
  // 使用ref来存储上一次的值，避免不必要的更新
  const prevValuesRef = useRef({ audienceTags, trafficTags, matchLogic, excludeTags })

  // 只在值变化时通知父组件，使用防抖
  useEffect(() => {
    if (!initialNotificationRef.current) {
      initialNotificationRef.current = true
      return
    }

    // 检查值是否真的变化了
    const prevValues = prevValuesRef.current
    const valuesChanged =
      prevValues.audienceTags.length !== audienceTags.length ||
      prevValues.trafficTags.length !== trafficTags.length ||
      prevValues.matchLogic !== matchLogic ||
      prevValues.excludeTags.length !== excludeTags.length

    if (!valuesChanged) return

    // 更新ref中存储的上一次值
    prevValuesRef.current = { audienceTags, trafficTags, matchLogic, excludeTags }

    // 使用防抖延迟通知父组件
    const timer = setTimeout(() => {
      onValuesChange({ audienceTags, trafficTags, matchLogic, excludeTags })
    }, 300)

    return () => clearTimeout(timer)
  }, [audienceTags, trafficTags, matchLogic, excludeTags, onValuesChange])

  const filteredAudienceTags = mockAudienceTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(audienceSearchQuery.toLowerCase()) ||
      tag.description.toLowerCase().includes(audienceSearchQuery.toLowerCase()),
  )

  const filteredTrafficTags = mockTrafficTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(trafficSearchQuery.toLowerCase()) ||
      tag.description.toLowerCase().includes(trafficSearchQuery.toLowerCase()),
  )

  const filteredExcludeTags = mockExcludeTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(excludeSearchQuery.toLowerCase()) ||
      tag.description.toLowerCase().includes(excludeSearchQuery.toLowerCase()),
  )

  const handleAudienceTagToggle = (tagId: string) => {
    setAudienceTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleTrafficTagToggle = (tagId: string) => {
    setTrafficTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleExcludeTagToggle = (tagId: string) => {
    setExcludeTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  // 计算匹配的预估人数
  const calculateEstimatedMatches = () => {
    if (audienceTags.length === 0 && trafficTags.length === 0) return 0

    const selectedAudienceTags = mockAudienceTags.filter((tag) => audienceTags.includes(tag.id))
    const selectedTrafficTags = mockTrafficTags.filter((tag) => trafficTags.includes(tag.id))
    const selectedExcludeTags = mockExcludeTags.filter((tag) => excludeTags.includes(tag.id))

    let estimatedTotal = 0

    if (audienceTags.length === 0) {
      estimatedTotal = selectedTrafficTags.reduce((sum, tag) => sum + tag.count, 0)
    } else if (trafficTags.length === 0) {
      estimatedTotal = selectedAudienceTags.reduce((sum, tag) => sum + tag.count, 0)
    } else {
      // 如果两种标签都有选择，根据匹配逻辑计算
      if (matchLogic === "and") {
        // 取交集，估算为较小集合的70%
        const minCount = Math.min(
          selectedAudienceTags.reduce((sum, tag) => sum + tag.count, 0),
          selectedTrafficTags.reduce((sum, tag) => sum + tag.count, 0),
        )
        estimatedTotal = Math.floor(minCount * 0.7)
      } else {
        // 取并集，估算为两者之和的80%（考虑重叠）
        const totalCount =
          selectedAudienceTags.reduce((sum, tag) => sum + tag.count, 0) +
          selectedTrafficTags.reduce((sum, tag) => sum + tag.count, 0)
        estimatedTotal = Math.floor(totalCount * 0.8)
      }
    }

    // 减去排除标签的人数
    const excludeCount = selectedExcludeTags.reduce((sum, tag) => sum + tag.count, 0)
    return Math.max(0, estimatedTotal - excludeCount)
  }

  const estimatedMatches = calculateEstimatedMatches()

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <Tabs defaultValue="include" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="include">包含条件</TabsTrigger>
                <TabsTrigger value="exclude">排除条件</TabsTrigger>
              </TabsList>

              <TabsContent value="include" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center">
                    <TagIcon className="h-4 w-4 mr-2" />
                    人群标签选择
                  </Label>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索人群标签"
                      value={audienceSearchQuery}
                      onChange={(e) => setAudienceSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <ScrollArea className="h-[200px] rounded-md border">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3">
                      {filteredAudienceTags.map((tag) => (
                        <div
                          key={tag.id}
                          className={`border rounded-md p-2 cursor-pointer hover:bg-gray-50 ${
                            audienceTags.includes(tag.id) ? "border-blue-500 bg-blue-50" : ""
                          }`}
                          onClick={() => handleAudienceTagToggle(tag.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{tag.name}</div>
                            <Checkbox
                              checked={audienceTags.includes(tag.id)}
                              onCheckedChange={() => handleAudienceTagToggle(tag.id)}
                              className="pointer-events-none"
                            />
                          </div>
                          <div className="text-xs text-gray-500">{tag.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <Users className="h-3 w-3 inline mr-1" />
                            {tag.count}人
                          </div>
                        </div>
                      ))}

                      {filteredAudienceTags.length === 0 && (
                        <div className="col-span-full p-4 text-center text-gray-500">没有找到符合条件的人群标签</div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    流量词选择
                  </Label>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索流量词"
                      value={trafficSearchQuery}
                      onChange={(e) => setTrafficSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <ScrollArea className="h-[200px] rounded-md border">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3">
                      {filteredTrafficTags.map((tag) => (
                        <div
                          key={tag.id}
                          className={`border rounded-md p-2 cursor-pointer hover:bg-gray-50 ${
                            trafficTags.includes(tag.id) ? "border-blue-500 bg-blue-50" : ""
                          }`}
                          onClick={() => handleTrafficTagToggle(tag.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{tag.name}</div>
                            <Checkbox
                              checked={trafficTags.includes(tag.id)}
                              onCheckedChange={() => handleTrafficTagToggle(tag.id)}
                              className="pointer-events-none"
                            />
                          </div>
                          <div className="text-xs text-gray-500">{tag.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <Users className="h-3 w-3 inline mr-1" />
                            {tag.count}人
                          </div>
                        </div>
                      ))}

                      {filteredTrafficTags.length === 0 && (
                        <div className="col-span-full p-4 text-center text-gray-500">没有找到符合条件的流量词</div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">标签匹配逻辑</Label>
                  <RadioGroup value={matchLogic} onValueChange={(value) => setMatchLogic(value as "and" | "or")}>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="and" id="and" />
                        <Label htmlFor="and">同时满足所有标签（AND）</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="or" id="or" />
                        <Label htmlFor="or">满足任一标签即可（OR）</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>

              <TabsContent value="exclude" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium flex items-center">
                      <UserMinus className="h-4 w-4 mr-2" />
                      排除标签
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="auto-tag" checked={autoTagEnabled} onCheckedChange={setAutoTagEnabled} />
                      <Label htmlFor="auto-tag" className="text-sm">
                        自动为拉群成员添加标签
                      </Label>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索排除标签"
                      value={excludeSearchQuery}
                      onChange={(e) => setExcludeSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <ScrollArea className="h-[200px] rounded-md border">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3">
                      {filteredExcludeTags.map((tag) => (
                        <div
                          key={tag.id}
                          className={`border rounded-md p-2 cursor-pointer hover:bg-gray-50 ${
                            excludeTags.includes(tag.id) ? "border-red-500 bg-red-50" : ""
                          }`}
                          onClick={() => handleExcludeTagToggle(tag.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{tag.name}</div>
                            <Checkbox
                              checked={excludeTags.includes(tag.id)}
                              onCheckedChange={() => handleExcludeTagToggle(tag.id)}
                              className="pointer-events-none"
                            />
                          </div>
                          <div className="text-xs text-gray-500">{tag.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <Users className="h-3 w-3 inline mr-1" />
                            {tag.count}人
                          </div>
                        </div>
                      ))}

                      {filteredExcludeTags.length === 0 && (
                        <div className="col-span-full p-4 text-center text-gray-500">没有找到符合条件的排除标签</div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    启用自动标记后，系统将为所有被拉入群的用户添加"已拉群"标签，避免重复拉人
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <div className="p-4 bg-blue-50 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">预估匹配人数:</span>
                <span className="text-blue-700 font-bold">{estimatedMatches} 人</span>
              </div>
            </div>

            {audienceTags.length === 0 && trafficTags.length === 0 && (
              <div className="flex items-center p-3 bg-yellow-50 rounded-md text-yellow-800">
                <AlertCircle className="h-4 w-4 mr-2" />
                请至少选择一个人群标签或流量词
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          上一步
        </Button>
        <Button
          onClick={onComplete}
          className="bg-blue-500 hover:bg-blue-600"
          disabled={audienceTags.length === 0 && trafficTags.length === 0}
        >
          完成
        </Button>
      </div>
    </div>
  )
}

