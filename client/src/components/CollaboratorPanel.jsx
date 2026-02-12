import { useState, useEffect } from 'react';
import { Users, Plus, X, Shield, Eye, Edit3 } from 'lucide-react';
import api from '../services/api';

const ROLE_ICONS = {
  viewer: Eye,
  editor: Edit3,
  lead: Shield,
};

const ROLE_LABELS = {
  viewer: 'Viewer',
  editor: 'Editor',
  lead: 'Lead',
};

const CollaboratorPanel = ({ grievanceId }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [stewards, setStewards] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCollaborators();
  }, [grievanceId]);

  const fetchCollaborators = async () => {
    try {
      const response = await api.get(`/features/grievances/${grievanceId}/collaborators`);
      setCollaborators(response.data.collaborators || []);
    } catch (err) {
      console.error('Failed to fetch collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStewards = async () => {
    try {
      const response = await api.get('/users/stewards');
      setStewards(response.data.stewards || []);
    } catch (err) {
      console.error('Failed to fetch stewards:', err);
    }
  };

  const handleShowAdd = () => {
    if (stewards.length === 0) fetchStewards();
    setShowAdd(true);
  };

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setSubmitting(true);
    try {
      await api.post(`/features/grievances/${grievanceId}/collaborators`, {
        userId: parseInt(selectedUserId),
        role: selectedRole,
      });
      setSelectedUserId('');
      setSelectedRole('viewer');
      setShowAdd(false);
      fetchCollaborators();
    } catch (err) {
      console.error('Failed to add collaborator:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (userId) => {
    try {
      await api.delete(`/features/grievances/${grievanceId}/collaborators/${userId}`);
      fetchCollaborators();
    } catch (err) {
      console.error('Failed to remove collaborator:', err);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Users className="h-5 w-5 text-primary mr-2" />
          Case Team
        </h3>
        <button
          onClick={handleShowAdd}
          className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="label text-xs">Steward / Representative</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Select a person...</option>
              {stewards.filter(s => !collaborators.find(c => c.user_id === s.id)).map(s => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field text-sm"
            >
              <option value="viewer">Viewer (read-only)</option>
              <option value="editor">Editor (can add notes)</option>
              <option value="lead">Lead (full access)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!selectedUserId || submitting} className="btn-primary text-sm px-4 py-2 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add to Team'}
            </button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm px-4 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : collaborators.length === 0 ? (
        <p className="text-sm text-gray-500">No additional team members. Add stewards or reps for collaboration.</p>
      ) : (
        <div className="space-y-2">
          {collaborators.map(c => {
            const RoleIcon = ROLE_ICONS[c.role] || Eye;
            return (
              <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <RoleIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-gray-500">{c.user_role} — {ROLE_LABELS[c.role]}</p>
                  </div>
                </div>
                <button onClick={() => handleRemove(c.user_id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollaboratorPanel;
