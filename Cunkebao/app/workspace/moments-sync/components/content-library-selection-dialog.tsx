"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface ContentLibrary {
  id: string
  name: string
  sourceType: number
  creatorName: string
  updateTime: string
  status: number
}

interface ContentLibrarySelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedLibraries: string[]
  onSelect: (libraries: string[]) => void
}

export function ContentLibrarySelectionDialog({
  open,
  onOpenChange,
  selectedLibraries,
  onSelect,
}: ContentLibrarySelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [libraries, setLibraries] = useState<ContentLibrary[]>([])
  const [tempSelected, setTempSelected] = useState<string[]>([])

  // 获取内容库列表
  const fetchLibraries = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(searchQuery ? { keyword: searchQuery } : {})
      })
      const response = await api.get<{
        code: number
        msg: string
        data: {
          list: ContentLibrary[]
          total: number
        }
      }>(`/v1/content/library/list?${queryParams.toString()}`)

      if (response.code === 200 && response.data) {
        setLibraries(response.data.list)
      } else {
        showToast(response.msg || "获取内容库列表失败", "error")
      }
    } catch (error: any) {
      console.error("获取内容库列表失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchLibraries()
      setTempSelected(selectedLibraries)
    }
  }, [open, searchQuery, selectedLibraries])

  const handleRefresh = () => {
    fetchLibraries()
  }

  const handleSelectAll = () => {
    if (tempSelected.length === libraries.length) {
      setTempSelected([])
    } else {
      setTempSelected(libraries.map(lib => lib.id))
    }
  }

  const handleLibraryToggle = (libraryId: string) => {
    setTempSelected(prev => 
      prev.includes(libraryId) 
        ? prev.filter(id => id !== libraryId)
        : [...prev, libraryId]
    )
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setTempSelected(selectedLibraries)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>选择内容库</DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索内容库"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-500">
            已选择 {tempSelected.length} 个内容库
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              disabled={loading || libraries.length === 0}
            >
              {tempSelected.length === libraries.length ? "取消全选" : "全选"}
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] -mx-6 px-6">
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                加载中...
              </div>
            ) : libraries.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                暂无数据
              </div>
            ) : (
              libraries.map((library) => (
                <Label
                  key={library.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  htmlFor={library.id}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
                    <Checkbox 
                      id={library.id}
                      checked={tempSelected.includes(library.id)}
                      onCheckedChange={() => handleLibraryToggle(library.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate mb-1">{library.name}</div>
                      <div className="text-sm text-gray-500 truncate mb-1">创建人：{library.creatorName}</div>
                      <div className="text-sm text-gray-500 truncate">更新时间：{new Date(library.updateTime).toLocaleString()}</div>
                    </div>
                  </div>
                  {/* <Badge variant={library.status === 1 ? "default" : "secondary"}>
                    {library.status === 1 ? "启用" : "已停用"}
                  </Badge> */}
                </Label>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          {/* <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
            取消
          </Button> */}
          <Button onClick={() => {
            onSelect(tempSelected)
            onOpenChange(false)
          }}>
            确定{tempSelected.length > 0 ? ` (${tempSelected.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 