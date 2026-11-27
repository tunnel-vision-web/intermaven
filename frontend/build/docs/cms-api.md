# Intermaven Mother-CMS — Developer API Reference

Base URL (Production): `https://api.intermaven.io` (Local Dev: `http://localhost:8005`)

## 1. Public Consumer Endpoints (No Auth Required)

### `GET /api/cms/{key}`
Resolves a single CMS key for a target `portal` and ISO-3166 `region`.

Query Parameters:
- `portal` (optional): `business` | `music` | `hospitality` (or custom consumer portal slug)
- `region` (optional): `KE` | `US` | `GB` | `CA` | `NG` | `ZA`

Response:
```json
{
  "key": "pricing.callout.title",
  "value": "Instant M-Pesa Till, Paybill & Corporate Card Billing",
  "found": true,
  "resolved_for": { "region": "KE", "portal": "business" }
}
```

### `GET /api/cms/bulk/lookup`
Resolves comma-separated keys in a single round-trip.
```http
GET /api/cms/bulk/lookup?keys=footer.tagline,footer.contact.phone&region=KE&portal=business
```

## 2. Admin Management Endpoints (Bearer Admin JWT Required)

- `GET /api/admin/cms` — List all CMS keys and override trees
- `GET /api/admin/cms/{key}` — Inspect raw document & portal/region dictionaries
- `PUT /api/admin/cms/{key}` — Upsert key values and append pre-change snapshot to `history[]`
- `GET /api/admin/cms/{key}/history` — List revision snapshots for a key
- `POST /api/admin/cms/{key}/rollback/{revision_id}` — Roll back to a specific revision snapshot
- `DELETE /api/admin/cms/{key}` — Delete a key
- `GET / POST / DELETE /api/admin/cms/media` — Manage site media catalog assets
