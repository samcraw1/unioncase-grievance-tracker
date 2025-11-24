import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { InlineLoader } from './LoadingSpinner';

/**
 * DashboardAnalytics - Display analytics and statistics for grievances
 */
const DashboardAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/grievances/statistics');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <InlineLoader text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const successRate = stats.totalGrievances > 0
    ? ((stats.resolvedGrievances + stats.settledGrievances) / stats.totalGrievances * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Grievances */}
        <StatCard
          title="Total Grievances"
          value={stats.totalGrievances}
          icon={<AlertCircle className="w-6 h-6" />}
          color="blue"
        />

        {/* Active Grievances */}
        <StatCard
          title="Active Grievances"
          value={stats.activeGrievances}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
        />

        {/* Resolved */}
        <StatCard
          title="Resolved"
          value={stats.resolvedGrievances}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />

        {/* Pending Deadlines */}
        <StatCard
          title="Pending Deadlines"
          value={stats.pendingDeadlines}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Success Rate and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Success Rate
          </h3>

          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              {/* Simple circular progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#10B981"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - successRate / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {successRate}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.resolvedGrievances}
              </div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.settledGrievances}
              </div>
              <div className="text-sm text-gray-600">Settled</div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Breakdown
          </h3>

          <div className="space-y-3">
            <StatusBar
              label="Active"
              count={stats.activeGrievances}
              total={stats.totalGrievances}
              color="bg-blue-500"
            />
            <StatusBar
              label="Resolved"
              count={stats.resolvedGrievances}
              total={stats.totalGrievances}
              color="bg-green-500"
            />
            <StatusBar
              label="Settled"
              count={stats.settledGrievances}
              total={stats.totalGrievances}
              color="bg-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Grievances by Process Step
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StepCard label="Filed" count={stats.filedCount} />
          <StepCard label="Step B" count={stats.stepBCount} />
          <StepCard label="Active" count={stats.activeGrievances} />
          <StepCard label="Resolved" count={stats.resolvedGrievances} />
          <StepCard label="Settled" count={stats.settledGrievances} />
          <StepCard label="Total" count={stats.totalGrievances} highlight />
        </div>
      </div>
    </div>
  );
};

/**
 * StatCard - Individual statistic card
 */
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * StatusBar - Progress bar for status
 */
const StatusBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * StepCard - Card for individual step count
 */
const StepCard = ({ label, count, highlight = false }) => {
  return (
    <div className={`
      p-4 rounded-lg text-center
      ${highlight ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'}
    `}>
      <div className={`text-2xl font-bold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
        {count}
      </div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
};

export default DashboardAnalytics;
