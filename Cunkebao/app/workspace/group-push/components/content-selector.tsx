"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2 } from "lucide-react"
import type { ContentLibrary } from "@/types/group-push"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface ContentSelectorProps {
  selectedLibraries: ContentLibrary[]
  onLibrariesChange: (libraries: ContentLibrary[]) => void
  onPrevious: () => void
  onNext: () => void
  onSave: () => void
  onCancel: () => void
}

export function ContentSelector({
  selectedLibraries = [],
  onLibrariesChange,
  onPrevious,
  onNext,
  onSave,
  onCancel,
}: ContentSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [libraries, setLibraries] = useState<ContentLibrary[]>([])
  const [loading, setLoading] = useState(false)

  // 拉取内容库列表
  const fetchLibraries = async (keyword = "") => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        keyword: keyword.trim(),
      })
      const res = await api.get(`/v1/content/library/list?${params.toString()}`) as any
      if (res.code === 200 && Array.isArray(res.data?.list)) {
        setLibraries(res.data.list)
      } else {
        setLibraries([])
        showToast(res.msg || "获取内容库失败", "error")
      }
    } catch (e) {
      setLibraries([])
      showToast((e as any)?.message || "网络错误", "error")
    } finally {
      setLoading(false)
    }
  }

  // 弹窗打开/搜索时拉取
  useEffect(() => {
    if (isDialogOpen) {
      fetchLibraries(searchTerm)
    }
    // eslint-disable-next-line
  }, [isDialogOpen])

  const handleSearch = () => {
    fetchLibraries(searchTerm)
  }

  const handleAddLibrary = (library: ContentLibrary) => {
    if (!selectedLibraries.some((l) => l.id === library.id)) {
      onLibrariesChange([...selectedLibraries, library])
    }
    setIsDialogOpen(false)
  }

  const handleRemoveLibrary = (libraryId: string) => {
    onLibrariesChange(selectedLibraries.filter((library) => library.id !== libraryId))
  }

  const filteredLibraries = libraries.filter((library) =>
    library.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="font-medium text-sm">选择内容库:</span>
              </div>
              <Button variant="default" size="sm" onClick={() => setIsDialogOpen(true)} className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                选择内容库
              </Button>
            </div>

            <div className="overflow-x-auto">
              {selectedLibraries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">序号</TableHead>
                      <TableHead>内容库名称</TableHead>
                      <TableHead>采集对象</TableHead>
                      <TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedLibraries.map((library, index) => (
                      <TableRow key={library.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{library.name}</TableCell>
                        <TableCell>
                          <div className="flex -space-x-2 flex-wrap">
                            {(((library as any).sourceType === 1 ? (library as any).selectedFriends : (library as any).selectedGroups) || []).map((target: any) => (
                              <div
                                key={target.id}
                                className="w-10 h-10 rounded-md overflow-hidden border-2 border-white"
                              >
                                <img
                                  src={target.avatar || "/placeholder.svg?height=40&width=40"}
                                  alt={target.nickname || target.name || "Target"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveLibrary(library.id)}
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
                <div className="border rounded-md p-8 text-center text-gray-500">请点击"选择内容库"按钮添加内容库</div>
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
            <DialogTitle>选择内容库</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative flex items-center gap-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="搜索内容库名称"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <Button size="sm" variant="outline" onClick={handleSearch}>搜索</Button>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center text-gray-400 py-8">加载中...</div>
              ) : filteredLibraries.length === 0 ? (
                <div className="text-center text-gray-400 py-8">暂无内容库</div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">序号</TableHead>
                    <TableHead>内容库名称</TableHead>
                    <TableHead>采集对象</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLibraries.map((library, index) => (
                    <TableRow key={library.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{library.name}</TableCell>
                      <TableCell>
                        <div className="flex -space-x-2 flex-wrap">
                            {(((library as any).sourceType === 1 ? (library as any).selectedFriends : (library as any).selectedGroups) || []).map((target: any) => (
                              <div
                                key={target.id}
                                className="w-10 h-10 rounded-md overflow-hidden border-2 border-white"
                              >
                              <img
                                src={target.avatar || "/placeholder.svg?height=40&width=40"}
                                  alt={target.nickname || target.name || "Target"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                            variant="default"
                          size="sm"
                          onClick={() => handleAddLibrary(library)}
                            disabled={selectedLibraries.some((l) => String(l.id) === String(library.id))}
                        >
                            {selectedLibraries.some((l) => String(l.id) === String(library.id)) ? "已添加" : "添加"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

