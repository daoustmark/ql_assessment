import React from 'react';
import { Fade } from '../../ui/Fade';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
}

function StatCard({ title, value, change, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change && (
          <p
            className={cn(
              'ml-2 text-sm font-semibold',
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
}

export function Overview() {
  return (
    <Fade>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your assessment platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Candidates"
            value="1,234"
            change="+12%"
            trend="up"
          />
          <StatCard
            title="Active Sessions"
            value="45"
            change="-3%"
            trend="down"
          />
          <StatCard
            title="Completed Tests"
            value="892"
            change="+8%"
            trend="up"
          />
          <StatCard
            title="Average Score"
            value="85%"
            change="+2%"
            trend="up"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="mt-6 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {[
                  {
                    id: 1,
                    name: 'John Doe',
                    action: 'completed',
                    target: 'Day 1 Assessment',
                    time: '2 hours ago',
                  },
                  {
                    id: 2,
                    name: 'Jane Smith',
                    action: 'started',
                    target: 'Day 2 Assessment',
                    time: '3 hours ago',
                  },
                  {
                    id: 3,
                    name: 'Mike Johnson',
                    action: 'submitted',
                    target: 'Video Response',
                    time: '4 hours ago',
                  },
                ].map((activity) => (
                  <li key={activity.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {activity.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.action} {activity.target}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Fade>
  );
} 