import { useState, useEffect } from 'react';
import { FileSearch, Plus, Check, X, Clock, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

const STATUS_COLORS = {
  sent: 'bg-blue-100 text-blue-700',
  received: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  refused: 'bg-red-100 text-red-700',
  overdue: 'bg-red-200 text-red-800',
};

const InfoRequestPanel = ({ grievanceId }) => {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [items, setItems] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [grievanceId]);

  const fetchRequests = async () => {
    try {
      const response = await api.get(`/features/grievances/${grievanceId}/info-requests`);
      setRequests(response.data.infoRequests || []);
    } catch (err) {
      console.error('Failed to fetch info requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !items.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/features/grievances/${grievanceId}/info-requests`, {
        description: description.trim(),
        itemsRequested: items.split('\n').map(i => i.trim()).filter(Boolean),
        dueDate: dueDate || undefined,
      });
      setDescription('');
      setItems('');
      setDueDate('');
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      console.error('Failed to create info request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/features/info-requests/${id}`, {
        status: newStatus,
        responseDate: newStatus === 'received' ? new Date().toISOString().slice(0, 10) : undefined,
      });
      fetchRequests();
    } catch (err) {
      console.error('Failed to update info request:', err);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <FileSearch className="h-5 w-5 text-primary mr-2" />
          Information Requests
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="label text-xs">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field text-sm"
              placeholder="e.g., Request for overtime records"
              required
            />
          </div>
          <div>
            <label className="label text-xs">Items Requested (one per line)</label>
            <textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              className="input-field text-sm"
              rows={3}
              placeholder="OTDL sign-up sheets for Q3 2025&#10;Clock ring data for grievant&#10;Overtime equitability report"
              required
            />
          </div>
          <div>
            <label className="label text-xs">Due Date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary text-sm px-4 py-2 disabled:opacity-50">
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-gray-500">No information requests filed. File one with every grievance (NLRA Section 8(a)(5)).</p>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.description}</p>
                  <p className="text-xs text-gray-500">
                    By {r.requested_by_name} — {format(new Date(r.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>
                  {r.status}
                </span>
              </div>

              {r.items_requested?.length > 0 && (
                <ul className="text-xs text-gray-600 list-disc list-inside mb-2">
                  {r.items_requested.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {r.due_date && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Due: {format(new Date(r.due_date), 'MMM dd, yyyy')}
                </p>
              )}

              {r.response_notes && (
                <p className="text-xs text-gray-600 mt-1 italic">Response: {r.response_notes}</p>
              )}

              {r.status === 'sent' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleStatusUpdate(r.id, 'received')} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Received
                  </button>
                  <button onClick={() => handleStatusUpdate(r.id, 'partial')} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Partial
                  </button>
                  <button onClick={() => handleStatusUpdate(r.id, 'refused')} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1">
                    <X className="h-3 w-3" /> Refused
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InfoRequestPanel;
