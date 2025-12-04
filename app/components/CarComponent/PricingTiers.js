import React, { useState, useEffect } from "react";
import { Paper, Stack, Typography, Divider } from "@mui/material";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { seasons } from "@utils/companyData";
import { useTranslation } from "@node_modules/react-i18next";

// Function to get the current season (same as above)
// const getCurrentSeason = (date = dayjs()) => {
//   const currentYear = date.year();

//   for (const [season, range] of Object.entries(seasons)) {
//     const startDate = dayjs(`${range.start}/${currentYear}`, "DD/MM/YYYY");
//     const endDate = dayjs(`${range.end}/${currentYear}`, "DD/MM/YYYY");

//     if (date.isAfter(startDate) && date.isBefore(endDate)) {
//       return season;
//     }
//   }

//   return "NoSeason";
// };
const getCurrentSeason = (date = dayjs()) => {
  // Если date не задана (или это текущий месяц), используем первый день месяца
  // Если date — это выбранная дата бронирования, используем её
  let targetDate;
  if (!date || dayjs(date).isSame(dayjs(), "month")) {
    targetDate = dayjs().startOf("month");
  } else {
    targetDate = dayjs(date);
  }
  const currentYear = targetDate.year();

  for (const [season, range] of Object.entries(seasons)) {
    const startDate = dayjs(`${range.start}/${currentYear}`, "DD/MM/YYYY");
    const endDate = dayjs(`${range.end}/${currentYear}`, "DD/MM/YYYY");

    // Включаем граничные даты сезона
    if (
      targetDate.isSameOrAfter(startDate, "day") &&
      targetDate.isSameOrBefore(endDate, "day")
    ) {
      return season;
    }
  }

  return "NoSeason"; // Default season
};

// const getCurrentSeason = () => {
//   const today = dayjs();
//   const currentYear = today.year();

//   for (const [season, range] of Object.entries(seasons)) {
//     const startDate = dayjs(`${range.start}/${currentYear}`, "DD/MM/YYYY");
//     const endDate = dayjs(`${range.end}/${currentYear}`, "DD/MM/YYYY");

//     if (today.isAfter(startDate) && today.isBefore(endDate)) {
//       return season;
//     }
//   }

//   return "NoSeason"; // Default season
// };

// PricingDisplay component to show current season pricing
// const PricingDisplay = ({ prices }) => {
//   const { t } = useTranslation();
//   const currentSeason = getCurrentSeason(); // Get current season
//   const pricingData = prices[currentSeason].days || {}; // Get the days and amounts for the current season
const PricingDisplay = ({
  prices,
  selectedDate,
  discount,
  discountStart,
  discountEnd,
}) => {
  const seasonDate = selectedDate ? dayjs(selectedDate) : dayjs();
  // Проверка скидки: для будущих месяцев используем весь месяц,
  // для текущего месяца — диапазон от сегодня (включительно) до конца месяца.
  const isCurrentMonth = seasonDate.isSame(dayjs(), "month");
  const monthStart = seasonDate.startOf("month");
  const monthEnd = seasonDate.endOf("month");
  const rangeStart = isCurrentMonth ? dayjs().startOf("day") : monthStart;
  let discountType = "none"; // 'full', 'partial', 'none'
  if (
    typeof discount === "number" &&
    discount > 0 &&
    discountStart &&
    discountEnd
  ) {
    // Полное покрытие выбранного диапазона
    if (
      rangeStart.isSameOrAfter(discountStart, "day") &&
      monthEnd.isSameOrBefore(discountEnd, "day")
    ) {
      discountType = "full";
    } else if (
      // Пересечение выбранного диапазона со скидкой
      monthEnd.isSameOrAfter(discountStart, "day") &&
      rangeStart.isSameOrBefore(discountEnd, "day")
    ) {
      discountType = "partial";
    } else {
      discountType = "none";
    }
  }
  const { t } = useTranslation();
  const currentSeason = getCurrentSeason(seasonDate);
  const pricingData = prices[currentSeason]?.days || {};

  // Helper function для формирования шапки таблицы цен при аренде авто
  const getDayRangeText = (days) => {
    const daysNum = Number(days); // Явное преобразование в число
    //console.log("1. Читаем из Tiers:", days, daysNum);
    //if (daysNum >= 1 && daysNum <= 4) return t("carPark.1-4days");
    if (daysNum === 4) return t("carPark.1-4days");
    if (daysNum === 7) return t("carPark.5-14days");
    if (daysNum === 14) return t("carPark.14+days"); // Явное условие для >14

    return ""; // Запасной вариант
  };

  return (
    <>
      {" "}
      <Typography>
        {t("car.pricesFor")} {currentSeason} ({t("basic.from")}{" "}
        {seasons[currentSeason].start} {t("basic.till")}{" "}
        {seasons[currentSeason].end})
      </Typography>
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 1.2, sm: 2 }, // Уменьшили отступы для более компактного вида
          "@media (max-width:900px) and (orientation: landscape)": {
            padding: 0.6,
          },
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
          {Object.entries(pricingData).map(([days, amount], index) => {
            const discountedPrice = Math.round(
              amount * (1 - (discount || 0) / 100)
            );
            let priceDisplay;
            if (discountType === "full") {
              // Скидка действует весь месяц
              priceDisplay = (
                <>
                  <span>€{discountedPrice}</span>
                </>
              );
            } else if (discountType === "partial") {
              // Скидка действует частично
              priceDisplay = (
                <>
                  <span>€{discountedPrice}</span>
                  <span style={{ margin: "0 6px" }}> - </span>
                  <span>€{amount}</span>
                  {/* <span style={{ color: '#388e3c', marginLeft: 4 }}>
                    ({discount}% скидка частично)
                  </span> */}
                </>
              );
            } else {
              // Скидка не действует
              priceDisplay = <>{`€${amount}`}</>;
            }
            return (
              <React.Fragment key={index}>
                <Stack direction="column" alignItems="center">
                  <Typography
                    sx={{
                      lineHeight: { xs: "0.9rem", sm: "0.9rem" },
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      "@media (max-width:900px) and (orientation: landscape)": {
                        fontSize: "0.7rem",
                        lineHeight: "0.8rem",
                      },
                      mb: 1,
                    }}
                  >
                    {getDayRangeText(days)}
                  </Typography>
                  <Typography
                    sx={{
                      lineHeight: { xs: "1rem", sm: "1.2rem" },
                      fontSize: { xs: "1rem", sm: "1.2rem" },
                      "@media (max-width:900px) and (orientation: landscape)": {
                        fontSize: "0.95rem",
                        lineHeight: "1rem",
                      },
                    }}
                    color="primary"
                  >
                    {priceDisplay}
                  </Typography>
                </Stack>
                {/* Divider between prices */}
                {index + 1 < Object.entries(pricingData).length && (
                  <Divider orientation="vertical" flexItem />
                )}
              </React.Fragment>
            );
          })}
        </Stack>
      </Paper>
    </>
  );
};

export default PricingDisplay;
