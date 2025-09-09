"use client";

import { useState } from "react";
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
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

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