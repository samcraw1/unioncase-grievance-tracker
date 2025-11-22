import { useState, useEffect } from 'react';
import { X, Share, Plus, Square } from 'lucide-react';

const IOSInstallModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed or installed
    const dismissed = localStorage.getItem('iosInstallDismissed');
    const installed = localStorage.getItem('appInstalled');

    if (dismissed || installed) {
      return;
    }

    // Detect iOS Safari (not in standalone mode)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isInStandaloneMode) {
      // Track visit count
      const visitCount = parseInt(localStorage.getItem('visitCount') || '0');

      // Show modal after 2-3 visits
      if (visitCount >= 2) {
        // Delay showing modal by 3 seconds to not be intrusive
        const timer = setTimeout(() => {
          setShowModal(true);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowModal(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('iosInstallDismissed', 'true');
    setShowModal(false);
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Install UnionTrack</h2>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img
                src="/icons/icon-96x96.png"
                alt="UnionTrack"
                className="w-16 h-16 rounded-xl"
              />
            </div>
            <p className="text-gray-600">
              Add UnionTrack to your home screen for quick access and offline support
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium mb-1">
                  Tap the Share button
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Share className="h-4 w-4" />
                  <span>in the Safari toolbar below</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium mb-1">
                  Scroll down and tap "Add to Home Screen"
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Plus className="h-4 w-4" />
                  <span>Look for this icon</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium mb-1">
                  Tap "Add" in the top right corner
                </p>
                <p className="text-xs text-gray-600">
                  The app will appear on your home screen
                </p>
              </div>
            </div>
          </div>

          {/* Visual Helper */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center mb-2">
              Look for the share button at the bottom of Safari
            </p>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-300">
                <Square className="h-5 w-5 text-blue-500" />
                <Share className="h-5 w-5 text-blue-500 animate-bounce" />
                <Square className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <button
              onClick={handleDismiss}
              className="w-full btn-primary"
            >
              Got it!
            </button>
            <button
              onClick={handleDontShowAgain}
              className="w-full btn-secondary text-sm"
            >
              Don't show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallModal;
