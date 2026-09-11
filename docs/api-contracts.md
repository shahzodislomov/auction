# API Contract Migration Notes

## Legacy Pages

These routes still use legacy `/lot`, `/bids`, `/deposit`, `lotId`, lot type,
subtype, and dynamic attribute contracts:

- `/`
- `/auctions`
- `/lots/[id]`
- `/lots/bidding/[id]`
- `/sell`
- `/dashboard`
- `/admin`

The v2 foundation is available under `src/api/v2` for new modules. Endpoint
query modules are intentionally not created until backend vehicle and auction
contracts are confirmed. Existing marketplace pages are intentionally unchanged.

## Backend Blockers

- Confirmed OpenAPI paths and response bodies for `/api/v1/vehicles`.
- Confirmed OpenAPI paths and response bodies for `/api/v1/auctions`.
- Confirmed auction STOMP topics and message payloads.
