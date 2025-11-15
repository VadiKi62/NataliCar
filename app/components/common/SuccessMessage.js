import React from "react";
import { Typography, Box, Button } from "@mui/material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const SuccessMessage = ({
  submittedOrder,
  presetDates,
  onClose,
  emailSent,
  message = null,
}) => {
  const { t } = useTranslation();
  // ...
  return (
    <Box>
      {message ? (
        <Typography
          textAlign="center"
          sx={{ mt: 3, letterSpacing: 0.1 }}
          variant="h5"
          color="primary.red"
        >
          {message}
        </Typography>
      ) : (
        <Typography
          variant="h6"
          color="primary"
          textAlign="center"
          sx={{ textTransform: "uppercase" }}
        >
          {t("bookMesssages.bookOK")}
        </Typography>
      )}

      <Typography variant="body1" sx={{ mt: 2 }}>
        {t("bookMesssages.bookReceive")}{" "}
        <strong>{submittedOrder?.carModel}</strong> {t("basic.from")}{" "}
        {/* <strong>{dayjs(presetDates?.startDate).format("MMMM D")}</strong>{" "}
        {t("basic.to")}{" "}
        <strong>{dayjs(presetDates?.endDate).format("MMMM D")}</strong>. */}
        <strong>{dayjs(presetDates?.startDate).format("DD.MM.YY")}</strong>{" "}
        {t("basic.to")}{" "}
        <strong>{dayjs(presetDates?.endDate).format("DD.MM.YY")}</strong>.
      </Typography>

      <Typography
        textAlign="center"
        sx={{ mt: 3, letterSpacing: 0.1 }}
        variant="h5"
        color="primary.red"
      >
        {t("bookMesssages.bookDays")} {submittedOrder.numberOfDays}{" "}
      </Typography>
      <Typography
        textAlign="center"
        sx={{ mb: 3, letterSpacing: 0.1 }}
        variant="h5"
        color="primary.red"
      >
        {t("bookMesssages.bookPrice")} €{submittedOrder.totalPrice}{" "}
      </Typography>
      {emailSent && (
        <Typography variant="body1" sx={{ mt: 1 }}>
          {t("bookMesssages.bookFinalize")}
        </Typography>
      )}
      {/* Добавлена кнопка OK для выхода из сообщения */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="error" // красный цвет по стилю MUI
          onClick={onClose}
          sx={{
            minWidth: "120px",
            fontWeight: "bold",
            fontSize: "1.1rem",
            backgroundColor: "primary.red", // красный цвет из темы
            color: "white",
            "&:hover": {
              backgroundColor: "#d32f2f",
            },
          }}
        >
          OK
        </Button>
      </Box>
    </Box>
  );
};

export default SuccessMessage;
