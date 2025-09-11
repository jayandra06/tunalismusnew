"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  UserCheck,
  Layers,
  Megaphone,
  Monitor
} from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't run auth checks until client-side
    
    console.log('🔄 Admin layout useEffect triggered');
    console.log('📊 Auth state:', { 
      status, 
      session: session ? 'Present' : 'None',
      user: session?.user,
      pathname
    });
    
    // Skip auth checks for login page
    if (pathname === '/admin/login') {
      console.log('ℹ️ On login page, skipping auth checks');
      return;
    }
    
    if (status === 'loading') {
      console.log('⏳ Auth is loading, waiting...');
      return; // Wait for auth to load
    }
    
    if (!session) {
      console.log('❌ Not authenticated, redirecting to admin login');
      router.push("/admin/login");
      return;
    }
    
    if (session.user?.role !== 'admin') {
      console.log('❌ Not admin role, redirecting to unauthorized');
      router.push("/unauthorized");
      return;
    }
    
    console.log('✅ Admin access granted, rendering dashboard');
  }, [isClient, status, session, router, pathname]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Batches", href: "/admin/batches", icon: Layers },
    { name: "Enrollments", href: "/admin/enrollments", icon: UserCheck },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { 
      name: "Marketing", 
      icon: Megaphone,
      children: [
        { name: "Homepage Ads", href: "/admin/marketing/homepage-ads", icon: Monitor }
      ]
    },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // Skip auth checks for login page
  if (pathname === '/admin/login') {
    return children;
  }

  // Show loading until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Admin Portal</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              
              if (item.children) {
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {Icon && <Icon className="h-5 w-5 mr-3" />}
                      {item.name}
                    </div>
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            {ChildIcon && <ChildIcon className="h-4 w-4 mr-3" />}
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4 border-b border-gray-200 dark:border-gray-700">
            <Shield className="h-8 w-8 text-red-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Admin Portal</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              
              if (item.children) {
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {Icon && <Icon className="h-5 w-5 mr-3" />}
                      {item.name}
                    </div>
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            {ChildIcon && <ChildIcon className="h-4 w-4 mr-3" />}
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-3">
                <span className="text-red-600 dark:text-red-400 font-semibold text-sm">
                  {session.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{session.user?.name || 'Admin'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Administrator</div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" />
              <div className="flex items-center gap-x-2">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 font-semibold text-sm">
                    {session.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-white">
                  {session.user?.name || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
