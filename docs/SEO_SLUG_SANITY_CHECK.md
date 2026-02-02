# SEO slug — sanity check

Manual checklist (or use snippets below):

1. **`/car/{id}` → 308 → `/cars/{slug}`**  
   For a car that has a slug: `GET /car/<validObjectId>` must respond with **308** and `Location: /cars/<slug>`. No 200 with legacy URL.

2. **`/car/{missing}` → 404**  
   For a non-existent id: `GET /car/<badOrDeletedId>` must respond with **404**. No redirect to homepage.

3. **Sitemap contains no `/car/` URLs**  
   Fetch `/sitemap.xml` (or the app sitemap route). Every URL must be static or `/cars/{slug}`. No `/car/` segment.

---

## Quick curl snippets

```bash
# 1) 308 from /car/{id} to /cars/{slug} (replace CAR_ID and expect Location: /cars/SLUG)
curl -sI "http://localhost:3000/car/CAR_ID" | grep -E "HTTP|Location"

# 2) 404 for missing car
curl -sI "http://localhost:3000/car/507f1f77bcf86cd799439011" | grep HTTP

# 3) Sitemap has no /car/ URLs
curl -s "http://localhost:3000/sitemap.xml" | grep -c "/car/" || true
# Should output 0 (or no match).
```
