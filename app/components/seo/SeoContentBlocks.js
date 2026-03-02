import Link from "next/link";

export function SeoIntroBlock({ title, introText }) {
  return (
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "32px 16px 8px" }}>
      <h1 style={{ marginBottom: 12 }}>{title}</h1>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{introText}</p>
    </section>
  );
}

export function SeoLinksBlock({ title, links }) {
  if (!links || links.length === 0) return null;

  return (
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "8px 16px" }}>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SeoSingleLinkBlock({ title, href, label }) {
  if (!href || !label) return null;

  return (
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "8px 16px" }}>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <p style={{ margin: 0 }}>
        <Link href={href}>{label}</Link>
      </p>
    </section>
  );
}

export function SeoPickupGuidanceBlock({ title, pickupGuidance }) {
  if (!pickupGuidance || !pickupGuidance.trim()) return null;

  return (
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "16px 16px 8px" }}>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{pickupGuidance}</p>
    </section>
  );
}

export function SeoNearbyPlacesBlock({ title, nearbyPlaces }) {
  if (!nearbyPlaces || nearbyPlaces.length === 0) return null;

  return (
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "8px 16px" }}>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
        {nearbyPlaces.map((place, i) => (
          <li key={i}>{place}</li>
        ))}
      </ul>
    </section>
  );
}

export function SeoFaqBlock({ title, faq }) {
  if (!faq || faq.length === 0) return null;

  return (
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "8px 16px 16px" }}>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <ul style={{ margin: 0, paddingLeft: 20, listStyle: "none" }}>
        {faq.map((item, i) => (
          <li key={i} style={{ marginBottom: 12 }}>
            <strong style={{ display: "block", marginBottom: 4 }}>{item.question}</strong>
            <span style={{ lineHeight: 1.6 }}>{item.answer}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SeoLocationCtaBlock({ href, label }) {
  if (!href || !label) return null;

  return (
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          padding: "12px 24px",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </Link>
    </section>
  );
}
