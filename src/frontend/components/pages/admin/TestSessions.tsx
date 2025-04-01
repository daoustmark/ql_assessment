import React from 'react';
import { Fade } from '../../ui/Fade';

interface TestSession {
  id: string;
  candidateName: string;
  testType: 'Day 1' | 'Day 2';
  status: 'in_progress' | 'completed' | 'expired';
  startTime: string;
  endTime?: string;
  score?: number;
}

const sessions: TestSession[] = [
  {
    id: '1',
    candidateName: 'John Doe',
    testType: 'Day 1',
    status: 'completed',
    startTime: '2024-03-20 10:00 AM',
    endTime: '2024-03-20 11:30 AM',
    score: 85,
  },
  {
    id: '2',
    candidateName: 'Jane Smith',
    testType: 'Day 2',
    status: 'in_progress',
    startTime: '2024-03-20 2:00 PM',
  },
  {
    id: '3',
    candidateName: 'Mike Johnson',
    testType: 'Day 1',
    status: 'expired',
    startTime: '2024-03-19 9:00 AM',
  },
];

function StatusBadge({ status }: { status: TestSession['status'] }) {
  const colors = {
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
  };

  const labels = {
    in_progress: 'In Progress',
    completed: 'Completed',
    expired: 'Expired',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colors[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

export function TestSessions() {
  return (
    <Fade>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test Sessions</h2>
            <p className="mt-1 text-sm text-gray-500">
              Monitor and manage test sessions
            </p>
          </div>
          <button className="btn btn-primary">
            Create Session
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search sessions..."
              className="input input-bordered flex-1"
            />
            <select className="select select-bordered">
              <option value="">All Test Types</option>
              <option value="Day 1">Day 1</option>
              <option value="Day 2">Day 2</option>
            </select>
            <select className="select select-bordered">
              <option value="">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {session.candidateName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{session.testType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={session.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.startTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.endTime || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.score ? `${session.score}%` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark mr-3">
                      View
                    </button>
                    {session.status === 'in_progress' && (
                      <button className="text-red-600 hover:text-red-900">
                        End
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Fade>
  );
} 