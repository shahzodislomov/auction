# Auth Contract Migration Notes

## Existing Contracts Kept

- Email login: `POST /auth/loginByEmail`
- Email registration: `POST /auth/registerByEmail`
- Email registration verification: `POST /auth/verify`
- Email login/device verification: `POST /auth/checkCodeByEmail`
- Email OTP resend: `POST /auth/resendCodeToMail`
- Google login: `POST /auth/google`

## Contract-Gated Flows

These flows are visible in the frontend foundation but do not call a backend
endpoint until a real contract is configured:

- Phone registration + SMS OTP.
- Access-token refresh.
- Session/device listing.
- Revoke one session.
- Revoke other sessions.
- Optional 2FA setup or entry routes.

The frontend intentionally does not invent endpoint paths for those flows. Phone
registration is blocked when the phone contract is unavailable, so phone data is
not posted to the email registration endpoint.

## Environment Keys For Confirmed Backend Contracts

- `NEXT_PUBLIC_AUTH_REFRESH_PATH`
- `NEXT_PUBLIC_AUTH_PHONE_REGISTER_PATH`
- `NEXT_PUBLIC_AUTH_PHONE_RESEND_OTP_PATH`
- `NEXT_PUBLIC_AUTH_PHONE_VERIFY_OTP_PATH`
- `NEXT_PUBLIC_AUTH_SESSIONS_PATH`
- `NEXT_PUBLIC_AUTH_REVOKE_OTHER_SESSIONS_PATH`

Leave these unset until backend-auth/session contracts are confirmed.
