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
import { WechatGroup } from "@/types/wechat"

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

interface GroupListResponse {
  list: any[]
  total: number
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
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [tempSelectedGroups, setTempSelectedGroups] = useState<WechatGroup[]>([])
  const pageSize = 20

  useEffect(() => {
    if (open) {
      fetchGroups(1)
      setTempSelectedGroups([...selectedGroups])
    }
  }, [open, selectedGroups])

  const fetchGroups = async (pageNum: number) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
        ...(searchQuery ? { keyword: searchQuery } : {})
      })
      
      const response = await api.get<ApiResponse<GroupListResponse>>(`/v1/chatroom?${queryParams.toString()}`)
      
      if (response.code === 200 && response.data) {
        const groupsList = response.data.list.map(item => ({
          id: item.id || `group-${Math.random()}`,
          name: item.name || item.chatroomName || '未知群聊',
          memberCount: item.memberCount || 0,
          avatar: item.avatar || '/placeholder.svg',
          customer: item.ownerNickname || '--'
        }))
        
        setGroups(groupsList)
        setTotalItems(response.data.total)
        setTotalPages(Math.ceil(response.data.total / pageSize))
        setPage(pageNum)
      } else {
        showToast(response.msg || "获取群聊列表失败", "error")
      }
    } catch (error: any) {
      console.error("获取群聊列表失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
    setLoading(false)
  }
  }

  const handleSearch = () => {
    fetchGroups(1)
  }

  const handlePrevPage = () => {
    if (page > 1) {
      fetchGroups(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchGroups(page + 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>选择聊天群</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索群聊"
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
          ) : groups.length === 0 ? (
            <div className="text-center py-4">未找到匹配的群聊</div>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg">
                <Checkbox
                  checked={tempSelectedGroups.some((g) => g.id === group.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setTempSelectedGroups([...tempSelectedGroups, group])
                    } else {
                      setTempSelectedGroups(tempSelectedGroups.filter((g) => g.id !== group.id))
                    }
                  }}
                />
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={group.avatar} />
                  <AvatarFallback className="rounded-lg">{group.name?.[0] || '群'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{group.name}</div>
                  <div className="text-sm text-gray-500">
                    <div className="truncate">归属客户：{group.customer}</div>
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
              总计 {totalItems} 个群聊
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
          <Button onClick={() => {
            onSelect(tempSelectedGroups)
            onOpenChange(false)
          }}>
            确定 ({tempSelectedGroups.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

