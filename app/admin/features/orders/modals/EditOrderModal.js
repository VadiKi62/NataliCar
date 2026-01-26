import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  useTheme,
} from "@mui/material";
import { ConfirmButton, CancelButton, DeleteButton, ActionButton } from "@/app/components/ui";
import { RenderTextField } from "@/app/components/ui/inputs/Fields";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import Snackbar from "@/app/components/ui/feedback/Snackbar";
import { useMainContext } from "@app/Context";
import TimePicker from "@/app/components/calendar-ui/MuiTimePicker";
import { BufferSettingsLinkifiedText } from "@/app/components/ui";
import { companyData } from "@utils/companyData";
import { useEditOrderConflicts } from "../hooks/useEditOrderConflicts";
import { useEditOrderPermissions } from "../hooks/useEditOrderPermissions";
import { useEditOrderState } from "../hooks/useEditOrderState";
import { useSession } from "next-auth/react";
import { isSuperAdmin } from "@/domain/orders/admin-rbac";
// 🎯 Athens timezone utilities — ЕДИНСТВЕННЫЙ источник правды для времени
import {
  ATHENS_TZ,
  fromServerUTC,
  createAthensDateTime,
  toServerUTC,
  formatTimeHHMM,
  formatDateYYYYMMDD,
  athensNow,
} from "@/domain/time/athensTime";
// 🎯 Утилита для проверки возможности подтверждения заказа
import { canPendingOrderBeConfirmed } from "@/domain/booking/analyzeConfirmationConflicts";
// 🎯 Модальное окно настройки буфера
import BufferSettingsModal from "@/app/admin/features/settings/BufferSettingsModal";
import { ORDER_COLORS } from "@/config/orderColors";

import {
  toggleConfirmedStatus,
  getConfirmedOrders,
} from "@utils/action";
import { RenderSelectField } from "@/app/components/ui/inputs/Fields";
import { useTranslation } from "react-i18next";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// ⚠️ УДАЛЁН: timeZone константа и dayjs.tz.setDefault()
// Теперь используем athensTime.js для всей работы с таймзонами

/**
 * PRICE ARCHITECTURE HELPER
 * 
 * Returns the effective price used by UI, invoices, and payments
 * effectivePrice = OverridePrice !== null ? OverridePrice : totalPrice
 */
const getEffectivePrice = (order) => {
  if (!order) return 0;
  // If OverridePrice is set (not null/undefined), use it
  if (order.OverridePrice !== null && order.OverridePrice !== undefined) {
    return Number(order.OverridePrice);
  }
  // Otherwise use auto-calculated totalPrice
  return Number(order.totalPrice) || 0;
};

