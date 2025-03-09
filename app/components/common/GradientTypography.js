import { Typography } from "@mui/material";

const GradientTypography = ({ text }) => {
  return (
    <Typography
      component="span"
      sx={{
        background: (theme) =>
          `linear-gradient(to right, ${theme.palette.primary.red}, ${theme.palette.secondary.main}, ${theme.palette.primary.red})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textTransform: "uppercase",
      }}
    >
      {text}
    </Typography>
  );
};

export default GradientTypography;
