import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import ChatIcon from '@material-ui/icons/Chat';

import TicketsManagerTabs from "../../components/TicketsManagerTabs";
import Ticket from "../../components/Ticket";
import TicketAdvancedLayout from "../../components/TicketAdvancedLayout";

import { TicketsContext } from "../../context/Tickets/TicketsContext";

import { i18n } from "../../translate/i18n";
import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";
import CheckIcon from '@mui/icons-material/Check';

const useStyles = makeStyles(theme => ({
    header: {
        background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.65)" : "rgba(255,255,255,0.75)",
        borderBottom: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
        backdropFilter: "blur(16px)",
    },
    root: {
        background: "transparent",
    },
    bottomNav: {
        background: "transparent",
        "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },
        "& .MuiBottomNavigationAction-label": {
            fontWeight: 700,
        },
        "& .Mui-selected": {
            color: theme.palette.type === "dark" ? "rgba(0,242,255,0.95)" : theme.palette.primary.main,
        },
    },
    content: {
        overflow: "auto",
        background:
            theme.palette.type === "dark"
                ? "radial-gradient(900px 400px at 15% 0%, rgba(0, 242, 255, 0.12) 0%, rgba(0,0,0,0) 55%), radial-gradient(800px 360px at 85% 20%, rgba(189, 0, 255, 0.10) 0%, rgba(0,0,0,0) 60%)"
                : "radial-gradient(900px 400px at 15% 0%, rgba(37, 117, 252, 0.10) 0%, rgba(255,255,255,0) 55%), radial-gradient(800px 360px at 85% 20%, rgba(106, 17, 203, 0.10) 0%, rgba(255,255,255,0) 60%)",
    },
    placeholderContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        // backgroundColor: "#eee"
        background: theme.palette.tabHeaderBackground,
    },
    placeholderItem: {
        fontWeight: 700,
        opacity: 0.85,
        marginBottom: theme.spacing(2),
    },
    primaryButton: {
        color: "white",
        background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
        boxShadow: "none",
        borderRadius: 12,
        textTransform: "none",
        padding: "10px 14px",
        fontWeight: 800,
    },
}));

const TicketAdvanced = (props) => {
    const classes = useStyles();
    const { ticketId } = useParams();
    const [option, setOption] = useState(0);
    const { currentTicket, setCurrentTicket } = useContext(TicketsContext)

    useEffect(() => {
        if (currentTicket.id !== null) {
            setCurrentTicket({ id: currentTicket.id, code: '#open' })
        }
        if (!ticketId) {
            setOption(1)
        }
        return () => {
            setCurrentTicket({ id: null, code: null })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (currentTicket.id !== null) {
            setOption(0)
        }
    }, [currentTicket])

    const renderPlaceholder = () => {
        return <Box className={classes.placeholderContainer}>
            <div className={classes.placeholderItem}>{i18n.t("chat.noTicketMessage")}</div><br />
            <Button
               onClick={() => setOption(1)}
               variant="contained"
               startIcon={<CheckIcon />}
               className={classes.primaryButton}
                 >
                Selecionar Ticket
            </Button>
        </Box>
    }

    const renderMessageContext = () => {
        if (ticketId && ticketId !== "undefined") {
            return <Ticket />
        }
        return renderPlaceholder()
    }

    const renderTicketsManagerTabs = () => {
        return <TicketsManagerTabs
        />
    }

    return (
        <QueueSelectedProvider>

            <TicketAdvancedLayout>
                <Box className={classes.header}>
                    <BottomNavigation
                        value={option}
                        onChange={(event, newValue) => {
                            setOption(newValue);
                        }}
                        showLabels
                        className={classes.bottomNav}
                    >
                        <BottomNavigationAction label="Ticket" icon={<ChatIcon />} />
                        <BottomNavigationAction label="Atendimentos" icon={<QuestionAnswerIcon />} />
                    </BottomNavigation>
                </Box>
                <Box className={classes.content}>
                    {option === 0 ? renderMessageContext() : renderTicketsManagerTabs()}
                </Box>
            </TicketAdvancedLayout>
        </QueueSelectedProvider>
    );
};

export default TicketAdvanced;
