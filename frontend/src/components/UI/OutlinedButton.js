import React from "react";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    textTransform: "none",
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    "&:hover": {
      borderColor: theme.palette.primary.main,
      background:
        theme.palette.type === "dark"
          ? "rgba(255,255,255,0.06)"
          : "rgba(0,0,0,0.04)",
    },
  },
}));

const OutlinedButton = ({ children, className, style, ...rest }) => {
  const classes = useStyles();
  return (
    <Button variant="outlined" className={`${classes.root} ${className || ""}`} style={style} {...rest}>
      {children}
    </Button>
  );
};

export default OutlinedButton;
