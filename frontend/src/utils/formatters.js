/**
 * Formats a difficulty string to Title Case.
 * @param {"easy" | "medium" | "hard"} difficulty 
 * @returns {string}
 */
export const formatDifficulty = (difficulty) => {
  if (!difficulty) return '';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

/**
 * Formats a backend verdict to a user-friendly string.
 * @param {string} verdict 
 * @returns {string}
 */
export const formatVerdict = (verdict) => {
  if (!verdict) return '';
  return verdict
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
