"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface WechatGroup {
  id: string
  name: string
  memberCount: number
  avatar: string
  owner: string
  customer: string
}

interface WechatGroupSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedGroups: WechatGroup[]
  onSelect: (groups: WechatGroup[]) => void
}

export function WechatGroupSelector({ open, onOpenChange, selectedGroups, onSelect }: WechatGroupSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [groups, setGroups] = useState<WechatGroup[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchGroups()
    }
  }, [open])

  const fetchGroups = async () => {
    setLoading(true)
    // 模拟从API获取群聊列表
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const mockGroups = Array.from({ length: 10 }, (_, i) => ({
      id: `group-${i}`,
      name: `群聊${i + 1}`,
      memberCount: Math.floor(Math.random() * 400) + 100,
      avatar: `/placeholder.svg?height=40&width=40&text=群${i + 1}`,
      owner: `群主${i + 1}`,
      customer: `客户${i + 1}`,
    }))
    setGroups(mockGroups)
    setLoading(false)
  }

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>选择聊天群</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索群聊"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">加载中...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-4">未找到匹配的群聊</div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg">
                <Checkbox
                  checked={selectedGroups.some((g) => g.id === group.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelect([...selectedGroups, group])
                    } else {
                      onSelect(selectedGroups.filter((g) => g.id !== group.id))
                    }
                  }}
                />
                <img src={group.avatar || "/placeholder.svg"} alt={group.name} className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <div className="font-medium">{group.name}</div>
                  <div className="text-sm text-gray-500">
                    <div>群主：{group.owner}</div>
                    <div>归属客户：{group.customer}</div>
                    <div>{group.memberCount}人</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={() => onOpenChange(false)}>确定</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

