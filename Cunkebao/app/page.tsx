"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Smartphone, Users, Activity } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

// 导入Chart.js
import { Chart, registerables } from "chart.js"
Chart.register(...registerables)

export default function Home() {
  const router = useRouter()
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // 统一设备数据
  const [stats, setStats] = useState({
    totalDevices: 42,
    onlineDevices: 35,
    totalWechatAccounts: 42,
    onlineWechatAccounts: 35,
  })

  useEffect(() => {
    // 模拟API调用
    const fetchStats = async () => {
      // 这里应该是实际的API调用
      const mockStats = {
        totalDevices: 42,
        onlineDevices: 35,
        totalWechatAccounts: 42,
        onlineWechatAccounts: 35,
      }
      setStats(mockStats)
    }
    fetchStats()
  }, [])

  // 使用Chart.js创建图表
  useEffect(() => {
    if (chartRef.current) {
      // 如果已经有图表实例，先销毁它
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")

      // 创建新的图表实例
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
          datasets: [
            {
              label: "获客数量",
              data: [120, 150, 180, 200, 230, 210, 190],
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: "rgba(59, 130, 246, 1)",
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              titleColor: "#333",
              bodyColor: "#666",
              borderColor: "#ddd",
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                label: (context) => `获客数量: ${context.parsed.y}`,
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
            },
          },
        },
      })
    }

    // 组件卸载时清理图表实例
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  const handleDevicesClick = () => {
    router.push("/devices")
  }

  const handleWechatClick = () => {
    router.push("/wechat-accounts")
  }

  const scenarioFeatures = [
    {
      id: "douyin",
      name: "抖音获客",
      icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-QR8ManuDplYTySUJsY4mymiZkDYnQ9.png",
      color: "bg-blue-100 text-blue-600",
      value: 156,
      growth: 12,
    },
    {
      id: "xiaohongshu",
      name: "小红书获客",
      icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yvnMxpoBUzcvEkr8DfvHgPHEo1kmQ3.png",
      color: "bg-red-100 text-red-600",
      value: 89,
      growth: 8,
    },
    {
      id: "gongzhonghao",
      name: "公众号获客",
      icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Gsg0CMf5tsZb41mioszdjqU1WmsRxW.png",
      color: "bg-green-100 text-green-600",
      value: 234,
      growth: 15,
    },
    {
      id: "haibao",
      name: "海报获客",
      icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-x92XJgXy4MI7moNYlA1EAes2FqDxMH.png",
      color: "bg-orange-100 text-orange-600",
      value: 167,
      growth: 10,
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto pb-16 bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold text-blue-600">存客宝</h1>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-white hover:shadow-lg transition-all cursor-pointer" onClick={handleDevicesClick}>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-2">设备数量</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">{stats.totalDevices}</span>
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white hover:shadow-lg transition-all cursor-pointer" onClick={handleWechatClick}>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-2">微信号数量</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">{stats.totalWechatAccounts}</span>
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-2">在线微信号</span>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-blue-600">{stats.onlineWechatAccounts}</span>
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <Progress value={(stats.onlineWechatAccounts / stats.totalWechatAccounts) * 100} className="h-1" />
            </div>
          </Card>
        </div>

        {/* 场景获客统计 */}
        <Card className="p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">场景获客统计</h2>
          </div>
          <div className="flex justify-between">
            {scenarioFeatures
              .sort((a, b) => b.value - a.value)
              .map((scenario) => (
                <Link href={`/scenarios/${scenario.id}`} key={scenario.id} className="block flex-1">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-12 h-12 rounded-full ${scenario.color} flex items-center justify-center`}>
                      <img src={scenario.icon || "/placeholder.svg"} alt={scenario.name} className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-medium">{scenario.value}</div>
                    <div className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                      {scenario.name}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </Card>

        {/* 每日获客趋势 - 使用Canvas和Chart.js */}
        <Card className="p-4 bg-white">
          <h2 className="text-lg font-semibold mb-4">每日获客趋势</h2>
          <div className="w-full h-64 relative">
            <canvas ref={chartRef} />
          </div>
        </Card>
      </div>
    </div>
  )
}

