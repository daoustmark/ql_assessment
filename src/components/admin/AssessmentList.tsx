import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Assessment = {
  id: number;
  title: string;
  description: string;
  created_at: string;
};

export default function AssessmentList() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAssessment, setNewAssessment] = useState({ title: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/assessments');
      if (!response.ok) {
        throw new Error('Failed to fetch assessments');
      }
      
      const data = await response.json();
      setAssessments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssessment.title) {
      setError('Title is required');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssessment),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assessment');
      }
      
      // Refresh assessments list
      fetchAssessments();
      
      // Reset form
      setNewAssessment({ title: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteAssessment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/assessments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete assessment');
      }
      
      // Refresh assessments list
      fetchAssessments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Create Assessment'}
        </button>
      </div>
      
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      
      {showForm && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Create New Assessment</h2>
            <form onSubmit={handleCreateAssessment}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Assessment Title"
                  className="input input-bordered"
                  value={newAssessment.title}
                  onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Assessment Description"
                  className="textarea textarea-bordered"
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                />
              </div>
              
              <div className="card-actions justify-end mt-6">
                <button type="submit" className="btn btn-primary">
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : assessments.length === 0 ? (
        <div className="alert">
          <span>No assessments found. Create your first assessment!</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment.id}>
                  <td>{assessment.title}</td>
                  <td className="truncate max-w-xs">{assessment.description}</td>
                  <td>{new Date(assessment.created_at).toLocaleDateString()}</td>
                  <td className="flex gap-2">
                    <Link 
                      href={`/admin/assessments/${assessment.id}`}
                      className="btn btn-sm btn-info"
                    >
                      View
                    </Link>
                    <Link 
                      href={`/admin/assessments/${assessment.id}/edit`}
                      className="btn btn-sm btn-warning"
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDeleteAssessment(assessment.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 