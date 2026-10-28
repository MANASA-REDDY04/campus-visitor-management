'use client';

import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Mail,
  Printer,
  X,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { Visit } from '@/types/visitor';

interface SharePassProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
}

export function formatWhatsAppPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

export function generateShareDetails(visit: Visit) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://campus-visitor-management.vercel.app';
  const passUrl = `${origin}/visitor/pass/${visit.pass_id}`;
  const visitorName = visit.visitor?.full_name || 'Visitor';
  const isApproved = visit.status === 'APPROVED' || visit.status === 'CHECKED_IN';

  const statusText = isApproved
    ? '✅ Your pass is *APPROVED*! Please show your digital QR pass at the CBIT Security Gate for instant entry.'
    : '⏳ Your visit pass request is currently *PENDING APPROVAL*. You can check the approval status anytime via the link below.';

  const message = `🎓 *CBIT Campus Visitor Pass*\n\n` +
    `Hello *${visitorName}*,\n` +
    `${statusText}\n\n` +
    `📋 *Pass ID:* ${visit.pass_id}\n` +
    `👤 *Visiting:* ${visit.person_to_visit}\n` +
    `🏢 *Department:* ${visit.department}\n` +
    `📅 *Date:* ${visit.visit_date} at ${visit.arrival_time}\n` +
    `🎯 *Purpose:* ${visit.purpose}\n\n` +
    `🔗 *View Your Digital QR Pass:*\n${passUrl}\n\n` +
    `📍 *Chaitanya Bharathi Institute of Technology (CBIT)*, Gandipet, Hyderabad.`;

  const phone = formatWhatsAppPhone(visit.visitor?.phone);
  const waUrl = phone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  const subject = `CBIT Campus Visitor Pass - ${visit.pass_id}`;
  const mailtoUrl = `mailto:${visit.visitor?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  return { passUrl, message, waUrl, mailtoUrl, subject };
}

export function SharePassModal({ visit, isOpen, onClose }: SharePassProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { passUrl, message, waUrl, mailtoUrl } = generateShareDetails(visit);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(passUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `CBIT Visitor Pass - ${visit.visitor?.full_name}`,
          text: message,
          url: passUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const handlePrint = () => {
    window.open(passUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Share Visitor Pass
              </h2>
              <p className="text-xs text-gray-500">
                Send pass directly to <span className="font-semibold text-gray-800">{visit.visitor?.full_name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Pass Preview Snippet */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                Digital Pass ID
              </span>
              <p className="font-mono text-base font-black text-gray-900">{visit.pass_id}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {visit.status === 'APPROVED' ? '✅ Pass Approved' : '⏳ Pending Approval'}
              </p>
            </div>
            <a
              href={passUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-semibold border border-blue-200 shadow-xs transition-colors"
            >
              <span>Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Primary Action: Send via WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-md shadow-green-600/20 transition-all active:scale-[0.99]"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Send to Visitor on WhatsApp</span>
            {visit.visitor?.phone && (
              <span className="text-xs font-medium bg-green-700/60 px-2 py-0.5 rounded-full ml-1">
                {visit.visitor.phone}
              </span>
            )}
          </a>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Copy Link Button */}
            <button
              onClick={handleCopy}
              className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                copied
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              <span>{copied ? 'Link Copied!' : 'Copy Pass Link'}</span>
            </button>

            {/* Email Button */}
            <a
              href={mailtoUrl}
              className="py-2.5 px-3 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4 text-gray-500" />
              <span>Email Pass</span>
            </a>
          </div>

          {/* Native Share & Print Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex-1 py-2 px-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>More Options (Native Share)</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="py-2 px-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
              title="Print Pass"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
