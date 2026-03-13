# 3 частые SEO-ошибки в Next.js и статус Natali Cars

Разбор трёх типичных проблем, которые тормозят индексацию, особенно на мультиязычных сайтах.

---

## 1️⃣ Неправильный canonical (относительный URL)

**Проблема:** В App Router часто делают canonical относительным:

```js
alternates: { canonical: "/cars/toyota-yaris" }
```

Google может интерпретировать это неправильно → **Duplicate, Google chose different canonical than user**.

**Правильно:** Canonical всегда **абсолютный** и с **локалью**:

- `https://natali-cars.com/bg/cars/toyota-yaris`, а не `/cars/toyota-yaris`
- `https://natali-cars.com/ro/contacts`, а не `/contacts`

### Статус в Natali Cars ✅

- **Все** canonical строятся через `toAbsoluteUrl(canonicalPath)` в `services/seo/metadataBuilder.ts`.
- `toAbsoluteUrl()` в `services/seo/urlBuilder.ts` возвращает `baseUrl + path` (production: `https://natali-cars.com`).
- Путь всегда с локалью: `getLocationPath(locale, slug)`, `getCarPath(locale, slug)`, `getStaticPagePath(locale, pageKey)`.
- В root layout **не** задаётся дефолтный canonical (убран в прошлом аудите), чтобы не перезаписывать страницы на другой язык.

**Итог:** Canonical везде абсолютные и самоссылающиеся на текущий URL (в т.ч. для `/bg/...`, `/ro/...`).

---

## 2️⃣ Страницы без внутренних ссылок

**Проблема:** Если страницы машин `/cars/[slug]` есть только в sitemap и в карточках, но нет **отдельной hub-страницы** со списком всех машин, Google индексирует их хуже.

**Нужно:** Страница каталога (например `/cars` или `/{locale}/cars`) со **ссылками на все машины** (Toyota Yaris, Fiat 500, VW Polo и т.д.).

### Статус в Natali Cars ✅

- Есть страница **`/{locale}/cars`** (например `/en/cars`, `/bg/cars`).
- На ней:
  - **SeoLinksBlock** «All car models» со списком ссылок на все публичные машины: `getCarPath(locale, c.slug)`.
  - **CarGrid** с карточками тех же машин.
- Данные подтягиваются на сервере (`fetchAllCars`), список машин есть в HTML при первом ответе.
- В sitemap есть записи для `/{locale}/cars` и для каждой `/{locale}/cars/[slug]`.

**Итог:** Hub-страница каталога со ссылками на все машины есть; Google может находить страницы машин и по sitemap, и по внутренним ссылкам.

---

## 3️⃣ Страницы только на клиенте (пустой HTML)

**Проблема:** Если контент подгружается только в `useEffect` после JS, в исходном HTML страницы почти ничего нет → хуже индексация.

**Правильно:** Для SEO-страниц — **SSR или SSG**: данные на сервере, полный HTML в ответе.

### Статус в Natali Cars ✅

- **Страницы машин** `/[locale]/cars/[slug]`:
  - **Server Component** (async, без `"use client"`).
  - Данные: `fetchAllCars`, `fetchCarBySlug` и т.д. на сервере.
  - Есть **generateStaticParams** для известных машин (pre-render при сборке).
  - При открытии «View Source» в HTML уже есть контент страницы (заголовки, текст, ссылки).
- **Страница каталога** `/[locale]/cars`:
  - Тоже Server Component, `fetchAllCars` на сервере, список машин и ссылки в первом HTML.
- **Локации, SEO-landing, hub** — серверный рендер и/или generateStaticParams.

**Итог:** Критичные для SEO страницы (машины, каталог, локации) отдаются с полным HTML с сервера, не «пустые» до загрузки JS.

---

## Дубли между языками и hreflang

**Проблема:** Один и тот же текст на `/bg/page` и `/en/page` без разметки языков даёт дубликаты.

**Решение:** Корректные **hreflang** + **x-default**.

### Статус в Natali Cars ✅

- В `buildBaseMetadata()` для всех страниц вызывается **buildHreflangAlternates(alternatePathsByLocale)**.
- В метаданные попадают `alternates.languages` с **абсолютными URL** для каждой локали и **x-default** (default locale).
- Страница каталога `/[locale]/cars` после правки тоже использует **buildHreflangAlternates** (в т.ч. x-default).

**Итог:** У мультиязычных страниц есть hreflang и x-default, дубли между языками помечены корректно.

---

## Чек-лист «что проверить первым»

| Проверка | Статус |
|----------|--------|
| 1. Canonical generation | ✅ Абсолютные URL, с локалью, через `toAbsoluteUrl`. |
| 2. Hreflang | ✅ Есть у всех [locale] страниц, есть x-default. |
| 3. Sitemap | ✅ Только индексные страницы; юридические/админка исключены. |
| 4. Robots | ✅ noindex для cookie/privacy/terms/rental-terms, admin, login. |
| 5. Cars hub page | ✅ `/{locale}/cars` со списком ссылок на все машины + CarGrid. |
| 6. SSR/SSG страниц машин | ✅ Server Components, generateStaticParams, полный HTML в ответе. |

---

## Как быстро проверить у себя

1. **Canonical:** Открыть любую страницу (например `/bg/cars/toyota-yaris`) → View Source → найти `<link rel="canonical"`. Должен быть полный URL с доменом и путём с локалью.
2. **Внутренние ссылки на машины:** Открыть `https://natali-cars.com/en/cars` (или другой locale) → в исходном HTML должен быть блок со ссылками на все модели (Toyota Yaris, Fiat 500 и т.д.).
3. **Не пустой HTML:** Открыть `https://natali-cars.com/en/cars/toyota-yaris` → View Source. В HTML уже должен быть текст страницы (название модели, описание и т.д.), а не только разметка и скрипты.

Если все три пункта выполняются — база для индексации и мультиязычности у Natali Cars в порядке.
