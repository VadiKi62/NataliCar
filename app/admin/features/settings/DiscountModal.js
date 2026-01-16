"use client";

import React from "react";
import {
  Button,
  Box,
  Typography,
  Slider,
  CircularProgress,
} from "@mui/material";
import DialogLayout from "@/app/components/ui/modals/DialogLayout";

/**
 * DiscountModal - Admin-only component for setting discount dates
 * Heavy date picker libraries are lazy-loaded only when modal opens
 * 
 * Location: admin/features/settings/ (admin-only bundle)
 * 
 * NOTE: DialogLayout.loading используется ТОЛЬКО для UX-действий (сохранение).
 * Lazy-loading библиотек обрабатывается внутренним placeholder в children.
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
  const [dayjs, setDayjs] = React.useState(null);

  React.useEffect(() => {
    if (open && !DatePicker && !LocalizationProvider) {
      // Load all date picker libraries only when modal opens for the first time
      Promise.all([
        // Используем DesktopDatePicker для компактного выпадающего календаря
        import("@mui/x-date-pickers/DesktopDatePicker").then((mod) => mod.DesktopDatePicker || mod.default),
        import("@mui/x-date-pickers/LocalizationProvider").then((mod) => mod.LocalizationProvider || mod.default),
        import("@mui/x-date-pickers/AdapterDayjs").then((mod) => mod.AdapterDayjs || mod.default),
        import("dayjs/locale/ru").then((mod) => mod.default || mod.ru),
        import("dayjs").then((mod) => mod.default),
      ])
        .then(([DatePickerComponent, LocalizationProviderComponent, adapter, ruLocale, dayjsLib]) => {
          // Проверяем, что все компоненты загружены
          if (DatePickerComponent && LocalizationProviderComponent && adapter && ruLocale && dayjsLib) {
            setDatePicker(() => DatePickerComponent);
            setLocalizationProvider(() => LocalizationProviderComponent);
            setDateAdapter(() => adapter);
            setLocale(ruLocale);
            setDayjs(() => dayjsLib);
          } else {
            console.error("Some date picker components failed to load:", {
              DatePickerComponent: !!DatePickerComponent,
              LocalizationProviderComponent: !!LocalizationProviderComponent,
              adapter: !!adapter,
              ruLocale: !!ruLocale,
              dayjs: !!dayjsLib,
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load date picker libraries:", err);
        });
    }
  }, [open, DatePicker, LocalizationProvider]);

  if (!open) {
    return null; // Don't render anything when modal is closed
  }

  const isReady = DatePicker && LocalizationProvider && DateAdapter && locale && dayjs;

  return (
    <DialogLayout
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={`Выбор скидки: ${selectedDiscount}%`}
      showCloseButton={true}
      closeOnBackdropClick={false}
      closeOnEscape={false}
      // loading НЕ используется для lazy-import — только для UX-действий
      contentSx={{ minWidth: 350, pb: 3, pt: 3 }}
      sx={{
        "& .MuiDialog-paper": {
          minHeight: 400,
          minWidth: 350,
        },
      }}
    >
      {/* Внутренний placeholder пока библиотеки загружаются */}
      {!isReady ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <LocalizationProvider dateAdapter={DateAdapter} adapterLocale={locale}>
            <Box sx={{ mb: 3, mt: 2 }}>
              <DatePicker
                label="Дата начала скидки"
                value={discountStartDate ? dayjs(discountStartDate) : null}
                disablePast
                minDate={dayjs()}
                onChange={(newValue) => {
                  if (!newValue) {
                    setDiscountStartDate(null);
                    return;
                  }
                  const d = newValue.toDate();
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
                format="DD.MM.YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    sx: { mt: 2 },
                  },
                }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <DatePicker
                label="Дата окончания скидки"
                value={discountEndDate ? dayjs(discountEndDate) : null}
                disablePast
                minDate={
                  discountStartDate
                    ? dayjs(discountStartDate).add(1, "day")
                    : dayjs().add(1, "day")
                }
                onChange={(newValue) => {
                  if (!newValue) {
                    setDiscountEndDate(null);
                    return;
                  }
                  const d = newValue.toDate();
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
                format="DD.MM.YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    sx: { mt: 2 },
                  },
                }}
              />
            </Box>
          </LocalizationProvider>

          <Typography gutterBottom sx={{ mt: 4, mb: 3 }}>
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
        
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button onClick={onClose}>Закрыть</Button>
            <Button variant="contained" onClick={onSave}>
              Сохранить
            </Button>
          </Box>
        </>
      )}
    </DialogLayout>
  );
}
