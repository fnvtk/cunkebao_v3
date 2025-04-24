"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash } from "lucide-react"
import Link from "next/link"
import { toast, Toaster } from "sonner"

// 为React.use添加类型声明
declare module 'react' {
  function use<T>(promise: Promise<T>): T;
  function use<T>(value: T): T;
}

interface Device {
  id: number
  memo: string
}

interface Project {
  id: number
  name: string
  memo: string
  companyId: number
  createTime: string
  account: string
  phone: string | null
  deviceCount: number
  friendCount: number
  userCount: number
  username: string
  status: number
  devices?: Device[]
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { id } = React.use(params)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/detail/${id}`)
        const data = await response.json()

        if (data.code === 200) {
          setProject(data.data)
        } else {
          toast.error(data.msg || "获取项目信息失败")
        }
      } catch (error) {
        toast.error("网络错误，请稍后重试")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password && password !== confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }
    
    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: parseInt(id),
          name: project?.name,
          account: project?.account,
          memo: project?.memo,
          phone: project?.phone,
          username: project?.username,
          status: project?.status,
          ...(password && { password })
        }),
      })

      const data = await response.json()

      if (data.code === 200) {
        toast.success("更新成功")
        router.push("/dashboard/projects")
      } else {
        toast.error(data.msg)
      }
    } catch (error) {
      toast.error("网络错误，请稍后重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddDevice = () => {
    router.push(`/dashboard/projects/${id}/devices/new`)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-center" />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">编辑项目</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>项目基本信息</CardTitle>
            <CardDescription>编辑项目的名称、手机号等基础信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName">项目名称</Label>
              <Input
                id="projectName"
                value={project?.name || ""}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                placeholder="请输入项目名称"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account">登录账号</Label>
                <Input
                  id="account"
                  value={project?.account || ""}
                  onChange={(e) => setProject({ ...project, account: e.target.value })}
                  placeholder="请输入登录的账号"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input
                  id="nickname"
                  value={project?.username || ""}
                  onChange={(e) => setProject({ ...project, username: e.target.value })}
                  placeholder="用于账号登录后显示的用户名，可以填真实姓名"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  type="number"
                  value={project?.phone || ""}
                  onChange={(e) => setProject({ ...project, phone: e.target.value as string })}
                  placeholder="手机号可用于登录"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <select
                  id="status"
                  value={project?.status.toString() || "1"}
                  onChange={(e) => setProject({ ...project, status: parseInt(e.target.value) })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="1">启用</option>
                  <option value="0">禁用</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="不修改请留空"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="不修改请留空"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>关联设备</Label>
              <div className="space-y-3">
                {project && project.devices && project.devices.length > 0 && project.devices.map((device) => (
                  <div key={device.id} className="flex items-center gap-2">
                    <Input
                      value={device.memo}
                      readOnly
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddDevice} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> 添加设备
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">项目介绍</Label>
              <Textarea
                id="description"
                value={project?.memo || ""}
                onChange={(e) => setProject({ ...project, memo: e.target.value })}
                placeholder="请输入项目介绍（选填）"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/projects">取消</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存修改"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

