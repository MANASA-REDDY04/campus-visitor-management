'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LogIn, User, ShieldCheck, ClipboardList } from 'lucide-react';

export function NavbarUser() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </Link>
    );
  }

  const roleBadgeColor =
    user.role === 'ADMIN'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : user.role === 'MANAGER'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-green-100 text-green-700 border-green-200';

  const RoleIcon =
    user.role === 'ADMIN'
      ? ClipboardList
      : user.role === 'SECURITY'
      ? ShieldCheck
      : User;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200/90 text-xs">
        <RoleIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <span className="font-semibold text-gray-800 max-w-[110px] truncate hidden md:inline">
          {user.name}
        </span>
        <span className={`px-1.5 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase border ${roleBadgeColor}`}>
          {user.role}
        </span>
      </div>

      <button
        onClick={logout}
        title="Sign Out"
        aria-label="Sign Out"
        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-gray-200/70 sm:border-0"
      >
        <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
}
