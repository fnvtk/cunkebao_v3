"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getMenus, type MenuItem } from "@/lib/menu-api"
import * as LucideIcons from "lucide-react"
import { ChevronDown, ChevronRight } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  // 使用Set来存储已展开的菜单ID
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true)
      try {
        const data = await getMenus()
        setMenus(data || [])
        
        // 自动展开当前活动菜单的父菜单
        autoExpandActiveMenuParent(data || []);
      } catch (error) {
        console.error("获取菜单失败:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenus()
  }, [])

  // 自动展开当前活动菜单的父菜单
  const autoExpandActiveMenuParent = (menuItems: MenuItem[]) => {
    const newExpandedMenus = new Set<number>();
    
    // 递归查找当前路径匹配的菜单项
    const findActiveMenu = (items: MenuItem[], parentIds: number[] = []) => {
      for (const item of items) {
        const currentPath = pathname === "/" ? "/dashboard" : pathname;
        const itemPath = item.path;
        
        if (currentPath === itemPath || currentPath.startsWith(itemPath + "/")) {
          // 将所有父菜单ID添加到展开集合
          parentIds.forEach(id => newExpandedMenus.add(id));
          return true;
        }
        
        if (item.children && item.children.length > 0) {
          const found = findActiveMenu(item.children, [...parentIds, item.id]);
          if (found) {
            return true;
          }
        }
      }
      return false;
    };
    
    findActiveMenu(menuItems);
    setExpandedMenus(newExpandedMenus);
  };

  // 切换菜单展开状态
  const toggleMenu = (menuId: number) => {
    setExpandedMenus(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(menuId)) {
        newExpanded.delete(menuId);
      } else {
        newExpanded.add(menuId);
      }
      return newExpanded;
    });
  };

  // 获取Lucide图标组件
  const getLucideIcon = (iconName: string) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-4 w-4 mr-2" /> : null;
  };

  // 递归渲染菜单项
  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.id);
    const isActive = pathname === item.path;
    const isChildActive = hasChildren && item.children!.some(child => 
      pathname === child.path || pathname.startsWith(child.path + "/")
    );

    return (
      <li key={item.id}>
        {hasChildren ? (
          <div className="flex flex-col">
            <button
              onClick={() => toggleMenu(item.id)}
              className={`flex items-center justify-between px-4 py-2 rounded-md text-sm w-full text-left ${
                isActive || isChildActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <div className="flex items-center">
                {item.icon && getLucideIcon(item.icon)}
                {item.title}
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {isExpanded && hasChildren && (
              <ul className="ml-4 mt-1 space-y-1">
                {item.children!.map(child => {
                  const isChildItemActive = pathname === child.path;
                  return (
                    <li key={child.id}>
                      <Link
                        href={child.path}
                        className={`flex items-center px-4 py-2 rounded-md text-sm ${
                          isChildItemActive
                            ? "text-primary font-medium"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {child.icon && getLucideIcon(child.icon)}
                        {child.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <Link
            href={item.path}
            className={`flex items-center px-4 py-2 rounded-md text-sm ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {item.icon && getLucideIcon(item.icon)}
            {item.title}
          </Link>
        )}
      </li>
    );
  };

  return (
    <div className="w-64 border-r bg-background h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">超级管理员</h2>
      </div>

      <nav className="flex-1 overflow-auto p-2">
        {loading ? (
          // 加载状态
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded animate-pulse bg-gray-200"></div>
            ))}
          </div>
        ) : menus.length > 0 ? (
          // 菜单项
          <ul className="space-y-1">
            {menus.map(renderMenuItem)}
          </ul>
        ) : (
          // 无菜单数据
          <div className="text-center py-8 text-gray-500">
            <p>暂无菜单数据</p>
          </div>
        )}
      </nav>
    </div>
  );
} 