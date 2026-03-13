# SEO Canonical & Indexing Audit — Natali Cars

**Issue:** Google Search Console — "Duplicate, Google chose different canonical than user"

**Affected URLs (examples):**
- `/bg/locations/koli-pod-naem-ormilia`
- `/bg/cookie-policy`
- `/ro`

---

## STEP 1 — Current SEO Implementation

### How canonical tags are generated

1. **Root layout (`app/layout.js`)**
   - Sets **global** `metadata.alternates`:
     - `canonical`: `${baseUrl}/${defaultLocale}` → e.g. `https://natali-cars.com/en`
     - `languages`: all locale roots (`/en`, `/bg`, `/ro`, …) for hreflang
   - This applies to the **entire app** as the default. Any page that does **not** return its own `alternates` from `generateMetadata` will **inherit** this canonical — i.e. **canonical to /en** regardless of the actual URL (e.g. `/bg/cookie-policy` or `/ro`).

2. **Next.js Metadata API**
   - Next.js uses the **Metadata API** (root `metadata` export and per-page `generateMetadata`).
   - Merging is **shallow**: child `metadata` overwrites parent for the **same key**. So if a page returns `alternates: { canonical, languages }`, it should replace the root `alternates`.
   - **Risk:** If for any reason the child metadata is not applied (e.g. streaming, build, or error), the **root canonical (always /en)** is used → "Google chose different canonical than user".

3. **Where canonical URLs are defined**
   - **Centralized:** `services/seo/metadataBuilder.ts`
     - `buildBaseMetadata()` builds `alternates.canonical` from `canonicalPath` via `toAbsoluteUrl(canonicalPath)`.
     - Used by: `buildHubMetadata`, `buildLocationsIndexMetadata`, `buildLocationMetadata`, `buildCarMetadata`, `buildStaticPageMetadata`.
   - **URLs:** `services/seo/urlBuilder.ts` — `toAbsoluteUrl(path)` → `baseUrl + path` (production base from `config/seo.js`).
   - **Paths:** From `domain/locationSeo/locationSeoService.ts` — `getLocationPath(locale, slug)`, `getStaticPagePath(locale, pageKey)`, `getLocaleRootPath(locale)`, etc. All use the **requested** locale when `generateMetadata` receives correct `params.locale`.

4. **Locale dependence**
   - Canonical is **locale-dependent**: each page’s canonical is built from `locale` (from `params.locale`) and the page path. So `/bg/cookie-policy` should get canonical `https://natali-cars.com/bg/cookie-policy` when `params.locale === 'bg'`.
   - **Bug source:** If the **root** layout’s canonical is ever used (e.g. no override), it always points to **default locale** (`/en`), so any non‑EN URL would have "user canonical = /en" → duplicate/canonical conflict.

5. **Incorrect canonical to another language**
   - Exactly this happens when the inherited canonical is used: e.g. `/bg/cookie-policy` or `/ro` would get canonical `https://natali-cars.com/en` instead of self.

**Conclusion (Step 1):** The root layout’s default `alternates.canonical` (and possibly `languages`) is the main risk. Removing it ensures no page inherits a wrong canonical; every [locale] page already sets its own via `generateMetadata`.

---

## STEP 2 — Multi-Language Structure

- **Locales:** en, ru, uk, de, sr, ro, bg, el (from `locationSeoKeys` / config).
- **hreflang:** Implemented in `buildBaseMetadata()` via `buildHreflangAlternates(alternatePathsByLocale)` → Next.js emits `<link rel="alternate" hreflang="..." href="...">` for each locale and `x-default` (pointing to default locale).
- **Conflict:** Root layout also sets `alternates.languages` to **locale roots only** (`/en`, `/bg`, …). So root gives hreflang for **homepage** only; child pages replace with their own alternates. No logical conflict **if** child metadata is applied; if not, hreflang would point to homepages, not to the current page’s locale variants.
- **Correct setup:** Each page should canonicalize to **itself** (e.g. `/bg/cookie-policy` → canonical `https://natali-cars.com/bg/cookie-policy`) and have hreflang for **that** page in all locales. This is what `metadataBuilder` does when used from each page.

---

## STEP 3 — Duplicate Content

- **Same content in multiple languages:** e.g. `/en/cookie-policy`, `/bg/cookie-policy` — same page type, different locale. Not "duplicate" in a bad sense if each has **self-referencing canonical** and correct hreflang.
- **Problem:** If they all get canonical `/en/...` (from root), Google would see duplicate content with wrong canonical.
- **Recommendation:** Legal/technical pages (cookie-policy, privacy-policy, terms, rental-terms) should be **noindex** so they don’t compete with main SEO pages; then duplicate signals are reduced.

---

## STEP 4 — Technical Pages (noindex)

**Pages that should NOT be indexed:**

- `cookie-policy`
- `privacy-policy`
- `terms-of-service`
- `rental-terms`
- Admin routes: `/admin/*`
- API routes: `/api/*` (no HTML; no canonical issue)

