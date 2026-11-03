'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { verifyPass, checkIn } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { StatusBadge } from './StatusBadge';
import { Search, ScanLine, CheckCircle, AlertCircle, Building2, User, Calendar, Camera, CameraOff, X } from 'lucide-react';

interface QRScannerProps {
  onCheckIn?: () => void;
}

// ─── Pass ID Extraction & Audio Feedback ─────────────────────────────────────

function extractPassId(rawText: string): string {
  const trimmed = rawText.trim();
  // If it's a URL like https://.../visitor/pass/VISIT-2026-XXXXXX
  const urlMatch = trimmed.match(/\/visitor\/pass\/([A-Za-z0-9_-]+)/i);
  if (urlMatch) {
    return urlMatch[1].toUpperCase();
  }
  // If text contains a pattern like VISIT-XXXX-XXXXXX
  const visitMatch = trimmed.match(/\b(VISIT-[A-Za-z0-9_-]+)\b/i);
  if (visitMatch) {
    return visitMatch[1].toUpperCase();
  }
  return trimmed.toUpperCase();
}

function playScanBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {
    // Ignore audio context errors
  }
}

// ─── Camera QR Scanner Modal ──────────────────────────────────────────────────

function CameraScanner({
  onDetected,
  onClose,
}: {
  onDetected: (passId: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    rafRef.current = null;
    streamRef.current = null;
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    if (code?.data) {
      setScanning(false);
      stopCamera();
      playScanBeep();
      onDetected(extractPassId(code.data));
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [onDetected, stopCamera]);

  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .then((stream) => {
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            rafRef.current = requestAnimationFrame(tick);
          }).catch(() => {
            // Video play interrupted or restricted
          });
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err?.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access and try again.'
            : 'Unable to access camera. Make sure a camera is connected.'
        );
      });
    return () => {
      mounted = false;
      stopCamera();
    };
  }, [tick, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-green-400" />
            <span className="font-semibold text-sm">Scan Visitor QR Code</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Close scanner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative bg-black">
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <CameraOff className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full aspect-square object-cover"
                playsInline
                autoPlay
                muted
              />
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-48 h-48">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                  {/* Scanning line animation */}
                  {scanning && (
                    <div className="absolute left-2 right-2 h-0.5 bg-green-400/80 shadow-[0_0_8px_2px_rgba(74,222,128,0.6)] animate-scan-line" />
                  )}
                </div>
              </div>
              {/* Hidden canvas for QR processing */}
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Point the camera at the visitor&apos;s QR code on their pass
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main QR Scanner Component ────────────────────────────────────────────────

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
  const [showCamera, setShowCamera] = useState(false);

  const handleVerify = async (id?: string) => {
    const targetId = (id ?? passId).trim().toUpperCase();
    if (!targetId) return;
    setLoading(true);
    setVerifyResult(null);
    setCheckInSuccess(false);
    try {
      const res = await verifyPass(targetId);
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

  /** Called when camera scanner detects a QR code */
  const handleQRDetected = (scannedId: string) => {
    setShowCamera(false);
    setPassId(scannedId);
    handleVerify(scannedId);
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
    <>
      {/* Camera Scanner Modal */}
      {showCamera && (
        <CameraScanner
          onDetected={handleQRDetected}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="space-y-6">
        {/* Mobile-Only: Camera QR Scanner Quick Action */}
        <div className="md:hidden">
          <button
            onClick={() => setShowCamera(true)}
            className="w-full py-3.5 px-4 bg-gray-900 hover:bg-black active:scale-[0.99] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all"
          >
            <Camera className="w-5 h-5 text-green-400" />
            <span>Open Camera to Scan QR Code</span>
          </button>

          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink mx-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
              Or enter code manually
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>
        </div>

        {/* Input row */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="hidden md:inline">Enter Visitor Pass ID</span>
            <span className="md:hidden">Visitor Pass ID</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Text input */}
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

            {/* Manual Verify Button */}
            <button
              onClick={() => handleVerify()}
              disabled={loading || !passId.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Verifying...' : 'Verify Pass'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            <span className="hidden md:inline">
              Enter the pass ID from the visitor&apos;s digital pass to verify and check them in
            </span>
            <span className="md:hidden">
              Enter code manually or tap <span className="font-medium text-gray-700">Open Camera</span> above to scan
            </span>
          </p>
        </div>

        {/* Verification Result */}
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
    </>
  );
}
