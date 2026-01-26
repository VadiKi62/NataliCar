import React from "react";
import Link from "@mui/material/Link";

/**
 * Renders a conflict message where any occurrence of
 * "Настройки буфера" (with or without ⚙️) becomes a clickable link.
 *
 * IMPORTANT:
 * - Does not change wording, only link rendering.
 * - Keeps original text segments intact.
 */
export function BufferSettingsLinkifiedText({ text, onOpen }) {
  if (!text) return null;
  if (typeof text !== "string") return text;

  // Match the exact UX phrase, optionally prefixed by the gear icon.
  // We keep the token as-is, and only wrap it with a Link.
  const tokenRe = /(⚙️\s*Настройки буфера|Настройки буфера)/g;
  const parts = text.split(tokenRe);

  // If no matches, render as plain text
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, idx) => {
        const isToken =
          part === "Настройки буфера" ||
          part === "⚙️ Настройки буфера" ||
          part === "⚙️  Настройки буфера";

        if (!isToken) return <React.Fragment key={idx}>{part}</React.Fragment>;

        // If no handler provided, keep text as-is (safety).
        if (!onOpen) return <React.Fragment key={idx}>{part}</React.Fragment>;

        return (
          <Link
            key={idx}
            component="button"
            type="button"
            underline="always"
            onClick={(e) => {
              e.preventDefault();
              onOpen();
            }}
            sx={{ typography: "inherit" }}
          >
            {part}
          </Link>
        );
      })}
    </>
  );
}