**Recommendation:** Set `<meta name="robots" content="noindex,follow">` for the legal static pages above (and admin layout). Implement via `buildStaticPageMetadata` (e.g. a list of `NOINDEX_STATIC_PAGES`) and in admin layout.

---

## STEP 5 — Sitemap

- **Current:** `lib/sitemap/sitemapBuilder.ts` — `buildLocalizedSitemap()` includes:
  - Locale roots (`/en`, `/bg`, …)
  - `/locations`, `/cars` (index)
  - **Static pages:** contacts, privacy-policy, terms-of-service, cookie-policy, rental-terms
  - Location pages, car pages, SEO category/brand/programmatic pages
- **Required:** Sitemap should include **only** SEO-relevant pages: locale roots, locations index, cars index, location pages, car pages, SEO landing pages. **Exclude:** cookie-policy, privacy-policy, terms-of-service, rental-terms. Contacts can stay for local SEO. Admin and API are not in sitemap.

---

## STEP 6 — Internal Linking

- Links must point to **localized** URLs: e.g. `/${locale}/cars/${slug}`, `/${locale}/locations/${slug}`, not `/cars/${slug}`.
- Implementation is in components and `locationSeoService` helpers (`getCarPath`, `getLocationPath`, etc.) — they take `locale`. No change in this audit; just ensure no hardcoded `/en/...` or un-prefixed paths in key links.

---

## STEP 7 — Canonical Rule

**Rule:** Every page must canonicalize to **itself** (self-referencing canonical).

- **Correct:** `/bg/locations/koli-pod-naem-ormilia` → canonical `https://natali-cars.com/bg/locations/koli-pod-naem-ormilia`.
- **Wrong:** canonical to `/en` or any other locale.

**Fix:** Remove default `alternates` from root layout so no page inherits a canonical. Rely on each page’s `generateMetadata` to set `alternates.canonical` (and `languages`) to the correct self-URL and hreflang.

---

## STEP 8 — Hreflang

- Already implemented in `buildBaseMetadata()`: `buildHreflangAlternates(input.alternatePathsByLocale)` and `toAbsoluteUrl()`.
- Each page that uses `buildBaseMetadata` gets correct hreflang for that page’s locale variants; `x-default` points to default locale.
- No change needed except ensuring **only** page-level metadata (not root) defines alternates for [locale] routes so hreflang matches the actual page set.

---

## STEP 9 — Validation Checklist

1. **Canonical self-reference:** For any URL `/{locale}/...`, view source and confirm `<link rel="canonical" href="https://natali-cars.com/{locale}/...">` matches the current URL.
2. **Hreflang:** Same page has `<link rel="alternate" hreflang="en" href="...">` (and bg, ro, etc.) and `hreflang="x-default"` for the default locale.
3. **noindex for technical pages:** `/bg/cookie-policy`, `/en/privacy-policy`, etc. have `<meta name="robots" content="noindex,follow">`.
4. **Sitemap:** Sitemap XML does not contain cookie-policy, privacy-policy, terms-of-service, rental-terms.

---

## STEP 10 — Safe Implementation Summary

1. **Root layout:** Remove `alternates` (canonical + languages) so no default canonical is inherited.
2. **buildStaticPageMetadata:** Add noindex for cookie-policy, privacy-policy, terms-of-service, rental-terms.
3. **Sitemap:** Exclude those four static legal pages from `buildLocalizedSitemap`.
4. **Admin:** Ensure admin layout (if any) sets `robots: { index: false, follow: true }`.
5. **Params:** Ensure all `generateMetadata` use `params.locale` (and in future, await params if Next.js 15+). Defensive `normalizeLocale(params?.locale)` where applicable.

No routing or page removal — only metadata and sitemap filtering.

---

## Implementation (Done)

1. **Root layout (`app/layout.js`)**  
   - Removed `alternates.canonical` and `alternates.languages` so no page inherits a default canonical (e.g. to /en).  
   - Each `app/[locale]/...` page sets its own canonical and hreflang via `generateMetadata` → `build*Metadata`.

2. **Legal pages noindex**  
   - `services/seo/metadataBuilder.ts`: `buildBaseMetadata(..., noindex?: boolean)`.  
   - `buildStaticPageMetadata` uses `NOINDEX_STATIC_PAGES` (cookie-policy, privacy-policy, terms-of-service, rental-terms) and passes `noindex: true` so those pages get `robots: { index: false, follow: true }`.  
   - Canonical and hreflang are still set (self-referencing) for consistency.

3. **Sitemap**  
   - `lib/sitemap/sitemapBuilder.ts`: static pages in sitemap reduced to `CONTACTS` only. Cookie-policy, privacy-policy, terms-of-service, rental-terms are no longer in the sitemap.

4. **Admin noindex**  
   - `app/admin/layout.js` is a Server Component that exports `metadata: { robots: { index: false, follow: true } }` and renders the existing client layout (`AdminLayoutClient.js`).  
   - Admin routes are not in the sitemap (they are under `/admin`, which is not added to the sitemap).

5. **Next.js 15**  
   - When upgrading to Next.js 15, ensure all `generateMetadata({ params })` use `const { locale } = await params` (or await params then use locale) so canonical is always built from the correct segment.
