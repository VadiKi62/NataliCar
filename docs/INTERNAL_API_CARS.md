# Internal API: Cars

**Endpoint:** `GET /api/internal/cars`  
**Purpose:** Return only real cars (testingCar = false) for external consumers (e.g. https://bbqr.site).

## Environment

Add to `.env` or `.env.local`:

```bash
INTERNAL_API_TOKEN=your-secret-token-here
```

If `INTERNAL_API_TOKEN` is missing or empty, all requests return **401 Unauthorized**.

## Authentication

- **Header:** `Authorization: Bearer <INTERNAL_API_TOKEN>`
- Missing or invalid token → **401 Unauthorized**.

## CORS

- **Allowed origin:** `https://bbqr.site` only.
- **Methods:** `GET`, `OPTIONS`.
- **Headers:** `Authorization`, `Content-Type`.

## Example request (from bbqr.site)

```bash
curl -X GET "https://your-next-app-domain.com/api/internal/cars" \
  -H "Authorization: Bearer YOUR_INTERNAL_API_TOKEN"
```

From browser/fetch (same origin as bbqr.site or from bbqr.site backend):

```javascript
const res = await fetch("https://your-next-app-domain.com/api/internal/cars", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${process.env.INTERNAL_API_TOKEN}`,
  },
});
const cars = await res.json();
```

## Response format

**200 OK** — JSON array of cars (ideal format for external listings, e.g. BBQR):

```json
[
  {
    "externalId": "507f1f77bcf86cd799439011",
    "title": "Toyota Yaris Automatic",
    "priceFrom": 30,
    "image": "https://...",
    "bookingUrl": "https://natali-cars.com/cars/toyota-yaris-automatic"
  }
]
```

- **externalId** — MongoDB `_id` (for mapping in external system).
- **title** — Display name: brand + model + transmission (e.g. "Toyota Yaris Automatic").
- **priceFrom** — Representative minimum price from pricing tiers (for "from €30").
- **image** — Car photo URL (or `null`).
- **bookingUrl** — Deep link to Natali Cars booking: `/cars/[slug]`. BBQR can use this directly for "Check availability"; no need to build URLs or know site structure.

**Base URL** for `bookingUrl` is taken from `NEXT_PUBLIC_API_BASE_URL` or `NEXT_PUBLIC_SITE_URL` (or Vercel), fallback `https://natali-cars.com`.

**BBQR mapping example:**

```json
{
  "externalId": "externalId",
  "title": "title",
  "priceFrom": "priceFrom",
  "coverImage": "image",
  "bookingUrl": "bookingUrl"
}
```

**401 Unauthorized** — Missing or invalid token:

```json
{ "error": "Unauthorized" }
```

**500 Server Error** — DB or server error:

```json
{ "error": "Server error" }
```

## Mongo query

Only real cars are returned (testing cars excluded):

```js
// Equivalent filter used in code:
{ $or: [ { testingCar: false }, { testingCar: { $exists: false } } ] }
```

This returns cars where `testingCar` is explicitly `false` or the field is missing (e.g. before seed). Cars with `testingCar: true` are never returned.
