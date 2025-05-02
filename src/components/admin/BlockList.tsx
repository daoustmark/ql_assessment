import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Block = {
  id: number;
  title: string;
  description: string;
  block_type: string;
  sequence_order: number;
  created_at: string;
};

type Part = {
  id: number;
  title: string;
  assessment_id: number;
};

interface BlockListProps {
  partId: string;
}

export default function BlockList({ partId }: BlockListProps) {
  const router = useRouter();
  const [part, setPart] = useState<Part | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBlock, setNewBlock] = useState({
    title: '',
    description: '',
    block_type: 'question_group'
  });
  const [showForm, setShowForm] = useState(false);

  const fetchPart = async () => {
    try {
      const response = await fetch(`/api/admin/parts/${partId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Part not found');
        }
        throw new Error('Failed to fetch part');
      }
      
      const data = await response.json();
      setPart(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  const fetchBlocks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/parts/${partId}/blocks`);
      if (!response.ok) {
        throw new Error('Failed to fetch blocks');
      }
      
      const data = await response.json();
      setBlocks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      const partData = await fetchPart();
      if (partData) {
        await fetchBlocks();
      }
    }
    
    loadData();
  }, [partId]);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBlock.title) {
      setError('Title is required');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/parts/${partId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlock),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create block');
      }
      
      // Refresh blocks list
      fetchBlocks();
      
      // Reset form
      setNewBlock({
        title: '',
        description: '',
        block_type: 'question_group'
      });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading && !part) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error && !part) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button onClick={() => router.back()} className="btn btn-sm">
          Go Back
        </button>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="alert alert-warning">
        <span>Part not found</span>
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
            href={`/admin/assessments/${part.assessment_id}`} 
            className="btn btn-ghost btn-sm"
          >
            ← Back to Assessment
          </Link>
          <h1 className="text-2xl font-bold mt-2">Blocks for Part: {part.title}</h1>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Block'}
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
            <h2 className="card-title">Create New Block</h2>
            <form onSubmit={handleCreateBlock}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Block Title"
                  className="input input-bordered"
                  value={newBlock.title}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Block Description"
                  className="textarea textarea-bordered"
                  value={newBlock.description}
                  onChange={(e) => setNewBlock({ ...newBlock, description: e.target.value })}
                />
              </div>
              
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Block Type</span>
                </label>
                <select
                  className="select select-bordered"
                  value={newBlock.block_type}
                  onChange={(e) => setNewBlock({ ...newBlock, block_type: e.target.value })}
                  required
                >
                  <option value="question_group">Question Group</option>
                  <option value="scenario">Scenario</option>
                  <option value="scenario_group">Scenario Group</option>
                  <option value="likert_group">Likert Group</option>
                  <option value="email_scenario">Email Scenario</option>
                  <option value="video_scenario">Video Scenario</option>
                </select>
              </div>
              
              <div className="card-actions justify-end mt-6">
                <button type="submit" className="btn btn-primary">
                  Create Block
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
      ) : blocks.length === 0 ? (
        <div className="alert">
          <span>No blocks found. Add your first block to this part!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {blocks.map((block) => (
            <div key={block.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between">
                  <h2 className="card-title">
                    {block.title}
                    <div className="badge badge-neutral">Block {block.sequence_order}</div>
                    <div className="badge badge-outline">{block.block_type}</div>
                  </h2>
                  <div className="card-actions">
                    <Link 
                      href={`/admin/blocks/${block.id}`}
                      className="btn btn-sm btn-info"
                    >
                      View Questions
                    </Link>
                    <Link 
                      href={`/admin/blocks/${block.id}/edit`}
                      className="btn btn-sm btn-warning"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
                {block.description && <p className="mt-2">{block.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 