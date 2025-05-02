import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Question = {
  id: number;
  question_text: string;
  question_type: string;
  sequence_order: number;
  is_required: boolean;
  created_at: string;
};

type Block = {
  id: number;
  title: string;
  part_id: number;
  block_type: string;
};

interface QuestionListProps {
  blockId: string;
}

export default function QuestionList({ blockId }: QuestionListProps) {
  const router = useRouter();
  const [block, setBlock] = useState<Block | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'multiple-choice',
    is_required: true
  });
  const [showForm, setShowForm] = useState(false);

  const fetchBlock = async () => {
    try {
      const response = await fetch(`/api/admin/blocks/${blockId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Block not found');
        }
        throw new Error('Failed to fetch block');
      }
      
      const data = await response.json();
      setBlock(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/blocks/${blockId}/questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      setQuestions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      const blockData = await fetchBlock();
      if (blockData) {
        await fetchQuestions();
      }
    }
    
    loadData();
  }, [blockId]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.question_text) {
      setError('Question text is required');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/blocks/${blockId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create question');
      }
      
      // Refresh questions list
      fetchQuestions();
      
      // Reset form
      setNewQuestion({
        question_text: '',
        question_type: 'multiple-choice',
        is_required: true
      });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice': return 'Multiple Choice';
      case 'textarea': return 'Text Area';
      case 'written': return 'Written';
      case 'video': return 'Video';
      case 'email': return 'Email';
      case 'likert': return 'Likert Scale';
      default: return type;
    }
  };

  if (loading && !block) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error && !block) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button onClick={() => router.back()} className="btn btn-sm">
          Go Back
        </button>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="alert alert-warning">
        <span>Block not found</span>
        <button onClick={() => router.back()} className="btn btn-sm">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link 
            href={`/admin/assessments/parts/${block.part_id}`} 
            className="btn btn-ghost btn-sm"
          >
            ← Back to Part
          </Link>
          <h1 className="text-2xl font-bold mt-2">Questions for Block: {block.title}</h1>
          <div className="badge badge-outline">{block.block_type}</div>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Question'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      
      {showForm && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Create New Question</h2>
            <form onSubmit={handleCreateQuestion}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Question Text</span>
                </label>
                <textarea
                  placeholder="Enter your question here"
                  className="textarea textarea-bordered"
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Question Type</span>
                </label>
                <select
                  className="select select-bordered"
                  value={newQuestion.question_type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
                  required
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="textarea">Text Area</option>
                  <option value="written">Written</option>
                  <option value="video">Video</option>
                  <option value="email">Email</option>
                  <option value="likert">Likert Scale</option>
                </select>
              </div>
              
              <div className="form-control mt-4">
                <label className="label cursor-pointer">
                  <span className="label-text">Required</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={newQuestion.is_required}
                    onChange={(e) => setNewQuestion({ 
                      ...newQuestion, 
                      is_required: e.target.checked 
                    })}
                  />
                </label>
              </div>
              
              <div className="card-actions justify-end mt-6">
                <button type="submit" className="btn btn-primary">
                  Create Question
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
      ) : questions.length === 0 ? (
        <div className="alert">
          <span>No questions found. Add your first question to this block!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map((question) => (
            <div key={question.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-lg">
                      {question.question_text}
                    </h3>
                    <div className="mt-2 flex gap-2">
                      <div className="badge badge-neutral">Q{question.sequence_order}</div>
                      <div className="badge badge-outline">{getQuestionTypeLabel(question.question_type)}</div>
                      {question.is_required && <div className="badge badge-secondary">Required</div>}
                    </div>
                  </div>
                  <div className="card-actions">
                    <Link 
                      href={`/admin/questions/${question.id}`}
                      className="btn btn-sm btn-info"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/admin/questions/${question.id}/edit`}
                      className="btn btn-sm btn-warning"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 