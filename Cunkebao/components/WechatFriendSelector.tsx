"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface WechatFriend {
  id: string
  nickname: string
  wechatId: string
  avatar: string
  gender?: "male" | "female"
  customer?: string
  alias?: string
  ownerNickname?: string
  ownerAlias?: string
  createTime?: string
}

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

interface FriendListResponse {
  list: any[]
  total: number
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
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 20

  useEffect(() => {
    if (open) {
      fetchFriends(1)
    }
  }, [open])

  const fetchFriends = async (pageNum: number) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
        ...(searchQuery ? { keyword: searchQuery } : {})
      })
      
      const response = await api.get<ApiResponse<FriendListResponse>>(`/v1/friend?${queryParams.toString()}`)
      
      if (response.code === 200 && response.data) {
        const friendsList = response.data.list.map(item => ({
          id: item.id || item.wechatId || `${item.nickname}-${Math.random()}`,
          nickname: item.nickname || '未知好友',
          wechatId: item.wechatId || '',
          avatar: item.avatar || '/placeholder.svg',
          alias: item.alias || '',
          ownerNickname: item.ownerNickname || '',
          ownerAlias: item.ownerAlias || item.ownerWechatId || '',
          createTime: item.createTime || '--'
        }))
        
        setFriends(friendsList)
        setTotalItems(response.data.total)
        setTotalPages(Math.ceil(response.data.total / pageSize))
        setPage(pageNum)
      } else {
        showToast(response.msg || "获取好友列表失败", "error")
      }
    } catch (error: any) {
      console.error("获取好友列表失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchFriends(1)
  }

  const handlePrevPage = () => {
    if (page > 1) {
      fetchFriends(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchFriends(page + 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>选择微信好友</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索好友"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleSearch}
            disabled={loading}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">加载中...</div>
          ) : friends.length === 0 ? (
            <div className="text-center py-4">未找到匹配的好友</div>
          ) : (
            friends.map((friend) => (
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
                  <AvatarFallback>{friend.nickname?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{friend.nickname}</div>
                  <div className="text-sm text-gray-500">
                    {friend.wechatId && <div className="truncate">微信ID：{friend.alias || friend.wechatId}</div>}
                    {friend.ownerNickname && <div className="truncate">归属客户：{friend.ownerNickname} ({friend.ownerAlias || '--'})</div>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* 分页控制 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <div className="text-sm text-gray-500">
              总计 {totalItems} 个好友
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePrevPage} 
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {page} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNextPage} 
                disabled={page === totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={() => onOpenChange(false)}>确定 ({selectedFriends.length})</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

