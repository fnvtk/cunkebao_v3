"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, CheckCircle2, Circle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const [libraries] = useState([
    { id: "1", name: "卡若朋友圈", count: 58 },
    { id: "2", name: "暗黑4代练", count: 422 },
    { id: "3", name: "家装设计", count: 107 },
    { id: "4", name: "美食分享", count: 321 },
    { id: "5", name: "旅游攻略", count: 89 },
  ])

  const [tempSelectedLibraries, setTempSelectedLibraries] = useState<string[]>(selectedLibraries)

  const toggleLibrary = (libraryId: string) => {
    setTempSelectedLibraries((prev) =>
      prev.includes(libraryId) ? prev.filter((id) => id !== libraryId) : [...prev, libraryId]
    )
  }

  const handleConfirm = () => {
    onSelect(tempSelectedLibraries)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTempSelectedLibraries(selectedLibraries)
    onOpenChange(false)
  }

  const filteredLibraries = libraries.filter((library) =>
    library.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle>选择内容库</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="搜索内容库"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {filteredLibraries.map((library) => (
                <div
                  key={library.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleLibrary(library.id)}
                >
                  <div>
                    <h3 className="font-medium">{library.name}</h3>
                    <p className="text-sm text-gray-500">{library.count}条内容</p>
                  </div>
                  {tempSelectedLibraries.includes(library.id) ? (
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex border-t p-4">
          <Button
            variant="outline"
            className="flex-1 mr-2"
            onClick={handleCancel}
          >
            取消
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={tempSelectedLibraries.length === 0}
          >
            确定 ({tempSelectedLibraries.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 