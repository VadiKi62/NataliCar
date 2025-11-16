import { Car } from "@models/car";
import { connectToDB } from "@utils/database";

// Нормализация ключа для сравнения: нижний регистр, без диакритики/пробелов/дефисов/точек
const normalizeKey = (s) => {
  if (typeof s !== "string") return "";
  const trimmed = s.trim();
  // Удаляем диакритику
  const noDiacritics = trimmed.normalize("NFD").replace(/\p{Diacritic}+/gu, "");
  // Удаляем пробелы, дефисы, точки, подчёркивания
  return noDiacritics.replace(/[\s\-\._]+/g, "").toLowerCase();
};

// Карта канонических отображаемых названий по нормализованному ключу
const canonicalMap = new Map([
  ["audi", "Audi"],
  ["bmw", "BMW"],
  ["byd", "BYD"],
  ["chevrolet", "Chevrolet"],
  ["citroen", "Citroën"],
  ["dacia", "Dacia"],
  ["dodge", "Dodge"],
  ["fiat", "Fiat"],
  ["ford", "Ford"],
  ["honda", "Honda"],
  ["hyundai", "Hyundai"],
  ["isuzu", "Isuzu"],
  ["kia", "Kia"],
  ["mazda", "Mazda"],
  ["mercedesbenz", "Mercedes-Benz"],
  ["mg", "MG"],
  ["mini", "Mini"],
  ["mitsubishi", "Mitsubishi"],
  ["nissan", "Nissan"],
  ["opel", "Opel"],
  ["peugeot", "Peugeot"],
  ["renault", "Renault"],
  ["seat", "Seat"],
  ["skoda", "Škoda"],
  ["smart", "Smart"],
  ["suzuki", "Suzuki"],
  ["tesla", "Tesla"],
  ["toyota", "Toyota"],
  ["volkswagen", "Volkswagen"],
  ["volvo", "Volvo"],
]);

export const GET = async () => {
  try {
    await connectToDB();
    const models = await Car.distinct("model");

    // Фильтрация и нормализация
    const seen = new Set();
    const unique = [];
    for (const m of models || []) {
      if (typeof m !== "string") continue;
      const raw = m.trim();
      if (!raw) continue;
      const key = normalizeKey(raw);
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      const canonical = canonicalMap.get(key) || raw;
      unique.push(canonical);
    }

    unique.sort((a, b) => a.localeCompare(b));

    return new Response(JSON.stringify(unique), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch models" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const POST = GET;
