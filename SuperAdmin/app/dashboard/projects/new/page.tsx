"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [devices, setDevices] = useState([{ id: "1", name: "" }])

  const handleAddDevice = () => {
    setDevices([...devices, { id: Date.now().toString(), name: "" }])
  }

  const handleRemoveDevice = (id: string) => {
    setDevices(devices.filter((device) => device.id !== id))
  }

  const handleDeviceChange = (id: string, value: string) => {
    setDevices(devices.map((device) => (device.id === id ? { ...device, name: value } : device)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/dashboard/projects")
    }, 1500)
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
              <Label htmlFor="projectName">项目名称</Label>
              <Input id="projectName" placeholder="请输入项目名称" required />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input id="phone" placeholder="请输入手机号" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">账号</Label>
                <Input id="account" placeholder="请输入账号" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">初始密码</Label>
                <Input id="password" type="password" placeholder="请设置初始密码" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input id="confirmPassword" type="password" placeholder="请再次输入密码" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>关联设备</Label>
              <div className="space-y-3">
                {devices.map((device, index) => (
                  <div key={device.id} className="flex items-center gap-2">
                    <Input
                      placeholder={`设备 ${index + 1} 名称`}
                      value={device.name}
                      onChange={(e) => handleDeviceChange(device.id, e.target.value)}
                    />
                    {devices.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveDevice(device.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddDevice} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> 添加设备
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">项目介绍</Label>
              <Textarea id="description" placeholder="请输入项目介绍（选填）" rows={4} />
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

