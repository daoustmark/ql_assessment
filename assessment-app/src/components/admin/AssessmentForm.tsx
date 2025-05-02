import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Assessment = {
  id: number;
  title: string;
  description: string;
};

interface AssessmentFormProps {
  assessmentId: string;
}

export default function AssessmentForm({ assessmentId }: AssessmentFormProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      setLoading(true);
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
        setFormData({
          title: data.title || '',
          description: data.description || ''
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      setError('Title is required');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/assessments/${assessmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update assessment');
      }
      
      // Navigate back to the assessment detail page
      router.push(`/admin/assessments/${assessmentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
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
          <Link 
            href={`/admin/assessments/${assessmentId}`} 
            className="btn btn-ghost btn-sm"
          >
            ← Back to Assessment
          </Link>
          <h1 className="text-2xl font-bold mt-2">Edit Assessment</h1>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                placeholder="Assessment Title"
                className="input input-bordered"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="card-actions justify-end mt-6">
              <Link 
                href={`/admin/assessments/${assessmentId}`}
                className="btn btn-ghost"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 