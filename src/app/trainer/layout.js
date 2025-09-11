"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  GraduationCap
} from "lucide-react";
import Link from "next/link";

export default function TrainerLayout({ children }) {
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
    
    console.log('🔄 Trainer layout useEffect triggered');
    console.log('📊 Auth state:', { 
      status, 
      session: session ? 'Present' : 'None',
      user: session?.user,
      pathname
    });
    
    // Skip auth checks for login page
    if (pathname === '/trainer/login') {
      console.log('ℹ️ On login page, skipping auth checks');
      return;
    }
    
    if (status === 'loading') {
      console.log('⏳ Auth is loading, waiting...');
      return; // Wait for auth to load
    }
    
    if (!session) {
      console.log('❌ Not authenticated, redirecting to trainer login');
      router.push("/trainer/login");
      return;
    }
    
    if (!["admin", "trainer"].includes(session.user?.role)) {
      console.log('❌ Invalid role, redirecting to unauthorized');
      router.push("/unauthorized");
      return;
    }
    
    console.log('✅ Trainer access granted, rendering layout');
  }, [isClient, status, session, router, pathname]);

  const handleLogout = async () => {
    try {
      console.log('🔓 Initiating signout...');
      
      // First try the standard NextAuth signout
      await signOut({ 
        callbackUrl: '/login',
        redirect: false // Don't redirect automatically, we'll handle it
      });
      
      // Then call our custom signout endpoint to ensure cookies are cleared
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'include'
        });
        console.log('✅ Custom signout successful');
      } catch (customError) {
        console.warn('⚠️ Custom signout failed, but standard signout succeeded:', customError);
      }
      
      // Finally redirect to login
      window.location.href = '/login';
      
    } catch (error) {
      console.error('❌ Signout error:', error);
      
      // Fallback: try custom signout endpoint
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'include'
        });
        console.log('✅ Fallback signout successful');
      } catch (fallbackError) {
        console.error('❌ Fallback signout also failed:', fallbackError);
      }
      
      // Force redirect to login
      window.location.href = '/login';
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/trainer/dashboard", icon: BarChart3 },
    { name: "My Batches", href: "/trainer/batches", icon: BookOpen },
    { name: "Students", href: "/trainer/students", icon: Users },
    { name: "Schedule", href: "/trainer/schedule", icon: Calendar },
    { name: "Materials", href: "/trainer/materials", icon: FileText },
    { name: "Settings", href: "/trainer/settings", icon: Settings },
  ];

  // Skip auth checks for login page
  if (pathname === '/trainer/login') {
    return children;
  }

  // Show loading until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || !["admin", "trainer"].includes(session.user?.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Trainer Portal</span>
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
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-3">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {session.user?.name?.charAt(0)?.toUpperCase() || 'T'}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{session.user?.name || 'Trainer'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Trainer</div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
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
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Trainer Portal</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-3">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {session.user?.name?.charAt(0)?.toUpperCase() || 'T'}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{session.user?.name || 'Trainer'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Trainer</div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full mt-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
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
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                    {session.user?.name?.charAt(0)?.toUpperCase() || 'T'}
                  </span>
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-white">
                  {session.user?.name || 'Trainer'}
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


