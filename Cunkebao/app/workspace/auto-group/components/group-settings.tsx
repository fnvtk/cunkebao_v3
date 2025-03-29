"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info, Plus, Minus, User, Users, X, Search } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

interface WechatFriend {
  id: string
  nickname: string
  wechatId: string
  avatar: string
  tags: string[]
}

interface GroupSettingsProps {
  onNext: () => void
  initialValues?: {
    name: string
    fixedWechatIds: string[]
    groupingOption: "all" | "fixed"
    fixedGroupCount: number
  }
  onValuesChange: (values: {
    name: string
    fixedWechatIds: string[]
    groupingOption: "all" | "fixed"
    fixedGroupCount: number
  }) => void
}

export function GroupSettings({ onNext, initialValues, onValuesChange }: GroupSettingsProps) {
  const [name, setName] = useState(initialValues?.name || "新建群计划")
  const [fixedWechatIds, setFixedWechatIds] = useState<string[]>(initialValues?.fixedWechatIds || [])
  const [newWechatId, setNewWechatId] = useState("")
  const [groupingOption, setGroupingOption] = useState<"all" | "fixed">(initialValues?.groupingOption || "all")
  const [fixedGroupCount, setFixedGroupCount] = useState(initialValues?.fixedGroupCount || 5)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [friendSelectorOpen, setFriendSelectorOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState<WechatFriend[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFriends, setSelectedFriends] = useState<WechatFriend[]>([])

  // 微信群人数固定为38人
  const GROUP_SIZE = 38
  // 系统建议的最大群组数
  const RECOMMENDED_MAX_GROUPS = 20
  // 最多可选择的微信号数量
  const MAX_WECHAT_IDS = 5

  // 只在组件挂载时执行一次初始验证
  useEffect(() => {
    validateSettings()
    fetchFriends()
  }, [])

  // 当值变化时，通知父组件
  useEffect(() => {
    const timer = setTimeout(() => {
      onValuesChange({
        name,
        fixedWechatIds,
        groupingOption,
        fixedGroupCount,
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [name, fixedWechatIds, groupingOption, fixedGroupCount, onValuesChange])

  const fetchFriends = async () => {
    setLoading(true)
    // 模拟从API获取好友列表
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const mockFriends = Array.from({ length: 20 }, (_, i) => ({
      id: `friend-${i}`,
      nickname: `好友${i + 1}`,
      wechatId: `wxid_${Math.random().toString(36).substring(2, 8)}`,
      avatar: `/placeholder.svg?height=40&width=40&text=${i + 1}`,
      tags: i % 3 === 0 ? ["重要客户"] : i % 3 === 1 ? ["潜在客户", "已沟通"] : ["新客户"],
    }))
    setFriends(mockFriends)
    setLoading(false)
  }

  const validateSettings = () => {
    setError(null)
    setWarning(null)

    if (!name.trim()) {
      setError("计划名称不能为空")
      return false
    }

    if (fixedWechatIds.length === 0) {
      setError("请至少添加一个固定微信号")
      return false
    }

    if (groupingOption === "fixed") {
      if (fixedGroupCount <= 0) {
        setError("群组数必须大于0")
        return false
      }

      if (fixedGroupCount > RECOMMENDED_MAX_GROUPS) {
        setWarning(`创建${fixedGroupCount}个群可能会消耗较多资源，建议减少群组数量`)
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateSettings()) {
      onNext()
    }
  }

  const adjustGroupCount = (delta: number) => {
    setFixedGroupCount((prev) => {
      const newValue = Math.max(1, prev + delta)
      return newValue
    })
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleNewWechatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewWechatId(e.target.value)
  }

  const handleGroupCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setFixedGroupCount(value)
  }

  const handleGroupingOptionChange = (value: string) => {
    setGroupingOption(value as "all" | "fixed")
  }

  const addWechatId = () => {
    if (!newWechatId.trim()) return

    if (fixedWechatIds.includes(newWechatId.trim())) {
      setError("该微信号已添加")
      return
    }

    if (fixedWechatIds.length >= MAX_WECHAT_IDS) {
      setError(`最多只能添加${MAX_WECHAT_IDS}个微信号`)
      return
    }

    setFixedWechatIds((prev) => [...prev, newWechatId.trim()])
    setNewWechatId("")
    setError(null)
  }

  const removeWechatId = (id: string) => {
    setFixedWechatIds((prev) => prev.filter((wid) => wid !== id))
  }

  const openFriendSelector = () => {
    if (fixedWechatIds.length >= MAX_WECHAT_IDS) {
      setError(`最多只能添加${MAX_WECHAT_IDS}个微信号`)
      return
    }
    setFriendSelectorOpen(true)
  }

  const handleFriendSelection = () => {
    const newIds = selectedFriends.map((f) => f.wechatId).filter((id) => !fixedWechatIds.includes(id))

    const combinedIds = [...fixedWechatIds, ...newIds]

    if (combinedIds.length > MAX_WECHAT_IDS) {
      setError(`最多只能添加${MAX_WECHAT_IDS}个微信号，已自动截取前${MAX_WECHAT_IDS}个`)
      setFixedWechatIds(combinedIds.slice(0, MAX_WECHAT_IDS))
    } else {
      setFixedWechatIds(combinedIds)
    }

    setFriendSelectorOpen(false)
    setSelectedFriends([])
  }

  const toggleFriendSelection = (friend: WechatFriend) => {
    setSelectedFriends((prev) => {
      const isSelected = prev.some((f) => f.id === friend.id)
      if (isSelected) {
        return prev.filter((f) => f.id !== friend.id)
      } else {
        return [...prev, friend]
      }
    })
  }

  const filteredFriends = friends.filter(
    (friend) =>
      friend.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.wechatId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // 计算总人数
  const totalMembers = groupingOption === "fixed" ? fixedGroupCount * GROUP_SIZE : "根据好友总数自动计算"

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">
                  计划名称<span className="text-red-500">*</span>
                </Label>
                <Input id="name" value={name} onChange={handleNameChange} placeholder="请输入计划名称" />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center">
                  固定微信号<span className="text-red-500">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-1 inline text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>这些微信号将被添加到每个群中</p>
                        <p>如不在好友列表中，系统将先添加为好友</p>
                        <p>最多可添加5个微信号</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>

                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      value={newWechatId}
                      onChange={handleNewWechatIdChange}
                      placeholder="请输入微信号"
                      className="pl-9"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addWechatId()
                        }
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={addWechatId}
                    disabled={!newWechatId.trim() || fixedWechatIds.length >= MAX_WECHAT_IDS}
                  >
                    添加
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={openFriendSelector}
                    disabled={fixedWechatIds.length >= MAX_WECHAT_IDS}
                  >
                    选择好友
                  </Button>
                </div>

                {fixedWechatIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {fixedWechatIds.map((id) => (
                      <Badge key={id} variant="secondary" className="px-3 py-1">
                        {id}
                        <button
                          type="button"
                          className="ml-2 text-gray-500 hover:text-gray-700"
                          onClick={() => removeWechatId(id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-1">
                  已添加 {fixedWechatIds.length}/{MAX_WECHAT_IDS} 个微信号
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-base font-medium">分组方式</Label>
                <RadioGroup value={groupingOption} onValueChange={handleGroupingOptionChange}>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="all" id="all" className="mt-1" />
                      <div>
                        <Label htmlFor="all" className="font-medium">
                          所有好友自动分组
                        </Label>
                        <p className="text-sm text-gray-500">系统将根据好友总数自动计算需要创建的群数量</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="fixed" className="font-medium">
                          指定群数量
                        </Label>
                        <p className="text-sm text-gray-500 mb-2">手动指定需要创建的群数量</p>

                        {groupingOption === "fixed" && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Label htmlFor="groupCount" className="whitespace-nowrap">
                              计划创建群组数:
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => adjustGroupCount(-1)}
                                disabled={fixedGroupCount <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                id="groupCount"
                                type="number"
                                value={fixedGroupCount}
                                onChange={handleGroupCountChange}
                                className="w-20 text-center"
                                min={1}
                              />
                              <Button type="button" variant="outline" size="icon" onClick={() => adjustGroupCount(1)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                              <span className="text-gray-500">组</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-md">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 mr-2 text-blue-700" />
                <span className="text-blue-700 font-medium">群配置信息</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700">每个群人数:</span>
                <span className="text-blue-700 font-bold">{GROUP_SIZE} 人</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-blue-700">预计总人数:</span>
                <span className="text-blue-700 font-bold">{totalMembers}</span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {warning && (
              <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{warning}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          className="bg-blue-500 hover:bg-blue-600"
          disabled={fixedWechatIds.length === 0 || !!error}
        >
          下一步
        </Button>
      </div>

      <Dialog open={friendSelectorOpen} onOpenChange={setFriendSelectorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>选择微信好友</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索好友"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="mt-4 h-[400px]">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4">加载中...</div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-4">未找到匹配的好友</div>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                    onClick={() => toggleFriendSelection(friend)}
                  >
                    <Checkbox
                      checked={selectedFriends.some((f) => f.id === friend.id)}
                      onCheckedChange={() => toggleFriendSelection(friend)}
                    />
                    <Avatar>
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.nickname[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{friend.nickname}</div>
                      <div className="text-sm text-gray-500">{friend.wechatId}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {friend.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setFriendSelectorOpen(false)}>
              取消
            </Button>
            <Button onClick={handleFriendSelection} disabled={selectedFriends.length === 0}>
              确定 ({selectedFriends.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

