# Full SEO Technical Audit Report — Natali Cars

**Purpose:** Detect technical SEO issues before scaling with many vehicle pages.  
**Stack:** Next.js 14 (App Router), multi-locale (`en`, `ru`, `uk`, `el`, `de`, `bg`, `ro`, `sr`).

---

## STEP 1 — Route map

### 1.1 Effective routes (reachable after middleware)

| Pattern | File(s) | Notes |
|--------|---------|--------|
| **/** | `app/page.js` | Server redirect only → `/{locale}/locations/{airport-slug}` (no HTML). |
| **/{locale}** | `app/[locale]/page.js` | Hub homepage (CarGrid). Locale: en, ru, uk, el, de, bg, ro, sr. |
| **/{locale}/locations** | `app/[locale]/locations/page.js` | Locations index. |
| **/{locale}/locations/[slug]** | `app/[locale]/locations/[slug]/page.js` | Location SEO pages. Slug = locale-specific (e.g. `car-rental-ormilia`, `koli-pod-naem-ormilia`). |
| **/{locale}/cars** | `app/[locale]/cars/page.js` | Cars index. |
| **/{locale}/cars/[slug]** | `app/[locale]/cars/[slug]/page.js` | Car detail. Slug from DB (e.g. `toyota-yaris`). |
| **/{locale}/[seoSlug]** | `app/[locale]/[seoSlug]/page.js` | SEO landing pages (category, brand, programmatic). e.g. `automatic-car-rental-halkidiki`, `toyota-car-rental-halkidiki`, `rent-toyota-yaris-halkidiki`. |
| **/{locale}/contacts** | `app/[locale]/contacts/page.js` | Contact page. |
| **/{locale}/cookie-policy** | `app/[locale]/cookie-policy/page.js` | Cookie policy (noindex). |
| **/{locale}/privacy-policy** | `app/[locale]/privacy-policy/page.js` | Privacy policy (noindex). |
| **/{locale}/terms-of-service** | `app/[locale]/terms-of-service/page.js` | Terms of service (noindex). |
| **/{locale}/rental-terms** | `app/[locale]/rental-terms/page.js` | Rental terms (noindex). |
| **/{locale}/terms** | `app/[locale]/terms/page.js` | Redirect only → `/{locale}/rental-terms`. |
| **/{locale}/car/[...id]** | `app/[locale]/car/[...id]/page.js` | Legacy: car by ID → 308 to `/{locale}/cars/{slug}`. |
| **/login** | `app/login/page.js` | Login (middleware skips). |
| **/admin** | `app/admin/page.js` | Admin (noindex). |
| **/admin/orders** | `app/admin/orders/page.js` | |
| **/admin/orders-calendar** | `app/admin/orders-calendar/page.js` | |
| **/admin/cars** | `app/admin/cars/page.js` | |
| **/admin/table** | `app/admin/table/page.js` | |

**Middleware behavior:**

- Non-prefixed paths (except `/login`, `/api`, `/admin`, static files, `/robots.txt`, `/sitemap.xml`) → **301** to `/{detectedLocale}/...`.
- **/** → 301 to `/{locale}/locations/{airport-slug}` (not to `/{locale}`).
- **/terms** → 301 to `/{locale}/rental-terms`.
- **/{locale}/car-rental-xxx** (no `/locations/`) → 301 to `/{locale}/locations/{locale-slug}` when slug differs from canonical.
- **/{locale}/terms** → 301 to `/{locale}/rental-terms`.
- Unsupported locale prefix → 301 to `/{detectedLocale}/...`.
- Trailing slashes stripped in middleware (`normalizePathname`).

### 1.2 Defined but unreachable (middleware redirects first)

| Pattern | File(s) | Reason |
|--------|---------|--------|
| **/cookie-policy** | `app/(legal)/cookie-policy/page.js` | Request to `/cookie-policy` → 301 to `/{locale}/cookie-policy`. |
| **/privacy-policy** | `app/(legal)/privacy-policy/page.js` | Same. |
| **/terms-of-service** | `app/(legal)/terms-of-service/page.js` | Same. |
| **/rental-terms** | `app/(legal)/rental-terms/page.js` | Same. |
| **/contacts** | `app/contacts/page.js` | Request to `/contacts` → 301 to `/{locale}/contacts`. |
| **/cars/[slug]** | `app/cars/[slug]/page.js` | Request to `/cars/foo` → 301 to `/{locale}/cars/foo`. |
| **/car/[...id]** | `app/car/[...id]/page.js` | Request to `/car/xxx` → 301 to `/{locale}/car/xxx` (then locale one redirects to cars/slug). |

