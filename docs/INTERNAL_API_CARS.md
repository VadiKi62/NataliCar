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

**200 OK** — JSON array of cars (minimal public fields only):

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "brand": "Toyota",
    "model": "Yaris",
    "transmission": "Automatic",
    "price": 30,
    "slug": "toyota-yaris-automatic",
    "image": "https://..."
  }
]
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
