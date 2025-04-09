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

// Sample project data for editing
const projectData = {
  id: "1",
  name: "电商平台项目",
  phone: "13800138000",
  account: "ecommerce_admin",
  description: "这是一个电商平台推广项目，主要针对年轻用户群体，通过微信社交渠道进行产品推广和销售转化。",
  devices: [
    { id: "d1", name: "iPhone 13 Pro" },
    { id: "d2", name: "Huawei P40" },
    { id: "d3", name: "Samsung S21" },
  ],
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectName, setProjectName] = useState(projectData.name)
  const [phone, setPhone] = useState(projectData.phone)
  const [account, setAccount] = useState(projectData.account)
  const [description, setDescription] = useState(projectData.description)
  const [devices, setDevices] = useState(projectData.devices)

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
      router.push(`/dashboard/projects/${params.id}`)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/projects/${params.id}`}>
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
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="请输入项目名称"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">账号</Label>
                <Input
                  id="account"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="请输入账号"
                  required
                />
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
                    <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveDevice(device.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入项目介绍（选填）"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/projects/${params.id}`}>取消</Link>
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

