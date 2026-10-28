'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { ShieldAlert, LogIn, ArrowLeft, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  portalName: string;
}

export function ProtectedRoute({ children, allowedRoles, portalName }: ProtectedRouteProps) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-gray-500 text-sm">Verifying access...</p>
      </div>
    );
  }

  // Case 1: Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="CBIT Logo" className="w-10 h-10 rounded-xl object-cover" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Please log in with an authorized account to access the <span className="font-semibold text-gray-800">{portalName}</span>.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Continue
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Logged in, but unauthorized role
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            The <span className="font-semibold text-gray-800">{portalName}</span> requires{' '}
            <span className="font-semibold text-red-600">{allowedRoles.join(' or ')}</span> privileges.
          </p>
          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 mb-6 border border-gray-100">
            Currently logged in as <span className="font-bold text-gray-900">{user.name}</span> ({user.role})
          </div>
          <div className="space-y-3">
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm"
            >
              Switch Account (Log Out)
            </button>
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authorized!
  return <>{children}</>;
}
