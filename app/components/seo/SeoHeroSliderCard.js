"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Stack } from "@mui/material";
import Image from "next/image";

const AUTO_MS = 6000;

export default function SeoHeroSliderCard({
  title,
  paragraphs = [],
  imageUrls = [],
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
            alt=""
            fill
            priority={i === 0}
            style={{ objectFit: "cover" }}
          />
        </Box>
      ))}

      {/* OVERLAY */}
      <Box
        sx={(theme) => ({
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, 
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
        }}
      >
        <Box sx={{ maxWidth: 680 }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            {title}
          </Typography>

          {paragraphs.map((p, i) => (
            <Typography
              key={i}
              variant="body1"
              sx={{
                opacity: 0.9,
                lineHeight: 1.7,
                mb: 1.5,
              }}
            >
              {p}
            </Typography>
          ))}
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