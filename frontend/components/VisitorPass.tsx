'use client';

import React from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Visit } from '@/types/visitor';
import { StatusBadge } from './StatusBadge';
import { Building2, Calendar, Clock, User } from 'lucide-react';

interface VisitorPassProps {
  visit: Visit;
}

export function VisitorPass({ visit }: VisitorPassProps) {


  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const isValid = visit.status === 'APPROVED' || visit.status === 'CHECKED_IN';

  return (
    <div className="space-y-4">
      {/* Pass Card */}
      <div
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 max-w-md mx-auto"
      >
        {/* Header */}
        <div className={`p-4 sm:p-6 text-white ${isValid ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="CBIT Logo"
                className="w-12 h-12 rounded-xl border border-white/40 object-cover bg-white p-0.5 shadow-sm flex-shrink-0"
              />
              <div>
                <p className="text-blue-200 text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
                  CBIT Digital Pass
                </p>
                <h1 className="text-base sm:text-lg font-bold leading-tight">
                  Chaitanya Bharathi Institute of Technology
                </h1>
                <p className="text-blue-200 text-[11px] sm:text-xs">Gandipet, Hyderabad</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <StatusBadge status={visit.status} />
            </div>
          </div>
          <div className="pt-2 border-t border-white/20">
            <p className="text-blue-100 text-xs sm:text-sm">Visitor Name</p>
            <p className="text-xl sm:text-2xl font-bold leading-tight">{visit.visitor?.full_name}</p>
            <p className="text-blue-200 text-xs sm:text-sm capitalize mt-0.5">
              {visit.visitor?.visitor_type?.toLowerCase()} visitor
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Person to Visit</p>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-500" />
                {visit.person_to_visit}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Department</p>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-500" />
                {visit.department}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Visit Date</p>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                {formatDate(visit.visit_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Arrival Time</p>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                {visit.arrival_time}
                {visit.departure_time && ` – ${visit.departure_time}`}
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Purpose</p>
            <p className="text-gray-700 text-sm">{visit.purpose}</p>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center border-t border-dashed border-gray-200 pt-6">
            <div className={`p-3 rounded-2xl mb-3 ${isValid ? 'bg-blue-50' : 'bg-gray-100'}`}>
              <QRCode
                value={visit.pass_id}
                size={140}
                level="H"
                fgColor={isValid ? '#1e40af' : '#9ca3af'}
              />
            </div>
            <p className="font-mono text-sm font-bold text-gray-700 tracking-wider">
              {visit.pass_id}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isValid ? 'Show this code to security' : 'This pass is not valid for entry'}
            </p>
          </div>

          {/* Check-in info */}
          {visit.check_in_time && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl">
              <p className="text-xs text-green-600 font-semibold">
                ✓ Checked in at {new Date(visit.check_in_time).toLocaleTimeString('en-IN')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