### 1.3 API routes (no HTML, not indexed)

- `/api/auth/[...nextauth]`, `/api/car/*`, `/api/order/*`, `/api/company/*`, `/api/admin/*`, `/api/sendEmail`, `/api/telegram/send`, `/api/discount`, etc.

### 1.4 Special

- **/sitemap.xml** — `app/sitemap.xml/route.ts` (GET → XML).  
- **/robots.txt** — static or route; middleware skips.

---

## STEP 2 — Classification

| Category | Routes |
|----------|--------|
| **SEO pages** | `/{locale}`, `/{locale}/locations`, `/{locale}/locations/[slug]`, `/{locale}/cars`, `/{locale}/cars/[slug]`, `/{locale}/[seoSlug]` (category/brand/programmatic), `/{locale}/contacts`. |
| **Technical (noindex)** | `/{locale}/cookie-policy`, `/{locale}/privacy-policy`, `/{locale}/terms-of-service`, `/{locale}/rental-terms`, `/admin/*`, `/login`. |
| **Utility** | `/{locale}/terms` (redirect), `/{locale}/car/[...id]` (redirect). |
| **API** | All under `/api/*`. |

---

## STEP 3 — Indexability

| URL pattern | Indexable | Reason |
|-------------|-----------|--------|
| `/{locale}` | Yes | Hub; canonical + hreflang; index,follow. |
| `/{locale}/locations` | Yes | Locations index; canonical + hreflang. |
| `/{locale}/locations/[slug]` | Yes | Location SEO; canonical + hreflang. |
| `/{locale}/cars` | Yes | Cars index; canonical + hreflang. |
| `/{locale}/cars/[slug]` | Yes | Car detail; canonical + hreflang. |
| `/{locale}/[seoSlug]` | Yes | SEO landings; canonical + hreflang. |
| `/{locale}/contacts` | Yes | Contact; canonical + hreflang. |
| `/{locale}/cookie-policy` | No | noindex,follow (legal). |
| `/{locale}/privacy-policy` | No | noindex,follow (legal). |
| `/{locale}/terms-of-service` | No | noindex,follow (legal). |
| `/{locale}/rental-terms` | No | noindex,follow (legal). |
| `/{locale}/terms` | N/A | Redirect only. |
| `/{locale}/car/[...id]` | N/A | Redirect only. |
| `/login` | No | Should be noindex (recommend adding). |
| `/admin/*` | No | noindex,follow in admin layout. |
| `/api/*` | N/A | No HTML. |

---

## STEP 4 — Duplicate URL patterns

| Issue | Exists? | Details |
|-------|--------|--------|
| **Trailing slash** | No | Middleware strips trailing slash; links/sitemap use no trailing slash. |
| **Uppercase vs lowercase** | Yes | Car page resolves by `slug.toLowerCase()` but does **not** redirect to canonical slug. So `/en/cars/Toyota-Yaris` and `/en/cars/toyota-yaris` can both 200 with same content → duplicate. |
| **Locale vs non-locale** | Mitigated | Non-locale URLs redirect 301 to locale-prefixed; no duplicate serving. (legal) and root-level pages are unreachable due to middleware. |
| **Query duplicates** | Low risk | No known use of query params for same content; booking/search use query but are not separate indexable URLs. |

**Recommendation:** Add a 301 redirect on car (and optionally location) pages when the requested slug differs from the canonical slug (e.g. case-normalize to DB slug).

---

## STEP 5 — Canonical tags

| Page type | Canonical exists | Self-referencing | Correct URL |
|-----------|------------------|------------------|-------------|
| Hub `/{locale}` | Yes | Yes | `buildHubMetadata` → `getLocaleRootPath(locale)`. |
| Locations index | Yes | Yes | `buildLocationsIndexMetadata` → `/${locale}/locations`. |
| Location `/[slug]` | Yes | Yes | `buildLocationMetadata` → `getLocationPath(locale, location.slug)`. |
| Cars index | Yes | Yes | `toAbsoluteUrl(\`/${locale}/cars\`)`. |
| Car `/[slug]` | Yes | Yes | `buildCarMetadata` → `/${locale}/cars/${carSlug}`. |
| SEO slug | Yes | Yes | `toAbsoluteUrl(getSeoPagePath(locale, slug))`. |
| Static (contacts, legal) | Yes | Yes | `buildStaticPageMetadata` → `getStaticPagePath(locale, pageKey)`. |

