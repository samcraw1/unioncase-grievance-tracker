/**
 * Formats internal grievance number to public case number
 * GRVNC-2024-0042 → CASE-2024-0042 (display only)
 */

export const formatCaseNumber = (grievanceNumber) => {
  if (!grievanceNumber) return 'N/A';

  // Replace GRVNC prefix with CASE for display
  return grievanceNumber.replace(/^GRVNC-/, 'CASE-');
};

export const parseCaseNumber = (caseNumber) => {
  // Convert back to internal format if needed
  return caseNumber.replace(/^CASE-/, 'GRVNC-');
};
