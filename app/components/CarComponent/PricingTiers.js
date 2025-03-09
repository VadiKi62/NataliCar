import React from "react";
import { Paper, Stack, Typography, Divider } from "@mui/material";
import dayjs from "dayjs";
import { seasons } from "@utils/companyData";
import { useTranslation } from "@node_modules/react-i18next";

// Function to get the current season (same as above)
const getCurrentSeason = () => {
  const today = dayjs();
  const currentYear = today.year();

  for (const [season, range] of Object.entries(seasons)) {
    const startDate = dayjs(`${range.start}/${currentYear}`, "DD/MM/YYYY");
    const endDate = dayjs(`${range.end}/${currentYear}`, "DD/MM/YYYY");

    if (today.isAfter(startDate) && today.isBefore(endDate)) {
      return season;
    }
  }

  return "NoSeason"; // Default season
};

// PricingDisplay component to show current season pricing
const PricingDisplay = ({ prices }) => {
  const { t } = useTranslation();
  const currentSeason = getCurrentSeason(); // Get current season
  const pricingData = prices[currentSeason].days || {}; // Get the days and amounts for the current season

  return (
    <>
      {" "}
      <Typography>
        {t("car.pricesFor")} - {currentSeason} ({t("basic.from")}{" "}
        {seasons[currentSeason].start} {t("basic.till")}{" "}
        {seasons[currentSeason].end})
      </Typography>
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 1.8, sm: 3 },
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          backgroundColor: "secondary.light",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: 0,
          }}
        >
          {/* Map over the day tiers and prices */}
          {Object.entries(pricingData).map(([days, amount], index) => (
            <React.Fragment key={index}>
              <Stack direction="column" alignItems="center">
                <Typography
                  sx={{
                    lineHeight: { xs: "0.9rem", sm: "0.9rem" },
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    mb: 1,
                  }}
                >
                  {t("car.upTo", { days: days })}
                </Typography>

                <Typography
                  sx={{
                    lineHeight: { xs: "1rem", sm: "1.2rem" },
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                  }}
                  color="primary"
                >
                  ${amount}
                </Typography>
              </Stack>

              {/* Divider between prices */}
              {index + 1 < Object.entries(pricingData).length && (
                <Divider orientation="vertical" flexItem />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Paper>
    </>
  );
};

export default PricingDisplay;
