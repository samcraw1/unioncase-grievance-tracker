import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, TrendingUp, Activity, FileText, Users, BarChart3 } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

const StewardDashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkload();
  }, []);

  const fetchWorkload = async () => {
    try {
      setLoading(true);
      const response = await api.get('/features/steward/workload');
      setData(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Steward or representative role required.');
      } else {
        setError('Failed to load workload data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const daysUntil = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 text-primary hover:text-primary-dark mb-6">
            <ArrowLeft className="h-4 w-4" /><span>Back to Dashboard</span>
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <AlertTriangle className="h-5 w-5 inline mr-2" />{error}
          </div>
        </div>
      </div>
    );
  }

  const { stats, urgentDeadlines, overdueDeadlines, staleCases, stepDistribution, violationDistribution, recentActivity } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 text-primary hover:text-primary-dark mb-6">
          <ArrowLeft className="h-4 w-4" /><span>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 text-primary mr-3" />
            Steward Workload
          </h1>
          <p className="text-sm text-gray-600 mt-1">Priority view of your active caseload, deadlines, and trends</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-gray-600">Active Cases</p>
            <p className="text-3xl font-bold text-gray-900">{stats.active_cases}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Closed</p>
            <p className="text-3xl font-bold text-green-600">{stats.closed_cases}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">At Arbitration</p>
            <p className="text-3xl font-bold text-red-600">{stats.at_arbitration}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_cases}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overdue Deadlines */}
          {overdueDeadlines.length > 0 && (
            <div className="card border-l-4 border-red-500 lg:col-span-2">
              <h2 className="text-lg font-bold text-red-700 flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Overdue Deadlines ({overdueDeadlines.length})
              </h2>
              <div className="space-y-3">
                {overdueDeadlines.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100"
                       onClick={() => navigate(`/grievances/${d.grievance_id}`)}>
                    <div>
                      <span className="font-medium text-sm text-red-900">{d.grievance_number}</span>
                      <span className="text-sm text-red-700 ml-2">{d.deadline_type}</span>
                      <p className="text-xs text-red-600">{d.grievant_name} — {d.facility}</p>
                    </div>
                    <span className="text-xs font-semibold text-red-700 bg-red-200 px-2 py-1 rounded">
                      {Math.abs(daysUntil(d.deadline_date))}d overdue
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Urgent Deadlines (next 7 days) */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
              <Clock className="h-5 w-5 mr-2 text-amber-500" />
              Upcoming Deadlines ({urgentDeadlines.length})
            </h2>
            {urgentDeadlines.length === 0 ? (
              <p className="text-sm text-gray-500">No deadlines in the next 7 days.</p>
            ) : (
              <div className="space-y-3">
                {urgentDeadlines.map(d => {
                  const days = daysUntil(d.deadline_date);
                  const urgencyColor = days <= 1 ? 'text-red-600 bg-red-100' : days <= 3 ? 'text-amber-600 bg-amber-100' : 'text-blue-600 bg-blue-100';
                  return (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                         onClick={() => navigate(`/grievances/${d.grievance_id}`)}>
                      <div>
                        <span className="font-medium text-sm">{d.grievance_number}</span>
                        <span className="text-sm text-gray-600 ml-2">{d.deadline_type}</span>
                        <p className="text-xs text-gray-500">{d.grievant_name}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${urgencyColor}`}>
                        {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stale Cases */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
              <Activity className="h-5 w-5 mr-2 text-gray-400" />
              Needs Attention ({staleCases.length})
            </h2>
            {staleCases.length === 0 ? (
              <p className="text-sm text-gray-500">All cases have recent activity.</p>
            ) : (
              <div className="space-y-3">
                {staleCases.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                       onClick={() => navigate(`/grievances/${g.id}`)}>
                    <div>
                      <span className="font-medium text-sm">{g.grievance_number}</span>
                      <span className="text-sm text-gray-600 ml-2">{g.current_step}</span>
                      <p className="text-xs text-gray-500">{g.grievant_name} — {g.facility}</p>
                    </div>
                    <span className="text-xs text-gray-500">{g.days_stale}d inactive</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step Distribution */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Cases by Step
            </h2>
            {stepDistribution.length === 0 ? (
              <p className="text-sm text-gray-500">No active cases.</p>
            ) : (
              <div className="space-y-3">
                {stepDistribution.map(s => {
                  const total = stepDistribution.reduce((sum, x) => sum + parseInt(x.count), 0);
                  const pct = total > 0 ? Math.round((parseInt(s.count) / total) * 100) : 0;
                  return (
                    <div key={s.current_step}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 capitalize">{s.current_step.replace(/_/g, ' ')}</span>
                        <span className="text-gray-900 font-medium">{s.count}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Violations (CBA prep data) */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Top Violations
            </h2>
            {violationDistribution.length === 0 ? (
              <p className="text-sm text-gray-500">No violation data yet.</p>
            ) : (
              <div className="space-y-3">
                {violationDistribution.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{v.violation_type}</p>
                      <p className="text-xs text-gray-500 truncate">{v.contract_article}</p>
                    </div>
                    <span className="text-sm font-bold text-primary ml-3">{v.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </h2>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                       onClick={() => navigate(`/grievances/${a.grievance_id}`)}>
                    <div className="w-2 h-2 mt-2 bg-primary rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-primary">{a.grievance_number}</span>
                        <span className="text-gray-600"> moved to </span>
                        <span className="font-medium capitalize">{a.step.replace(/_/g, ' ')}</span>
                      </p>
                      {a.notes && <p className="text-xs text-gray-500 truncate">{a.notes}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {a.handler_name} — {format(new Date(a.step_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StewardDashboardPage;
