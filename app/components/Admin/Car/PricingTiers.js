import React, { useState, useCallback, useEffect } from "react";
import { Grid, Typography, CircularProgress, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import { seasons } from "@utils/companyData";
import { updateCar } from "@utils/action";

const getSeasonDates = (season) => {
  const dates = seasons[season];
  return dates
    ? `${dates.start} - ${dates.end}`
    : `Season "${season}" not found`;
};

const PricingTiersTable = ({
  car = {},
  handleChange,
  disabled,
  isAddcar = false,
  defaultPrices = {},
}) => {
  const [rows, setRows] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState({});
  const prices = isAddcar ? defaultPrices : car?.pricingTiers;

  useEffect(() => {
    // console.log("prices :", prices);

    if (prices) {
      const data = Object.entries(prices).map(([season, pricing]) => ({
        id: season,
        season,
        seasonDates: getSeasonDates(season),
        ...Object.entries(pricing.days).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [`days${key}`]: value || 0,
          }),
          {}
        ),
      }));
      setRows(data);
    }
  }, [isAddcar, prices]);

  const debouncedUpdate = useCallback(
    debounce(async (updatedCarData) => {
      try {
        await updateCar(updatedCarData);
        setPendingUpdates({});
      } catch (error) {
        console.error("Failed to update car:", error);
      }
    }, 1000),
    []
  );

  const handlePricingTierChange = useCallback(
    (season, day, newPrice) => {
      setPendingUpdates((prev) => ({
        ...prev,
        [`${season}-${day}`]: true,
      }));

      // Update the car data and notify parent
      const updatedCarData = {
        ...car,
        pricingTiers: {
          ...car.pricingTiers,
          [season]: {
            ...car.pricingTiers[season],
            days: {
              ...car.pricingTiers[season].days,
              [day]: parseFloat(newPrice),
            },
          },
        },
      };
      // console.log("UPDATED CARDATA", updatedCarData);
      handleChange({
        target: { name: "pricingTiers", value: updatedCarData.pricingTiers },
      });
      if (!isAddcar) {
        debouncedUpdate(updatedCarData);
      } else {
        setPendingUpdates({});
      }
    },
    [car, debouncedUpdate, handleChange]
  );

  // console.log("Prices", prices);
  const columns = [
    { field: "season", headerName: "Season", width: 150 },
    { field: "seasonDates", headerName: "Season Dates", width: 200 },
    ...Object.keys(prices?.[Object.keys(prices)[0]]?.days || {}).map(
      (dayKey) => ({
        field: `days${dayKey}`,
        headerName:
          dayKey <= 5 ? "1-4 days" : dayKey <= 7 ? "7-14 days" : "14+ days",
        type: "number",
        width: 120,
        editable: true,
        renderCell: (params) => {
          const isUpdating = pendingUpdates[`${params.row.season}-${dayKey}`];
          return (
            <Box sx={{ position: "relative", opacity: isUpdating ? 0.5 : 1 }}>
              {params.value}
              {isUpdating && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={20} />
                </Box>
              )}
            </Box>
          );
        },
      })
    ),
  ];

  const handleRowUpdate = (newRow, oldRow) => {
    if (JSON.stringify(newRow) !== JSON.stringify(oldRow)) {
      Object.keys(newRow).forEach((key) => {
        if (key.startsWith("days") && newRow[key] !== oldRow[key]) {
          const day = key.replace("days", "");
          handlePricingTierChange(newRow.season, day, newRow[key]);
        }
      });
    }
    return newRow;
  };

  return (
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Цены:
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={handleRowUpdate}
        disableRowSelectionOnClick
        loading={disabled}
        hideFooter
      />
    </Grid>
  );
};

export default PricingTiersTable;
