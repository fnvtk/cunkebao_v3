"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Settings, LogOut, Menu, X } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  const navItems = [
    {
      title: "项目管理",
      href: "/dashboard/projects",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "客户池",
      href: "/dashboard/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "管理员权限",
      href: "/dashboard/admins",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-primary text-primary-foreground w-64 flex-shrink-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-40 h-full`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-primary/10">
            <h1 className="text-xl font-bold">超级管理员后台</h1>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary-foreground hover:text-primary ${
                      pathname.startsWith(item.href) ? "bg-primary-foreground text-primary" : ""
                    }`}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-primary/10 p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={() => {
                // Handle logout
                window.location.href = "/login"
              }}
            >
              <LogOut className="h-5 w-5" />
              退出登录
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <header className="h-16 border-b flex items-center px-6 bg-background">
          <h2 className="text-lg font-medium">
            {navItems.find((item) => pathname.startsWith(item.href))?.title || "仪表盘"}
          </h2>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

