import React from 'react';

/**
 * Skeleton - Basic skeleton loading component
 * @param {Object} props - Component props
 * @param {string} props.width - Width of skeleton
 * @param {string} props.height - Height of skeleton
 * @param {string} props.className - Additional CSS classes
 */
export const Skeleton = ({ width = 'w-full', height = 'h-4', className = '' }) => {
  return (
    <div
      className={`
        ${width}
        ${height}
        bg-gray-200
        rounded
        animate-pulse
        ${className}
      `}
    />
  );
};

/**
 * GrievanceCardSkeleton - Skeleton for grievance card
 */
export const GrievanceCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton width="w-32" height="h-6" className="mb-2" />
          <Skeleton width="w-48" height="h-4" />
        </div>
        <Skeleton width="w-20" height="h-6" className="rounded-full" />
      </div>

      <Skeleton width="w-full" height="h-4" className="mb-2" />
      <Skeleton width="w-3/4" height="h-4" className="mb-4" />

      <div className="flex gap-4">
        <Skeleton width="w-24" height="h-4" />
        <Skeleton width="w-24" height="h-4" />
        <Skeleton width="w-24" height="h-4" />
      </div>
    </div>
  );
};

/**
 * GrievanceDetailSkeleton - Skeleton for grievance detail page
 */
export const GrievanceDetailSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Skeleton width="w-48" height="h-8" className="mb-2" />
        <Skeleton width="w-64" height="h-6" />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <Skeleton width="w-24" height="h-4" className="mb-2" />
            <Skeleton width="w-32" height="h-6" />
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <Skeleton width="w-32" height="h-6" className="mb-4" />
        <Skeleton width="w-full" height="h-4" className="mb-2" />
        <Skeleton width="w-full" height="h-4" className="mb-2" />
        <Skeleton width="w-5/6" height="h-4" />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <Skeleton width="w-24" height="h-6" className="mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 mb-4">
            <Skeleton width="w-3" height="h-16" />
            <div className="flex-1">
              <Skeleton width="w-32" height="h-5" className="mb-2" />
              <Skeleton width="w-48" height="h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * TableSkeleton - Skeleton for data tables
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} width="flex-1" height="h-5" />
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-b">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} width="flex-1" height="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * ListSkeleton - Skeleton for lists
 */
export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <Skeleton width="w-3/4" height="h-5" className="mb-2" />
          <Skeleton width="w-full" height="h-4" className="mb-2" />
          <Skeleton width="w-2/3" height="h-4" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
