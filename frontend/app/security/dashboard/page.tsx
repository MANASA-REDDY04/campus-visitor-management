'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getTodaysVisitors, checkOut } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { StatusBadge } from '@/components/StatusBadge';
import { QRScanner } from '@/components/QRScanner';
import { TableSkeleton } from '@/components/TableSkeleton';
import {
  ChevronLeft, RefreshCw, Loader2, Shield, ScanLine,
  Users, LogOut, Calendar, Clock
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NavbarUser } from '@/components/NavbarUser';

export default function SecurityDashboard() {
  const [todaysVisitors, setTodaysVisitors] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'visitors' | 'verify'>('verify');

  const fetchVisitors = useCallback(async () => {
    try {
      const res = await getTodaysVisitors();
      setTodaysVisitors(res.data ?? []);
    } catch (e) {
      console.error('Failed to fetch today visitors', e);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getTodaysVisitors()
      .then((res) => {
        if (active) setTodaysVisitors(res.data ?? []);
      })
      .catch((e) => {
        console.error('Failed to fetch today visitors', e);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVisitors();
    setRefreshing(false);
  };

  const handleCheckOut = async (visitId: string) => {
    setCheckingOut(visitId);
    try {
      await checkOut(visitId);
      await fetchVisitors();
    } catch (e) {
      console.error('Check-out failed', e);
    } finally {
      setCheckingOut(null);
    }
  };

  const insideCount = todaysVisitors.filter((v) => v.status === 'CHECKED_IN').length;

  const formatTime = (timeStr: string) => timeStr;

  return (
    <ProtectedRoute allowedRoles={['SECURITY', 'ADMIN']} portalName="Security Console">
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
                    Security Console
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 flex-shrink-0">
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
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh today's data"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-green-600 transition-colors p-2 sm:px-3 sm:py-1.5 rounded-xl hover:bg-green-50 border border-gray-200/70 sm:border-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline font-medium">Refresh</span>
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <NavbarUser />
          </div>
        </nav>

        <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Controls & Campus Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          {/* Tabs */}
          <div className="grid grid-cols-2 sm:flex gap-1.5 p-1 bg-white rounded-2xl shadow-xs border border-gray-200/80 w-full sm:w-fit">
            <button
              onClick={() => setActiveTab('verify')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                activeTab === 'verify'
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              <span>Verify Pass</span>
            </button>
            <button
              onClick={() => setActiveTab('visitors')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                activeTab === 'visitors'
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Today&apos;s Visitors</span>
              {loading ? (
                <span className="w-5 h-4 bg-gray-200 rounded-full animate-pulse inline-block" />
              ) : todaysVisitors.length > 0 ? (
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${
                  activeTab === 'visitors' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                }`}>
                  {todaysVisitors.length}
                </span>
              ) : null}
            </button>
          </div>

          {/* Live Campus Count Status */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 bg-white px-3.5 py-2 rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-gray-600">On Campus Now:</span>
            </div>
            {loading ? (
              <div className="h-5 w-16 bg-green-100/80 rounded-full animate-pulse" />
            ) : (
              <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                {insideCount} Inside
              </span>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'verify' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Verify Visitor Pass</h2>
              <p className="text-gray-500 text-sm mt-1">
                Enter the visitor&apos;s pass ID to verify and check them in.
              </p>
            </div>
            <QRScanner onCheckIn={handleRefresh} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Today&apos;s Visitors
                <span className="text-sm font-normal text-gray-400 ml-2">
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="p-4 sm:p-6">
                <TableSkeleton rows={4} />
              </div>
            ) : todaysVisitors.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No visitors scheduled for today</p>
                <p className="text-sm mt-1">Approved visits for today will appear here</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View (screens < 768px) */}
                <div className="block md:hidden p-4 space-y-3">
                  {todaysVisitors.map((visit) => (
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
                          <span className="text-gray-400 block text-[10px] uppercase">Time</span>
                          <span>{formatTime(visit.arrival_time)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Status Check</span>
                          {visit.check_in_time ? (
                            <span className="text-green-600 font-medium">
                              In: {new Date(visit.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span>Not yet checked in</span>
                          )}
                        </div>
                      </div>

                      {visit.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckOut(visit.id)}
                          disabled={checkingOut === visit.id}
                          className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {checkingOut === visit.id ? 'Processing...' : 'Check Out Visitor'}
                        </button>
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
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Person to Visit</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Department</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Time</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {todaysVisitors.map((visit) => (
                        <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{visit.visitor?.full_name}</div>
                            <div className="text-xs text-gray-400">{visit.visitor?.phone}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{visit.person_to_visit}</td>
                          <td className="py-3 px-4 text-gray-700">{visit.department}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {formatTime(visit.arrival_time)}
                            </div>
                            {visit.check_in_time && (
                              <div className="text-xs text-green-600 mt-0.5">
                                In: {new Date(visit.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={visit.status} />
                          </td>
                          <td className="py-3 px-4">
                            {visit.status === 'CHECKED_IN' ? (
                              <button
                                onClick={() => handleCheckOut(visit.id)}
                                disabled={checkingOut === visit.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                {checkingOut === visit.id ? 'Processing...' : 'Check Out'}
                              </button>
                            ) : visit.status === 'APPROVED' ? (
                              <span className="text-xs text-blue-500 font-medium">Ready to Check In</span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  </ProtectedRoute>
  );
}
