"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { md5 } from "@/lib/utils"

export default function LoginPage() {
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // 对密码进行MD5加密
      const encryptedPassword = md5(password)
      
      // 调用登录接口
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account,
          password: encryptedPassword
        }),
        credentials: "include"
      })

      const result = await response.json()

      if (result.code === 200) {
        // 保存用户信息到本地存储
        localStorage.setItem("admin_info", JSON.stringify(result.data))
        localStorage.setItem("admin_token", result.data.token)
        
        // 跳转到仪表盘
        router.push("/dashboard")
      } else {
        setError(result.msg || "登录失败")
      }
    } catch (err) {
      console.error("登录失败:", err)
      setError("网络错误，请稍后再试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">超级管理员后台</CardTitle>
          <CardDescription className="text-center">请输入您的账号和密码登录系统</CardDescription>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">账号</Label>
              <Input
                id="account"
                placeholder="请输入账号"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

