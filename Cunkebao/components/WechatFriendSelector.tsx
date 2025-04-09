"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface WechatFriend {
  id: string
  nickname: string
  wechatId: string
  avatar: string
  gender: "male" | "female"
  customer: string
}

interface WechatFriendSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFriends: WechatFriend[]
  onSelect: (friends: WechatFriend[]) => void
}

export function WechatFriendSelector({ open, onOpenChange, selectedFriends, onSelect }: WechatFriendSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState<WechatFriend[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchFriends()
    }
  }, [open])

  const fetchFriends = async () => {
    setLoading(true)
    // 模拟从API获取好友列表
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const mockFriends = Array.from({ length: 20 }, (_, i) => ({
      id: `friend-${i}`,
      nickname: `好友${i + 1}`,
      wechatId: `wxid_${Math.random().toString(36).substr(2, 8)}`,
      avatar: `/placeholder.svg?height=40&width=40&text=${i + 1}`,
      gender: Math.random() > 0.5 ? "male" : "female",
      customer: `客户${i + 1}`,
    }))
    setFriends(mockFriends)
    setLoading(false)
  }

  const filteredFriends = friends.filter(
    (friend) =>
      friend.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.wechatId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">加载中...</div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-4">未找到匹配的好友</div>
          ) : (
            filteredFriends.map((friend) => (
              <div key={friend.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg">
                <Checkbox
                  checked={selectedFriends.some((f) => f.id === friend.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelect([...selectedFriends, friend])
                    } else {
                      onSelect(selectedFriends.filter((f) => f.id !== friend.id))
                    }
                  }}
                />
                <Avatar>
                  <AvatarImage src={friend.avatar} />
                  <AvatarFallback>{friend.nickname[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{friend.nickname}</div>
                  <div className="text-sm text-gray-500">
                    <div>{friend.wechatId}</div>
                    <div>归属客户：{friend.customer}</div>
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

