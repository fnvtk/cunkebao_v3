"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, User, Briefcase } from "lucide-react"

const navItems = [
  { href: "/", icon: Home, label: "首页" },
  { href: "/scenarios", icon: Users, label: "场景获客" },
  { href: "/workspace", icon: Briefcase, label: "工作台" },
  { href: "/profile", icon: User, label: "我的" },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-2 px-3 ${
              pathname === item.href ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

