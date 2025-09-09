"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
  LogOut,
  Settings,
  HelpCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import RouteGuard from "@/components/system/route-guard";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";

const navLinks = {
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/courses", label: "Courses", icon: Package },
    { href: "/dashboard/batches", label: "Batches", icon: Package2 },
    { href: "/dashboard/payments", label: "Payments", icon: ShoppingCart },
  ],
  trainer: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/batches", label: "My Batches", icon: Package2 },
  ],
  student: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/courses", label: "My Courses", icon: Package },
    { href: "/dashboard/progress", label: "Progress", icon: LineChart },
  ],
};

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [activePath, setActivePath] = useState("");

  // Set active path on route change
  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Get allowed roles from the current path
  const getAllowedRoles = () => {
    if (pathname.startsWith("/dashboard")) return ["admin", "trainer", "student"];
    return [];
  };

  return (
    <RouteGuard 
      allowedRoles={getAllowedRoles()}
    >
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-background">
        <div className="hidden border-r bg-muted/40 md:block dark:bg-gray-900/30">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 bg-background dark:bg-gray-900">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="text-xl font-bold text-foreground">Tunalismus</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                {user && navLinks[user.role]?.map((link) => {
                  const isActive = activePath === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:bg-accent hover:text-accent-foreground ${
                        isActive 
                          ? "bg-primary text-primary-foreground font-medium" 
                          : "text-muted-foreground"
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                      {isActive && (
                        <span className="ml-auto">
                          <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="mt-auto p-4 border-t">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground transition-colors">
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{session?.user?.name || session?.user?.email}</p>
                  <p className="text-xs capitalize text-muted-foreground">{session?.user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 bg-background">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Package2 className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">Tunalismus</span>
                  </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <nav className="grid items-start px-2 text-sm font-medium gap-1">
                    {user && navLinks[user.role]?.map((link) => {
                      const isActive = activePath === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:bg-accent ${
                            isActive 
                              ? "bg-primary text-primary-foreground font-medium" 
                              : "text-muted-foreground hover:text-accent-foreground"
                          }`}
                        >
                          <link.icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
                <div className="mt-auto p-4 border-t">
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{session?.user?.name || session?.user?.email}</p>
                      <p className="text-xs capitalize text-muted-foreground">{session?.user?.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 gap-2" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="w-full flex-1 md:max-w-md ml-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-full"
                />
              </div>
            </div>
            
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session?.user?.name || session?.user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {session?.user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer focus:bg-accent text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggleButton start="top-right" />
          </header>
          
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
