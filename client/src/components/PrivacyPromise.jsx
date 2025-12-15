import { Lock, Shield, Eye, Download } from 'lucide-react';

const PrivacyPromise = ({ compact = false }) => {
  // 🔴 PILOT-CRITICAL: Compact version for Settings
  if (compact) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="font-semibold text-sm">Privacy Promise</h3>
        </div>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>🔒 Your cases are private by default</li>
          <li>👤 Only you and stewards you assign can see your cases</li>
          <li>🚫 Management/USPS do not have accounts or access to this system</li>
          <li>💾 Your data is never sold or shared</li>
        </ul>
      </div>
    );
  }

  // 🟡 DEFERRED: Full version for future onboarding or dedicated privacy page
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Shield className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-lg font-bold text-gray-900">Privacy Promise</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-start">
          <Lock className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-gray-900">Your cases are private by default</p>
            <p className="text-xs text-gray-600">Only you can see your cases unless you choose to share them with a steward.</p>
          </div>
        </div>

        <div className="flex items-start">
          <Eye className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-gray-900">You control who sees your cases</p>
            <p className="text-xs text-gray-600">The developer maintains the software only and does not monitor or share case content.</p>
          </div>
        </div>

        <div className="flex items-start">
          <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-gray-900">Management has no access</p>
            <p className="text-xs text-gray-600">Management/USPS do not have accounts or access to this system, and it is not connected to USPS systems.</p>
          </div>
        </div>

        <div className="flex items-start">
          <Download className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-gray-900">Export your data anytime</p>
            <p className="text-xs text-gray-600">Download your case records anytime. Your data is never sold or shared.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-green-200">
        <p className="text-xs text-gray-600">
          Data is stored securely using standard cloud infrastructure.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPromise;
