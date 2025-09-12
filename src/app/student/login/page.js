"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, BookOpen, ArrowLeft } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function StudentLoginPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('⏰ Student login timeout - forcing render');
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    console.log('🔄 Student login useEffect:', { isMounted, status, session: session ? 'Present' : 'None' });
    
    if (!isMounted || status === 'loading') {
      console.log('⏳ Waiting for mount or auth to load...');
      return; // Wait for component to mount and auth to load
    }
    
    // Check if we're coming from a signout (check URL params or referrer)
    const urlParams = new URLSearchParams(window.location.search);
    const fromSignout = urlParams.get('from') === 'signout' || 
                       document.referrer.includes('/student/') ||
                       sessionStorage.getItem('justSignedOut') === 'true';
    
    if (fromSignout) {
      console.log('🔓 Coming from signout, clearing session storage and showing login form');
      sessionStorage.removeItem('justSignedOut');
      return; // Don't redirect, show login form
    }
    
    // Redirect if user is already authenticated and is student
    if (session && session.user?.role === 'student') {
      console.log('✅ Student user detected, redirecting to dashboard');
      router.push('/student/dashboard');
    } else if (session && session.user?.role !== 'student') {
      console.log('❌ Non-student user detected, redirecting to appropriate portal');
      // Redirect non-student users to their appropriate portal
      switch (session.user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'trainer':
          router.push('/trainer/dashboard');
          break;
        default:
          router.push('/');
      }
    } else {
      console.log('ℹ️ No session found, showing login form');
    }
  }, [isMounted, status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    console.log('🚀 Starting student login process...');
    console.log('📧 Email:', email);
    console.log('🔐 Password length:', password.length);

    try {
      console.log('📡 Calling NextAuth signIn...');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('📡 SignIn result:', result);

      if (result?.error) {
        console.log('❌ Login failed:', result.error);
        setError("Invalid credentials. Please check your email and password.");
        setIsLoading(false);
      } else {
        console.log('✅ Login successful');
        setIsSuccess(true);
        // Redirect to student dashboard
        setTimeout(() => {
          router.push('/student/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading state while auth is loading, but with a timeout
  if (!isMounted || (status === 'loading' && isMounted)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
          <p className="text-sm text-gray-500 mt-2">Status: {status}</p>
          <p className="text-xs text-gray-400 mt-4">
            If this takes too long, please refresh the page
          </p>
        </div>
      </div>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="mx-auto w-full max-w-md shadow-lg rounded-xl border-0 dark:border dark:border-gray-700">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-white">
              Login Successful!
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Redirecting to student dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="mx-auto w-full max-w-md shadow-lg rounded-xl border-0 dark:border dark:border-gray-700">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-white">
            Student Portal
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Access your learning dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="student@tunalismus.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-2 px-3 h-11 rounded-lg border border-gray-300 dark:border-gray-600 
                  focus:ring-2 focus:ring-green-500 focus:border-transparent 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  transition-colors duration-200"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="py-2 px-3 h-11 rounded-lg border border-gray-300 dark:border-gray-600 
                    focus:ring-2 focus:ring-green-500 focus:border-transparent 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    transition-colors duration-200 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400 flex items-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-11 rounded-lg bg-green-600 hover:bg-green-700 
                focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                text-white font-medium transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Access Student Portal"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}