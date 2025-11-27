import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TrialBanner = () => {
  const { subscriptionStatus } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(null);

  useEffect(() => {
    // Calculate days remaining if on trial
    if (subscriptionStatus?.status === 'trial' && subscriptionStatus?.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(subscriptionStatus.trialEndsAt);
      const diffTime = trialEnd - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays);
    }
  }, [subscriptionStatus]);

  // Don't show banner if:
  // - User has active subscription
  // - User dismissed it
  // - Trial has more than 7 days remaining
  if (!subscriptionStatus ||
      subscriptionStatus.status === 'active' ||
      dismissed ||
      (daysRemaining !== null && daysRemaining > 7)) {
    return null;
  }

  // Only show for trial users with 7 or fewer days remaining
  if (subscriptionStatus.status !== 'trial' || daysRemaining === null || daysRemaining <= 0) {
    return null;
  }

  const getUrgencyColor = () => {
    if (daysRemaining <= 2) return 'bg-red-50 border-red-200';
    if (daysRemaining <= 7) return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getTextColor = () => {
    if (daysRemaining <= 2) return 'text-red-800';
    if (daysRemaining <= 7) return 'text-yellow-800';
    return 'text-blue-800';
  };

  const getIconColor = () => {
    if (daysRemaining <= 2) return 'text-red-600';
    if (daysRemaining <= 7) return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <div className={`${getUrgencyColor()} border-b border-t py-3 px-4`}>
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className={`${getIconColor()} flex-shrink-0 mt-0.5`} size={20} />
          <div className="flex-1">
            <p className={`${getTextColor()} font-medium text-sm md:text-base`}>
              {daysRemaining === 1
                ? 'Your trial ends tomorrow!'
                : `Your trial ends in ${daysRemaining} days`}
            </p>
            <p className={`${getTextColor()} text-xs md:text-sm mt-1 opacity-90`}>
              Contact us to activate your subscription and maintain access to your grievance data.
              Email: samcraw01@gmail.com | Phone: 501-580-6175
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className={`${getTextColor()} hover:opacity-70 flex-shrink-0`}
          aria-label="Dismiss banner"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default TrialBanner;
