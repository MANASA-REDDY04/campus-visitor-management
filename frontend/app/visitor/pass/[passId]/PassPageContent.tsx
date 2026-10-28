'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getVisitByPassId } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { VisitorPass } from '@/components/VisitorPass';
import { ChevronLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

function PassSkeleton() {
  return (
    <div className="max-w-md mx-auto space-y-4 animate-pulse">
      <div className="text-center space-y-2 mb-6">
        <div className="h-7 w-48 bg-gray-200 rounded-lg mx-auto" />
        <div className="h-4 w-64 bg-gray-100 rounded mx-auto" />
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="p-4 sm:p-6 bg-slate-200 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-300" />
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-gray-300 rounded" />
                <div className="h-4 w-36 bg-gray-300 rounded" />
                <div className="h-3 w-24 bg-gray-300 rounded" />
              </div>
            </div>
            <div className="h-6 w-20 bg-gray-300 rounded-full" />
          </div>
          <div className="pt-2 border-t border-gray-300/60 space-y-1.5">
            <div className="h-3 w-20 bg-gray-300 rounded" />
            <div className="h-6 w-40 bg-gray-300 rounded" />
            <div className="h-3 w-24 bg-gray-300 rounded" />
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
            <div className="space-y-1">
              <div className="h-2.5 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-2.5 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-2.5 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-2.5 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-40 h-40 bg-gray-200 rounded-xl mb-3" />
            <div className="h-3 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PassPageContent() {
  const params = useParams();
  const passId = params.passId as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getVisitByPassId(passId);
      if (res.data) {
        setVisit(res.data);
      } else {
        setError('Pass not found');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setError(err?.response?.data?.detail || err?.message || 'Failed to load pass');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const res = await getVisitByPassId(passId);
        if (!active) return;
        if (res.data) {
          setVisit(res.data);
        } else {
          setError('Pass not found');
        }
      } catch (e: unknown) {
        if (!active) return;
        const err = e as { response?: { data?: { detail?: string } }; message?: string };
        setError(err?.response?.data?.detail || err?.message || 'Failed to load pass');
      } finally {
        if (active) setLoading(false);
      }
    }

    if (passId) {
      loadData();
    }

    return () => {
      active = false;
    };
  }, [passId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/visitor/register"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1 border border-gray-200/70 sm:border-0 flex-shrink-0"
            title="Return to Register"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden md:inline">Register</span>
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
                  Digital Pass
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
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            onClick={handleRefresh}
            title="Refresh pass status"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors p-2 sm:px-3 sm:py-1.5 rounded-xl hover:bg-blue-50 border border-gray-200/70 sm:border-0"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline font-medium">Refresh</span>
          </button>
        </div>
      </nav>

      <div className="max-w-lg mx-auto p-4 sm:p-6 py-6 sm:py-10">
        {loading ? (
          <PassSkeleton />
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pass Not Found</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <p className="text-sm text-gray-400 mb-6 font-mono bg-gray-100 px-4 py-2 rounded-lg">
              Pass ID: {passId}
            </p>
            <Link
              href="/visitor/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Register a Visit
            </Link>
          </div>
        ) : visit ? (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Digital Pass</h2>
              <p className="text-gray-500 text-sm mt-1">
                {visit.status === 'PENDING'
                  ? 'Your pass is pending admin approval'
                  : visit.status === 'APPROVED' || visit.status === 'CHECKED_IN'
                  ? 'Show this pass at the security desk'
                  : visit.status === 'REJECTED'
                  ? 'Your visit request was rejected'
                  : 'This visit has been completed'}
              </p>
            </div>
            <VisitorPass visit={visit} />

            {visit.status === 'PENDING' && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                <p className="text-yellow-800 text-sm font-medium">
                  ⏳ Your request is awaiting admin approval.
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  Refresh this page to check for updates.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
