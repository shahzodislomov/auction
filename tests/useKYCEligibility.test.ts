import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getKYCEligibility, KYC_STATUS } from '../src/hooks/useKYCEligibility.js';

describe('useKYCEligibility Helper & Hook (AUCTION v2)', () => {
  it('returns false for bidding when user is unauthenticated', () => {
    const result = getKYCEligibility(null);
    assert.strictEqual(result.canBid, false);
    assert.strictEqual(result.isKycApproved, false);
    assert.strictEqual(result.kycStatus, KYC_STATUS.NOT_SUBMITTED);
  });

  it('returns true for bidding when user KYC is APPROVED', () => {
    const user = { id: 1, kycStatus: KYC_STATUS.APPROVED };
    const result = getKYCEligibility(user);
    assert.strictEqual(result.canBid, true);
    assert.strictEqual(result.isKycApproved, true);
  });

  it('returns false for bidding when user KYC is PENDING or REJECTED', () => {
    const pendingUser = { id: 1, kycStatus: KYC_STATUS.PENDING };
    const pendingResult = getKYCEligibility(pendingUser);
    assert.strictEqual(pendingResult.canBid, false);
    assert.strictEqual(pendingResult.isKycPending, true);

    const rejectedUser = { id: 2, kycStatus: KYC_STATUS.REJECTED, kycRejectionReason: 'Passport expired' };
    const rejectedResult = getKYCEligibility(rejectedUser);
    assert.strictEqual(rejectedResult.canBid, false);
    assert.strictEqual(rejectedResult.isKycRejected, true);
    assert.strictEqual(rejectedResult.rejectionReason, 'Passport expired');
  });
});
