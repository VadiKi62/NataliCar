"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Stack } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import ActionButton from "@/app/components/ui/buttons/ActionButton";

const AUTO_MS = 6000;

// Matches Feed mainPt so hero sits under nav with no white stripe
const HERO_TOP_PADDING = { xs: "110px", md: "90px" };
const HERO_NEGATIVE_MARGIN = { xs: "-110px", md: "-90px" };

export default function SeoHeroSliderCard({
  title,
  paragraphs = [],
  imageUrls = [],
  imageAlt = "",
  ctaHref,
  ctaLabel,
  fullBleedUnderNav = false,
}) {
  const images =
    Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls
      : [];

  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, AUTO_MS);

    return () => clearInterval(intervalRef.current);
  }, [images.length]);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: { xs: 420, md: 520 },
        overflow: "hidden",
        ...(fullBleedUnderNav && { mt: HERO_NEGATIVE_MARGIN }),
      }}
    >
      {/* SLIDES */}
      {images.map((src, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        >
          <Image
            src={src}
            alt={imageAlt}
            fill
            priority={i === 0}
            style={{ objectFit: "cover" }}
          />
        </Box>
      ))}

      {/* OVERLAY: dark gradient from right so white text is readable */}
      <Box
        sx={(theme) => ({
          position: "absolute",
          inset: 0,
          background: `linear-gradient(270deg, 
            ${theme.palette.common.black}CC 0%, 
            ${theme.palette.common.black}88 40%, 
            transparent 75%)`,
        })}
      />

      {/* CONTENT */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1200,
          mx: "auto",
          px: 3,
          py: { xs: 6, md: 10 },
          color: "common.white",
          display: "flex",
          justifyContent: "flex-end",
          ...(fullBleedUnderNav && { pt: HERO_TOP_PADDING }),
        }}
      >
        <Box sx={{ maxWidth: 680, textAlign: "right" }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              mb: 2,
              color: "common.white",
            }}
          >
            {title}
          </Typography>

          {paragraphs.map((p, i) => (
            <Typography
              key={i}
              variant="body1"
              sx={{
                opacity: 0.92,
                lineHeight: 1.7,
                mb: 1.5,
                color: "common.white",
              }}
            >
              {p}
            </Typography>
          ))}
          {ctaHref && ctaLabel && (
            <Box sx={{ mt: 3 }}>
              <ActionButton
                component={Link}
                href={ctaHref}
                label={ctaLabel}
                color="primary"
                variant="contained"
                size="large"
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* DOTS */}
      {images.length > 1 && (
        <Stack
          direction="row"
          justifyContent="center"
          spacing={1}
          sx={{
            position: "absolute",
            bottom: 24,
            left: 0,
            right: 0,
            zIndex: 3,
          }}
        >
          {images.map((_, i) => (
            <Box
              key={i}
              onClick={() => setIndex(i)}
              sx={(theme) => ({
                width: 10,
                height: 10,
                borderRadius: "50%",
                cursor: "pointer",
                bgcolor:
                  i === index
                    ? theme.palette.primary.main
                    : "rgba(255,255,255,0.5)",
                transition: "all 0.3s ease",
              })}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}