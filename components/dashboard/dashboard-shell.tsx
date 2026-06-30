"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  Bell,
  HelpCircle,
  IdCard,
  KeyRound,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { NUKAFSLogo } from "@/components/nukafs-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  getAccountRoutes,
  resolvePortalPrefix,
  type PortalPrefix,
} from "@/lib/constants/portal-routes"
import { useAuth } from "@/lib/hooks/use-auth"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { useRouter } from "next/navigation"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

export interface NavSection {
  label: string
  items: NavItem[]
}

export interface DashboardUser {
  name: string
  email: string
  roleLabel: string
}

function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sign out of NUKAFS Registry?</DialogTitle>
          <DialogDescription>
            You will be redirected to the login page. Your session will be cleared
            and protected pages will require signing in again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Sign Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DashboardShell({
  sections,
  user,
  headerTitle,
  portalPrefix,
  children,
}: {
  sections: NavSection[]
  user: DashboardUser
  headerTitle: string
  portalPrefix?: PortalPrefix
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const { unreadCount } = useNotifications()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const portal = portalPrefix ?? resolvePortalPrefix(pathname, "student_active_complete")
  const routes = getAccountRoutes(portal)

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")

  const handleLogout = () => {
    setLogoutOpen(false)
    logout()
    router.push("/login")
  }

  const menuItems = [
    { label: "View My Profile", href: routes.profile, icon: User },
    { label: "My Membership Card", href: routes.membershipCard, icon: IdCard },
    { label: "Notifications", href: routes.notifications, icon: Bell },
    { label: "Account Settings", href: routes.settings, icon: Settings },
    { label: "Change Password", href: routes.changePassword, icon: KeyRound },
    { label: "Help & Support", href: routes.help, icon: HelpCircle },
  ]

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center px-2 py-1.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
            <NUKAFSLogo className="group-data-[collapsible=icon]:[&>div:last-child]:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          {sections.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const active = pathname === item.href
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={item.title}
                          render={
                            <Link href={item.href}>
                              <item.icon />
                              <span>{item.title}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="ml-auto">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign out"
                onClick={() => setLogoutOpen(true)}
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between gap-4">
            <h1 className="font-heading text-lg font-semibold tracking-tight">{headerTitle}</h1>
            <div className="flex items-center gap-1.5">
              <div className="hidden md:block">
                <InputGroup className="w-56">
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Search..." />
                </InputGroup>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="relative"
                render={<Link href={routes.notifications} />}
              >
                <Bell />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="gap-2 pl-1.5">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden text-sm font-medium sm:inline">{user.name.split(" ")[0]}</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                        <Badge variant="secondary" className="mt-1.5 w-fit">
                          {user.roleLabel}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {menuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.href}
                        render={
                          <Link href={item.href} className="flex items-center gap-2">
                            <item.icon className="size-4" />
                            {item.label}
                          </Link>
                        }
                      />
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setLogoutOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </SidebarProvider>
  )
}
