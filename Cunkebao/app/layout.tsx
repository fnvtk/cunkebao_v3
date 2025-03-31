import type { Metadata } from "next"
import "./globals.css"
import "regenerator-runtime/runtime"
import type React from "react"
import ErrorBoundary from "./components/ErrorBoundary"
import { AuthProvider } from "@/app/components/AuthProvider"
import LayoutWrapper from "./components/LayoutWrapper"

export const metadata: Metadata = {
  title: "存客宝",
  description: "智能客户管理系统",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="bg-gray-100">
        <AuthProvider>
          <ErrorBoundary>
            <LayoutWrapper>{children}</LayoutWrapper>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'