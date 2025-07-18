import {
  LayoutDashboard,
  Images,
  Users,
  Settings,
  BarChart3,
  Shield,
  Database,
  Globe,
  Mail,
  Server,
  TrendingUp,
  PieChart,
} from "lucide-react";
import React from "react";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
  permission?: string;
  description?: string;
  defaultHref?: string; // 折叠状态下的默认跳转路径
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}

export const adminNavigation: NavigationGroup[] = [
  {
    id: "main",
    label: "主要功能",
    items: [
      {
        id: "dashboard",
        label: "控制台",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "系统概览和快捷操作",
      },
      {
        id: "images",
        label: "图片管理",
        href: "/images",
        icon: Images,
        badge: "new",
        description: "图片上传、分类和管理",
        defaultHref: "/images/list", // 折叠状态下跳转到图片列表
        children: [
          {
            id: "images-list",
            label: "图片列表",
            href: "/images/list",
            icon: Images,
          },
          {
            id: "images-upload",
            label: "批量上传",
            href: "/images/upload",
            icon: Images,
          },
          {
            id: "images-categories",
            label: "分类管理",
            href: "/images/categories",
            icon: Images,
          },
        ],
      },
      {
        id: "users",
        label: "用户管理",
        href: "/users",
        icon: Users,
        description: "用户账户和权限管理",
        defaultHref: "/users", // 折叠状态下跳转到用户列表
        children: [
          {
            id: "users-list",
            label: "用户列表",
            href: "/users",
            icon: Users,
          },
          {
            id: "users-roles",
            label: "角色权限",
            href: "/users/roles",
            icon: Shield,
          },
        ],
      },
    ],
  },
  {
    id: "system",
    label: "系统管理",
    items: [
      {
        id: "stats",
        label: "数据统计",
        href: "/stats",
        icon: BarChart3,
        description: "详细的数据分析和可视化统计",
        defaultHref: "/stats",
        children: [
          {
            id: "stats-trends",
            label: "访问趋势",
            href: "/stats/trends",
            icon: TrendingUp,
          },
          {
            id: "stats-analytics",
            label: "分布分析",
            href: "/stats/analytics",
            icon: PieChart,
          },
        ],
      },
      {
        id: "storage",
        label: "存储策略",
        href: "/storage",
        icon: Database,
        description: "存储配置和策略管理",
      },
      {
        id: "settings",
        label: "系统设置",
        href: "/settings",
        icon: Settings,
        description: "基础配置和参数设置",
        defaultHref: "/settings", // 使用主设置页面
        children: [
          {
            id: "settings-basic",
            label: "基础设置",
            href: "/settings?tab=basic",
            icon: Settings,
          },
          {
            id: "settings-email",
            label: "邮件设置",
            href: "/settings?tab=email",
            icon: Mail,
          },
          {
            id: "settings-image",
            label: "图片设置",
            href: "/settings?tab=image",
            icon: Globe,
          },
          {
            id: "settings-security",
            label: "安全设置",
            href: "/settings?tab=security",
            icon: Shield,
          },
        ],
      },
    ],
  },
];

// 扁平化导航项，用于路由匹配
export const flattenNavigation = (
  groups: NavigationGroup[]
): NavigationItem[] => {
  const items: NavigationItem[] = [];

  groups.forEach((group) => {
    group.items.forEach((item) => {
      items.push(item);
      if (item.children) {
        items.push(...item.children);
      }
    });
  });

  return items;
};

// 根据路径查找导航项
export const findNavigationItem = (
  path: string
): NavigationItem | undefined => {
  const allItems = flattenNavigation(adminNavigation);
  return allItems.find((item) => item.href === path);
};

// 生成面包屑
export const generateBreadcrumbs = (path: string) => {
  const segments = path.split("/").filter(Boolean);
  const breadcrumbs = [];

  // 添加根路径
  if (segments[0] === "admin") {
    breadcrumbs.push({
      label: "管理后台",
      href: "/dashboard",
      icon: "dashboard",
    });

    // 查找当前页面
    const currentItem = findNavigationItem(path);
    if (currentItem && currentItem.href !== "/dashboard") {
      breadcrumbs.push({
        label: currentItem.label,
        href: currentItem.href,
        icon: currentItem.icon?.name || "page",
      });
    }
  }

  return breadcrumbs;
};
