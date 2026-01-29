import React from "react";
import { Chip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 999,
    fontWeight: 700,
    border: theme.custom?.glass?.chip?.border,
    background: theme.custom?.glass?.chip?.background,
    backdropFilter: "blur(12px)",
  },
  active: {
    color: "white",
    border: theme.custom?.glass?.chip?.activeBorder,
    background: theme.custom?.glass?.chip?.activeBackground,
    boxShadow: theme.custom?.glass?.chip?.activeShadow,
  },
}));

const SectionChip = ({ label, icon, active, className, ...rest }) => {
  const classes = useStyles();
  return (
    <Chip
      icon={icon}
      label={label}
      className={`${classes.root} ${active ? classes.active : ""} ${className || ""}`}
      {...rest}
    />
  );
};

export default SectionChip;
