import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateVin, verifyVinChecksum, formatVinDisplay } from '../src/utils/vinValidator';

describe('VIN Validator Utility (AUCTION v2)', () => {
  it('rejects empty or non-string VIN inputs', () => {
    assert.strictEqual(validateVin('').isValid, false);
    // @ts-expect-error testing invalid input
    assert.strictEqual(validateVin(null).isValid, false);
  });

  it('rejects VINs with invalid length or forbidden characters (I, O, Q)', () => {
    assert.strictEqual(validateVin('1HGCR2F83HA00000').isValid, false); // 16 chars
    assert.strictEqual(validateVin('1HGCR2F83HA0000000').isValid, false); // 18 chars
    assert.strictEqual(validateVin('1HGCR2F83HA00000I').isValid, false); // Contains 'I'
    assert.strictEqual(validateVin('1HGCR2F83HA00000O').isValid, false); // Contains 'O'
    assert.strictEqual(validateVin('1HGCR2F83HA00000Q').isValid, false); // Contains 'Q'
  });

  it('correctly decodes model year and origin region for valid VIN', () => {
    const result = validateVin('1HGCR2F83HA123456');
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.decoded?.modelYear, 2017);
    assert.strictEqual(result.decoded?.originRegion, 'USA');
    assert.strictEqual(result.decoded?.wmi, '1HG');
  });

  it('formats VIN display with or without middle masking', () => {
    const vin = '1HGCR2F83HA123456';
    assert.strictEqual(formatVinDisplay(vin, true), '1HG********123456');
    assert.strictEqual(formatVinDisplay(vin, false), '1HG CR2F83 HA123456');
  });

  it('verifies VIN checksum correctly', () => {
    assert.strictEqual(typeof verifyVinChecksum('1HGCR2F83HA123456'), 'boolean');
  });
});

