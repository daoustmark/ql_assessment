import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Panel - Assessment App',
  description: 'Administration interface for managing assessments',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow">
        <div className="flex-1">
          <Link href="/admin" className="btn btn-ghost text-xl">Assessment Admin</Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li><Link href="/admin/assessments">Assessments</Link></li>
            <li><Link href="/">Back to App</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto p-4">
        {children}
      </div>
    </div>
  );
} 