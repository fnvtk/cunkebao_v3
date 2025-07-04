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
import { WechatGroupMember } from "@/types/wechat"

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

interface GroupMemberListResponse {
  list: any[]
  total: number
}

interface WechatGroupMemberSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  selectedMembers: WechatGroupMember[]
  onSelect: (members: WechatGroupMember[]) => void
}

export function WechatGroupMemberSelector({ 
  open, 
  onOpenChange, 
  groupId,
  selectedMembers, 
  onSelect 
}: WechatGroupMemberSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [members, setMembers] = useState<WechatGroupMember[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [tempSelectedMembers, setTempSelectedMembers] = useState<WechatGroupMember[]>([])
  const pageSize = 20

  useEffect(() => {
    if (open && groupId) {
      fetchGroupMembers(1)
      
      // 过滤出当前群组的已选成员
      const currentGroupSelectedMembers = selectedMembers.filter(member => member.groupId === groupId)
      setTempSelectedMembers(currentGroupSelectedMembers)
    }
  }, [open, groupId, selectedMembers])

  const fetchGroupMembers = async (pageNum: number) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
        groupId: groupId,
        ...(searchQuery ? { keyword: searchQuery } : {})
      })
      
      const response = await api.get<ApiResponse<GroupMemberListResponse>>(`/v1/chatroom/getMemberList?${queryParams.toString()}`)
      
      if (response.code === 200 && response.data) {
        const membersList = response.data.list.map((item: any) => {
          // 确定角色类型
          let role: "owner" | "admin" | "member" | undefined;
          if (item.isOwner) {
            role = "owner";
          } else if (item.isAdmin) {
            role = "admin";
          } else {
            role = "member";
          }
          
          const memberId = item.id || `member-${Math.random()}`;
          
          // 创建成员对象
          const member = {
            id: memberId,
            nickname: item.name || item.ownerNickname || '未知成员',
            wechatId: item.ownerWechatId || item.identifier || '',
            avatar: item.ownerAvatar || item.avatar || '/placeholder.svg',
            role: role,
            joinTime: item.createTime ? new Date(item.createTime * 1000).toLocaleString() : '--',
            groupId: groupId
          };
          
          return member;
        });
        
        // 处理已选择的成员
        // 如果已选择的成员在新获取的成员列表中，更新其信息
        const updatedTempSelected = tempSelectedMembers.map(selected => {
          const foundInNewList = membersList.find(m => m.id === selected.id);
          if (foundInNewList) {
            return {
              ...selected,
              nickname: foundInNewList.nickname,
              avatar: foundInNewList.avatar,
              wechatId: foundInNewList.wechatId,
              role: foundInNewList.role
            };
          }
          return selected;
        });
        
        setTempSelectedMembers(updatedTempSelected);
        setMembers(membersList)
        setTotalItems(response.data.total)
        setTotalPages(Math.ceil(response.data.total / pageSize))
        setPage(pageNum)
      } else {
        showToast(response.msg || "获取群成员列表失败", "error")
      }
    } catch (error: any) {
      console.error("获取群成员列表失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchGroupMembers(1)
  }

  const handlePrevPage = () => {
    if (page > 1) {
      fetchGroupMembers(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchGroupMembers(page + 1)
    }
  }

  const handleSelect = (member: WechatGroupMember, checked: boolean) => {
    if (checked) {
      // 添加成员
      setTempSelectedMembers([...tempSelectedMembers, member]);
    } else {
      // 移除成员
      setTempSelectedMembers(tempSelectedMembers.filter(m => m.id !== member.id));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>选择群成员</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索群成员"
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
          ) : members.length === 0 ? (
            <div className="text-center py-4">未找到匹配的群成员</div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg">
                <Checkbox
                  checked={tempSelectedMembers.some((m) => m.id === member.id)}
                  onCheckedChange={(checked) => handleSelect(member, checked === true)}
                />
                <Avatar>
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.nickname?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {member.nickname}
                    {member.role === 'owner' && <span className="ml-1 text-xs text-red-500">(群主)</span>}
                    {member.role === 'admin' && <span className="ml-1 text-xs text-blue-500">(管理员)</span>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.wechatId && <div className="truncate">微信ID：{member.wechatId}</div>}
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
              总计 {totalItems} 个成员
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
            // 从selectedMembers中移除当前群组的所有成员，然后添加新选择的成员
            const otherGroupMembers = selectedMembers.filter(member => member.groupId !== groupId);
            onSelect([...otherGroupMembers, ...tempSelectedMembers]);
            onOpenChange(false);
          }}>
            确定 ({tempSelectedMembers.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 