**Root layout:** No longer sets default `alternates.canonical` or `alternates.languages` (fixed in prior audit); each page sets its own.

**Potential issue:** Car page canonical uses `params.slug` (requested path). If user visits `/en/cars/Toyota-Yaris`, canonical is `.../en/cars/Toyota-Yaris`, while sitemap and internal links use `toyota-yaris`. So canonical should use the **resolved** (DB) slug, not `params.slug`, and redirect when they differ.

---

## STEP 6 — Hreflang

| Check | Status |
|-------|--------|
| Hreflang links to other languages | Yes | `buildBaseMetadata` → `buildHreflangAlternates(alternatePathsByLocale)` for all locale pages. |
| x-default | Yes | `buildHreflangAlternates` sets `x-default` to default locale URL. |
| Correct locale URLs | Yes | Alternates built from `getLocationPath`, `getCarPath`, `getSeoPagePath`, `getStaticPagePath`, etc. per locale. |
| Missing hreflang | No | All [locale] pages using metadataBuilder get languages. |
| Canonical vs hreflang | OK | Canonical is self; hreflang includes self and other locales. |

**Note:** Hub homepage: root "/" redirects to a **location** page, so there is no URL that serves the hub at "/en" as a "home" with CarGrid. The route `/{locale}` (e.g. `/en`) does serve the hub. So hreflang for hub is `/{locale}` which is correct.

---

## STEP 7 — Meta robots

| Page type | Expected | Current |
|-----------|----------|---------|
| Cookie / Privacy / Terms / Rental-terms | noindex,follow | Yes | `buildStaticPageMetadata` uses `NOINDEX_STATIC_PAGES` → `noindex: true`. |
| Admin | noindex,follow | Yes | Admin layout exports `metadata.robots: { index: false, follow: true }`. |
| Login | noindex,follow | Not set | Login page has no explicit robots; recommend noindex. |
| SEO & hub & cars & locations | index,follow | Yes | Default in `buildBaseMetadata`. |

---

## STEP 8 — Sitemap

| Check | Status |
|-------|--------|
| Includes only indexable pages | Yes | Legal (cookie, privacy, terms, rental-terms) excluded; only Contacts among static. |
| Locale roots | Yes | `/{locale}` for each locale. |
| Locations index | Yes | `/{locale}/locations`. |
| Location pages | Yes | `/{locale}/locations/{slug}` per location × locale. |
| Cars index | Yes | `/{locale}/cars`. |
| Car pages | Yes | `/{locale}/cars/{slug}` per car × locale (public cars only). |
| SEO landing pages | Yes | Category, brand, programmatic. |
| Cookie / Privacy / Terms / Rental-terms | Excluded | Yes. |
| Admin / API | Excluded | Not in sitemap. |
| x-default on entries | Yes | `validateSitemapEntries` checks; build uses `buildHreflangAlternates`. |

**Source:** `lib/sitemap/sitemapBuilder.ts` → `buildLocalizedSitemap(cars)`; sitemap route fetches cars and builds XML.

---

## STEP 9 — Internal linking

| Check | Status |
|-------|--------|
| Links use locale | Yes | Footer uses `localeLink(path)` = `withLocalePrefix(lang, path)`. Nav and content use `getCarPath(locale, slug)`, `getLocationPath(locale, slug)`, `getSeoPagePath(locale, slug)`. |
| Links to non-existent routes | Low risk | Slugs from domain/repo or DB; 404 for missing car/location. |
| Links using ID instead of slug | No | Car links use slug; `/car/[...id]` redirects ID → slug. |

**Recommendation:** Ensure any new links (e.g. in CMS or new components) use the same helpers and never hardcode `/cars/` or `/locations/` without locale.

---

## STEP 10 — URL structure

| Rule | Status |
|------|--------|
| Lowercase | Mostly | Car slug in DB and sitemap is lowercase; **requested** URL can be mixed case (no redirect to lowercase). |
| Hyphen-separated | Yes | Slugs use hyphens (locationSeoRepo, car slugs, seoPageRegistry). |
| No raw IDs in URLs | Yes | Car/location URLs use slugs; IDs redirect to slug. |
| Descriptive slugs | Yes | e.g. `car-rental-halkidiki`, `toyota-yaris`. |

