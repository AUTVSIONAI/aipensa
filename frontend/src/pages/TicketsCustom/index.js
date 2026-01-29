import React, { useState, useCallback, useContext, useEffect, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/core/styles";
import TicketsManager from "../../components/TicketsManagerTabs";
import Ticket from "../../components/Ticket";

import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { CircularProgress } from "@material-ui/core";
import { getBackendUrl } from "../../config";
import logo from "../../assets/logo.png";
import logoDark from "../../assets/logo-black.png";
import moment from "moment";

const defaultTicketsManagerWidth = 550;
const minTicketsManagerWidth = 404;
const maxTicketsManagerWidth = 700;

const useStyles = makeStyles((theme) => ({
	chatContainer: {
		flex: 1,
		padding: theme.spacing(1),
		height: "100%",
		minHeight: 0,
		overflowY: "hidden",
		background:
			theme.palette.type === "dark"
				? "radial-gradient(1200px 600px at 20% 10%, rgba(0, 242, 255, 0.15) 0%, rgba(0,0,0,0) 55%), radial-gradient(900px 500px at 80% 30%, rgba(189, 0, 255, 0.12) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(17, 24, 39, 0.75) 0%, rgba(17, 24, 39, 0.55) 100%)"
				: "radial-gradient(1200px 600px at 20% 10%, rgba(37, 117, 252, 0.10) 0%, rgba(255,255,255,0) 55%), radial-gradient(900px 500px at 80% 30%, rgba(106, 17, 203, 0.10) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, rgba(244, 246, 248, 1) 0%, rgba(255,255,255,1) 100%)",
	},
	chatPapper: {
		display: "flex",
		height: "100%",
		borderRadius: 20,
		overflow: "hidden",
		boxShadow:
			theme.palette.type === "dark"
				? "0 18px 60px rgba(0, 0, 0, 0.55)"
				: "0 12px 40px rgba(0,0,0,0.12)",
		background:
			theme.palette.type === "dark"
				? "rgba(17, 24, 39, 0.55)"
				: "rgba(255, 255, 255, 0.85)",
		backdropFilter: "blur(18px)",
		border:
			theme.palette.type === "dark"
				? "1px solid rgba(255, 255, 255, 0.08)"
				: "1px solid rgba(0, 0, 0, 0.06)",
	},
	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
		minHeight: 0,
		position: "relative",
		borderRight: "1px solid rgba(255, 255, 255, 0.08)",
		background: "transparent",
	},
	messagesWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		flexGrow: 1,
		minHeight: 0,
		background: "transparent", // Transparent to show global background
	},
	welcomeMsg: {
		background: "transparent",
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
		border: "none",
	},
	dragger: {
		width: "4px",
		cursor: "ew-resize",
		padding: "4px 0 0",
		borderTop: "1px solid rgba(255,255,255,0.08)",
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		zIndex: 100,
		backgroundColor: "transparent",
		transition: "background 0.3s",
		"&:hover": {
			backgroundColor: theme.palette.primary.main,
			boxShadow: `0 0 10px ${theme.palette.primary.main}`,
		},
		userSelect: "none",
	},
	logo: {
		logo: theme.logo,
		content: "url(" + (theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark()) + ")",
		filter: theme.palette.type === 'dark' ? "drop-shadow(0 0 16px rgba(0, 242, 255, 0.35))" : "none",
	},
}));

const TicketsCustom = () => {
	const { user } = useContext(AuthContext);

	const classes = useStyles({ ticketsManagerWidth: user.defaultTicketsManagerWidth || defaultTicketsManagerWidth });
	const { handleLogout } = useContext(AuthContext);
	const { ticketId } = useParams();

	const [ticketsManagerWidth, setTicketsManagerWidth] = useState(0);
	const ticketsManagerWidthRef = useRef(ticketsManagerWidth);

	useEffect(() => {
		if (user && user.defaultTicketsManagerWidth) {
			setTicketsManagerWidth(user.defaultTicketsManagerWidth);
		}
	}, [user]);

	var before = moment(moment().format()).isBefore(user.company.dueDate);

	if (before !== true){
		handleLogout();
	}

	// useEffect(() => {
	// 	if (ticketId && currentTicket.uuid === undefined) {
	// 		history.push("/tickets");
	// 	}
	// }, [ticketId, currentTicket.uuid, history]);

	const handleMouseDown = (e) => {
		document.addEventListener("mouseup", handleMouseUp, true);
		document.addEventListener("mousemove", handleMouseMove, true);
	};
	const handleSaveContact = async value => {
		if (value < 404)
			value = 404
		await api.put(`/users/toggleChangeWidht/${user.id}`, { defaultTicketsManagerWidth: value });

	}
	const handleMouseMove = useCallback(
		(e) => {
			const newWidth = e.clientX - document.body.offsetLeft;
			if (
				newWidth > minTicketsManagerWidth &&
				newWidth < maxTicketsManagerWidth
			) {
				ticketsManagerWidthRef.current = newWidth;
				setTicketsManagerWidth(newWidth);
			}
		},
		[]
	);

	const handleMouseUp = async () => {
		document.removeEventListener("mouseup", handleMouseUp, true);
		document.removeEventListener("mousemove", handleMouseMove, true);

		const newWidth = ticketsManagerWidthRef.current;

		if (newWidth !== ticketsManagerWidth) {
			await handleSaveContact(newWidth);
		}
	};

	return (
		<QueueSelectedProvider>
			
			<div className={classes.chatContainer}>
				<div className={classes.chatPapper}>
					<div
						className={classes.contactsWrapper}
						style={{ width: ticketsManagerWidth }}
					>
						<TicketsManager />
						<div onMouseDown={e => handleMouseDown(e)} className={classes.dragger} />
					</div>
					<div className={classes.messagesWrapper}>
						{ticketId ? (
							<>
								{/* <Suspense fallback={<CircularProgress />}> */}
								<Ticket />
								{/* </Suspense> */}
							</>
						) : (
							<Hidden only={["sm", "xs"]}>
								<Paper square variant="outlined" className={classes.welcomeMsg}>
									<span>
										<center>
											<img className={classes.logo} width="50%" alt="" />
										</center>
										{i18n.t("chat.noTicketMessage")}
									</span>								</Paper>
							</Hidden>
						)}
					</div>
				</div>
			</div>
		</QueueSelectedProvider>
	);
};

export default TicketsCustom;
