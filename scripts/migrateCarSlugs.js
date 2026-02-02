/**
 * One-time migration: add slug to cars that don't have one.
 * - Idempotent: only sets slug when missing; never overwrites existing slug.
 * - Uniqueness: appends "-2", "-3", etc. on collision; logs collisions.
 * Safe to run multiple times.
 *
 * Usage: MONGODB_URI=... node scripts/migrateCarSlugs.js
 */

const { MongoClient } = require("mongodb");
const { generateSlugBase, toSlugBase } = require("../utils/slugCar.js");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/natalicar";

async function migrateCarSlugs() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const carsCollection = db.collection("cars");

    const existingSlugs = new Set();
    const carsWithSlug = await carsCollection.find({ slug: { $exists: true, $ne: null, $ne: "" } }).toArray();
    carsWithSlug.forEach((c) => existingSlugs.add((c.slug || "").toLowerCase().trim()));

    const carsWithoutSlug = await carsCollection.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    }).toArray();

    console.log(`📊 Cars with slug: ${carsWithSlug.length}`);
    console.log(`📊 Cars without slug: ${carsWithoutSlug.length}`);

    if (carsWithoutSlug.length === 0) {
      console.log("✅ All cars already have slug. Migration not needed.");
      return;
    }

    const collisions = [];
    let updated = 0;

    for (const car of carsWithoutSlug) {
      const base = generateSlugBase(car);
      let slug = base;
      let n = 1;
      while (existingSlugs.has(slug)) {
        n += 1;
        slug = `${base}-${n}`;
        collisions.push({ carId: car._id.toString(), base, finalSlug: slug });
      }
      existingSlugs.add(slug);
      // Never write null: only set when slug is a non-empty string (sparse index safety).
      if (typeof slug !== "string" || !slug.trim()) continue;

      const result = await carsCollection.updateOne(
        { _id: car._id },
        { $set: { slug: slug.trim() } }
      );
      if (result.modifiedCount) updated += 1;
    }

    if (collisions.length) {
      console.log(`⚠️ Collisions (slug already existed, appended -2, -3, ...): ${collisions.length}`);
      collisions.forEach((c) => console.log(`   ${c.base} → ${c.finalSlug} (car ${c.carId})`));
    }
    console.log(`✅ Updated ${updated} cars with slug.`);
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  } finally {
    await client.close();
    console.log("✅ Connection closed.");
  }
}

if (require.main === module) {
  migrateCarSlugs()
    .then(() => {
      console.log("🎉 Migration completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("💥 Migration failed:", err);
      process.exit(1);
    });
}

module.exports = { migrateCarSlugs };
