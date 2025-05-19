"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, X, Edit2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TagSettingsProps {
  formData: any
  onChange: (data: any) => void
  onNext?: () => void
  onPrev?: () => void
}

interface Tag {
  id: string
  name: string
  keywords: string[]
}

export function TagSettings({ formData, onChange, onNext, onPrev }: TagSettingsProps) {
  const [tags, setTags] = useState<Tag[]>(formData.tags || [])
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const [newTagKeywords, setNewTagKeywords] = useState("")
  const [hasWarnings, setHasWarnings] = useState(false)

  // 当标签更新时，更新formData
  useEffect(() => {
    onChange({ ...formData, tags })
  }, [tags, onChange])

  // 检查是否有标签
  useEffect(() => {
    setHasWarnings(tags.length === 0)
  }, [tags])

  const handleAddTag = () => {
    if (!newTagName.trim()) return

    const keywordsArray = newTagKeywords
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k !== "")

    if (editingTag) {
      // 编辑现有标签
      setTags(
        tags.map((tag) => (tag.id === editingTag.id ? { ...tag, name: newTagName, keywords: keywordsArray } : tag)),
      )
    } else {
      // 添加新标签
      setTags([
        ...tags,
        {
          id: Date.now().toString(),
          name: newTagName,
          keywords: keywordsArray,
        },
      ])
    }

    // 重置表单
    setNewTagName("")
    setNewTagKeywords("")
    setEditingTag(null)
    setIsAddTagDialogOpen(false)
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagKeywords(tag.keywords.join("\n"))
    setIsAddTagDialogOpen(true)
  }

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId))
  }

  const handleNext = () => {
    // 确保onNext是一个函数
    if (typeof onNext === "function") {
      onNext()
    }
  }

  const handlePrev = () => {
    // 确保onPrev是一个函数
    if (typeof onPrev === "function") {
      onPrev()
    }
  }

  const handleCancel = () => {
    setNewTagName("")
    setNewTagKeywords("")
    setEditingTag(null)
    setIsAddTagDialogOpen(false)
  }

  return (
    <div className="w-full p-4 bg-gray-50">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">标签列表</Label>
            <Button onClick={() => setIsAddTagDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" /> 添加标签
            </Button>
          </div>

          {tags.length === 0 ? (
            <div className="border rounded-md p-8 text-center text-gray-500">
              暂无标签，点击"添加标签"按钮来创建标签
            </div>
          ) : (
            <div className="space-y-3">
              {tags.map((tag) => (
                <div key={tag.id} className="border rounded-md p-3 flex justify-between items-center">
                  <div>
                    <Badge className="mb-2">{tag.name}</Badge>
                    <div className="text-sm text-gray-500">
                      {tag.keywords.length > 0 ? `关键词: ${tag.keywords.join(", ")}` : "无关键词"}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditTag(tag)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTag(tag.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasWarnings && (
            <Alert variant="destructive" className="mt-4 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription>建议添加至少一个标签，以便更好地管理客户。</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handlePrev}>
            上一步
          </Button>
          <Button onClick={handleNext}>下一步</Button>
        </div>
      </div>

      <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTag ? "编辑标签" : "添加标签"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-green-50 p-3 rounded-md text-sm text-green-700">
              设置关键字后，当评论/私信有涉及到关键字时自动添加标签
            </div>

            <div className="space-y-2">
              <Input
                placeholder="请输入标签名称(最长6位字符)"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value.slice(0, 6))}
              />
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="(非必填项) 请输入关键词，一行代表一个关键词"
                rows={5}
                value={newTagKeywords}
                onChange={(e) => setNewTagKeywords(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button type="button" onClick={handleAddTag}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

