"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Trash2, LucideTag, Users } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface TagGroup {
  id: string
  name: string
  description: string
  type: "profession" | "interest" | "age" | "consumption" | "interaction" | "custom"
  tags: Tag[]
}

interface Tag {
  id: string
  name: string
  count: number
}

interface UserProfile {
  id: string
  name: string
  avatar: string
  tags: string[]
  profession?: string
  interest?: string
  region?: string
  lastActive?: string
}

export interface AudienceTagsData {
  selectedTags: string[]
  tagOperator: "and" | "or"
}

interface AudienceTagsProps {
  initialData?: Partial<AudienceTagsData>
  onSave: (data: AudienceTagsData) => void
  onBack: () => void
}

export function AudienceTags({ initialData, onSave, onBack }: AudienceTagsProps) {
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.selectedTags || [])
  const [tagOperator, setTagOperator] = useState<"and" | "or">(initialData?.tagOperator || "or")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [newTagName, setNewTagName] = useState("")
  const [newTagDescription, setNewTagDescription] = useState("")
  const [newTagType, setNewTagType] = useState<TagGroup["type"]>("custom")
  const [isCreateTagDialogOpen, setIsCreateTagDialogOpen] = useState(false)

  // 模拟获取标签组和用户数据
  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 模拟标签组数据
      const mockTagGroups: TagGroup[] = [
        {
          id: "profession",
          name: "职业",
          description: "按照好友的职业分类",
          type: "profession",
          tags: [
            { id: "teacher", name: "教师", count: 15 },
            { id: "doctor", name: "医生", count: 8 },
            { id: "engineer", name: "工程师", count: 22 },
            { id: "business", name: "企业白领", count: 30 },
            { id: "freelancer", name: "自由职业", count: 12 },
          ],
        },
        {
          id: "interest",
          name: "兴趣爱好",
          description: "按照好友的兴趣爱好分类",
          type: "interest",
          tags: [
            { id: "photography", name: "摄影爱好者", count: 18 },
            { id: "sports", name: "运动达人", count: 25 },
            { id: "food", name: "美食爱好者", count: 32 },
            { id: "travel", name: "旅行达人", count: 20 },
            { id: "tech", name: "科技发烧友", count: 15 },
          ],
        },
        {
          id: "age",
          name: "年龄范围",
          description: "按照好友的年龄范围分类",
          type: "age",
          tags: [
            { id: "18-25", name: "18-25岁", count: 22 },
            { id: "26-35", name: "26-35岁", count: 45 },
            { id: "36-45", name: "36-45岁", count: 30 },
            { id: "46-55", name: "46-55岁", count: 15 },
            { id: "56+", name: "56岁以上", count: 8 },
          ],
        },
        {
          id: "consumption",
          name: "消费能力",
          description: "按照好友的消费能力分类",
          type: "consumption",
          tags: [
            { id: "high", name: "高消费", count: 12 },
            { id: "medium", name: "中等消费", count: 48 },
            { id: "low", name: "低消费", count: 30 },
          ],
        },
        {
          id: "interaction",
          name: "互动频率",
          description: "按照与好友的互动频率分类",
          type: "interaction",
          tags: [
            { id: "high-interaction", name: "高频互动", count: 15 },
            { id: "medium-interaction", name: "中频互动", count: 35 },
            { id: "low-interaction", name: "低频互动", count: 40 },
            { id: "new-friend", name: "近期新添加", count: 10 },
          ],
        },
        {
          id: "custom",
          name: "自定义标签",
          description: "自定义创建的标签",
          type: "custom",
          tags: [
            { id: "potential-customer", name: "潜在客户", count: 28 },
            { id: "vip", name: "VIP客户", count: 10 },
            { id: "partner", name: "合作伙伴", count: 5 },
          ],
        },
      ]

      setTagGroups(mockTagGroups)

      // 模拟用户数据
      const mockUsers: UserProfile[] = Array.from({ length: 50 }, (_, i) => {
        const professionTag = mockTagGroups[0].tags[Math.floor(Math.random() * mockTagGroups[0].tags.length)]
        const interestTag = mockTagGroups[1].tags[Math.floor(Math.random() * mockTagGroups[1].tags.length)]
        const ageTag = mockTagGroups[2].tags[Math.floor(Math.random() * mockTagGroups[2].tags.length)]
        const consumptionTag = mockTagGroups[3].tags[Math.floor(Math.random() * mockTagGroups[3].tags.length)]
        const interactionTag = mockTagGroups[4].tags[Math.floor(Math.random() * mockTagGroups[4].tags.length)]

        // 随机选择一些标签
        const userTags = [
          professionTag.id,
          interestTag.id,
          Math.random() > 0.5 ? ageTag.id : null,
          Math.random() > 0.5 ? consumptionTag.id : null,
          Math.random() > 0.5 ? interactionTag.id : null,
        ].filter(Boolean) as string[]

        // 随机添加一些自定义标签
        if (Math.random() > 0.7) {
          const customTag = mockTagGroups[5].tags[Math.floor(Math.random() * mockTagGroups[5].tags.length)]
          userTags.push(customTag.id)
        }

        return {
          id: `user-${i + 1}`,
          name: `用户${i + 1}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
          tags: userTags,
          profession: professionTag.name,
          interest: interestTag.name,
          region: ["北京", "上海", "广州", "深圳", "杭州"][Math.floor(Math.random() * 5)],
          lastActive: `${Math.floor(Math.random() * 24)}小时前`,
        }
      })

      setUsers(mockUsers)
    }

    fetchData()
  }, [])

  // 获取所有标签
  const allTags = tagGroups.flatMap((group) => group.tags)

  // 根据选中的标签过滤用户
  const filteredUsers = users.filter((user) => {
    if (selectedTags.length === 0) return true

    if (tagOperator === "and") {
      return selectedTags.every((tagId) => user.tags.includes(tagId))
    } else {
      return selectedTags.some((tagId) => user.tags.includes(tagId))
    }
  })

  // 根据搜索查询过滤标签
  const filteredTagGroups = tagGroups
    .map((group) => ({
      ...group,
      tags: group.tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase())),
    }))
    .filter((group) => group.tags.length > 0)

  // 根据标签类型过滤标签组
  const tabFilteredTagGroups =
    activeTab === "all" ? filteredTagGroups : filteredTagGroups.filter((group) => group.id === activeTab)

  // 切换标签选择
  const toggleTag = (tagId: string) => {
    setSelectedTags(selectedTags.includes(tagId) ? selectedTags.filter((id) => id !== tagId) : [...selectedTags, tagId])
  }

  // 创建新标签
  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: `custom-${Date.now()}`,
        name: newTagName.trim(),
        count: 0,
      }

      setTagGroups(
        tagGroups.map((group) => (group.id === "custom" ? { ...group, tags: [...group.tags, newTag] } : group)),
      )

      setNewTagName("")
      setNewTagDescription("")
      setIsCreateTagDialogOpen(false)
    }
  }

  // 保存选择的标签
  const handleSave = () => {
    onSave({
      selectedTags,
      tagOperator,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>指定点赞的人群标签</CardTitle>
          <CardDescription>选择特定标签，只对带有这些标签的好友朋友圈进行点赞</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 标签选择逻辑 */}
          <div className="flex items-center space-x-4">
            <Label className="font-medium">标签匹配逻辑：</Label>
            <RadioGroup
              value={tagOperator}
              onValueChange={(value) => setTagOperator(value as "and" | "or")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="and" id="and" />
                <Label htmlFor="and">同时满足所有标签</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="or" id="or" />
                <Label htmlFor="or">满足任一标签</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 已选标签展示 */}
          <div className="space-y-2">
            <Label className="font-medium">已选标签：</Label>
            <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md">
              {selectedTags.length === 0 ? (
                <span className="text-sm text-muted-foreground">未选择任何标签，将对所有好友点赞</span>
              ) : (
                selectedTags.map((tagId) => {
                  const tag = allTags.find((t) => t.id === tagId)
                  return tag ? (
                    <Badge key={tagId} className="flex items-center gap-1">
                      {tag.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => toggleTag(tagId)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </Badge>
                  ) : null
                })
              )}
            </div>
          </div>

          {/* 标签搜索和分类 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索标签"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={isCreateTagDialogOpen} onOpenChange={setIsCreateTagDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    <Plus className="h-4 w-4 mr-1" />
                    创建标签
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建新标签</DialogTitle>
                    <DialogDescription>创建一个新的标签来分类您的好友</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="tagName">标签名称</Label>
                      <Input
                        id="tagName"
                        placeholder="输入标签名称"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tagDescription">标签描述（可选）</Label>
                      <Textarea
                        id="tagDescription"
                        placeholder="输入标签描述"
                        value={newTagDescription}
                        onChange={(e) => setNewTagDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tagType">标签类型</Label>
                      <RadioGroup
                        value={newTagType}
                        onValueChange={(value) => setNewTagType(value as TagGroup["type"])}
                        className="grid grid-cols-2 gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="profession" id="profession" />
                          <Label htmlFor="profession">职业</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="interest" id="interest" />
                          <Label htmlFor="interest">兴趣爱好</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="age" id="age" />
                          <Label htmlFor="age">年龄范围</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="consumption" id="consumption" />
                          <Label htmlFor="consumption">消费能力</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="interaction" id="interaction" />
                          <Label htmlFor="interaction">互动频率</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="custom" />
                          <Label htmlFor="custom">自定义</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateTagDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                      创建
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-7">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="profession">职业</TabsTrigger>
                <TabsTrigger value="interest">兴趣</TabsTrigger>
                <TabsTrigger value="age">年龄</TabsTrigger>
                <TabsTrigger value="consumption">消费</TabsTrigger>
                <TabsTrigger value="interaction">互动</TabsTrigger>
                <TabsTrigger value="custom">自定义</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-6">
              {tabFilteredTagGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center">
                      <LucideTag className="h-4 w-4 mr-1 text-muted-foreground" />
                      {group.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">{group.description}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer flex items-center gap-1"
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                        <span className="text-xs opacity-70">({tag.count})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}

              {tabFilteredTagGroups.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">未找到符合条件的标签</div>
              )}
            </div>
          </div>

          {/* 预览匹配的用户 */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                匹配的好友预览
              </h3>
              <Badge variant="outline">共 {filteredUsers.length} 人</Badge>
            </div>
            <ScrollArea className="h-64 border rounded-md">
              <div className="p-2 space-y-2">
                {filteredUsers.slice(0, 20).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.profession} · {user.region} · 最近活跃: {user.lastActive}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                      {user.tags.slice(0, 2).map((tagId) => {
                        const tag = allTags.find((t) => t.id === tagId)
                        return tag ? (
                          <Badge key={tagId} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ) : null
                      })}
                      {user.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">未找到匹配的好友</div>
                )}
                {filteredUsers.length > 20 && (
                  <div className="text-center py-2 text-muted-foreground text-sm">
                    显示前 20 位好友，共 {filteredUsers.length} 位匹配
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          返回上一步
        </Button>
        <Button onClick={handleSave}>完成设置</Button>
      </div>
    </div>
  )
}

