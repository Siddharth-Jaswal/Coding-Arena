/**
 * Formats a Date object or ISO string into a localized, human-readable string.
 * @param {string | Date} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

/**
 * Returns a relative time string (e.g., '2 hours ago').
 * @param {string | Date} dateString 
 * @returns {string}
 */
export const formatRelativeTime = (dateString) => {
  // Implementation pending
  return String(dateString);
};
