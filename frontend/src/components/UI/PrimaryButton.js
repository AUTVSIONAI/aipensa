import React from "react";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    color: "white",
    background: theme.custom?.gradients?.primary,
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    textTransform: "none",
    boxShadow:
      theme.palette.type === "dark"
        ? "0 12px 32px rgba(0,0,0,0.35)"
        : "0 6px 18px rgba(0,0,0,0.12)",
    "&:hover": {
      background: theme.custom?.gradients?.primary,
      filter: "brightness(1.02)",
    },
  },
}));

const PrimaryButton = ({ children, className, style, ...rest }) => {
  const classes = useStyles();
  return (
    <Button className={`${classes.root} ${className || ""}`} style={style} {...rest}>
      {children}
    </Button>
  );
};

export default PrimaryButton;
