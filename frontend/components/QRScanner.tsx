'use client';

import { useState } from 'react';
import { verifyPass, checkIn } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { StatusBadge } from './StatusBadge';
import { Search, ScanLine, CheckCircle, AlertCircle, Building2, User, Calendar } from 'lucide-react';

interface QRScannerProps {
  onCheckIn?: () => void;
}

export function QRScanner({ onCheckIn }: QRScannerProps) {
  const [passId, setPassId] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    visit: Visit | null;
  } | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const handleVerify = async () => {
    if (!passId.trim()) return;
    setLoading(true);
    setVerifyResult(null);
    setCheckInSuccess(false);
    try {
      const res = await verifyPass(passId.trim().toUpperCase());
      setVerifyResult({
        success: res.success,
        message: res.message,
        visit: res.data ?? null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Verification failed';
      setVerifyResult({ success: false, message: msg, visit: null });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!verifyResult?.visit) return;
    setCheckingIn(true);
    try {
      await checkIn(verifyResult.visit.id);
      setCheckInSuccess(true);
      setVerifyResult((prev) =>
        prev
          ? {
              ...prev,
              message: 'Visitor checked in successfully!',
              visit: prev.visit ? { ...prev.visit, status: 'CHECKED_IN' } : null,
            }
          : null
      );
      onCheckIn?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Check-in failed';
      setVerifyResult((prev) =>
        prev ? { ...prev, success: false, message: msg } : null
      );
    } finally {
      setCheckingIn(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const canCheckIn =
    verifyResult?.success &&
    verifyResult.visit?.status === 'APPROVED' &&
    !checkInSuccess;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Enter Visitor Pass ID
        </label>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={passId}
              onChange={(e) => setPassId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="e.g. VISIT-2026-XXXXXX"
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-gray-50"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={loading || !passId.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Verifying...' : 'Verify Pass'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Enter the pass ID from the visitor&apos;s digital pass or scan the QR code
        </p>
      </div>

      {/* Result */}
      {verifyResult && (
        <div
          className={`rounded-2xl border-2 overflow-hidden ${
            verifyResult.success
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          {/* Status banner */}
          <div
            className={`px-5 py-3 flex items-center gap-2 ${
              verifyResult.success ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {verifyResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span
              className={`font-semibold ${
                verifyResult.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {verifyResult.message}
            </span>
          </div>

          {/* Visit details */}
          {verifyResult.visit && (
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {verifyResult.visit.visitor?.full_name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {verifyResult.visit.visitor?.visitor_type?.toLowerCase()} •{' '}
                    {verifyResult.visit.visitor?.phone}
                  </p>
                </div>
                <StatusBadge status={verifyResult.visit.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Person to Visit</p>
                    <p className="font-medium">{verifyResult.visit.person_to_visit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Department</p>
                    <p className="font-medium">{verifyResult.visit.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Visit Date</p>
                    <p className="font-medium">{formatDate(verifyResult.visit.visit_date)}</p>
                  </div>
                </div>
              </div>

              {canCheckIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="w-full py-3 mt-2 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {checkingIn ? 'Checking in...' : '✓ CHECK IN'}
                </button>
              )}

              {checkInSuccess && (
                <div className="p-3 bg-green-100 rounded-xl text-center">
                  <p className="text-green-800 font-semibold">
                    ✓ Visitor checked in successfully!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
