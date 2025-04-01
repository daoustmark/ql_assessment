import React from 'react';
import { Fade } from '../../ui/Fade';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text_response' | 'forced_choice' | 'likert_scale';
  section: 'foundational' | 'negotiation' | 'ethical' | 'video' | 'role_play';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'draft' | 'archived';
}

const questions: Question[] = [
  {
    id: '1',
    text: 'What is the primary goal of negotiation?',
    type: 'multiple_choice',
    section: 'foundational',
    difficulty: 'medium',
    status: 'active',
  },
  {
    id: '2',
    text: 'Describe a situation where you had to make an ethical decision.',
    type: 'text_response',
    section: 'ethical',
    difficulty: 'hard',
    status: 'active',
  },
  {
    id: '3',
    text: 'Rate your ability to handle conflict on a scale of 1-7',
    type: 'likert_scale',
    section: 'role_play',
    difficulty: 'easy',
    status: 'draft',
  },
];

function StatusBadge({ status }: { status: Question['status'] }) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colors[status]
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Question['difficulty'] }) {
  const colors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colors[difficulty]
      )}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

export function Questions() {
  return (
    <Fade>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage assessment questions and content
            </p>
          </div>
          <button className="btn btn-primary">
            Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search questions..."
              className="input input-bordered flex-1"
            />
            <select className="select select-bordered">
              <option value="">All Types</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="text_response">Text Response</option>
              <option value="forced_choice">Forced Choice</option>
              <option value="likert_scale">Likert Scale</option>
            </select>
            <select className="select select-bordered">
              <option value="">All Sections</option>
              <option value="foundational">Foundational</option>
              <option value="negotiation">Negotiation</option>
              <option value="ethical">Ethical</option>
              <option value="video">Video</option>
              <option value="role_play">Role Play</option>
            </select>
            <select className="select select-bordered">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((question) => (
                <tr key={question.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {question.text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {question.type.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {question.section.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DifficultyBadge difficulty={question.difficulty} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={question.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark mr-3">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
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