/**
 * VIN (Vehicle Identification Number) Validation and Decoding Utilities for AUCTION v2 Cars
 * Complies with ISO 3779 and North American VIN standards.
 */

// Characters I, O, Q are disallowed in valid VINs
const INVALID_VIN_CHARS_REGEX = /[IOQioq]/;
const VALID_VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

// Character weights for VIN checksum verification (position 1 to 17, with 9th being check digit)
const POSITION_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

// Letter to numeric value mapping for checksum
const CHAR_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
};

// VIN 10th Character to Model Year mapping (ISO 3779 / standard 30-year cycle)
const YEAR_CODES: Record<string, number> = {
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017,
  J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025,
  T: 2026, V: 2027, W: 2028, X: 2029, Y: 2030,
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
  '6': 2006, '7': 2007, '8': 2008, '9': 2009,
};

// WMI (World Manufacturer Identifier) 1st Character to Region mapping
const REGION_CODES: Record<string, string> = {
  '1': 'USA', '4': 'USA', '5': 'USA',
  '2': 'Canada',
  '3': 'Mexico',
  J: 'Japan',
  K: 'South Korea',
  L: 'China',
  S: 'United Kingdom',
  V: 'France/Estonia',
  W: 'Germany',
  Y: 'Sweden/Finland',
  Z: 'Italy',
};

export interface VinValidationResult {
  isValid: boolean;
  error?: string;
  decoded?: {
    modelYear?: number;
    originRegion?: string;
    wmi: string;
    vds: string;
    vis: string;
  };
}

/**
 * Validates a 17-character VIN code.
 */
export function validateVin(vin: string): VinValidationResult {
  if (!vin || typeof vin !== 'string') {
    return { isValid: false, error: 'VIN code is required.' };
  }

  const cleaned = vin.trim().toUpperCase();

  if (cleaned.length !== 17) {
    return { isValid: false, error: 'VIN code must be exactly 17 characters long.' };
  }

  if (INVALID_VIN_CHARS_REGEX.test(cleaned)) {
    return { isValid: false, error: 'VIN code cannot contain letters I, O, or Q.' };
  }

  if (!VALID_VIN_REGEX.test(cleaned)) {
    return { isValid: false, error: 'VIN code contains invalid characters.' };
  }

  // Calculate Checksum (9th digit)
  const checksumValid = verifyVinChecksum(cleaned);

  const modelYearCode = cleaned.charAt(9);
  const wmiFirstChar = cleaned.charAt(0);

  return {
    isValid: true,
    error: checksumValid ? undefined : 'VIN check digit verification failed (checksum warning).',
    decoded: {
      modelYear: YEAR_CODES[modelYearCode],
      originRegion: REGION_CODES[wmiFirstChar] || 'International',
      wmi: cleaned.substring(0, 3),
      vds: cleaned.substring(3, 9),
      vis: cleaned.substring(9, 17),
    },
  };
}

/**
 * Verifies North American / ISO 3779 VIN checksum (9th digit).
 */
export function verifyVinChecksum(vin: string): boolean {
  const cleaned = vin.toUpperCase();
  let totalSum = 0;

  for (let i = 0; i < 17; i++) {
    const char = cleaned.charAt(i);
    const value = CHAR_VALUES[char];
    if (value === undefined) return false;
    totalSum += value * POSITION_WEIGHTS[i];
  }

  const remainder = totalSum % 11;
  const expectedCheckChar = remainder === 10 ? 'X' : remainder.toString();
  const actualCheckChar = cleaned.charAt(8);

  return expectedCheckChar === actualCheckChar;
}

/**
 * Formats a VIN for public display (masks middle characters for security if requested).
 */
export function formatVinDisplay(vin: string, maskMiddle = false): string {
  if (!vin) return '';
  const cleaned = vin.trim().toUpperCase();
  if (cleaned.length !== 17) return cleaned;

  if (maskMiddle) {
    return `${cleaned.substring(0, 3)}********${cleaned.substring(11)}`;
  }
  return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 9)} ${cleaned.substring(9)}`;
}
