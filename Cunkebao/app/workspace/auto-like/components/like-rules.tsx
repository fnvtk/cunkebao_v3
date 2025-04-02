"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface TimeRange {
  id: string
  start: string
  end: string
}

export interface LikeRulesData {
  enableAutoLike: boolean
  likeInterval: number
  maxLikesPerDay: number
  likeOldContent: boolean
  contentTypes: string[]
  keywordFilters: string[]
  friendGroups: string[]
  excludedGroups: string[]
  timeRanges: TimeRange[]
  randomizeInterval: boolean
  minInterval?: number
  maxInterval?: number
}

interface LikeRulesProps {
  initialData?: Partial<LikeRulesData>
  onSave: (data: LikeRulesData) => void
}

export function LikeRules({ initialData, onSave }: LikeRulesProps) {
  const [formData, setFormData] = useState<LikeRulesData>({
    enableAutoLike: initialData?.enableAutoLike ?? true,
    likeInterval: initialData?.likeInterval ?? 15,
    maxLikesPerDay: initialData?.maxLikesPerDay ?? 50,
    likeOldContent: initialData?.likeOldContent ?? false,
    contentTypes: initialData?.contentTypes ?? ["text", "image", "video"],
    keywordFilters: initialData?.keywordFilters ?? [],
    friendGroups: initialData?.friendGroups ?? ["all"],
    excludedGroups: initialData?.excludedGroups ?? [],
    timeRanges: initialData?.timeRanges ?? [{ id: "1", start: "09:00", end: "11:00" }],
    randomizeInterval: initialData?.randomizeInterval ?? false,
    minInterval: initialData?.minInterval ?? 5,
    maxInterval: initialData?.maxInterval ?? 30,
  })

  const [newKeyword, setNewKeyword] = useState("")

  // 内容类型选项
  const contentTypeOptions = [
    { id: "text", label: "纯文字动态" },
    { id: "image", label: "图片动态" },
    { id: "video", label: "视频动态" },
    { id: "link", label: "链接分享" },
    { id: "original", label: "仅原创内容" },
  ]

  // 好友分组选项（模拟数据）
  const friendGroupOptions = [
    { id: "all", label: "所有好友" },
    { id: "work", label: "工作相关" },
    { id: "family", label: "亲友" },
    { id: "clients", label: "客户" },
    { id: "potential", label: "潜在客户" },
  ]

  // 添加时间范围
  const addTimeRange = () => {
    const newId = String(formData.timeRanges.length + 1)
    setFormData({
      ...formData,
      timeRanges: [...formData.timeRanges, { id: newId, start: "12:00", end: "14:00" }],
    })
  }

  // 删除时间范围
  const removeTimeRange = (id: string) => {
    setFormData({
      ...formData,
      timeRanges: formData.timeRanges.filter((range) => range.id !== id),
    })
  }

  // 更新时间范围
  const updateTimeRange = (id: string, field: "start" | "end", value: string) => {
    setFormData({
      ...formData,
      timeRanges: formData.timeRanges.map((range) => (range.id === id ? { ...range, [field]: value } : range)),
    })
  }

  // 添加关键词
  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywordFilters.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywordFilters: [...formData.keywordFilters, newKeyword.trim()],
      })
      setNewKeyword("")
    }
  }

  // 删除关键词
  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywordFilters: formData.keywordFilters.filter((k) => k !== keyword),
    })
  }

  // 切换内容类型
  const toggleContentType = (typeId: string) => {
    setFormData({
      ...formData,
      contentTypes: formData.contentTypes.includes(typeId)
        ? formData.contentTypes.filter((id) => id !== typeId)
        : [...formData.contentTypes, typeId],
    })
  }

  // 切换好友分组
  const toggleFriendGroup = (groupId: string) => {
    if (groupId === "all") {
      setFormData({
        ...formData,
        friendGroups: ["all"],
        excludedGroups: [],
      })
      return
    }

    // 如果当前包含"all"，则移除它
    let newGroups = formData.friendGroups.filter((id) => id !== "all")

    if (formData.friendGroups.includes(groupId)) {
      newGroups = newGroups.filter((id) => id !== groupId)
      // 如果没有选择任何组，默认回到"all"
      if (newGroups.length === 0) {
        newGroups = ["all"]
      }
    } else {
      newGroups.push(groupId)
    }

    setFormData({
      ...formData,
      friendGroups: newGroups,
    })
  }

  // 切换排除分组
  const toggleExcludedGroup = (groupId: string) => {
    setFormData({
      ...formData,
      excludedGroups: formData.excludedGroups.includes(groupId)
        ? formData.excludedGroups.filter((id) => id !== groupId)
        : [...formData.excludedGroups, groupId],
    })
  }

  // 处理表单提交
  const handleSubmit = () => {
    onSave(formData)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>点赞规则设置</CardTitle>
          <CardDescription>设定自动点赞的规则和时间间隔</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基本设置 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="enableAutoLike" className="font-medium">
                  启用自动点赞
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>开启后系统将根据设置自动为朋友圈点赞</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="enableAutoLike"
                checked={formData.enableAutoLike}
                onCheckedChange={(checked) => setFormData({ ...formData, enableAutoLike: checked })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="intervalType" className="font-medium">
                  点赞间隔设置
                </Label>
                <Select
                  value={formData.randomizeInterval ? "random" : "fixed"}
                  onValueChange={(value) => setFormData({ ...formData, randomizeInterval: value === "random" })}
                  disabled={!formData.enableAutoLike}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择间隔类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">固定间隔</SelectItem>
                    <SelectItem value="random">随机间隔</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.randomizeInterval ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="minInterval" className="text-sm">
                        最小间隔（分钟）
                      </Label>
                      <span className="text-sm text-muted-foreground">{formData.minInterval}分钟</span>
                    </div>
                    <Slider
                      id="minInterval"
                      min={1}
                      max={30}
                      step={1}
                      value={[formData.minInterval || 5]}
                      onValueChange={(value) => setFormData({ ...formData, minInterval: value[0] })}
                      disabled={!formData.enableAutoLike}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maxInterval" className="text-sm">
                        最大间隔（分钟）
                      </Label>
                      <span className="text-sm text-muted-foreground">{formData.maxInterval}分钟</span>
                    </div>
                    <Slider
                      id="maxInterval"
                      min={formData.minInterval || 5}
                      max={120}
                      step={1}
                      value={[formData.maxInterval || 30]}
                      onValueChange={(value) => setFormData({ ...formData, maxInterval: value[0] })}
                      disabled={!formData.enableAutoLike}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="likeInterval" className="text-sm">
                      点赞间隔（分钟）
                    </Label>
                    <span className="text-sm text-muted-foreground">{formData.likeInterval}分钟</span>
                  </div>
                  <Slider
                    id="likeInterval"
                    min={1}
                    max={60}
                    step={1}
                    value={[formData.likeInterval]}
                    onValueChange={(value) => setFormData({ ...formData, likeInterval: value[0] })}
                    disabled={!formData.enableAutoLike}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxLikesPerDay" className="font-medium">
                  每日最大点赞数
                </Label>
                <span className="text-sm text-muted-foreground">{formData.maxLikesPerDay}个</span>
              </div>
              <Slider
                id="maxLikesPerDay"
                min={10}
                max={200}
                step={10}
                value={[formData.maxLikesPerDay]}
                onValueChange={(value) => setFormData({ ...formData, maxLikesPerDay: value[0] })}
                disabled={!formData.enableAutoLike}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="likeOldContent" className="font-medium">
                  点赞历史内容
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>开启后系统将点赞好友的历史朋友圈内容</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="likeOldContent"
                checked={formData.likeOldContent}
                onCheckedChange={(checked) => setFormData({ ...formData, likeOldContent: checked })}
                disabled={!formData.enableAutoLike}
              />
            </div>
          </div>

          {/* 内容类型设置 */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="font-medium">点赞内容类型</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {contentTypeOptions.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`content-${type.id}`}
                    checked={formData.contentTypes.includes(type.id)}
                    onCheckedChange={() => toggleContentType(type.id)}
                    disabled={!formData.enableAutoLike}
                  />
                  <Label htmlFor={`content-${type.id}`} className="text-sm">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 关键词过滤 */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="font-medium">关键词过滤</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="输入关键词"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="flex-1"
                disabled={!formData.enableAutoLike}
              />
              <Button type="button" onClick={addKeyword} disabled={!formData.enableAutoLike || !newKeyword.trim()}>
                添加
              </Button>
            </div>
            {formData.keywordFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.keywordFilters.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeKeyword(keyword)}
                      disabled={!formData.enableAutoLike}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">添加关键词后，系统将只对包含这些关键词的内容进行点赞</p>
          </div>

          {/* 好友分组设置 */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="font-medium">好友分组筛选</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {friendGroupOptions.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={formData.friendGroups.includes(group.id)}
                    onCheckedChange={() => toggleFriendGroup(group.id)}
                    disabled={!formData.enableAutoLike || (group.id !== "all" && formData.friendGroups.includes("all"))}
                  />
                  <Label htmlFor={`group-${group.id}`} className="text-sm">
                    {group.label}
                  </Label>
                </div>
              ))}
            </div>

            {!formData.friendGroups.includes("all") && (
              <div className="mt-4">
                <Label className="font-medium text-sm">排除分组</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {friendGroupOptions
                    .filter((group) => group.id !== "all" && !formData.friendGroups.includes(group.id))
                    .map((group) => (
                      <div key={`exclude-${group.id}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`exclude-${group.id}`}
                          checked={formData.excludedGroups.includes(group.id)}
                          onCheckedChange={() => toggleExcludedGroup(group.id)}
                          disabled={!formData.enableAutoLike}
                        />
                        <Label htmlFor={`exclude-${group.id}`} className="text-sm">
                          {group.label}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 时间范围设置 */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-medium">点赞时间段</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addTimeRange}
                disabled={!formData.enableAutoLike || formData.timeRanges.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加时间段
              </Button>
            </div>

            <div className="space-y-3">
              {formData.timeRanges.map((range) => (
                <div key={range.id} className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={range.start}
                    onChange={(e) => updateTimeRange(range.id, "start", e.target.value)}
                    className="w-32"
                    disabled={!formData.enableAutoLike}
                  />
                  <span>至</span>
                  <Input
                    type="time"
                    value={range.end}
                    onChange={(e) => updateTimeRange(range.id, "end", e.target.value)}
                    className="w-32"
                    disabled={!formData.enableAutoLike}
                  />
                  {formData.timeRanges.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeRange(range.id)}
                      disabled={!formData.enableAutoLike}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">设置点赞的时间段，系统将在这些时间段内执行点赞任务</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit}>保存并继续</Button>
      </div>
    </div>
  )
}

