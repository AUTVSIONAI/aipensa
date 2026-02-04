import React from "react";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	MainHeaderButtonsWrapper: {
		flex: "none",
		marginLeft: "auto",
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "flex-end",
		"& > *": {
			margin: theme.spacing(1),
		},
        [theme.breakpoints.down("sm")]: {
            flexBasis: "100%",
            justifyContent: "center",
            marginTop: theme.spacing(1),
        },
	},
}));

const MainHeaderButtonsWrapper = ({ children }) => {
	const classes = useStyles();

	return <div className={classes.MainHeaderButtonsWrapper}>{children}</div>;
};

export default MainHeaderButtonsWrapper;
