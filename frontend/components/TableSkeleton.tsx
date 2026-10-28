'use client';

import React from 'react';

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 4 }: TableSkeletonProps) {
  const items = Array.from({ length: rows });

  return (
    <div className="w-full">
      {/* Mobile Card Skeleton (< 768px) */}
      <div className="block md:hidden space-y-3">
        {items.map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs animate-pulse"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-gray-200 rounded-md w-3/5" />
                <div className="h-3 bg-gray-100 rounded-md w-2/5" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-3 my-3">
              <div className="space-y-1">
                <div className="h-2.5 bg-gray-200 rounded w-12" />
                <div className="h-3.5 bg-gray-200 rounded w-24" />
              </div>
              <div className="space-y-1">
                <div className="h-2.5 bg-gray-200 rounded w-16" />
                <div className="h-3.5 bg-gray-200 rounded w-20" />
              </div>
              <div className="space-y-1">
                <div className="h-2.5 bg-gray-200 rounded w-10" />
                <div className="h-3.5 bg-gray-200 rounded w-20" />
              </div>
              <div className="space-y-1">
                <div className="h-2.5 bg-gray-200 rounded w-14" />
                <div className="h-3.5 bg-gray-200 rounded w-24" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="h-3.5 w-24 bg-gray-200 rounded" />
              <div className="h-7 w-20 bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Skeleton (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="py-3 px-4 text-left">
                <div className="h-3.5 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="py-3 px-4 text-left">
                <div className="h-3.5 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="py-3 px-4 text-left">
                <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="py-3 px-4 text-left">
                <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="py-3 px-4 text-left">
                <div className="h-3.5 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="py-3 px-4 text-left">
                <div className="h-3.5 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="py-3 px-4 text-left">
                <div className="h-3.5 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-3.5 px-4">
                  <div className="h-4 bg-gray-200 rounded w-28 mb-1" />
                  <div className="h-2.5 bg-gray-100 rounded w-16" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-3.5 bg-gray-200 rounded w-24 mb-1" />
                  <div className="h-2.5 bg-gray-100 rounded w-32" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-3.5 bg-gray-200 rounded w-28" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-3.5 bg-gray-200 rounded w-24" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-3.5 bg-gray-200 rounded w-20 mb-1" />
                  <div className="h-2.5 bg-gray-100 rounded w-14" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-gray-200 rounded-lg" />
                    <div className="h-7 w-7 bg-gray-200 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
