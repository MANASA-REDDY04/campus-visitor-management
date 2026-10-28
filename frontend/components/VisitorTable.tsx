'use client';

import { useState } from 'react';
import { Visit } from '@/types/visitor';
import { StatusBadge } from './StatusBadge';
import { approveVisit, rejectVisit } from '@/lib/api';
import { Eye, CheckCircle, XCircle, X, User, Phone, Mail, Building2, Calendar, Clock } from 'lucide-react';

interface VisitorTableProps {
  visits: Visit[];
  onStatusChange?: () => void;
  showActions?: boolean;
}

export function VisitorTable({ visits, onStatusChange, showActions = true }: VisitorTableProps) {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const handleApprove = async (visitId: string) => {
    setLoadingId(visitId);
    setError('');
    try {
      await approveVisit(visitId);
      onStatusChange?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to approve';
      setError(msg);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (visitId: string) => {
    setLoadingId(visitId);
    setError('');
    try {
      await rejectVisit(visitId);
      onStatusChange?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to reject';
      setError(msg);
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  if (visits.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No visitor requests found</p>
        <p className="text-gray-400 text-sm mt-1">Requests will appear here when submitted</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Mobile Card View (screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{visit.visitor?.full_name}</h3>
                <p className="text-xs text-gray-500 capitalize">{visit.visitor?.visitor_type?.toLowerCase()} visitor</p>
              </div>
              <StatusBadge status={visit.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 rounded-xl p-3 my-3">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Visiting</span>
                <span className="font-medium text-gray-900">{visit.person_to_visit}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Department</span>
                <span className="font-medium text-gray-900">{visit.department}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Phone</span>
                <span>{visit.visitor?.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Date & Time</span>
                <span>{formatDate(visit.visit_date)} • {visit.arrival_time}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
              <span className="font-mono text-xs text-blue-600 font-semibold">{visit.pass_id}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedVisit(visit)}
                  className="px-2.5 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                {showActions && visit.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(visit.id)}
                      disabled={loadingId === visit.id}
                      className="px-2.5 py-1.5 text-xs text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(visit.id)}
                      disabled={loadingId === visit.id}
                      className="px-2.5 py-1.5 text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (screens >= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Visitor</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Contact</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Person to Visit</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Department</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Visit Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
              {showActions && (
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visits.map((visit) => (
              <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{visit.visitor?.full_name}</div>
                  <div className="text-xs text-gray-500 capitalize">{visit.visitor?.visitor_type?.toLowerCase()}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-gray-700">{visit.visitor?.phone}</div>
                  {visit.visitor?.email && (
                    <div className="text-xs text-gray-500">{visit.visitor.email}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-700">{visit.person_to_visit}</td>
                <td className="py-3 px-4 text-gray-700">{visit.department}</td>
                <td className="py-3 px-4">
                  <div className="text-gray-700">{formatDate(visit.visit_date)}</div>
                  <div className="text-xs text-gray-500">{visit.arrival_time}</div>
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={visit.status} />
                </td>
                {showActions && (
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedVisit(visit)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {visit.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(visit.id)}
                            disabled={loadingId === visit.id}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(visit.id)}
                            disabled={loadingId === visit.id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visit Detail Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Visitor Details</h2>
              <button
                onClick={() => setSelectedVisit(null)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedVisit.visitor?.full_name}</p>
                  <p className="text-sm text-gray-500 capitalize">{selectedVisit.visitor?.visitor_type?.toLowerCase()}</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={selectedVisit.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {selectedVisit.visitor?.phone}
                </div>
                {selectedVisit.visitor?.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedVisit.visitor.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  {selectedVisit.person_to_visit}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {selectedVisit.department}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(selectedVisit.visit_date)}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {selectedVisit.arrival_time}
                  {selectedVisit.departure_time && ` – ${selectedVisit.departure_time}`}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Purpose of Visit</p>
                <p className="text-sm text-gray-700">{selectedVisit.purpose}</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Pass ID</p>
                <p className="text-sm font-mono font-semibold text-blue-700">{selectedVisit.pass_id}</p>
              </div>

              {selectedVisit.check_in_time && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Checked In:</span>{' '}
                  {new Date(selectedVisit.check_in_time).toLocaleString('en-IN')}
                </div>
              )}
              {selectedVisit.check_out_time && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Checked Out:</span>{' '}
                  {new Date(selectedVisit.check_out_time).toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {selectedVisit.status === 'PENDING' && (
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => { handleApprove(selectedVisit.id); setSelectedVisit(null); }}
                  disabled={loadingId === selectedVisit.id}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => { handleReject(selectedVisit.id); setSelectedVisit(null); }}
                  disabled={loadingId === selectedVisit.id}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
