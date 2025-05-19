"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Eye, EyeOff, Phone } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { WeChatIcon } from "@/components/icons/wechat-icon"
import { AppleIcon } from "@/components/icons/apple-icon"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/app/components/AuthProvider"
import { loginApi } from "@/lib/api"

// 定义登录表单类型
interface LoginForm {
  phone: string
  password: string
  verificationCode: string
  agreeToTerms: boolean
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<"password" | "verification">("password")
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<LoginForm>({
    phone: "",
    password: "",
    verificationCode: "",
    agreeToTerms: false,
  })

  const router = useRouter()
  const { toast } = useToast()
  const { login, isAuthenticated } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setForm((prev) => ({ ...prev, agreeToTerms: checked }))
  }

  const validateForm = () => {
    if (!form.phone) {
      toast({
        variant: "destructive",
        title: "请输入手机号",
        description: "手机号不能为空",
      })
      return false
    }

    if (!form.agreeToTerms) {
      toast({
        variant: "destructive",
        title: "请同意用户协议",
        description: "需要同意用户协议和隐私政策才能继续",
      })
      return false
    }

    if (activeTab === "password" && !form.password) {
      toast({
        variant: "destructive",
        title: "请输入密码",
        description: "密码不能为空",
      })
      return false
    }

    if (activeTab === "verification" && !form.verificationCode) {
      toast({
        variant: "destructive",
        title: "请输入验证码",
        description: "验证码不能为空",
      })
      return false
    }

    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (activeTab === "password") {
        // 发送账号密码登录请求
        const response = await loginApi.login(form.phone, form.password)

        if (response.code === 200 && response.data) {
          // 保存登录信息
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('token_expired', response.data.token_expired)
          localStorage.setItem('s2_accountId', response.data.member.s2_accountId)
          
          // 保存用户信息
          localStorage.setItem('userInfo', JSON.stringify(response.data.member))
          
          // 显示成功提示
          toast({
            title: "登录成功",
            description: "欢迎回来！",
          })

          // 跳转到首页
          router.push("/")
        } else {
          throw new Error(response.msg || "登录失败")
        }
      } else {
        // 验证码登录逻辑保持原样，未来可以实现
        toast({
          variant: "destructive",
          title: "功能未实现",
          description: "验证码登录功能尚未实现，请使用密码登录",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: error instanceof Error ? error.message : "请稍后重试",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendVerificationCode = async () => {
    if (!form.phone) {
      toast({
        variant: "destructive",
        title: "请输入手机号",
        description: "发送验证码需要手机号",
      })
      return
    }

    toast({
      variant: "destructive",
      title: "功能未实现",
      description: "验证码发送功能尚未实现",
    })
  }

  useEffect(() => {
    // 检查是否已登录，如果已登录且不在登录页面，则跳转到首页
    if (isAuthenticated && window.location.pathname === '/login') {
      router.push("/")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col px-4 py-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <Tabs
          defaultValue="password"
          className="w-full"
          onValueChange={(v) => setActiveTab(v as "password" | "verification")}
        >
          <TabsList className="w-full bg-transparent border-b border-gray-200">
            <TabsTrigger
              value="verification"
              className="flex-1 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 border-b-2 border-transparent"
            >
              验证码登录
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="flex-1 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 border-b-2 border-transparent"
            >
              密码登录
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <p className="text-gray-600 mb-6">你所在地区仅支持 手机号 / 微信 / Apple 登录</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <Input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="手机号"
                  className="pl-16 border-gray-300 text-gray-900 h-12"
                  disabled={isLoading}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  +86
                </span>
              </div>

              <TabsContent value="password" className="m-0">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="密码"
                    className="pr-12 border-gray-300 text-gray-900 h-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="verification" className="m-0">
                <div className="relative">
                  <Input
                    type="text"
                    name="verificationCode"
                    value={form.verificationCode}
                    onChange={handleInputChange}
                    placeholder="验证码"
                    className="pr-32 border-gray-300 text-gray-900 h-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 h-8 bg-blue-50 text-blue-500 rounded text-sm font-medium"
                    disabled={isLoading}
                  >
                    获取验证码
                  </button>
                </div>
              </TabsContent>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={form.agreeToTerms}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  同意《存客宝用户协议》和《隐私政策》
                </label>
              </div>

              <Button type="submit" className="w-full h-12 bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
                {isLoading ? "登录中..." : "登录"}
              </Button>

              <div className="flex items-center space-x-2 justify-center">
                <hr className="w-full border-gray-200" />
                <span className="px-2 text-gray-400 text-sm whitespace-nowrap">其他登录方式</span>
                <hr className="w-full border-gray-200" />
              </div>

              <div className="flex justify-center space-x-6">
                <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
                  <WeChatIcon className="h-8 w-8" />
                </button>
                <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
                  <AppleIcon className="h-8 w-8" />
                </button>
              </div>
            </form>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

