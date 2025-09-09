"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function RouteGuard({ children, allowedRoles = [] }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return; // Wait for the auth state to be determined
    }

    if (!session) {
      router.push('/login');
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      // User is authenticated but doesn't have the right role
      // Redirect to their own dashboard or a generic unauthorized page
      switch (session.user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'trainer':
          router.push('/trainer/dashboard');
          break;
        case 'student':
          router.push('/student/dashboard');
          break;
        default:
          router.push('/'); // Or a dedicated /unauthorized page
      }
    }
  }, [status, session, allowedRoles, router]);

  // While loading, show a full-screen loader
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated and authorized, render the children
  if (session && (allowedRoles.length === 0 || allowedRoles.includes(session.user?.role))) {
    return children;
  }

  // If not authenticated, the useEffect will have already started the redirect.
  // We can show a loader while the redirect happens.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}