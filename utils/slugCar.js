/**
 * Slug generation for Car URLs.
 * Format: lowercase, latin only, spaces/special → "-", trimmed.
 * Uniqueness: append "-2", "-3", etc. when slug exists (caller checks DB).
 */

/**
 * Normalize string to latin-only, lowercase, hyphens.
 * @param {string} str
 * @returns {string}
 */
function toSlugBase(str) {
  if (str == null || typeof str !== "string") return "";
  // Normalize: NFD to split accents, remove combining chars, then only a-z0-9 and spaces
  const normalized = str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return normalized.replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Generate base slug from make + model + year + optional location.
 * @param {Object} car - { model, registration, make?, location? }
 * @returns {string} Base slug (no uniqueness suffix).
 */
function generateSlugBase(car) {
  const parts = [];
  if (car.make && String(car.make).trim()) parts.push(String(car.make).trim());
  if (car.model && String(car.model).trim()) parts.push(String(car.model).trim());
  if (car.registration != null) parts.push(String(car.registration));
  if (car.location && String(car.location).trim()) parts.push(String(car.location).trim());
  const raw = parts.join(" ");
  const base = toSlugBase(raw);
  return base || "car";
}

/**
 * Ensure unique slug: if base exists, append "-2", "-3", ...
 * @param {string} base - Base slug
 * @param {Function} slugExists - async (slug) => boolean
 * @returns {Promise<string>} Unique slug
 */
async function ensureUniqueSlug(base, slugExists) {
  if (!base) base = "car";
  let slug = base;
  let n = 1;
  while (await slugExists(slug)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

module.exports = {
  toSlugBase,
  generateSlugBase,
  ensureUniqueSlug,
};
