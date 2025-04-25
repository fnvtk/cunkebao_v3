"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(2, "项目名称至少需要2个字符"),
  account: z.string().min(3, "账号至少需要3个字符"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  phone: z.string().optional(),
  memo: z.string().optional(),
})

interface ProjectEditProps {
  projectId: string
  onSuccess?: () => void
}

interface ProjectData {
  id: number
  name: string
  account: string
  memo?: string
  phone?: string
}

export default function ProjectEdit({ projectId, onSuccess }: ProjectEditProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      account: "",
      password: "",
      confirmPassword: "",
      phone: "",
      memo: "",
    },
  })

  // 获取项目数据
  useEffect(() => {
    const fetchProject = async () => {
      setIsFetching(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/profile/${projectId}`)
        const data = await response.json()
        
        if (data.code === 200) {
          const project = data.data
          form.reset({
            name: project.name || "",
            account: project.account || "",
            password: "",
            confirmPassword: "",
            phone: project.phone || "",
            memo: project.memo || "",
          })
        } else {
          toast.error(data.msg || "获取项目信息失败")
        }
      } catch (error) {
        toast.error("网络错误，请稍后重试")
      } finally {
        setIsFetching(false)
      }
    }

    fetchProject()
  }, [projectId, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // 检查密码是否匹配
    if (values.password && values.password !== values.confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }

    setIsLoading(true)
    try {
      // 准备请求数据，根据需要添加或移除字段
      const updateData: Record<string, any> = {
        id: parseInt(projectId),
        name: values.name,
        account: values.account,
        memo: values.memo,
        phone: values.phone,
      }

      // 如果提供了密码，则包含密码字段
      if (values.password) {
        updateData.password = values.password
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (data.code === 200) {
        toast.success("项目更新成功")
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(data.msg || "更新项目失败")
      }
    } catch (error) {
      toast.error("网络错误，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return <div className="flex items-center justify-center min-h-64">加载中...</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>编辑项目</CardTitle>
        <CardDescription>更新项目信息和设置</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form id="edit-project-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>项目名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入项目名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>账号</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入账号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入手机号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="不修改请留空" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="请再次输入密码" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>项目描述</FormLabel>
                  <FormControl>
                    <Textarea placeholder="请输入项目描述" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => form.reset()}
          disabled={isLoading}
        >
          重置
        </Button>
        <Button
          type="submit"
          form="edit-project-form"
          disabled={isLoading}
        >
          {isLoading ? "保存中..." : "保存更改"}
        </Button>
      </CardFooter>
    </Card>
  )
} 