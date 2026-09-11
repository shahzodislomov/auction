import { useMemo } from 'react';

export const KYC_STATUS = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

/**
 * Pure function to evaluate user KYC verification status and bidding/selling eligibility.
 * Complies with AUCTION v2 requirements R014-R015.
 */
export function getKYCEligibility(user) {
  if (!user) {
    return {
      isKycApproved: false,
      isKycPending: false,
      isKycRejected: false,
      kycStatus: KYC_STATUS.NOT_SUBMITTED,
      canBid: false,
      canCreateAuction: false,
      rejectionReason: null,
      message: {
        uz: 'Auksionda qatnashish uchun ro\'yxatdan o\'ting.',
        ru: 'Для участия в аукционе авторизуйтесь.',
        en: 'Please log in to participate in auctions.',
      },
    };
  }

  const kycStatus = user.kycStatus || (user.isKycVerified ? KYC_STATUS.APPROVED : KYC_STATUS.NOT_SUBMITTED);
  const isApproved = kycStatus === KYC_STATUS.APPROVED;
  const isPending = kycStatus === KYC_STATUS.PENDING;
  const isRejected = kycStatus === KYC_STATUS.REJECTED;
  const rejectionReason = user.kycRejectionReason || null;

  let message = { uz: '', ru: '', en: '' };

  if (isApproved) {
    message = {
      uz: 'Hujjatlaringiz tasdiqlangan. Siz auksionlarda to\'liq qatnasha olasiz.',
      ru: 'Ваши документы подтверждены. Вы можете полностью участвовать в аукционах.',
      en: 'KYC verified. Full auction access granted.',
    };
  } else if (isPending) {
    message = {
      uz: 'Hujjatlaringiz moderatorlar tomonidan ko\'rib chiqilmoqda.',
      ru: 'Ваши документы находятся на проверке модератором.',
      en: 'Your KYC documents are under moderator review.',
    };
  } else if (isRejected) {
    message = {
      uz: `Hujjat rad etilgan: ${rejectionReason || 'Sababi ko\'rsatilmagan'}`,
      ru: `Документы отклонены: ${rejectionReason || 'Причина не указана'}`,
      en: `KYC Rejected: ${rejectionReason || 'No reason specified'}`,
    };
  } else {
    message = {
      uz: 'Auksion va savdolarda qatnashish uchun shaxsingizni tasdiqlang (KYC).',
      ru: 'Для участия в аукционе пройдите верификацию личности (KYC).',
      en: 'Complete KYC verification to bid and list vehicles.',
    };
  }

  return {
    isKycApproved: isApproved,
    isKycPending: isPending,
    isKycRejected: isRejected,
    kycStatus,
    canBid: isApproved,
    canCreateAuction: isApproved,
    rejectionReason,
    message,
  };
}

/**
 * React hook wrapper around getKYCEligibility
 */
export function useKYCEligibility(user) {
  return useMemo(() => getKYCEligibility(user), [user]);
}
