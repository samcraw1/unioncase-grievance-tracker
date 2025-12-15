import { Lock, Eye } from 'lucide-react';

const CaseVisibilityIndicator = ({ grievance }) => {
  const hasSteward = grievance?.steward_assigned;
  const stewardName = grievance?.steward_name; // Assuming this comes from joined query

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
      hasSteward
        ? 'bg-blue-100 text-blue-700 border border-blue-300'
        : 'bg-gray-100 text-gray-700 border border-gray-300'
    }`}>
      {hasSteward ? (
        <>
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          Shared with Steward {stewardName ? `— ${stewardName}` : ''}
        </>
      ) : (
        <>
          <Lock className="h-3.5 w-3.5 mr-1.5" />
          Private — Only you can see this case
        </>
      )}
    </div>
  );
};

export default CaseVisibilityIndicator;
