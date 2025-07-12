'use client';

import { useSession } from 'next-auth/react';

export default function Layout({ children }) {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-grid-pattern">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}