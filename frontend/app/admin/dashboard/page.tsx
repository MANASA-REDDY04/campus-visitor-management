'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getDashboardStats, getAllVisits, approveVisit, rejectVisit } from '@/lib/api';
import { DashboardStats, Visit } from '@/types/visitor';
import { VisitorTable } from '@/components/VisitorTable';
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/TableSkeleton';
import {
  Users, Clock, CheckCircle, UserCheck, ChevronLeft,
  History, RefreshCw, Loader2, Filter
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NavbarUser } from '@/components/NavbarUser';

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'COMPLETED'];

function StatCard({
  label, value, icon: Icon, color, loading = false,
}: {
  label: string; value?: number; icon: React.ElementType; color: string; loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${color}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse mb-1" />
        ) : (
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{value ?? 0}</p>
        )}
        <p className="text-xs sm:text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, visitsRes] = await Promise.all([
        getDashboardStats(),
        getAllVisits(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      setVisits(visitsRes.data ?? []);
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    }
  }, [statusFilter]);

  useEffect(() => {
    let active = true;
    Promise.all([
      getDashboardStats(),
      getAllVisits(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    ])
      .then(([statsRes, visitsRes]) => {
        if (!active) return;
        if (statsRes.data) setStats(statsRes.data);
        setVisits(visitsRes.data ?? []);
      })
      .catch((e) => console.error('Failed to fetch dashboard data', e))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']} portalName="Admin Dashboard">
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1 border border-gray-200/70 sm:border-0 flex-shrink-0"
              title="Return to Home"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium hidden md:inline">Home</span>
            </Link>
            <div className="h-5 w-px bg-gray-200 hidden sm:block flex-shrink-0" />
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="CBIT Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-gray-200 bg-white flex-shrink-0 shadow-xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
                    Admin Portal
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                    CBIT
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 hidden lg:block leading-none mt-0.5">
                  Chaitanya Bharathi Institute of Technology
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <Link
              href="/admin/history"
              title="Visit History"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors p-2 sm:px-3 sm:py-1.5 rounded-xl hover:bg-indigo-50 border border-gray-200/70 sm:border-0"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
              <span className="hidden md:inline font-medium">History</span>
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh dashboard data"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors p-2 sm:px-3 sm:py-1.5 rounded-xl hover:bg-blue-50 border border-gray-200/70 sm:border-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline font-medium">Refresh</span>
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <NavbarUser />
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard label="Total Requests" value={stats?.total_visitors} loading={loading || !stats} icon={Users} color="bg-blue-500" />
          <StatCard label="Pending" value={stats?.pending_requests} loading={loading || !stats} icon={Clock} color="bg-yellow-500" />
          <StatCard label="Approved" value={stats?.approved_visits} loading={loading || !stats} icon={CheckCircle} color="bg-indigo-500" />
          <StatCard label="Currently Inside" value={stats?.currently_inside} loading={loading || !stats} icon={UserCheck} color="bg-green-500" />
        </div>

        {/* Visitor Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Visitor Requests</h2>
            {/* Filter tabs (horizontally scrollable on mobile) */}
            <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <div className="inline-flex items-center gap-1 bg-gray-100 rounded-xl p-1 min-w-max">
                <Filter className="w-3.5 h-3.5 text-gray-400 ml-2 mr-1" />
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === s
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <TableSkeleton rows={4} />
            ) : (
              <VisitorTable visits={visits} onStatusChange={handleRefresh} />
            )}
          </div>
        </div>
      </div>
    </div>
  </ProtectedRoute>
  );
}
