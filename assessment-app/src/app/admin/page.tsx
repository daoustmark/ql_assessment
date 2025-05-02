import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Assessments</h2>
            <p>Manage assessment tests, parts, blocks, and questions.</p>
            <div className="card-actions justify-end">
              <Link href="/admin/assessments" className="btn btn-primary">
                View Assessments
              </Link>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Assessment Results</h2>
            <p>View user attempts and responses to assessments.</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Settings</h2>
            <p>Configure admin settings and preferences.</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 