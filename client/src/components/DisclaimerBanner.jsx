import { AlertCircle } from 'lucide-react';

const DisclaimerBanner = ({ variant = 'warning', className = '' }) => {
  const variants = {
    info: 'bg-blue-50 border-blue-400 text-blue-800',
    warning: 'bg-amber-50 border-amber-400 text-amber-800',
    prominent: 'bg-yellow-50 border-yellow-500 text-yellow-900'
  };

  return (
    <div className={`border-l-4 p-4 rounded ${variants[variant]} ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-1">Important Notice</h3>
          <p className="text-xs leading-relaxed">
            This app does not file or submit official grievances. It is intended
            solely to help employees and stewards organize, track, and prepare
            grievance-related cases. All official grievances must still be filed
            through a union steward according to established procedures.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
