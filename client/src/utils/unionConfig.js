/**
 * Union Configuration Utility (Frontend)
 *
 * Manages union-specific configurations for USPS postal unions:
 * - NALC (National Association of Letter Carriers)
 * - APWU (American Postal Workers Union)
 * - NRLCA (National Rural Letter Carriers Association)
 */

export const UNION_CONFIGS = {
  nalc: {
    name: "NALC",
    fullName: "National Association of Letter Carriers",
    crafts: ['city_carrier', 'cca'],
    documents: [
      { id: 'm41', name: 'M-41 Handbook', url: '/docs/nalc/m41.pdf' },
      { id: 'elm', name: 'ELM (Employee and Labor Relations Manual)', url: '/docs/nalc/elm.pdf' },
      { id: 'national_agreement', name: 'National Agreement', url: '/docs/nalc/national.pdf' },
      { id: 'jcam', name: 'JCAM (Joint Contract Administration Manual)', url: '/docs/nalc/jcam.pdf' }
    ],
    grievanceSteps: ['filed', 'informal_step_a', 'formal_step_a', 'step_b', 'arbitration'],
    stepLabels: {
      'filed': 'Filed',
      'informal_step_a': 'Informal Step A',
      'formal_step_a': 'Formal Step A',
      'step_b': 'Step B',
      'arbitration': 'Arbitration',
      'resolved': 'Resolved',
      'settled': 'Settled',
      'denied': 'Denied'
    },
    terminology: {
      employee: 'Carrier',
      representative: 'Steward',
      chapter: 'Branch'
    }
  },

  apwu: {
    name: "APWU",
    fullName: "American Postal Workers Union",
    crafts: ['clerk', 'maintenance', 'mvs'],
    documents: [
      { id: 'contract', name: 'APWU Collective Bargaining Agreement', url: '/docs/apwu/contract.pdf' },
      { id: 'handbook', name: 'APWU Steward Handbook', url: '/docs/apwu/handbook.pdf' },
      { id: 'elm', name: 'ELM (Employee and Labor Relations Manual)', url: '/docs/apwu/elm.pdf' }
    ],
    grievanceSteps: ['filed', 'informal_step_a', 'formal_step_a', 'step_b', 'arbitration'],
    stepLabels: {
      'filed': 'Filed',
      'informal_step_a': 'Informal Step A',
      'formal_step_a': 'Formal Step A',
      'step_b': 'Step B',
      'arbitration': 'Arbitration',
      'resolved': 'Resolved',
      'settled': 'Settled',
      'denied': 'Denied'
    },
    terminology: {
      employee: 'Member',
      representative: 'Steward',
      chapter: 'Local'
    }
  },

  nrlca: {
    name: "NRLCA",
    fullName: "National Rural Letter Carriers Association",
    crafts: ['rural_carrier', 'rca'],
    documents: [
      { id: 'rural_agreement', name: 'Rural Carrier Agreement', url: '/docs/nrlca/agreement.pdf' },
      { id: 'rural_handbook', name: 'Rural Carrier Handbook', url: '/docs/nrlca/handbook.pdf' },
      { id: 'elm', name: 'ELM (Employee and Labor Relations Manual)', url: '/docs/nrlca/elm.pdf' }
    ],
    grievanceSteps: ['filed', 'informal_step_a', 'formal_step_a', 'step_b', 'arbitration'],
    stepLabels: {
      'filed': 'Filed',
      'informal_step_a': 'Informal Step A',
      'formal_step_a': 'Formal Step A',
      'step_b': 'Step B',
      'arbitration': 'Arbitration',
      'resolved': 'Resolved',
      'settled': 'Settled',
      'denied': 'Denied'
    },
    terminology: {
      employee: 'Rural Carrier',
      representative: 'Steward',
      chapter: 'State Association'
    }
  }
};

/**
 * Get union type from craft
 * @param {string} craft - The craft/position
 * @returns {string|null} - The union type or null if not found
 */
export function getUnionFromCraft(craft) {
  for (const [unionType, config] of Object.entries(UNION_CONFIGS)) {
    if (config.crafts.includes(craft)) {
      return unionType;
    }
  }
  return null;
}

/**
 * Get union configuration
 * @param {string} unionType - The union type (nalc, apwu, nrlca)
 * @returns {object} - The union configuration object
 */
export function getUnionConfig(unionType) {
  return UNION_CONFIGS[unionType] || UNION_CONFIGS.nalc; // Default to NALC
}

/**
 * Get human-readable craft label
 * @param {string} craft - The craft code
 * @returns {string} - The display label for the craft
 */
export function getCraftLabel(craft) {
  const labels = {
    city_carrier: 'City Carrier',
    cca: 'CCA (City Carrier Assistant)',
    rural_carrier: 'Rural Carrier',
    rca: 'RCA (Rural Carrier Associate)',
    clerk: 'Clerk',
    maintenance: 'Maintenance',
    mvs: 'Motor Vehicle Service',
    other: 'Other'
  };
  return labels[craft] || craft;
}

/**
 * Get all available crafts grouped by union
 * @returns {Array} - Array of craft options grouped by union
 */
export function getCraftsGrouped() {
  return [
    {
      union: 'nalc',
      label: 'NALC - Letter Carriers',
      crafts: [
        { value: 'city_carrier', label: 'City Carrier' },
        { value: 'cca', label: 'CCA (City Carrier Assistant)' }
      ]
    },
    {
      union: 'apwu',
      label: 'APWU - Postal Workers',
      crafts: [
        { value: 'clerk', label: 'Clerk' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'mvs', label: 'Motor Vehicle Service' }
      ]
    },
    {
      union: 'nrlca',
      label: 'NRLCA - Rural Carriers',
      crafts: [
        { value: 'rural_carrier', label: 'Rural Carrier' },
        { value: 'rca', label: 'RCA (Rural Carrier Associate)' }
      ]
    },
    {
      union: 'other',
      label: 'Other',
      crafts: [
        { value: 'other', label: 'Other' }
      ]
    }
  ];
}

/**
 * Validate craft against union
 * @param {string} craft - The craft to validate
 * @param {string} unionType - The union type to validate against
 * @returns {boolean} - True if craft belongs to union, false otherwise
 */
export function isCraftValidForUnion(craft, unionType) {
  const config = UNION_CONFIGS[unionType];
  return config ? config.crafts.includes(craft) : false;
}

/**
 * Get grievance step label for a specific union
 * @param {string} step - The step code
 * @param {string} unionType - The union type
 * @returns {string} - The display label for the step
 */
export function getStepLabel(step, unionType) {
  const config = getUnionConfig(unionType);
  return config.stepLabels[step] || step;
}

export default {
  UNION_CONFIGS,
  getUnionFromCraft,
  getUnionConfig,
  getCraftLabel,
  getCraftsGrouped,
  isCraftValidForUnion,
  getStepLabel
};
