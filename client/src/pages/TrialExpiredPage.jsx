import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Mail, Phone, LogOut } from 'lucide-react';

const TrialExpiredPage = () => {
  const { subscriptionStatus, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user has active subscription, redirect to dashboard
    if (subscriptionStatus?.status === 'active' || subscriptionStatus?.status === 'trial') {
      navigate('/dashboard');
    }
  }, [subscriptionStatus, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 px-6 py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-4">
              <AlertCircle className="text-red-600" size={48} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Trial Period Ended
          </h1>
          <p className="text-red-100 text-lg">
            Your 30-day free trial has expired
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Your Account is Temporarily Suspended
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Thank you for trying UnionCase! Your trial period has ended, and your account
              is currently suspended. To regain access to your grievance data and all features,
              please contact us to activate a paid subscription.
            </p>
          </div>

          {/* Data Safety Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-green-800 mb-2">
              Your Data is Safe
            </h3>
            <p className="text-green-700 text-sm">
              All your grievance records, documents, and notes are securely stored.
              Once you activate a subscription, you'll have immediate access to everything.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-4 text-center">
              Contact Us to Activate Your Subscription
            </h3>
            <div className="space-y-4">
              <a
                href="mailto:samcraw01@gmail.com"
                className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail size={20} />
                <span className="font-medium">samcraw01@gmail.com</span>
              </a>
              <a
                href="tel:501-580-6175"
                className="flex items-center justify-center gap-3 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Phone size={20} />
                <span className="font-medium">501-580-6175</span>
              </a>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3">
              What Happens Next?
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Contact us using the information above</li>
              <li>We'll discuss subscription options and payment details</li>
              <li>Once payment is processed, your account will be reactivated immediately</li>
              <li>All your data will be available exactly as you left it</li>
            </ol>
          </div>

          {/* Logout Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiredPage;
