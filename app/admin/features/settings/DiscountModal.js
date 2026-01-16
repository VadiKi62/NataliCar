"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Slider,
} from "@mui/material";

/**
 * DiscountModal - Admin-only component for setting discount dates
 * Heavy date picker libraries are lazy-loaded only when modal opens
 * 
 * Location: admin/features/settings/ (admin-only bundle)
 */
export default function DiscountModal({
  open,
  onClose,
  selectedDiscount,
  setSelectedDiscount,
  discountStartDate,
  setDiscountStartDate,
  discountEndDate,
  setDiscountEndDate,
  onSave,
}) {
  // Lazy load all date picker dependencies only when modal opens
  const [DatePicker, setDatePicker] = React.useState(null);
  const [LocalizationProvider, setLocalizationProvider] = React.useState(null);
  const [DateAdapter, setDateAdapter] = React.useState(null);
  const [locale, setLocale] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && !DatePicker && !LocalizationProvider) {
      // Load all date picker libraries only when modal opens for the first time
      setIsLoading(true);
      Promise.all([
        import("@mui/x-date-pickers/DatePicker").then((mod) => mod.DatePicker),
        import("@mui/x-date-pickers/LocalizationProvider").then((mod) => mod.LocalizationProvider),
        import("@mui/x-date-pickers/AdapterDateFnsV3").then((mod) => mod.default),
        import("date-fns/locale/ru").then((mod) => mod.default),
      ])
        .then(([DatePickerComponent, LocalizationProviderComponent, adapter, ruLocale]) => {
          setDatePicker(() => DatePickerComponent);
          setLocalizationProvider(() => LocalizationProviderComponent);
          setDateAdapter(() => adapter);
          setLocale(ruLocale);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load date picker libraries:", err);
          setIsLoading(false);
        });
    }
  }, [open, DatePicker, LocalizationProvider]);

  if (!open) {
    return null; // Don't render anything when modal is closed
  }

  if (isLoading || !DatePicker || !LocalizationProvider || !DateAdapter || !locale) {
    // Loading state - date picker libraries are being loaded
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm">
        <DialogContent>
          <Typography>Загрузка...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        sx: { minHeight: 400, minWidth: 350 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        Выбор скидки: {selectedDiscount}%
      </DialogTitle>
      <DialogContent sx={{ minWidth: 350, pb: 3, pt: 3 }}>
        <LocalizationProvider dateAdapter={DateAdapter} adapterLocale={locale}>
          <Box sx={{ mb: 3, mt: 6 }}>
            <DatePicker
              label="Дата начала скидки"
              value={discountStartDate}
              disablePast
              minDate={new Date()}
              onChange={(newValue) => {
                if (!newValue) {
                  setDiscountStartDate(null);
                  return;
                }
                const d = new Date(
                  newValue.getFullYear(),
                  newValue.getMonth(),
                  newValue.getDate()
                );
                const today = new Date();
                const todayStart = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate()
                );
                if (d < todayStart) return;
                setDiscountStartDate(d);
                if (discountEndDate) {
                  const endLocal = new Date(
                    discountEndDate.getFullYear(),
                    discountEndDate.getMonth(),
                    discountEndDate.getDate()
                  );
                  if (endLocal <= d) setDiscountEndDate(null);
                }
              }}
              inputFormat="dd.MM.yyyy"
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  sx={{ mt: 2 }}
                />
              )}
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <DatePicker
              label="Дата окончания скидки"
              value={discountEndDate}
              disablePast
              minDate={
                discountStartDate
                  ? new Date(
                      discountStartDate.getFullYear(),
                      discountStartDate.getMonth(),
                      discountStartDate.getDate() + 1
                    )
                  : (() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow;
                    })()
              }
              onChange={(newValue) => {
                if (!newValue) {
                  setDiscountEndDate(null);
                  return;
                }
                const d = new Date(
                  newValue.getFullYear(),
                  newValue.getMonth(),
                  newValue.getDate()
                );
                if (discountStartDate) {
                  const startLocal = new Date(
                    discountStartDate.getFullYear(),
                    discountStartDate.getMonth(),
                    discountStartDate.getDate()
                  );
                  if (d <= startLocal) return;
                }
                const today = new Date();
                const todayStart = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate()
                );
                if (d <= todayStart) return;
                setDiscountEndDate(d);
              }}
              inputFormat="dd.MM.yyyy"
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  sx={{ mt: 2 }}
                />
              )}
            />
          </Box>
        </LocalizationProvider>

        <Typography gutterBottom sx={{ mt: 6, mb: 5 }}>
          Скидка на аренду (%):
        </Typography>
        <Slider
          value={selectedDiscount}
          onChange={(e, value) => setSelectedDiscount(value)}
          valueLabelDisplay="on"
          step={5}
          marks
          min={0}
          max={100}
          sx={{ width: "100%", mt: 1, maxWidth: 300 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        <Button variant="contained" onClick={onSave}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
