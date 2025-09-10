"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  Video
} from "lucide-react";
import Link from "next/link";

export default function StudentLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Skip authentication checks for login page
  const isLoginPage = pathname === '/student/login';

  useEffect(() => {
    // Skip auth checks if we're on the login page
    if (isLoginPage) {
      return;
    }

    if (status === 'loading') {
      return; // Wait for auth to load
    }
    
    if (!session) {
      router.push("/student/login");
      return;
    }
    
    if (!["admin", "trainer", "student"].includes(session.user?.role)) {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router, isLoginPage]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const navigation = [
    { name: "Dashboard", href: "/student/dashboard", icon: BarChart3 },
    { name: "Join Class", href: "/student/join-class", icon: Video },
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "Schedule", href: "/student/schedule", icon: Calendar },
    { name: "Materials", href: "/student/materials", icon: FileText },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ];

  // Skip loading checks for login page
  if (!isLoginPage) {
    if (status === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      );
    }

    if (!session || !["admin", "trainer", "student"].includes(session.user?.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      );
    }
  }

  // For login page, just render children without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Student Portal</span>
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
              className="w-full border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
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
            <User className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Student Portal</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
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
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-3">
                <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                  {session.user?.name?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{session.user?.name || 'Student'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Student</div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full mt-2 border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
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
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                    {session.user?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-white">
                  {session.user?.name || 'Student'}
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
