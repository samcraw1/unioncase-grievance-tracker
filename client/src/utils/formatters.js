import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format utilities for displaying data in the UI
 */

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format date and time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM d, yyyy h:mm a');
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '-';
  }
};

/**
 * Format grievance step to readable name
 * @param {string} step - Grievance step code
 * @returns {string} Readable step name
 */
export const formatGrievanceStep = (step) => {
  const steps = {
    'filed': 'Filed',
    'informal_step_a': 'Informal Step A',
    'formal_step_a': 'Formal Step A',
    'step_b': 'Step B',
    'arbitration': 'Arbitration',
    'resolved': 'Resolved',
    'settled': 'Settled',
    'denied': 'Denied'
  };

  return steps[step] || step;
};

/**
 * Format grievance status to readable name
 * @param {string} status - Grievance status code
 * @returns {string} Readable status name
 */
export const formatStatus = (status) => {
  const statuses = {
    'active': 'Active',
    'resolved': 'Resolved',
    'settled': 'Settled',
    'denied': 'Denied',
    'withdrawn': 'Withdrawn'
  };

  return statuses[status] || status;
};

/**
 * Get status badge color classes
 * @param {string} status - Grievance status
 * @returns {string} Tailwind CSS classes for badge
 */
export const getStatusColor = (status) => {
  const colors = {
    'active': 'bg-blue-100 text-blue-800',
    'resolved': 'bg-green-100 text-green-800',
    'settled': 'bg-purple-100 text-purple-800',
    'denied': 'bg-red-100 text-red-800',
    'withdrawn': 'bg-gray-100 text-gray-800'
  };

  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get step badge color classes
 * @param {string} step - Grievance step
 * @returns {string} Tailwind CSS classes for badge
 */
export const getStepColor = (step) => {
  const colors = {
    'filed': 'bg-yellow-100 text-yellow-800',
    'informal_step_a': 'bg-blue-100 text-blue-800',
    'formal_step_a': 'bg-indigo-100 text-indigo-800',
    'step_b': 'bg-purple-100 text-purple-800',
    'arbitration': 'bg-red-100 text-red-800',
    'resolved': 'bg-green-100 text-green-800',
    'settled': 'bg-teal-100 text-teal-800',
    'denied': 'bg-gray-100 text-gray-800'
  };

  return colors[step] || 'bg-gray-100 text-gray-800';
};

/**
 * Format phone number to US format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
};

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format craft to readable name
 * @param {string} craft - Craft code
 * @returns {string} Readable craft name
 */
export const formatCraft = (craft) => {
  const crafts = {
    'city_carrier': 'City Carrier',
    'cca': 'City Carrier Assistant',
    'rural_carrier': 'Rural Carrier',
    'rca': 'Rural Carrier Associate',
    'clerk': 'Clerk',
    'maintenance': 'Maintenance',
    'mvs': 'Motor Vehicle Service',
    'other': 'Other'
  };

  return crafts[craft] || craft;
};

/**
 * Format union type to readable name
 * @param {string} unionType - Union type code
 * @returns {string} Readable union name
 */
export const formatUnionType = (unionType) => {
  const unions = {
    'nalc': 'NALC',
    'apwu': 'APWU',
    'nrlca': 'NRLCA'
  };

  return unions[unionType] || unionType;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;

  return text.substring(0, maxLength) + '...';
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Calculate days until deadline
 * @param {string|Date} deadline - Deadline date
 * @returns {number} Number of days until deadline (negative if overdue)
 */
export const daysUntilDeadline = (deadline) => {
  if (!deadline) return null;

  const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Get deadline urgency color
 * @param {string|Date} deadline - Deadline date
 * @returns {string} Tailwind CSS color classes
 */
export const getDeadlineColor = (deadline) => {
  const days = daysUntilDeadline(deadline);

  if (days === null) return 'text-gray-500';
  if (days < 0) return 'text-red-600 font-bold';
  if (days === 0) return 'text-red-500 font-semibold';
  if (days <= 2) return 'text-orange-500';
  if (days <= 7) return 'text-yellow-600';

  return 'text-green-600';
};

/**
 * Format deadline with urgency indicator
 * @param {string|Date} deadline - Deadline date
 * @returns {string} Formatted deadline with urgency
 */
export const formatDeadlineWithUrgency = (deadline) => {
  const days = daysUntilDeadline(deadline);

  if (days === null) return '-';
  if (days < 0) return `Overdue by ${Math.abs(days)} day(s)`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 7) return `Due in ${days} days`;

  return formatDate(deadline);
};
