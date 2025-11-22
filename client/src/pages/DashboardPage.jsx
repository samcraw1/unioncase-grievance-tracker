import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, FileText, Clock, CheckCircle, Search, Filter, AlertCircle, Settings, Calendar, User, Download } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import PullToRefresh from '../components/PullToRefresh';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState([]);
  const [statistics, setStatistics] = useState({
    activeGrievances: 0,
    pendingDeadlines: 0,
    resolvedGrievances: 0,
    totalGrievances: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGrievances, setSelectedGrievances] = useState([]);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    fetchGrievances();
    fetchStatistics();
  }, []);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const response = await api.get('/grievances');
      setGrievances(response.data.grievances || []);
      setError('');
    } catch (err) {
      console.error('Error fetching grievances:', err);
      setError('Failed to load grievances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/grievances/statistics');
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'badge badge-filed',
      filed: 'badge badge-filed',
      informal_step_a: 'badge badge-step-a',
      formal_step_a: 'badge badge-step-a',
      step_b: 'badge badge-step-b',
      arbitration: 'badge badge-arbitration',
      resolved: 'badge badge-resolved',
      settled: 'badge badge-settled',
      denied: 'badge bg-red-100 text-red-800'
    };
    return classes[status] || 'badge';
  };

  const formatStatus = (status) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateDaysActive = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedGrievances(filteredGrievances.map(g => g.id));
    } else {
      setSelectedGrievances([]);
    }
  };

  const handleSelectGrievance = (grievanceId) => {
    setSelectedGrievances(prev => {
      if (prev.includes(grievanceId)) {
        return prev.filter(id => id !== grievanceId);
      } else {
        return [...prev, grievanceId];
      }
    });
  };

  const handleExportSelected = async () => {
    if (selectedGrievances.length === 0) {
      alert('Please select at least one grievance to export');
      return;
    }

    try {
      setExportingPDF(true);

      // Export each selected grievance separately
      for (const grievanceId of selectedGrievances) {
        const grievance = grievances.find(g => g.id === grievanceId);

        const response = await api.get(`/grievances/${grievanceId}/export-pdf`, {
          responseType: 'blob'
        });

        // Create blob URL and trigger download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Grievance_${grievance.grievance_number}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setSelectedGrievances([]);
    } catch (err) {
      console.error('Error exporting PDFs:', err);
      alert('Failed to export PDFs. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchGrievances(),
      fetchStatistics()
    ]);
  };

  const filteredGrievances = grievances.filter(grievance => {
    const matchesSearch =
      grievance.grievance_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grievance.violation_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grievance.grievant_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      grievance.status === statusFilter ||
      grievance.current_step === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img
                src="/images/nalc-logo.png"
                alt="NALC Logo"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold">NALC Grievance Tracker</h1>
                <p className="text-sm text-gray-200">
                  Welcome, {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-gray-200 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center space-x-2 bg-primary-dark hover:bg-opacity-80 px-4 py-2 rounded transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-primary-dark hover:bg-opacity-80 px-4 py-2 rounded transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Grievances</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.activeGrievances}</p>
              </div>
              <FileText className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Deadlines</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.pendingDeadlines}</p>
              </div>
              <Clock className="h-12 w-12 text-warning opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.resolvedGrievances}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-success opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Filed</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalGrievances}</p>
              </div>
              <FileText className="h-12 w-12 text-neutral opacity-20" />
            </div>
          </div>
        </div>

        {/* New Grievance Button and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/grievances/new')}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>File New Grievance</span>
            </button>
            {selectedGrievances.length > 0 && (
              <button
                onClick={handleExportSelected}
                disabled={exportingPDF}
                className="btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-5 w-5" />
                <span>
                  {exportingPDF
                    ? 'Exporting...'
                    : `Export Selected (${selectedGrievances.length})`}
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search grievances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-10 w-full sm:w-48"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="filed">Filed</option>
                <option value="informal_step_a">Informal Step A</option>
                <option value="formal_step_a">Formal Step A</option>
                <option value="step_b">Step B</option>
                <option value="arbitration">Arbitration</option>
                <option value="resolved">Resolved</option>
                <option value="settled">Settled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Grievances Table/Cards */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Grievances ({filteredGrievances.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading grievances...</p>
            </div>
          ) : filteredGrievances.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {grievances.length === 0
                  ? 'No grievances filed yet'
                  : 'No grievances match your filters'}
              </p>
              {grievances.length === 0 && (
                <button
                  onClick={() => navigate('/grievances/new')}
                  className="btn-primary"
                >
                  File Your First Grievance
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedGrievances.length === filteredGrievances.length && filteredGrievances.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Case Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grievant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Filed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Violation Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Step
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days Active
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGrievances.map((grievance) => (
                      <tr
                        key={grievance.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedGrievances.includes(grievance.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectGrievance(grievance.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/grievances/${grievance.id}`)}
                        >
                          <div className="text-sm font-medium text-primary">
                            {grievance.grievance_number}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/grievances/${grievance.id}`)}
                        >
                          <div className="text-sm text-gray-900">{grievance.grievant_name}</div>
                          <div className="text-xs text-gray-500">{grievance.facility}</div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/grievances/${grievance.id}`)}
                        >
                          <div className="text-sm text-gray-900">
                            {format(new Date(grievance.created_at), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 cursor-pointer"
                          onClick={() => navigate(`/grievances/${grievance.id}`)}
                        >
                          <div className="text-sm text-gray-900">{grievance.violation_type}</div>
                          <div className="text-xs text-gray-500">{grievance.contract_article}</div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/grievances/${grievance.id}`)}
                        >
                          <span className={getStatusBadgeClass(grievance.current_step)}>
                            {formatStatus(grievance.current_step)}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => navigate(`/grievances/${grievance.id}`)}
                        >
                          <span className={getStatusBadgeClass(grievance.status)}>
                            {formatStatus(grievance.status)}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                          onClick={() => navigate(`/grievances/${grievance.id}`)}
                        >
                          {calculateDaysActive(grievance.created_at)} days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredGrievances.map((grievance) => (
                  <div
                    key={grievance.id}
                    className="p-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
                    onClick={() => navigate(`/grievances/${grievance.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={selectedGrievances.includes(grievance.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectGrievance(grievance.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded min-h-touch min-w-touch"
                          />
                          <h3 className="text-base font-semibold text-primary">
                            {grievance.grievance_number}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={getStatusBadgeClass(grievance.current_step)}>
                            {formatStatus(grievance.current_step)}
                          </span>
                          <span className={getStatusBadgeClass(grievance.status)}>
                            {formatStatus(grievance.status)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {calculateDaysActive(grievance.created_at)} days
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-700">
                        <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{grievance.grievant_name}</span>
                          <span className="text-gray-500 ml-1">• {grievance.facility}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span>Filed {format(new Date(grievance.created_at), 'MMM dd, yyyy')}</span>
                      </div>

                      <div className="flex items-start text-gray-700">
                        <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{grievance.violation_type}</div>
                          <div className="text-xs text-gray-500">{grievance.contract_article}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      </PullToRefresh>
    </div>
  );
};

export default DashboardPage;
