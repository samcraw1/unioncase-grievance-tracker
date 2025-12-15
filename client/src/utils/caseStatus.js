/**
 * Maps database status/step to user-friendly case stages
 * UI Layer only - no backend changes
 *
 * FIELD LOGIC:
 * - current_step = workflow position (draft, filed, informal_step_a, etc.)
 * - status = lifecycle state ('active' or 'resolved'/'settled'/'denied'/'withdrawn')
 * - Both fields are updated together when case closes
 */

export const mapCaseStage = (currentStep, status) => {
  // Handle closed cases first by checking status field
  if (['resolved', 'settled', 'denied', 'withdrawn'].includes(status)) {
    return 'Closed';
  }

  // Map active cases by current_step
  const stageMap = {
    'draft': 'Draft',
    'filed': 'Preparing with Steward',
    'informal_step_a': 'Step 1',
    'formal_step_a': 'Step 1',
    'step_b': 'Step 2',
    'arbitration': 'Step 2', // Show as Step 2 + arbitration badge
    // Terminal steps (also set status to same value)
    'resolved': 'Closed',
    'settled': 'Closed',
    'denied': 'Closed',
    'withdrawn': 'Closed'
  };

  return stageMap[currentStep] || 'Preparing with Steward';
};

export const getCaseStageBadgeClass = (stage) => {
  const classMap = {
    'Draft': 'bg-gray-100 text-gray-700 border border-gray-300',
    'Preparing with Steward': 'bg-blue-100 text-blue-700',
    'Step 1': 'bg-yellow-100 text-yellow-700',
    'Step 2': 'bg-orange-100 text-orange-700',
    'Closed': 'bg-green-100 text-green-700'
  };

  return classMap[stage] || 'bg-gray-100 text-gray-700';
};

export const isArbitration = (currentStep) => {
  return currentStep === 'arbitration';
};

export const getNextStageOptions = (currentStep, status) => {
  if (status !== 'active') return [];

  const progressionMap = {
    'draft': [
      { value: 'filed', label: 'Share with Steward', updateStatus: false }
    ],
    'filed': [
      { value: 'informal_step_a', label: 'Begin Step 1 (Informal)', updateStatus: false },
      { value: 'withdrawn', label: 'Close as Withdrawn', updateStatus: true }
    ],
    'informal_step_a': [
      { value: 'formal_step_a', label: 'Escalate to Step 1 (Formal)', updateStatus: false },
      { value: 'step_b', label: 'Escalate to Step 2', updateStatus: false },
      { value: 'resolved', label: 'Close as Resolved', updateStatus: true },
      { value: 'settled', label: 'Close as Settled', updateStatus: true },
      { value: 'withdrawn', label: 'Close as Withdrawn', updateStatus: true }
    ],
    'formal_step_a': [
      { value: 'step_b', label: 'Escalate to Step 2', updateStatus: false },
      { value: 'resolved', label: 'Close as Resolved', updateStatus: true },
      { value: 'settled', label: 'Close as Settled', updateStatus: true },
      { value: 'withdrawn', label: 'Close as Withdrawn', updateStatus: true }
    ],
    'step_b': [
      { value: 'arbitration', label: 'Escalate to Arbitration', updateStatus: false },
      { value: 'resolved', label: 'Close as Resolved', updateStatus: true },
      { value: 'settled', label: 'Close as Settled', updateStatus: true },
      { value: 'withdrawn', label: 'Close as Withdrawn', updateStatus: true }
    ],
    'arbitration': [
      { value: 'resolved', label: 'Close as Resolved', updateStatus: true },
      { value: 'settled', label: 'Close as Settled', updateStatus: true },
      { value: 'denied', label: 'Close as Denied', updateStatus: true }
    ]
  };

  return progressionMap[currentStep] || [];
};

/**
 * BACKEND NOTE: When frontend sends step update request, backend controller should:
 * - If option.updateStatus === true: Set BOTH current_step AND status to the same value
 *   Example: { current_step: 'resolved', status: 'resolved' }
 * - If option.updateStatus === false: Only update current_step, keep status as 'active'
 *   Example: { current_step: 'filed', status: 'active' }
 */
