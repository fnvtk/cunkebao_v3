"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Trash2 } from "lucide-react"
import type { WechatGroup } from "@/types/group-push"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface GroupSelectorProps {
  selectedGroups: WechatGroup[]
  onGroupsChange: (groups: WechatGroup[]) => void
  onPrevious: () => void
  onNext: () => void
  onSave: () => void
  onCancel: () => void
}

export function GroupSelector({
  selectedGroups = [],
  onGroupsChange,
  onPrevious,
  onNext,
  onSave,
  onCancel,
}: GroupSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [groups, setGroups] = useState<WechatGroup[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // 拉取群列表
  const fetchGroups = async (page = 1, keyword = "") => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        keyword: keyword.trim(),
      })
      const res = await api.get(`/v1/workbench/group-list?${params.toString()}`) as any
      if (res.code === 200 && Array.isArray(res.data.list)) {
        const mappedList = (res.data.list || []).map((item: any) => ({
          ...item, // 保留所有原始字段，方便渲染
          id: String(item.id),
          name: item.groupName,
          avatar: item.groupAvatar,
          serviceAccount: {
            id: item.ownerWechatId,
            name: item.nickName,
            avatar: item.avatar, // 可补充
          },
        }))
        setGroups(mappedList)
        setTotal(res.data.total || mappedList.length)
      } else {
        setGroups([])
        setTotal(0)
        showToast(res.msg || "获取群列表失败", "error")
      }
    } catch (e) {
      setGroups([])
      setTotal(0)
      showToast((e as any)?.message || "网络错误", "error")
    } finally {
      setLoading(false)
    }
  }

  // 弹窗打开/搜索/翻页时拉取
  useEffect(() => {
    if (isDialogOpen) {
      fetchGroups(currentPage, searchTerm)
    }
    // eslint-disable-next-line
  }, [isDialogOpen, currentPage])

  // 搜索时重置页码
  const handleSearch = () => {
    setCurrentPage(1)
    fetchGroups(1, searchTerm)
  }

  const handleAddGroup = (group: WechatGroup) => {
    if (!selectedGroups.some((g) => g.id === group.id)) {
      onGroupsChange([...selectedGroups, group])
    }
    setIsDialogOpen(false)
  }

  const handleRemoveGroup = (groupId: string) => {
    onGroupsChange(selectedGroups.filter((group) => group.id !== groupId))
  }

  // 过滤客服（本地过滤）
  const filteredGroups = groups.filter((group) => {
    const matchesService = !serviceFilter || group.serviceAccount?.name?.includes(serviceFilter)
    return matchesService
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="font-medium text-sm">推送社群:</span>
              </div>
              <Button variant="default" size="sm" onClick={() => setIsDialogOpen(true)} className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                选择微信聊天群
              </Button>
            </div>

            <div className="overflow-x-auto">
              {selectedGroups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">序号</TableHead>
                      <TableHead>群信息</TableHead>
                      <TableHead>推送客服</TableHead>
                      <TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedGroups.map((group, index) => (
                      <TableRow key={group.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={group.avatar || "/placeholder.svg?height=32&width=32"}
                                alt={group.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{group.name}</div>
                              <div className="text-xs text-gray-500">群主：{group.serviceAccount?.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-500">群主：{group.serviceAccount?.name}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveGroup(group.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="border rounded-md p-8 text-center text-gray-500">
                  请点击"选择微信聊天群"按钮添加群组
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-2 justify-center sm:justify-end">
        <Button type="button" variant="outline" onClick={onPrevious} className="flex-1 sm:flex-none">
          上一步
        </Button>
        <Button type="button" onClick={onNext} className="flex-1 sm:flex-none">
          下一步
        </Button>
        <Button type="button" variant="outline" onClick={onSave} className="flex-1 sm:flex-none">
          保存
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
          取消
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>选择微信聊天群</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="搜索群聊名称"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="sm:w-64">
                <Input
                  placeholder="按归属客服筛选"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                />
              </div>
              <Button size="sm" variant="outline" onClick={handleSearch}>搜索</Button>
            </div>
            <div className="overflow-x-auto max-h-96">
              {loading ? (
                <div className="text-center text-gray-400 py-8">加载中...</div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center text-gray-400 py-8">暂无群聊</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">序号</TableHead>
                      <TableHead>群信息</TableHead>
                      <TableHead>推送客服</TableHead>
                      <TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group, index) => (
                      <TableRow key={group.id}>
                        <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={group.avatar || "/placeholder.svg?height=32&width=32"}
                                alt={group.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{group.name}</div>
                              <div className="text-xs text-gray-500">群主：{group.serviceAccount?.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-500">群主：{group.serviceAccount?.name}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAddGroup(group)}
                            disabled={selectedGroups.some((g) => g.id === group.id)}
                          >
                            {selectedGroups.some((g) => g.id === group.id) ? "已添加" : "添加"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            {/* 分页 */}
            {total > pageSize && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>上一页</Button>
                <span className="text-sm text-gray-500">第 {currentPage} / {Math.ceil(total / pageSize)} 页</span>
                <Button size="sm" variant="outline" disabled={currentPage === Math.ceil(total / pageSize)} onClick={() => setCurrentPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}>下一页</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

