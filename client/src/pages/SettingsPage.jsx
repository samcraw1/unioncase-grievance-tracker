import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Bell, Save, CheckCircle, AlertCircle, Download, Trash2, Calendar, BellRing } from 'lucide-react';
import api from '../services/api';
import PrivacyPromise from '../components/PrivacyPromise';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [preferences, setPreferences] = useState({
    email_enabled: true,
    new_grievance: true,
    deadline_reminders: true,
    status_updates: true,
    new_notes: true,
    grievance_resolved: true,
    reminder_days: [3, 1, 0]
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    fetchPreferences();
    // Check push notification support
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setPushEnabled(!!sub);
        });
      });
    }
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me/preferences');
      setPreferences(response.data.preferences || preferences);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleReminderDayToggle = (day) => {
    setPreferences(prev => {
      const reminderDays = prev.reminder_days.includes(day)
        ? prev.reminder_days.filter(d => d !== day)
        : [...prev.reminder_days, day].sort((a, b) => b - a);

      return {
        ...prev,
        reminder_days: reminderDays
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      await api.put('/users/me/preferences', { preferences });

      setMessage({
        type: 'success',
        text: 'Notification preferences saved successfully!'
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setMessage({
        type: 'error',
        text: 'Failed to save preferences. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePush = async () => {
    try {
      setPushLoading(true);
      const reg = await navigator.serviceWorker.ready;

      if (pushEnabled) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await api.post('/features/push/unsubscribe', { endpoint: sub.endpoint });
        }
        setPushEnabled(false);
        setMessage({ type: 'success', text: 'Push notifications disabled.' });
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setMessage({ type: 'error', text: 'Notification permission denied by your browser.' });
          return;
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
        });
        await api.post('/features/push/subscribe', {
          endpoint: sub.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
            auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth'))))
          }
        });
        setPushEnabled(true);
        setMessage({ type: 'success', text: 'Push notifications enabled!' });
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Push toggle error:', err);
      setMessage({ type: 'error', text: 'Failed to update push notifications.' });
    } finally {
      setPushLoading(false);
    }
  };

  const handleDownloadCalendar = async () => {
    try {
      const response = await api.get('/features/calendar/feed.ics', { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'unioncase-deadlines.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Calendar file downloaded! Import it into your calendar app.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Calendar download error:', err);
      setMessage({ type: 'error', text: 'Failed to download calendar file.' });
    }
  };

  const calendarFeedUrl = `${api.defaults.baseURL}/features/calendar/feed.ics`;

  const handleExportAllCases = async () => {
    try {
      const response = await api.get('/grievances');
      const cases = response.data.grievances || [];

      if (cases.length === 0) {
        alert('No cases to export');
        return;
      }

      setMessage({
        type: 'success',
        text: `Exporting ${cases.length} case(s)...`
      });

      for (const grievance of cases) {
        const blob = await api.get(`/grievances/${grievance.id}/export-pdf`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(blob.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `case-${grievance.grievance_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      setMessage({
        type: 'success',
        text: 'All cases exported successfully!'
      });

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Error exporting cases:', err);
      setMessage({
        type: 'error',
        text: 'Failed to export cases. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-primary hover:text-primary-dark mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="card">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bell className="h-8 w-8 text-primary mr-3" />
              Notification Settings
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Manage how you receive notifications about cases and deadlines
            </p>
          </div>

          {/* Success/Error Messages */}
          {message.text && (
            <div className={`mb-6 px-4 py-3 rounded flex items-start ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Master Toggle */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive email notifications for case updates and reminders
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('email_enabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.email_enabled ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.email_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Notification Types */}
            {preferences.email_enabled && (
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900">
                  Notification Types
                </h3>

                {/* New Grievance */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      New Case Assigned
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      When a new case is assigned to you as a steward
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('new_grievance')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.new_grievance ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.new_grievance ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Deadline Reminders */}
                <div className="py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        Deadline Reminders
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Get reminded about upcoming and overdue deadlines
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle('deadline_reminders')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.deadline_reminders ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.deadline_reminders ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Reminder Days */}
                  {preferences.deadline_reminders && (
                    <div className="ml-4 mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Send reminders:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleReminderDayToggle(3)}
                          className={`px-3 py-1 text-xs rounded border transition-colors ${
                            preferences.reminder_days.includes(3)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                          }`}
                        >
                          3 days before
                        </button>
                        <button
                          onClick={() => handleReminderDayToggle(1)}
                          className={`px-3 py-1 text-xs rounded border transition-colors ${
                            preferences.reminder_days.includes(1)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                          }`}
                        >
                          1 day before
                        </button>
                        <button
                          onClick={() => handleReminderDayToggle(0)}
                          className={`px-3 py-1 text-xs rounded border transition-colors ${
                            preferences.reminder_days.includes(0)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                          }`}
                        >
                          On the day
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Updates */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      Status Updates
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      When a case moves to a new step in the process
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('status_updates')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.status_updates ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.status_updates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* New Notes */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      New Notes
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      When someone adds a note or update to your cases
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('new_notes')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.new_notes ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.new_notes ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Grievance Resolved */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      Case Resolved
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      When your case has been resolved or closed
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('grievance_resolved')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.grievance_resolved ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.grievance_resolved ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Calendar Integration */}
        <div className="card mt-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-6 w-6 text-primary mr-3" />
              Calendar Integration
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Subscribe to your grievance deadlines in your calendar app
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">Download Calendar File</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Download an .ics file with all your active deadlines. Import it into Google Calendar, Outlook, or Apple Calendar.
                </p>
              </div>
              <button
                onClick={handleDownloadCalendar}
                className="btn-primary px-4 py-2 flex items-center space-x-2 text-sm whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                <span>Download .ics</span>
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <h4 className="text-xs font-semibold text-gray-700 mb-1">Subscribe URL (for auto-sync)</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={calendarFeedUrl}
                  className="flex-1 text-xs bg-white border border-gray-300 rounded px-3 py-2 text-gray-600 font-mono"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(calendarFeedUrl);
                    setMessage({ type: 'success', text: 'Calendar URL copied to clipboard!' });
                    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                  }}
                  className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-100 whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Paste this URL in your calendar app's "Subscribe" or "Add by URL" feature for automatic updates.
              </p>
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="card mt-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BellRing className="h-6 w-6 text-primary mr-3" />
              Push Notifications
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Get real-time browser notifications for deadline alerts
            </p>
          </div>

          {!pushSupported ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded">
              <p className="text-sm text-amber-800">
                Push notifications are not supported in this browser. Try using Chrome, Edge, or Firefox.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Browser Push Notifications
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Receive alerts directly in your browser when deadlines are approaching or overdue.
                </p>
              </div>
              <button
                onClick={handleTogglePush}
                disabled={pushLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pushEnabled ? 'bg-primary' : 'bg-gray-200'
                } ${pushLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pushEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 card bg-blue-50 border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                About Email Notifications
              </h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                Email notifications are sent to <strong>{user?.email}</strong>.
                Make sure this email address is correct and check your spam folder if you don't receive notifications.
                You can update your notification preferences at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Data Control */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Privacy & Data Control</h2>

          <PrivacyPromise compact={true} />

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">Export Your Data</h3>
            <div className="flex gap-3">
              <button
                className="btn btn-outline flex items-center space-x-2"
                onClick={handleExportAllCases}
              >
                <Download className="h-4 w-4" />
                <span>Export All My Cases</span>
              </button>
              <button
                className="btn btn-outline text-gray-400 border-gray-300 cursor-not-allowed"
                disabled
                title="Coming soon after pilot"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Data (Coming Soon)
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Download your case records anytime as PDF files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
