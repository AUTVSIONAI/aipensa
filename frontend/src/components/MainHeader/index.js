import React from "react";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	contactsHeader: {
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(1.5),
		padding: theme.spacing(2, 2, 1.5, 2),
		marginBottom: theme.spacing(2),
		position: "sticky",
		top: 0,
		zIndex: 5,
		borderRadius: 16,
		background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.55)" : "rgba(255, 255, 255, 0.75)",
		backdropFilter: "blur(16px)",
		border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
		boxShadow: theme.palette.type === "dark" ? "0 12px 32px rgba(0,0,0,0.35)" : "0 6px 18px rgba(0,0,0,0.06)",
	},
}));

const MainHeader = ({ children }) => {
	const classes = useStyles();

	return <div className={classes.contactsHeader}>{children}</div>;
};

export default MainHeader;
