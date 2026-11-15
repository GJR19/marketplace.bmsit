export interface USNParseResult {
  isValidFormat: boolean;
  institutionCode: string;
  isBMSIT: boolean;
  admissionYearTwoDigits: string;
  admissionYearFull: number;
  currentYear: string;
  branchCode: string;
  branchName: string | null;
  sequenceNumber: string;
  isKnownBranch: boolean;
  errorMessage?: string;
}

export const BMSIT_BRANCH_MAP: Record<string, string> = {
  AI: 'Artificial Intelligence & Machine Learning (AIML)',
  CS: 'Computer Science & Engineering (CSE)',
  IS: 'Information Science & Engineering (ISE)',
  EC: 'Electronics & Communication Engineering (ECE)',
  EE: 'Electrical & Electronics Engineering (EEE)',
  ME: 'Mechanical Engineering (ME)',
  CV: 'Civil Engineering (CE)',
  CD: 'Computer Science & Design (CSD)',
  CY: 'Computer Science & Cyber Security (CSCY)',
  DS: 'Computer Science & Data Science (CSDS)',
  ET: 'Electronics & Telecommunication Engineering (ETE)',
  MC: 'Master of Computer Applications (MCA)',
  MB: 'Master of Business Administration (MBA)',
};

/**
 * Calculates current college year based on admission year and current calendar/academic cycle.
 * Current reference year: 2026 (or dynamic date).
 */
export function calculateAcademicYear(admissionYear: number, referenceYear: number = 2026): string {
  const diff = referenceYear - admissionYear;
  if (diff <= 0) return '1st Year (Fresher)';
  if (diff === 1) return '2nd Year (Sophomore)';
  if (diff === 2) return '3rd Year (Pre-final)';
  if (diff === 3) return '4th Year (Final Year)';
  return 'Graduating / Alumni';
}

/**
 * Parses VTU / BMSIT style USN (e.g., 1BY24AI049, 1by23cs088)
 */
export function parseUSN(usnInput: string): USNParseResult {
  const clean = (usnInput || '').trim().toUpperCase();

  // Pattern: 1BY + 2 digits (year) + 2 letters (branch) + 3 digits (roll)
  const regex = /^([0-9][A-Z]{2})([0-9]{2})([A-Z]{2})([0-9]{3})$/;
  const match = clean.match(regex);

  if (!match) {
    return {
      isValidFormat: false,
      institutionCode: '',
      isBMSIT: false,
      admissionYearTwoDigits: '',
      admissionYearFull: 0,
      currentYear: '',
      branchCode: '',
      branchName: null,
      sequenceNumber: '',
      isKnownBranch: false,
      errorMessage: 'USN must follow standard format, e.g. 1BY24AI049',
    };
  }

  const [, institution, year2, branchCode, seq] = match;
  const isBMSIT = institution === '1BY';
  const admissionYearFull = 2000 + parseInt(year2, 10);
  const currentYear = calculateAcademicYear(admissionYearFull);
  const branchName = BMSIT_BRANCH_MAP[branchCode] || null;

  return {
    isValidFormat: true,
    institutionCode: institution,
    isBMSIT,
    admissionYearTwoDigits: year2,
    admissionYearFull,
    currentYear,
    branchCode,
    branchName,
    sequenceNumber: seq,
    isKnownBranch: Boolean(branchName),
    errorMessage: isBMSIT
      ? undefined
      : 'Institution code is not 1BY (BMSIT). Demonstration permits BMSIT students.',
  };
}

export function formatPriceINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
