'use client';

import { Suspense } from 'react';
import PassPageContent from './PassPageContent';
import { Loader2 } from 'lucide-react';

export default function PassPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <PassPageContent />
    </Suspense>
  );
}