**Issue:** Car URLs are not forced to lowercase; same content can be reached via `/en/cars/toyota-yaris` and `/en/cars/Toyota-Yaris`. Recommend normalizing to canonical slug and redirecting.

---

## STEP 11 — Structured data

| Page type | Schema types | Notes |
|-----------|--------------|-------|
| Hub `/{locale}` | Organization (root layout), Hub JSON-LD (primary location) | `buildHubJsonLd`. |
| Location `/[slug]` | AutoRental, FAQPage, BreadcrumbList | `buildAutoRentalJsonLd`, `buildFaqJsonLd`, `buildBreadcrumbJsonLd`. |
| Car `/[slug]` | AutoRental, Product (vehicle), FAQPage, BreadcrumbList | `buildAutoRentalJsonLd`, `buildCarProductJsonLd`, FAQ, Breadcrumb. |
| SEO slug (category/brand/prog) | AutoRental, ItemList (when applicable), FAQPage, BreadcrumbList | Same pattern. |

**Conclusion:** Structured data is present and appropriate for car rental; no critical gaps.

---

## STEP 12 — Summary tables

### Route inventory (effective)

- **SEO:** `/{locale}`, `/{locale}/locations`, `/{locale}/locations/[slug]`, `/{locale}/cars`, `/{locale}/cars/[slug]`, `/{locale}/[seoSlug]`, `/{locale}/contacts`.
- **Technical (noindex):** `/{locale}/cookie-policy`, `/{locale}/privacy-policy`, `/{locale}/terms-of-service`, `/{locale}/rental-terms`, `/admin/*`.
- **Utility/redirect:** `/{locale}/terms`, `/{locale}/car/[...id]`, `/`.
- **Login:** `/login` (recommend noindex).

### Indexability map

- Index: all SEO pages + contacts.
- Noindex: legal static pages, admin, (recommend) login.

### Duplicate URL issues

- **Critical:** Car (and optionally location) slug case: same content reachable via different case (e.g. `Toyota-Yaris` vs `toyota-yaris`). Fix: redirect to canonical slug and set canonical from DB slug.

### Canonical issues

- **High:** Car page canonical should use **resolved** (DB) slug, not `params.slug`, and redirect when they differ (e.g. case).

### Hreflang issues

- None identified.

### Technical pages noindex

- Implemented: legal static pages, admin. To add: login.

### Sitemap issues

- None; legal pages excluded, only indexable content included.

### Internal linking issues

- None identified; locale-aware helpers used consistently.

---

## STEP 13 — Safe fix plan

### Critical (must fix before SEO scaling)

1. **Car URL canonical + redirect (case / normalization)**  
   - In `app/[locale]/cars/[slug]/page.js`:  
     - Resolve car by slug (keep current logic).  
     - If `params.slug !== car.slug` (e.g. case difference), **301 redirect** to `getCarPath(locale, car.slug)`.  
     - Set **canonical** and all internal references from `car.slug` (DB), not `params.slug`.  
   - Ensures one URL per car per locale and correct canonical in sitemap vs. user URL.

2. **Optional: location slug normalization**  
   - If location slugs can differ by case or variant, add same pattern: redirect to `getLocationPath(locale, location.slug)` when requested slug !== resolved slug, and use resolved slug in canonical.

### High priority

3. **Login page noindex**  
   - In `app/login/page.js` (or layout if present): add `export const metadata = { robots: { index: false, follow: true } };` (or equivalent in generateMetadata if dynamic).

4. **Next.js 15 params**  
   - When upgrading, ensure all `generateMetadata({ params })` use `const { locale } = await params` (or await params) so canonical/hreflang never use wrong locale.

### Optional improvements

5. **Remove dead (legal) and root-level page routes**  
   - `app/(legal)/*` and `app/contacts/page.js`, `app/cars/[slug]/page.js`, `app/car/[...id]/page.js` are unreachable due to middleware. Removing them reduces confusion and bundle; keep `app/page.js` as redirect.

6. **Breadcrumb and internal links**  
   - Ensure all car links use `getCarPath(locale, car.slug)` (resolved slug) after the redirect fix.

7. **Structured data**  
   - Consider adding `ItemList` or `Product` where it adds value (e.g. car index); already present on car detail and some SEO pages.

---

**Document version:** 1.0  
**Last updated:** After full route and metadata review.
