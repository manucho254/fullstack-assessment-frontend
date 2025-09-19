import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Home,
  Shield,
  BookOpen,
  BarChart3,
  User,
  FileText,
  Truck,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Log Book', url: '/dashboard/logbook', icon: BookOpen },
  { title: 'Compliance', url: '/dashboard/compliance', icon: Shield },
  { title: 'Reports', url: '/dashboard/reports', icon: BarChart3 },
  { title: 'Driver Profile', url: '/dashboard/profile', icon: User },
  { title: 'Log Output', url: '/dashboard/log-output', icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isExpanded = navigationItems.some((item) => isActive(item.url));

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-sidebar-accent text-sidebar-primary font-medium' : 'hover:bg-sidebar-accent/50';

  return (
    <Sidebar
      className={collapsed ? 'w-14' : 'w-60'}
      variant="sidebar"
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sidebar-primary/10 rounded-lg">
              <Truck className="h-6 w-6 text-sidebar-primary" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <h2 className="font-bold text-sidebar-foreground">TruckLog Pro</h2>
                <p className="text-xs text-sidebar-foreground/60">HOS Compliance</p>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        {!collapsed && user && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-sidebar-primary" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="font-medium text-sm text-sidebar-foreground truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout button at bottom */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}