const EditOrderModal = ({
  open,
  onClose,
  order,
  onSave,
  setCarOrders,
  isConflictOrder,
  setIsConflictOrder,
  startEndDates,
  cars, // <-- список автомобилей
  isViewOnly, // <-- режим просмотра (передаётся из BigCalendar для завершённых заказов)
}) => {
  const { allOrders, fetchAndUpdateOrders, company, pendingConfirmBlockById } = useMainContext();
  const { data: session } = useSession();
  const { t } = useTranslation();
  
  // Get current user for permission checks
  const currentUser = useMemo(() => {
    if (!session?.user?.isAdmin) return null;
    return {
      isAdmin: true,
      role: session.user.role,
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    };
  }, [session]);
  
  // 🎯 LAYER 1: Permissions (Domain/Logic Layer)
  const permissions = useEditOrderPermissions(order, currentUser, isViewOnly);
  
  // 🎯 LAYER 2: State & Data Orchestration Layer
  const {
    editedOrder,
    startTime,
    endTime,
    loading,
    isUpdating,
    setIsUpdating,
    updateMessage,
    attemptedSave,
    setAttemptedSave,
    calcLoading,
    selectedCar,
    updateField,
    updateStartDate,
    updateEndDate,
    updateStartTime,
    updateEndTime,
    handleSave,
    handleDelete,
    setUpdateMessage,
  } = useEditOrderState({
    order,
    cars,
    company,
    permissions,
    onSave,
    onClose,
    fetchAndUpdateOrders,
    setCarOrders,
  });
  
  // UI state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Сегодня (Athens timezone) для ограничения выбора начала аренды
  const todayStr = athensNow().format("YYYY-MM-DD");
  const locations = company.locations.map((loc) => loc.name);

  // Conflict check for conflict order badge
  useEffect(() => {
    if (order?.hasConflictDates) {
      const ordersIdSet = new Set(order?.hasConflictDates);
      const checkConflicts = async () => {
        const isConflict = await getConfirmedOrders([...ordersIdSet]);
        if (isConflict) {
          setIsConflictOrder(true);
        }
      };
      checkConflicts();
    }
  }, [order, setIsConflictOrder]);

  // handleDelete is now provided by useEditOrderState hook

  // --- Централизованный анализ конфликтов времени ---

  const {
    pickupSummary,
    returnSummary,
    hasBlockingConflict,
  } = useEditOrderConflicts({
    allOrders,
    editingOrder: order,
    carId: editedOrder?.car,
    pickupDate: editedOrder?.rentalStartDate,
    pickupTime: startTime,
    returnDate: editedOrder?.rentalEndDate,
    returnTime: endTime,
    company,
  });
  
  // State для модального окна настройки буфера
  const [bufferModalOpen, setBufferModalOpen] = useState(false);

  const onCloseModalEdit = () => {
    onClose();
    // ⚠️ УДАЛЕНЫ: setConflictMessage1/2, setAvailableTimes
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setUpdateMessage(null);
  };

  const showMessage = (message, isError = false) => {
    setUpdateMessage(message);
    setSnackbarOpen(true);
    if (!isError) {
      setTimeout(() => {
        setSnackbarOpen(false);
        setUpdateMessage(null);
      }, 3000);
    }
  };

  // Local state for confirmation toggle (separate from save operation)
  const [confirmToggleUpdating, setConfirmToggleUpdating] = useState(false);

  const handleConfirmationToggle = async () => {
    if (permissions.viewOnly || !permissions.canConfirm) return;
    setConfirmToggleUpdating(true);
    setUpdateMessage(null);
    try {
      const result = await toggleConfirmedStatus(editedOrder._id);

      if (!result.success) {
        setUpdateMessage(result.message);
        return;
      }

      // Update local state
      updateField("confirmed", result.updatedOrder?.confirmed);

      // Show message
      const isWarning = result.level === "warning";
      setUpdateMessage(result.message);
      onSave(result.updatedOrder);

      // Close modal
      setTimeout(() => {
        onClose();
      }, isWarning ? 3000 : 1500);
    } catch (error) {
      console.error("Error toggling confirmation status:", error);
      setUpdateMessage(error.message || "Статус не обновлен. Ошибка сервера.");
    } finally {
      setConfirmToggleUpdating(false);
    }
  };

  // handleOrderUpdate is now handleSave from useEditOrderState hook
  // Keeping old name for backward compatibility in UI
  const handleOrderUpdate = handleSave;

  
  // Dev-only: Permission audit log
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && order && currentUser) {
      console.table(permissions.fieldPermissions);
    }
  }, [order, currentUser, permissions]);

  // Стили для отключенных элементов
  const disabledStyles = {
    opacity: 0.6,
    cursor: "not-allowed",
  };

  const enabledStyles = {
    opacity: 1,
    cursor: "pointer",
  };

  // 🎯 Проверяем, может ли pending заказ быть подтверждён
  // Сначала проверяем precomputed map из контекста (быстро)
  const confirmationCheck = useMemo(() => {
    // Если заказ уже подтверждён — не нужно проверять
    if (editedOrder?.confirmed) {
      return { canConfirm: true, message: null, isBlocked: false };
    }

    // 🚀 Быстрая проверка через precomputed map
    const orderId = editedOrder?._id?.toString();
    const blockMessage = pendingConfirmBlockById?.[orderId];
    
    if (blockMessage) {
      return {
        canConfirm: false,
        message: blockMessage,
        isBlocked: true,
      };
    }

    // Fallback: если map ещё не обновился, пересчитываем
    const sameCarOrders = allOrders.filter((o) => {
      const oCarId = o.car?._id || o.car;
      return oCarId?.toString() === editedOrder?.car?.toString();
    });

    const result = canPendingOrderBeConfirmed({
      pendingOrder: editedOrder,
      allOrders: sameCarOrders,
      bufferHours: company?.bufferTime, // Передаём bufferTime из компании
    });
    
    return {
      ...result,
      isBlocked: !result.canConfirm,
    };
  }, [editedOrder, allOrders, company, pendingConfirmBlockById]);

  // Создаём summary для конфликта подтверждения (для подсветки времени)
  const confirmationConflictSummary = useMemo(() => {
    if (!confirmationCheck || confirmationCheck.canConfirm) {
      return null;
    }
    
    // Если есть информация о времени конфликта, создаём summary
    if (confirmationCheck.conflictTime) {
      return {
        level: "block", // Всегда block для конфликтов подтверждения
        message: confirmationCheck.message,
        conflictTime: confirmationCheck.conflictTime, // "return" или "pickup"
      };
    }
    
    // Fallback: если нет conflictTime, но есть message, создаём summary без указания времени
    return {
      level: "block",
      message: confirmationCheck.message,
    };
  }, [confirmationCheck]);

  // Объединяем конфликт подтверждения с summary для подсветки времени
  const finalPickupSummary = useMemo(() => {
    if (confirmationConflictSummary?.conflictTime === "pickup") {
      // Если конфликт подтверждения относится к pickup времени, объединяем
      return confirmationConflictSummary;
    }
    return pickupSummary;
  }, [confirmationConflictSummary, pickupSummary]);
  
  const finalReturnSummary = useMemo(() => {
    if (confirmationConflictSummary?.conflictTime === "return") {
      // Если конфликт подтверждения относится к return времени, объединяем
      return confirmationConflictSummary;
    }
    return returnSummary;
  }, [confirmationConflictSummary, returnSummary]);

  // Проверка, заблокирована ли кнопка подтверждения
  const isConfirmationDisabled =
    permissions.viewOnly ||
    !permissions.canConfirm ||
    (permissions.isCurrentOrder && editedOrder?.confirmed) ||
    (!editedOrder?.confirmed && !confirmationCheck.canConfirm);

  return (
    <>
      <Paper
        sx={{
          // Адаптивная ширина для разных экранов
          width: { xs: "100%", sm: 500, md: 700 },
          maxWidth: { xs: "95vw", sm: "90%" },
          // Адаптивные отступы
          p: { xs: 1.5, sm: 2, md: 4 },
          pt: { xs: 1, sm: 1.5, md: 2 },
          // Центрирование модального окна
          mx: "auto",
          // Ограничение высоты с учётом мобильных устройств
          maxHeight: { xs: "95vh", sm: "99vh" },
          overflow: "auto",
          // Стили для конфликтных заказов
          border: isConflictOrder ? "4px solid" : "none",
          borderColor: isConflictOrder ? "error.main" : "transparent",
          animation: isConflictOrder ? "pulse 2s infinite" : "none",
          // Скругление углов для мобильных
          borderRadius: { xs: 2, sm: 1 },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography
              variant="h6"
              color="primary.main"
              sx={{ 
                letterSpacing: "-0.5px", 
                fontSize: { xs: "1rem", sm: "1.15rem", md: "1.3rem" },
                textAlign: { xs: "center", sm: "left" },
                mb: { xs: 0.5, sm: 0 },
              }}
            >
              {permissions.viewOnly ? "Просмотреть заказ" : t("order.editOrder")} №
              {order?.orderNumber ? order.orderNumber.slice(2, -2) : ""}
              {(() => {
                // Найти автомобиль по id заказа
                const carObj = cars?.find(
                  (c) => c._id === (order?.car || editedOrder?.car)
                );
                if (carObj) {
                  return ` (${carObj.model} ${carObj.regNumber})`;
                }
                return "";
              })()}
            </Typography>
            {/* Количество дней и стоимость */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: "center", sm: "flex-start" }}
              flexWrap="wrap"
              sx={{ mb: 1, gap: { xs: 0.5, sm: 0 } }}
            >
              <Typography variant="body1">
                {t("order.daysNumber")}{" "}
                <Box
                  component="span"
                  sx={{ color: "primary.dark", fontWeight: 700 }}
                >
                  {editedOrder?.numberOfDays}
                </Box>{" "}
                | {t("order.price")}
              </Typography>
              {(() => {
                /**
                 * PRICE FLOW (IMPORTANT)
                 *
                 * totalPrice
                 *   - ALWAYS auto-calculated price
                 *   - Updated ONLY by backend recalculation
                 *
                 * OverridePrice
                 *   - Manual price set by admin
                 *   - NEVER changed automatically
                 *
                 * effectivePrice =
                 *   OverridePrice !== null ? OverridePrice : totalPrice
                 *
                 * UI rules:
                 * - Inline edit → sets OverridePrice
                 * - Recalculate button → updates totalPrice ONLY
                 * - UI displays effectivePrice
                 * - Admin can reset OverridePrice explicitly
                 */
                const effectivePrice = getEffectivePrice(editedOrder);
                const hasManualOverride = editedOrder?.OverridePrice !== null && editedOrder?.OverridePrice !== undefined;
                
                return (
                  <>
                    <TextField
                      value={
                        effectivePrice !== undefined &&
                        effectivePrice !== null
                          ? effectivePrice
                          : ""
                      }
                      onChange={(e) => {
                        if (permissions.viewOnly || !permissions.fieldPermissions.totalPrice) return;
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        // 🔧 PRICE ARCHITECTURE: Manual input sets OverridePrice
                        updateField("totalPrice", val ? Number(val) : 0, {
                          source: "manual",
                        });
                      }}
                      variant="outlined"
                      size="small"
                      inputProps={{
                        maxLength: 4,
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                      }}
                      InputProps={{
                        endAdornment: (
                          <Box
                            component="span"
                            sx={{
                              fontWeight: 700,
                              fontSize: 18,
                              ml: 0,
                              mr: "-8px",
                              color: "primary.dark",
                            }}
                          >
                            €
                          </Box>
                        ),
                      }}
                      sx={{
                        ml: 1,
                        width: "90px",
                        "& .MuiInputBase-input": {
                          fontWeight: 700,
                          fontSize: 18,
                          textAlign: "right",
                          letterSpacing: 1,
                          width: "5ch",
                          padding: "8px 8px 8px 12px",
                          boxSizing: "content-box",
                          color: "primary.dark",
                        },
                      }}
                      disabled={permissions.viewOnly || !permissions.fieldPermissions.totalPrice}
                    />
                    {/* Visual marker for manual override + button to return to auto */}
                    {hasManualOverride && (
                      <Box sx={{ ml: 1, mt: 0.5 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: "warning.main",
                            fontSize: "0.7rem",
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          ✏️ Manual price (auto: €{editedOrder.totalPrice?.toFixed(2) || "0"})
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            if (permissions.viewOnly || !permissions.fieldPermissions.totalPrice) return;
                            // Return to auto price: use CURRENT totalPrice and clear OverridePrice
                            // This ensures we use the latest calculated price, not a stale one
                            updateField("totalPrice", editedOrder.totalPrice, {
                              source: "auto",
                              clearOverride: true,
                            });
                          }}
                          sx={{
                            fontSize: "0.65rem",
                            py: 0.25,
                            px: 1,
                            minWidth: "auto",
                          }}
                        >
                          Вернуть автоматическую цену
                        </Button>
                      </Box>
                    )}
                  </>
                );
              })()}
            </Box>

        

            <Divider
              sx={{
                my: 1.5,
                borderColor: editedOrder?.my_order ? ORDER_COLORS.CONFIRMED_CLIENT.main : ORDER_COLORS.CONFIRMED_ADMIN.main,
                borderWidth: 2,
              }}
            />

          

            <Box sx={{ mb: 2 }}>
              <ActionButton
                fullWidth
                onClick={handleConfirmationToggle}
                disabled={confirmToggleUpdating || isConfirmationDisabled}
                color={editedOrder?.confirmed ? "success" : "primary"}
                label={
                  editedOrder?.confirmed
                    ? t("order.orderConfirmed")
                    : t("order.orderNotConfirmed")
                }
                title={
                  permissions.isCurrentOrder && editedOrder?.confirmed
                    ? "Нельзя снять подтверждение у текущего заказа"
                    : confirmationCheck.message || ""
                }
                sx={isConfirmationDisabled ? disabledStyles : enabledStyles}
              />
              {/* 🔴 Показываем сообщение о блокировке подтверждения */}
              {!editedOrder?.confirmed && confirmationCheck.message && (
                <Box
                  sx={{
                    mt: 1,
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "error.lighter",
                    border: "1px solid",
                    borderColor: "error.main",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "error.main", fontWeight: 500 }}>
                    🔴 Невозможно подтвердить заказ
                  </Typography>
                <Typography
                    variant="body2" 
                    component="div"
                    sx={{ color: "error.dark", fontSize: 12, mt: 0.5 }}
                  >
                    <BufferSettingsLinkifiedText
                      text={confirmationCheck.message}
                      onOpen={() => setBufferModalOpen(true)}
                    />
                </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 0 }}>
              {/* Даты — вертикально на мобильных */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1, sm: 2 },
                  mb: 1,
                  alignItems: { xs: "stretch", sm: "flex-start" },
                }}
              >
                <TextField
                  label={t("order.pickupDate")}
                  type="date"
                  value={editedOrder?.rentalStartDate ? formatDateYYYYMMDD(editedOrder.rentalStartDate) : ""}
                  onChange={(e) => {
                    if (permissions.viewOnly || (!isSuperAdmin(currentUser) && permissions.isCurrentOrder) || !permissions.fieldPermissions.rentalStartDate) return;
                    updateStartDate(e.target.value);
                  }}
                  sx={{ flex: 1, minHeight: 48 }}
                  size="medium"
                  InputProps={{ style: { minHeight: 48 } }}
                  disabled={permissions.viewOnly || (!isSuperAdmin(currentUser) && permissions.isCurrentOrder) || !permissions.fieldPermissions.rentalStartDate}
                  inputProps={{ min: todayStr }}
                />
                <TextField
                  label={t("order.returnDate")}
                  type="date"
                  value={
                    editedOrder?.rentalEndDate
                      ? formatDateYYYYMMDD(editedOrder.rentalEndDate)
                      : ""
                  }
                  onChange={(e) => {
                    if (permissions.viewOnly || !permissions.fieldPermissions.rentalEndDate) return;
                    updateEndDate(e.target.value);
                  }}
                  disabled={permissions.viewOnly || !permissions.fieldPermissions.rentalEndDate}
                  sx={{ flex: 1, minHeight: 48 }}
                  size="medium"
                  InputProps={{ style: { minHeight: 48 } }}
                  inputProps={{
                    min: permissions.isCurrentOrder
                      ? athensNow().format("YYYY-MM-DD")
                      : editedOrder?.rentalStartDate
                          ? formatDateYYYYMMDD(editedOrder.rentalStartDate)
                          : undefined,
                  }}
                />
              </Box>
              {/* Время — TimePicker читает conflicts, не думает */}
              {/* Время — упрощённый TimePicker (НИКОГДА не блокирует ввод) */}
              <TimePicker
                startTime={startTime}
                endTime={endTime}
                setStartTime={updateStartTime}
                setEndTime={updateEndTime}
                disabled={permissions.viewOnly || (!permissions.fieldPermissions.timeIn && !permissions.fieldPermissions.timeOut)}
                pickupDisabled={permissions.viewOnly || !permissions.fieldPermissions.timeIn}
                returnDisabled={permissions.viewOnly || !permissions.fieldPermissions.timeOut}
                pickupSummary={finalPickupSummary}
                returnSummary={finalReturnSummary}
                onOpenBufferSettings={() => setBufferModalOpen(true)}
              />

              {/* 🔴 Block-сообщение — ТОЛЬКО после попытки сохранения */}
              {attemptedSave && hasBlockingConflict && (
                <Box
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "error.lighter",
                    border: "1px solid",
                    borderColor: "error.main",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "error.main", fontWeight: 500 }}>
                    🔴 Невозможно сохранить изменения
                  </Typography>
                  <Typography 
                    variant="body2" 
                    component="div"
                    sx={{ color: "error.dark", fontSize: 12, mt: 0.5 }}
                  >
                    <BufferSettingsLinkifiedText
                      text={
                        pickupSummary?.level === "block"
                          ? pickupSummary.message
                          : returnSummary?.message
                      }
                      onOpen={() => setBufferModalOpen(true)}
                    />
                  </Typography>
                </Box>
              )}

              {/* Место получения и возврата — вертикально на мобильных */}
              <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 2 }, 
                mb: 1 
              }}>
                <Autocomplete
                  freeSolo
                  options={locations}
                  value={editedOrder.placeIn || ""}
                  onChange={(_, newValue) =>
                    updateField("placeIn", newValue || "")
                  }
                  onInputChange={(_, newInputValue) =>
                    updateField("placeIn", newInputValue)
                  }
                  disabled={permissions.viewOnly || (!isSuperAdmin(currentUser) && permissions.isCurrentOrder) || !permissions.fieldPermissions.placeIn}
                  PaperProps={{
                    sx: {
                      border: "2px solid",
                      borderColor: "text.primary",
                      borderRadius: 1,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                      backgroundColor: "background.paper",
                    },
                  }}
                  slotProps={{
                    popper: {
                      style: { zIndex: 1400 },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("order.pickupLocation")}
                      size="medium"
                      required
                      InputProps={{
                        ...params.InputProps,
                        style: { minHeight: 48 },
                      }}
                    />
                  )}
                  sx={{
                    flex: 1,
                    minHeight: 48,
                  }}
                />
                {editedOrder.placeIn &&
                  editedOrder.placeIn.toLowerCase() === "airport" && (
                    <TextField
                      label={t("order.flightNumber") || "Номер рейса"}
                      value={editedOrder.flightNumber || ""}
                      onChange={(e) =>
                        updateField("flightNumber", e.target.value)
                      }
                      size="medium"
                      sx={{ width: "25%", alignSelf: "stretch" }}
                      InputLabelProps={{ shrink: true }}
                      disabled={permissions.viewOnly || (!isSuperAdmin(currentUser) && permissions.isCurrentOrder) || !permissions.fieldPermissions.flightNumber}
                    />
                  )}
                <Autocomplete
                  freeSolo
                  options={locations}
                  value={editedOrder.placeOut || ""}
                  onChange={(_, newValue) =>
                    updateField("placeOut", newValue || "")
                  }
                  onInputChange={(_, newInputValue) =>
                    updateField("placeOut", newInputValue)
                  }
                  disabled={permissions.viewOnly || !permissions.fieldPermissions.placeOut}
                  PaperProps={{
                    sx: {
                      border: "2px solid",
                      borderColor: "text.primary",
                      borderRadius: 1,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                      backgroundColor: "background.paper",
                    },
                  }}
                  slotProps={{
                    popper: {
                      style: { zIndex: 1400 },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("order.returnLocation")}
                      size="medium"
                      required
                      InputProps={{
                        ...params.InputProps,
                        style: { minHeight: 48 },
                      }}
                    />
                  )}
                  sx={{
                    flex: 1,
                    minHeight: 48,
                  }}
                />
              </Box>
              {/* Страховка и детские кресла — адаптивно */}
              <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 2 }, 
                mb: 0
              }}>
                <FormControl
                  fullWidth
                  sx={{
                    width: { 
                      xs: "100%", 
                      sm: editedOrder.insurance === "TPL" ? "49%" : "30%" 
                    },
                  }}
                >
                  <InputLabel>{t("order.insurance")}</InputLabel>
                  <Select
                    label={t("order.insurance")}
                    value={editedOrder.insurance || ""}
                    onChange={(e) =>
                      !permissions.viewOnly && permissions.fieldPermissions.insurance &&
                      updateField("insurance", e.target.value)
                    }
                    disabled={permissions.viewOnly || !permissions.fieldPermissions.insurance}
                  >
                    {(() => {
                      // 🔧 FIX: Use selectedCar from hook (single source of truth)
                      const kaskoPrice = selectedCar?.PriceKacko ?? 0;
                      return (t("order.insuranceOptions", { returnObjects: true }) || []).map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value === "CDW"
                            ? `${option.label} ${kaskoPrice}€/${t("order.perDay")}`
                            : option.label}
                        </MenuItem>
                      ));
                    })()}
                  </Select>
                </FormControl>
                {editedOrder.insurance === "CDW" && (
                  <Box sx={{ width: "16%" }}>
                    <RenderTextField
                      name="franchiseOrder"
                      label={t("car.franchise") || "Франшиза заказа"}
                      type="number"
                      updatedCar={editedOrder}
                      handleChange={(e) =>
                        !permissions.viewOnly && permissions.fieldPermissions.franchiseOrder &&
                        updateField("franchiseOrder", Number(e.target.value))
                      }
                      isLoading={loading}
                      disabled={permissions.viewOnly || !permissions.fieldPermissions.franchiseOrder}
                    />
                  </Box>
                )}
                <FormControl fullWidth sx={{ width: { xs: "100%", sm: "49%" } }}>
                  <InputLabel>
                    {t("order.childSeats")}{" "}
                    {selectedCar?.PriceChildSeats ?? 0}
                    €/{t("order.perDay")}
                  </InputLabel>
                  <Select
                    label={`${t("order.childSeats")} ${selectedCar?.PriceChildSeats ?? 0}€/${t("order.perDay")}`}
                    value={
                      typeof editedOrder.ChildSeats === "number"
                        ? editedOrder.ChildSeats
                        : 0
                    }
                    onChange={(e) =>
                      !permissions.viewOnly && permissions.fieldPermissions.ChildSeats &&
                      updateField("ChildSeats", Number(e.target.value))
                    }
                    disabled={permissions.viewOnly || !permissions.fieldPermissions.ChildSeats}
                  >
                    <MenuItem value={0}>{t("order.childSeatsNone")}</MenuItem>
                    {[1, 2, 3, 4].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Блок данных клиента: имя на отдельной строке, телефон и email — ниже в одну строку */}
            <Box sx={{ mb: 0 }}>
              <FormControl fullWidth margin="dense" sx={{ mt: 0, mb: 0 }}>
                <TextField
                  fullWidth
                  margin="dense"
                  label={
                    <>
                      <span>{t("order.clientName")}</span>
                      <Box component="span" sx={{ color: "primary.dark" }}>*</Box>
                    </>
                  }
                  value={editedOrder.customerName || ""}
                  onChange={(e) =>
                    !permissions.viewOnly &&
                    updateField("customerName", e.target.value)
                  }
                  disabled={permissions.viewOnly || !permissions.fieldPermissions.customerName}
                />
              </FormControl>
              {/* Телефон и email — вертикально на мобильных */}
              <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 0.5, sm: 2 }, 
                mb: 0 
              }}>
                <FormControl
                  fullWidth
                  margin="dense"
                  sx={{ flex: 1, minHeight: 36 }}
                >
                  <TextField
                    fullWidth
                    margin="dense"
                    size="small"
                    label={
                      <>
                        <span>{t("order.phone")}</span>
                        <Box component="span" sx={{ color: "primary.dark" }}>*</Box>
                      </>
                    }
                    value={editedOrder.phone || ""}
                    onChange={(e) =>
                      !permissions.viewOnly &&
                      updateField("phone", e.target.value)
                    }
                    disabled={permissions.viewOnly || !permissions.fieldPermissions.phone}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  margin="dense"
                  sx={{ flex: 1, minHeight: 36 }}
                >
                  <TextField
                    fullWidth
                    margin="dense"
                    size="small"
                    label={
                      <>
                        {t("order.email")}
                        <Box
                          component="span"
                          sx={{
                            color: "success.main",
                            fontWeight: 500,
                            ml: 1,
                          }}
                        >
                          {t("basic.optional")}
                        </Box>
                      </>
                    }
                    value={editedOrder.email || ""}
                    onChange={(e) =>
                      !permissions.viewOnly &&
                      updateField("email", e.target.value)
                    }
                    disabled={permissions.viewOnly || !permissions.fieldPermissions.email}
                  />
                </FormControl>
              </Box>
            </Box>

            {/* Кнопки действий — адаптивное расположение */}
            <Box
              sx={{
                mt: { xs: 2, sm: 1 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: { xs: "center", sm: "space-between" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 1, sm: 0 },
              }}
            >
              <CancelButton
                onClick={onCloseModalEdit}
                label={t("basic.cancel")}
                sx={{ order: { xs: 3, sm: 1 }, width: { xs: "100%", sm: "auto" }, }}
              />
              <ConfirmButton
                loading={isUpdating}
                disabled={permissions.viewOnly}
                sx={{ 
                  mx: { xs: 0, sm: 2 }, 
                  width: { xs: "100%", sm: "40%" },
                  order: { xs: 1, sm: 2 },

                }}
                onClick={async () => {
                  if (permissions.viewOnly) return;

                  // Отмечаем попытку сохранения
                  setAttemptedSave(true);

                  // ❌ БЛОК: Не сохраняем если есть блокирующие конфликты
                  if (hasBlockingConflict) {
                    // Сообщение покажется через attemptedSave + hasBlockingConflict
                    return;
                  }

                  // Restored from pre-refactor logic: Управление isUpdating централизовано в onClick
                  setIsUpdating(true);
                  try {
                    // ✅ Warnings разрешены — сохраняем без подтверждения
                    // Single unified update call
                    await handleOrderUpdate();
                    showMessage(t("order.orderUpdated"));
                    setAttemptedSave(false); // Сбрасываем после успешного сохранения
                  } catch (error) {
                    setUpdateMessage(
                      error?.message || "Ошибка обновления заказа"
                    );
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                label={t("order.updateOrder")}
              />
              <DeleteButton
                onClick={handleDelete}
                loading={isUpdating}
                disabled={permissions.viewOnly || !permissions.canDelete}
                label={t("order.deleteOrder")}
                sx={{
                  width: { xs: "100%", sm: "30%" },
                  order: { xs: 2, sm: 3 },
                  opacity: !permissions.canDelete ? 0.5 : 1,
                  cursor: !permissions.canDelete ? "not-allowed" : "pointer",
                }}
                title={
                  !permissions.canDelete
                    ? "You don't have permission to delete this order"
                    : t("order.deleteOrder")
                }
              />
            </Box>
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        message={updateMessage}
        closeFunc={handleSnackbarClose}
        isError={
          updateMessage && updateMessage.toLowerCase().includes("failed")
        }
      />

      {/* Модальное окно настройки буфера */}
      <BufferSettingsModal
        open={bufferModalOpen}
        onClose={() => setBufferModalOpen(false)}
      />
    </>
  );
};
export default EditOrderModal;
