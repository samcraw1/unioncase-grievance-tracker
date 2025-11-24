import React from 'react';

/**
 * LoadingSpinner - A reusable loading spinner component
 * @param {Object} props - Component props
 * @param {string} props.size - Size of spinner (sm, md, lg)
 * @param {string} props.color - Color of spinner
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600'
  };

  return (
    <div
      className={`
        inline-block
        ${sizeClasses[size]}
        border-4
        ${colorClasses[color]}
        border-t-transparent
        rounded-full
        animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

/**
 * FullPageLoader - Loading spinner centered on full page
 */
export const FullPageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="xl" color="blue" />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

/**
 * InlineLoader - Small inline loading indicator
 */
export const InlineLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <LoadingSpinner size="sm" color="gray" />
      <span className="text-sm">{text}</span>
    </div>
  );
};

/**
 * ButtonLoader - Loading spinner for buttons
 */
export const ButtonLoader = () => {
  return (
    <LoadingSpinner size="sm" color="white" className="mr-2" />
  );
};
