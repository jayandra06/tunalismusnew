"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const getRedirectPath = () => {
    if (!session?.user) return "/";
    
    switch (session.user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'trainer':
        return '/trainer/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="mx-auto w-full max-w-md shadow-lg rounded-xl border-0 dark:border dark:border-gray-700">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-white">
            Access Denied
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            You don&apos;t have permission to access this portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {session?.user ? (
                <>
                  You are logged in as: <span className="font-semibold capitalize">{session.user.role}</span>
                </>
              ) : (
                "You are not logged in"
              )}
            </p>
          </div>
          
          <div className="space-y-2">
            {session?.user && (
              <Button 
                onClick={() => router.push(getRedirectPath())}
                className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 
                  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                  text-white font-medium transition-colors duration-200"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Your Dashboard
              </Button>
            )}
            
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full h-11 rounded-lg border-red-200 text-red-600 hover:bg-red-50 
                dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <Link href="/" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

