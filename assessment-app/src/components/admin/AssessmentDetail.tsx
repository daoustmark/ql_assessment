import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Part = {
  id: number;
  title: string;
  description: string;
  sequence_order: number;
  created_at: string;
};

type Assessment = {
  id: number;
  title: string;
  description: string;
  created_at: string;
  parts: Part[];
};

interface AssessmentDetailProps {
  assessmentId: string;
}

export default function AssessmentDetail({ assessmentId }: AssessmentDetailProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPart, setNewPart] = useState({ title: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchAssessment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/assessments/${assessmentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Assessment not found');
        }
        throw new Error('Failed to fetch assessment');
      }
      
      const data = await response.json();
      setAssessment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPart.title) {
      setError('Title is required');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/assessments/${assessmentId}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPart),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create part');
      }
      
      // Refresh assessment data
      fetchAssessment();
      
      // Reset form
      setNewPart({ title: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button onClick={() => router.push('/admin/assessments')} className="btn btn-sm">
          Back to Assessments
        </button>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="alert alert-warning">
        <span>Assessment not found</span>
        <button onClick={() => router.push('/admin/assessments')} className="btn btn-sm">
          Back to Assessments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/assessments" className="btn btn-ghost btn-sm">
            ← Back to Assessments
          </Link>
          <h1 className="text-2xl font-bold mt-2">{assessment.title}</h1>
          {assessment.description && (
            <p className="mt-2 text-gray-500">{assessment.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/assessments/${assessmentId}/edit`} className="btn btn-warning">
            Edit Assessment
          </Link>
        </div>
      </div>
      
      <div className="divider">Parts</div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Assessment Parts</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Part'}
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
            <h2 className="card-title">Create New Part</h2>
            <form onSubmit={handleCreatePart}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Part Title"
                  className="input input-bordered"
                  value={newPart.title}
                  onChange={(e) => setNewPart({ ...newPart, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Part Description"
                  className="textarea textarea-bordered"
                  value={newPart.description}
                  onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                />
              </div>
              
              <div className="card-actions justify-end mt-6">
                <button type="submit" className="btn btn-primary">
                  Create Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {assessment.parts && assessment.parts.length === 0 ? (
        <div className="alert">
          <span>No parts found. Add your first part to this assessment!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessment.parts && assessment.parts.map((part) => (
            <div key={part.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  {part.title}
                  <div className="badge badge-neutral">Part {part.sequence_order}</div>
                </h2>
                {part.description && <p>{part.description}</p>}
                <div className="card-actions justify-end mt-4">
                  <Link 
                    href={`/admin/assessments/${assessmentId}/parts/${part.id}`}
                    className="btn btn-sm btn-info"
                  >
                    View Blocks
                  </Link>
                  <Link 
                    href={`/admin/parts/${part.id}/edit`}
                    className="btn btn-sm btn-warning"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 