import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

/**
 * AdvancedSearch - Component for filtering and searching grievances
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Callback when search is performed
 * @param {Function} props.onReset - Callback when filters are reset
 */
const AdvancedSearch = ({ onSearch, onReset }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
    currentStep: '',
    facility: '',
    dateFrom: '',
    dateTo: '',
    craft: '',
    contractArticle: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const emptyFilters = {
      searchTerm: '',
      status: '',
      currentStep: '',
      facility: '',
      dateFrom: '',
      dateTo: '',
      craft: '',
      contractArticle: ''
    };
    setFilters(emptyFilters);
    onReset();
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleChange}
            placeholder="Search by grievance number, description, or employee name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
            ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          `}
        >
          <Filter className="w-5 h-5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Search
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </form>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="settled">Settled</option>
                <option value="denied">Denied</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Current Step Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Step
              </label>
              <select
                name="currentStep"
                value={filters.currentStep}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Steps</option>
                <option value="filed">Filed</option>
                <option value="informal_step_a">Informal Step A</option>
                <option value="formal_step_a">Formal Step A</option>
                <option value="step_b">Step B</option>
                <option value="arbitration">Arbitration</option>
              </select>
            </div>

            {/* Craft Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                name="craft"
                value={filters.craft}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Positions</option>
                <option value="city_carrier">City Carrier</option>
                <option value="cca">City Carrier Assistant</option>
                <option value="rural_carrier">Rural Carrier</option>
                <option value="rca">Rural Carrier Associate</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Facility Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility
              </label>
              <input
                type="text"
                name="facility"
                value={filters.facility}
                onChange={handleChange}
                placeholder="Filter by facility"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident Date From
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident Date To
              </label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Contract Article */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Article
              </label>
              <input
                type="text"
                name="contractArticle"
                value={filters.contractArticle}
                onChange={handleChange}
                placeholder="e.g., Article 8.5.D"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
