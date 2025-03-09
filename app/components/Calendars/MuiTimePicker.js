import * as React from "react";
import dayjs from "dayjs";
import { Box, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

export default function Time({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  isRestrictionTimeIn = false,
  isRestrictionTimeOut = false,
  mb = 0,
  timeInMessage = null,
  timeOutMessage = null,
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: 2 }}>
        <TimePicker
          label="Start Time"
          value={startTime}
          minTime={isRestrictionTimeIn ? startTime : null}
          format="HH:mm"
          onChange={(newValue) => setStartTime(newValue)}
          // slots={{
          //   textField: (params) => <TextField {...params} fullWidth />,
          // }}
        />
        {isRestrictionTimeIn && (
          <Typography sx={{ color: "primary.main", fontSize: 13 }}>
            {" "}
            The car is not availbale before {isRestrictionTimeIn}{" "}
          </Typography>
        )}

        {timeInMessage && (
          <Typography sx={{ color: "primary.main", fontSize: 13 }}>
            {" "}
            {timeInMessage}
          </Typography>
        )}
      </Box>
      <Box sx={{ mt: 2, mb: mb }}>
        <TimePicker
          label="End Time"
          value={endTime}
          maxTime={isRestrictionTimeOut ? endTime : null}
          onChange={(newValue) => setEndTime(newValue)}
          format="HH:mm"
          // slots={{
          //   textField: (params) => <TextField {...params} fullWidth />,
          // }}
        />
        {isRestrictionTimeOut && (
          <Typography sx={{ color: "primary.main", fontSize: 13 }}>
            {" "}
            The car is not availbale after {isRestrictionTimeOut}{" "}
          </Typography>
        )}
        {timeOutMessage && (
          <Typography sx={{ color: "primary.main", fontSize: 13 }}>
            {" "}
            {timeOutMessage}
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
}
