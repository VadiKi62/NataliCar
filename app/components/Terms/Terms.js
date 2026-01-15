"use client";
import React, { useMemo } from "react";
import { Container } from "@mui/material";
import { terms } from "@app/data/terms";
import ApplyStyle from "@/app/components/ui/ApplyStyle";

import { useMainContext } from "@app/Context";

function Terms() {
  const { lang } = useMainContext();

  console.log(terms);

  // Ensure terms and terms[lang] are valid objects
  const termsLang = terms[lang] || terms["en"];

  return (
    <Container sx={{ my: 17 }}>
      {Object.entries(termsLang).map(([sectionKey, sectionValue]) => {
        return (
          <div key={sectionKey}>{ApplyStyle(sectionKey, sectionValue)}</div>
        );
      })}
    </Container>
  );
}

export default Terms;
