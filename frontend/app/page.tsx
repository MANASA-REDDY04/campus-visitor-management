'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  ShieldCheck,
  ClipboardList,
  ArrowRight,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-between p-4 sm:p-6 py-8">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTI4NDAiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzBoLTJ2Mmgydi0yek0zNCAyOGgydi0yaC0ydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 pointer-events-none" />

      {/* Top Bar with Auth State */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="CBIT Logo"
            className="w-8 h-8 rounded-lg object-cover bg-white shadow-xs"
          />
          <span className="text-white font-bold text-sm tracking-wide hidden sm:inline">
            CBIT Hyderabad
          </span>
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-xs text-white">
              <User className="w-3.5 h-3.5 text-blue-300" />
              <span className="font-semibold">{user.name}</span>
              <span className="bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {user.role}
              </span>
              <button
                onClick={logout}
                className="ml-1 p-1 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/30"
            >
              <LogIn className="w-4 h-4" />
              <span>Portal Login</span>
            </Link>
          )}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl my-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          {/* College Logo */}
          <div className="flex items-center justify-center mb-4">
            <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="CBIT Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover bg-white"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3.5 py-1.5 mb-3 sm:mb-4 max-w-full">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-blue-300 text-xs sm:text-sm font-medium truncate">
              Chaitanya Bharathi Institute of Technology (CBIT)
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight">
            CBIT Campus
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {' '}Visitor Management
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Secure, role-based campus access control system for registration, approval, and verification of visitor passes.
          </p>
        </div>

        {/* 3 Role Cards (Admin, Manager, Security) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {/* 1. Admin */}
          <Link href="/admin/dashboard" className="group">
            <div className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-7 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                    Admin Role
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">Admin Portal</h2>
                <p className="text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed">
                  Approves or rejects visitor pass requests, views daily statistics, and inspects complete campus visit history.
                </p>
              </div>
              <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:translate-x-1 transition-transform pt-2 border-t border-white/5">
                Open Admin Portal <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* 2. Manager */}
          <Link href="/visitor/register" className="group">
            <div className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-7 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                    Manager Role
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">Manager Portal</h2>
                <p className="text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed">
                  Registers new visitor passes, submits visit requests with arrival dates and purpose, and generates digital passes.
                </p>
              </div>
              <div className="flex items-center text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform pt-2 border-t border-white/5">
                Register a Pass <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* 3. Security */}
          <Link href="/security/dashboard" className="group">
            <div className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-7 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10 cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 uppercase">
                    Security Role
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">Security Console</h2>
                <p className="text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed">
                  Scans QR codes or enters pass IDs to verify authenticity, processes visitor check-ins and check-outs.
                </p>
              </div>
              <div className="flex items-center text-green-400 text-sm font-semibold group-hover:translate-x-1 transition-transform pt-2 border-t border-white/5">
                Open Security Console <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-slate-500 text-xs sm:text-sm mt-8">
        CBIT Campus Visitor Management System • MCA Project Demo
      </footer>
    </main>
  );
}
