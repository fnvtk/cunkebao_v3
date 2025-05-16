import type { Metadata } from "next"
import "./globals.css"
import "regenerator-runtime/runtime"
import type React from "react"
import ErrorBoundary from "./components/ErrorBoundary"
import { AuthProvider } from "@/app/components/AuthProvider"
import LayoutWrapper from "./components/LayoutWrapper"
import { AuthCheck } from "@/app/components/auth-check"
import { Toaster } from "sonner"

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
      <body className="font-sans">
        <AuthProvider>
          <AuthCheck>
            <ErrorBoundary>
              <LayoutWrapper>{children}</LayoutWrapper>
            </ErrorBoundary>
          </AuthCheck>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}