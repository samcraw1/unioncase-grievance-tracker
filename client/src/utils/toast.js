/**
 * Simple toast notification system
 * Creates toast notifications that auto-dismiss after a timeout
 */

let toastContainer = null;
let toastId = 0;

/**
 * Initialize toast container
 */
const initToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

/**
 * Create and show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 * @param {number} duration - How long to show the toast in milliseconds (default: 4000)
 */
export const showToast = (message, type = 'info', duration = 4000) => {
  const container = initToastContainer();

  const id = ++toastId;
  const toast = document.createElement('div');
  toast.id = `toast-${id}`;
  toast.className = `
    toast-notification
    transform transition-all duration-300 ease-in-out
    p-4 rounded-lg shadow-lg flex items-start gap-3
    ${getToastClasses(type)}
    opacity-0 translate-x-full
  `;

  toast.innerHTML = `
    <div class="flex-shrink-0">
      ${getToastIcon(type)}
    </div>
    <div class="flex-1 text-sm font-medium">
      ${escapeHtml(message)}
    </div>
    <button
      onclick="this.closest('.toast-notification').remove()"
      class="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
      aria-label="Close"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('opacity-0', 'translate-x-full');
  }, 10);

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }
};

/**
 * Remove a toast notification with animation
 * @param {HTMLElement} toast - The toast element to remove
 */
const removeToast = (toast) => {
  if (!toast) return;

  toast.classList.add('opacity-0', 'translate-x-full');
  setTimeout(() => {
    toast.remove();
  }, 300);
};

/**
 * Get toast styling classes based on type
 * @param {string} type - Toast type
 * @returns {string} CSS classes
 */
const getToastClasses = (type) => {
  const classes = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200'
  };

  return classes[type] || classes.info;
};

/**
 * Get icon SVG for toast type
 * @param {string} type - Toast type
 * @returns {string} SVG icon HTML
 */
const getToastIcon = (type) => {
  const icons = {
    success: `
      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `,
    error: `
      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `,
    warning: `
      <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
    `,
    info: `
      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `
  };

  return icons[type] || icons.info;
};

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Convenience methods
export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  warning: (message, duration) => showToast(message, 'warning', duration),
  info: (message, duration) => showToast(message, 'info', duration)
};

export default toast;
