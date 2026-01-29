import React from "react";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 16,
    padding: theme.spacing(2),
    background: theme.custom?.glass?.card?.background,
    border: theme.custom?.glass?.card?.border,
    backdropFilter: theme.custom?.glass?.card?.backdropFilter,
    boxShadow: theme.custom?.glass?.card?.boxShadow,
  },
}));

const GlassCard = ({ children, className, style, elevation = 0, ...rest }) => {
  const classes = useStyles();
  return (
    <Paper elevation={elevation} className={`${classes.root} ${className || ""}`} style={style} {...rest}>
      {children}
    </Paper>
  );
};

export default GlassCard;
