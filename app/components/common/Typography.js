/* eslint-disable react/require-default-props */
import * as React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import MuiTypography from "@mui/material/Typography";

const mark = {
  center: {
    h1: "",
    h2: "markedH2Center",
    h3: "markedH3Center",
    h4: "markedH4Center",
    h5: "",
    h6: "",
  },
  left: {
    h1: "",
    h2: "",
    h3: "",
    h4: "",
    h5: "",
    h6: "markedH6Left",
  },
  none: {
    h1: "",
    h2: "",
    h3: "",
    h4: "",
    h5: "",
    h6: "",
  },
};

const styles = ({ theme }) => ({
  [`& .${mark.center.h2}`]: {
    height: 4,
    width: 73,
    display: "block",
    margin: `${theme.spacing(1)} auto 0`,
    color: theme.palette.text.dark,
    backgroundColor: theme.palette.text.dark,
  },
  [`& .${mark.center.h3}`]: {
    height: 4,
    width: 55,
    display: "block",
    margin: `${theme.spacing(1)} auto 0`,
    color: theme.palette.text.dark,
    backgroundColor: theme.palette.text.dark,
  },
  [`& .${mark.center.h4}`]: {
    height: 4,
    width: 55,
    display: "block",
    margin: `${theme.spacing(1)} auto 0`,
    color: theme.palette.text.dark,
    backgroundColor: theme.palette.text.dark,
  },
  [`& .${mark.left.h6}`]: {
    height: 2,
    width: 28,
    display: "block",
    color: theme.palette.text.dark,
    marginTop: theme.spacing(0.5),
    background: "currentColor",
  },
  [`&.${theme.typography.body2}`]: {
    lineHeight: "0.79rem",
  },
});

const variantMapping = {
  h1: "h1",
  h2: "h1",
  h3: "h1",
  h4: "h1",
  h5: "h3",
  h6: "h2",
  subtitle1: "h3",
};

const Typography = React.forwardRef(function Typography(props, ref) {
  const { children, variant, marked = "none", ...other } = props;

  let markedClassName = "";
  if (mark[marked] && variant in mark[marked]) {
    markedClassName = mark[marked][variant];
  }

  return (
    <MuiTypography
      variantMapping={variantMapping}
      variant={variant}
      ref={ref} // Forward ref directly to MuiTypography
      {...other}
    >
      {children}
      {markedClassName ? <span className={markedClassName} /> : null}
    </MuiTypography>
  );
});

Typography.propTypes = {
  children: PropTypes.node,
  marked: PropTypes.oneOf(["center", "left", "none"]),
  variant: PropTypes.oneOf([
    "body1",
    "body2",
    "button",
    "caption",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "inherit",
    "overline",
    "subtitle1",
    "subtitle2",
  ]),
};

Typography.propTypes = {
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  marked: PropTypes.oneOf(["center", "left", "none"]),
  /**
   * Applies the theme typography styles.
   * @default 'body1'
   */
  variant: PropTypes.oneOf([
    "body1",
    "body2",
    "button",
    "caption",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "inherit",
    "overline",
    "subtitle1",
    "subtitle2",
  ]),
};
const StyledForwardedTypography = styled(Typography)(styles);

export default StyledForwardedTypography;
