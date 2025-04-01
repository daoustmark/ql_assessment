import React from 'react';
import { Fade } from '../../ui/Fade';

export function Settings() {
  return (
    <Fade>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your assessment platform settings
          </p>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Platform Name
                </label>
                <input
                  type="text"
                  className="mt-1 input input-bordered w-full"
                  defaultValue="Assessment Platform"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time Zone
                </label>
                <select className="mt-1 select select-bordered w-full">
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Test Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Test Settings</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  className="mt-1 input input-bordered w-full"
                  defaultValue="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Attempts
                </label>
                <input
                  type="number"
                  className="mt-1 input input-bordered w-full"
                  defaultValue="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Show Results
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input type="checkbox" className="checkbox" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">
                      Allow candidates to view their results
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Email Settings</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SMTP Host
                </label>
                <input
                  type="text"
                  className="mt-1 input input-bordered w-full"
                  defaultValue="smtp.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SMTP Port
                </label>
                <input
                  type="number"
                  className="mt-1 input input-bordered w-full"
                  defaultValue="587"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  From Email
                </label>
                <input
                  type="email"
                  className="mt-1 input input-bordered w-full"
                  defaultValue="noreply@example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </Fade>
  );
} 