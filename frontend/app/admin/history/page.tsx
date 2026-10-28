'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getVisitHistory } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/TableSkeleton';
import {
  ChevronLeft, History, Loader2, Filter, Calendar, Building2
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NavbarUser } from '@/components/NavbarUser';

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'COMPLETED'];

export default function HistoryPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (dateFilter) params.date = dateFilter;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await getVisitHistory(params);
      setVisits(res.data ?? []);
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  }, [dateFilter, deptFilter, statusFilter]);

  useEffect(() => {
    let active = true;
    const params: Record<string, string> = {};
    if (dateFilter) params.date = dateFilter;
    if (deptFilter) params.department = deptFilter;
    if (statusFilter) params.status = statusFilter;

    getVisitHistory(params)
      .then((res) => {
        if (active) setVisits(res.data ?? []);
      })
      .catch((e) => console.error('Failed to fetch history', e))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dateFilter, deptFilter, statusFilter]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

  const formatDateTime = (dt?: string) =>
    dt
      ? new Date(dt).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        })
      : '—';

  return (
    <ProtectedRoute allowedRoles={['ADMIN']} portalName="Visit History">
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/admin/dashboard"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1 border border-gray-200/70 sm:border-0 flex-shrink-0"
              title="Return to Dashboard"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium hidden md:inline">Dashboard</span>
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
                    Visit History
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex-shrink-0">
                    CBIT
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 hidden lg:block leading-none mt-0.5">
                  Chaitanya Bharathi Institute of Technology
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <NavbarUser />
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  placeholder="Filter by department..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === '' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(dateFilter || deptFilter || statusFilter) && (
            <button
              onClick={() => { setDateFilter(''); setDeptFilter(''); setStatusFilter(''); }}
              className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>All Visits</span>
              {loading ? (
                <span className="inline-block w-20 h-4 bg-gray-200 rounded-md animate-pulse" />
              ) : (
                <span className="text-sm font-normal text-gray-400">({visits.length} records)</span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="p-4 sm:p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : visits.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No visit records found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View (screens < 768px) */}
              <div className="block md:hidden p-4 space-y-3">
                {visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{visit.visitor?.full_name}</h3>
                        <p className="text-xs text-gray-400">{visit.visitor?.phone}</p>
                      </div>
                      <StatusBadge status={visit.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5 my-2.5">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Visiting</span>
                        <span className="font-medium text-gray-900">{visit.person_to_visit}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Department</span>
                        <span className="font-medium text-gray-900">{visit.department}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Date</span>
                        <span>{formatDate(visit.visit_date)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Purpose</span>
                        <span className="truncate block">{visit.purpose}</span>
                      </div>
                    </div>

                    {(visit.check_in_time || visit.check_out_time) && (
                      <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span>In: {formatDateTime(visit.check_in_time)}</span>
                        <span>Out: {formatDateTime(visit.check_out_time)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View (screens >= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Visitor</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Visit Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Person Visited</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Check In</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Check Out</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Purpose</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visits.map((visit) => (
                      <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{visit.visitor?.full_name}</div>
                          <div className="text-xs text-gray-400">{visit.visitor?.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{formatDate(visit.visit_date)}</td>
                        <td className="py-3 px-4 text-gray-700">{visit.person_to_visit}</td>
                        <td className="py-3 px-4 text-gray-700">{visit.department}</td>
                        <td className="py-3 px-4 text-gray-600 text-xs font-mono">{formatDateTime(visit.check_in_time)}</td>
                        <td className="py-3 px-4 text-gray-600 text-xs font-mono">{formatDateTime(visit.check_out_time)}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs">
                          <p className="truncate">{visit.purpose}</p>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={visit.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </ProtectedRoute>
  );
}
