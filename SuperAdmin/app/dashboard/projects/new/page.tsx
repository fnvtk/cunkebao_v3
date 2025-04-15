"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewProjectPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    account: "",
    password: "",
    confirmPassword: "",
    realName: "",
    nickname: "",
    description: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    if (formData.password !== formData.confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("http://yishi.com/company/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          account: formData.account,
          password: formData.password,
          realName: formData.realName,
          nickname: formData.nickname,
          description: formData.description
        }),
      })

      const data = await response.json()

      if (data.code === 200) {
        toast.success("创建成功")
        router.push("/dashboard/projects")
      } else {
        toast.error(data.msg || "创建失败")
      }
    } catch (error) {
      toast.error("创建失败，请稍后重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">新建项目</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>项目基本信息</CardTitle>
            <CardDescription>创建新项目需要填写项目名称并设置账号信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">项目名称</Label>
              <Input 
                id="name" 
                placeholder="请输入项目名称" 
                required 
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account">账号</Label>
                <Input 
                  id="account" 
                  placeholder="请输入账号" 
                  required 
                  value={formData.account}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">初始密码</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="请设置初始密码" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="请再次输入密码" 
                  required 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="realName">真实姓名</Label>
                <Input 
                  id="realName" 
                  placeholder="请输入真实姓名" 
                  required 
                  value={formData.realName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input 
                  id="nickname" 
                  placeholder="请输入昵称" 
                  required 
                  value={formData.nickname}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">项目介绍</Label>
              <Textarea 
                id="description" 
                placeholder="请输入项目介绍（选填）" 
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/projects">取消</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "创建中..." : "创建项目"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

