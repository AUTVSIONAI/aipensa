import React, { useContext, useState, useEffect, useRef, useCallback } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import {
  Badge,
  ListItemAvatar,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
  Avatar,
  Tooltip,
} from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";

import GroupIcon from "@material-ui/icons/Group";
import ContactTag from "../ContactTag";
import ConnectionIcon from "../ConnectionIcon";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import ShowTicketOpen from "../ShowTicketOpenModal";
import { isNil } from "lodash";
import { toast } from "react-toastify";
import { Done, HighlightOff, Replay, SwapHoriz } from "@material-ui/icons";
import useCompanySettings from "../../hooks/useSettings/companySettings";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    margin: theme.spacing(0.75, 0),
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.32)" : "rgba(255,255,255,0.75)",
    backdropFilter: "blur(16px)",
    overflow: "hidden",
    transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      borderColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.10)",
      boxShadow: theme.palette.type === "dark" ? "0 18px 44px rgba(0,0,0,0.45)" : "0 12px 32px rgba(0,0,0,0.10)",
    },
    "&.Mui-selected": {
      borderColor: theme.palette.type === "dark" ? "rgba(0, 242, 255, 0.35)" : "rgba(37, 117, 252, 0.35)",
      boxShadow: theme.palette.type === "dark"
        ? "0 0 0 1px rgba(0, 242, 255, 0.18), 0 18px 44px rgba(0,0,0,0.55)"
        : "0 0 0 1px rgba(37, 117, 252, 0.14), 0 12px 32px rgba(0,0,0,0.10)",
    },
  },

  pendingTicket: {
    cursor: "unset",
  },
  ticketUnread: {
  // degradê suave da esquerda pra direita
  background:
    theme.mode === "light"
      ? "linear-gradient(90deg, rgba(37,117,252,0.20) 0%, rgba(106,17,203,0.12) 45%, rgba(255,255,255,0) 85%)"
      : "linear-gradient(90deg, rgba(0,242,255,0.18) 0%, rgba(189,0,255,0.12) 45%, rgba(17,24,39,0) 85%)",
  // “barrinha” roxa à esquerda sem empurrar layout
  boxShadow: "inset 3px 0 0 rgba(0, 242, 255, 0.85)",
  borderRadius: 16,
},

  queueTag: {
    background: "#FCFCFC",
    color: "#000",
    marginRight: 1,
    padding: 1,
    fontWeight: "bold",
    borderRadius: 3,
    fontSize: "0.5em",
    whiteSpace: "nowrap",
  },
  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  newMessagesCount: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: 0,
    color: theme.palette.type === "dark" ? "rgba(0,242,255,0.9)" : "#2575fc",
    fontWeight: "bold",
    marginRight: "10px",
    borderRadius: 0,
  },
  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  connectionTag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "green",
    color: "#FFF",
    padding: "4px 10px",
    fontWeight: 800,
    borderRadius: 999,
    fontSize: "0.72em",
    letterSpacing: 0.2,
    lineHeight: 1,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.06)",
  },
  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "5px",
    color: theme.mode === "light" ? "black" : "white",
  },
  contactNameText: {
    fontWeight: 700, // negrito apenas no nome
  },

  // Avatar base + anel verde quando há notificação
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    transition: "border-color .2s ease",
    border: "3px solid transparent",
    boxSizing: "border-box",
  },
  avatarRing: {
    borderColor: theme.palette.type === "dark" ? "rgba(0, 242, 255, 0.85)" : "rgba(37, 117, 252, 0.85)",
  },
  avatarWrapper: {
    marginLeft: 0,
    minWidth: 56,
  },
  ticketCompact: {
    margin: theme.spacing(0.5, 0),
    borderRadius: 14,
    "& $avatar": {
      width: 38,
      height: 38,
    },
    "& $avatarWrapper": {
      minWidth: 50,
    },
    "& $listItemText": {
      paddingRight: 138,
    },
    "& $actionBtn": {
      minWidth: 36,
      height: 36,
      borderRadius: 12,
    },
    "& $actionBar": {
      gap: 8,
    },
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: -30,
    marginRight: "1px",
    color: theme.mode === "light" ? "#636363" : grey[400],
  },

  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: -30,
    color: "#9054bc", //CORES ROXO
    fontWeight: "bold",
    marginRight: "1px",
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
  paddingRight: "0%",
  marginLeft: "5px",
  color: theme.mode === "light" ? grey[500] : grey[400], // antes: "black"
  fontWeight: 400,
},

contactLastMessageUnread: {
  paddingRight: 20,
  color: theme.mode === "light" ? "#2575fc" : grey[200],
  width: "50%",
  fontWeight: 400,
},


  badgeStyle: {
  color: "#fff",
  background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
},

  acceptButton: {
    position: "absolute",
    right: "1px",
  },

  ticketQueueColor: {
    flex: "none",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  ticketInfo: {
    position: "relative",
    top: -13,
  },
  secondaryContentSecond: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    flexDirection: "row",
    alignContent: "flex-start",
    gap: 6,
  },
  ticketInfo1: {
    position: "relative",
    top: 13,
    right: 0,
  },
  Radiusdot: {
    "& .MuiBadge-badge": {
      borderRadius: 2,
      position: "inherit",
      height: 16,
      margin: 2,
      padding: 3,
    },
    "& .MuiBadge-anchorOriginTopRightRectangle": {
      transform: "scale(1) translate(0%, -40%)",
    },
  },
  connectionIcon: {
    marginRight: theme.spacing(1),
  },

  /*** reserva espaço pro bloco de ações à direita ***/
  listItemText: {
    paddingRight: 156,
    boxSizing: "border-box",
    overflow: "hidden",
  },

  /*** META (bolinha + horário) no topo direito, sem invadir botões ***/
  metaTopRight: {
    position: "absolute",
    top: 10,
    right: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
    zIndex: 3,
    pointerEvents: "none",
  },

  /*** Barra de ações à direita ***/
  actionBar: {
    right: 12,
    display: "flex",
    gap: 10,
    alignItems: "center",
    top: "50%",
    transform: "translateY(-50%)",
  },
  actionBtn: {
    padding: 8,
    borderRadius: 12,
    minWidth: 40,
    height: 40,
    color: "#fff",
    boxShadow: theme.palette.type === "dark" ? "0 12px 24px rgba(0,0,0,0.35)" : "0 8px 18px rgba(0,0,0,0.12)",
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
  },
  btnBlue: { background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)" },
  btnGreen: { background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)" },
  btnRed: { background: "linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)" },
}));

const TicketListItemCustom = ({ setTabOpen, ticket, compact }) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] =
    useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);

  const [openAlert, setOpenAlert] = useState(false);
  const [userTicketOpen, setUserTicketOpen] = useState("");
  const [queueTicketOpen, setQueueTicketOpen] = useState("");

  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);

  const { get: getSetting } = useCompanySettings();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleOpenAcceptTicketWithouSelectQueue = useCallback(() => {
    setAcceptTicketWithouSelectQueueOpen(true);
  }, []);

  const handleCloseTicket = async (id) => {
    const setting = await getSetting({ column: "requiredTag" });

    if (setting.requiredTag === "enabled") {
      try {
        const contactTags = await api.get(`/contactTags/${ticket.contact.id}`);
        if (!contactTags.data.tags) {
          toast.warning(i18n.t("messagesList.header.buttons.requiredTag"));
        } else {
          await api.put(`/tickets/${id}`, {
            status: "closed",
            userId: user?.id || null,
          });
          if (isMounted.current) setLoading(false);
          history.push(`/tickets/`);
        }
      } catch (err) {
        setLoading(false);
        toastError(err);
      }
    } else {
      setLoading(true);
      try {
        await api.put(`/tickets/${id}`, {
          status: "closed",
          userId: user?.id || null,
        });
      } catch (err) {
        setLoading(false);
        toastError(err);
      }
      if (isMounted.current) setLoading(false);
      history.push(`/tickets/`);
    }
  };

  const handleCloseIgnoreTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id || null,
        sendFarewellMessage: false,
        amountUsedBotQueues: 0,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) setLoading(false);
    history.push(`/tickets/`);
  };

  const truncate = (str, len) => {
    if (!isNil(str)) {
      if (str.length > len) return str.substring(0, len) + "...";
      return str;
    }
  };

  const handleCloseTransferTicketModal = useCallback(() => {
    if (isMounted.current) setTransferTicketModalOpen(false);
  }, []);

  const handleOpenTransferModal = () => {
    setLoading(true);
    setTransferTicketModalOpen(true);
    if (isMounted.current) setLoading(false);
    handleSelectTicket(ticket);
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      const otherTicket = await api.put(`/tickets/${id}`, {
        status:
          ticket.isGroup && ticket.channel === "whatsapp" ? "group" : "open",
        userId: user?.id,
      });

      if (otherTicket.data.id !== ticket.id) {
        if (otherTicket.data.userId !== user?.id) {
          setOpenAlert(true);
          setUserTicketOpen(otherTicket.data.user.name);
          setQueueTicketOpen(otherTicket.data.queue.name);
        } else {
          setLoading(false);
          setTabOpen(ticket.isGroup ? "group" : "open");
          handleSelectTicket(otherTicket.data);
          history.push(`/tickets/${otherTicket.uuid}`);
        }
      } else {
        let setting;
        try {
          setting = await getSetting({ column: "sendGreetingAccepted" });
        } catch (err) {
          toastError(err);
        }

        if (
          setting.sendGreetingAccepted === "enabled" &&
          (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")
        ) {
          handleSendMessage(ticket.id);
        }
        if (isMounted.current) setLoading(false);

        setTabOpen(ticket.isGroup ? "group" : "open");
        handleSelectTicket(ticket);
        history.push(`/tickets/${ticket.uuid}`);
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleSendMessage = async (id) => {
    let setting;
    try {
      setting = await getSetting({ column: "greetingAcceptedMessage" });
    } catch (err) {
      toastError(err);
    }

    const msg = `${setting.greetingAcceptedMessage}`;
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: `${msg.trim()}`,
    };
    try {
      await api.post(`/messages/${id}`, message);
    } catch (err) {
      toastError(err);
    }
  };

  const handleCloseAlert = useCallback(() => {
    setOpenAlert(false);
    setLoading(false);
  }, []);

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
       const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const hasUnread = Number(ticket.unreadMessages) > 0;

  return (
    <React.Fragment key={ticket.id}>
      {openAlert && (
        <ShowTicketOpen
          isOpen={openAlert}
          handleClose={handleCloseAlert}
          user={userTicketOpen}
          queue={queueTicketOpen}
        />
      )}
      {acceptTicketWithouSelectQueueOpen && (
        <AcceptTicketWithouSelectQueue
          modalOpen={acceptTicketWithouSelectQueueOpen}
          onClose={() => setAcceptTicketWithouSelectQueueOpen(false)}
          ticketId={ticket.id}
          ticket={ticket}
        />
      )}
      {transferTicketModalOpen && (
        <TransferTicketModalCustom
          modalOpen={transferTicketModalOpen}
          onClose={handleCloseTransferTicketModal}
          ticketid={ticket.id}
          ticket={ticket}
        />
      )}

      <ListItem
  button
  dense={!!compact}
  onClick={(e) => {
    const tag = e.target.tagName.toLowerCase();
    const isIconClick =
      (tag === "input" && e.target.type === "checkbox") ||
      tag === "svg" ||
      tag === "path";
    if (isIconClick) return;

    handleSelectTicket(ticket);
    // opcional: se quiser já navegar ao clicar no item:
    // history.push(`/tickets/${ticket.uuid}`);
  }}
  selected={ticketId && ticketId === ticket.uuid}
  className={clsx(classes.ticket, {
    [classes.pendingTicket]: ticket.status === "pending",
    [classes.ticketUnread]: hasUnread,
    [classes.ticketCompact]: !!compact,
  })}
>

        <ListItemAvatar className={classes.avatarWrapper}>
          <Avatar
            className={clsx(classes.avatar, { [classes.avatarRing]: hasUnread })}
            src={`${ticket?.contact?.urlPicture}`}
          />
        </ListItemAvatar>

        <ListItemText
          className={classes.listItemText}
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>
              <Typography noWrap component="span" variant="body2">
                {ticket.isGroup && ticket.channel === "whatsapp" && (
                  <GroupIcon
                    fontSize="small"
                    style={{
                      color: grey[700],
                      marginBottom: "-1px",
                      marginLeft: "5px",
                    }}
                  />
                )}{" "}
                &nbsp;
                {ticket.channel && (
                  <ConnectionIcon
                    width="20"
                    height="20"
                    className={classes.connectionIcon}
                    connectionType={ticket.channel}
                  />
                )}{" "}
                &nbsp;
                <span className={classes.contactNameText}>
                  {truncate(ticket.contact?.name, 60)}
                </span>
              </Typography>
            </span>
          }
          secondary={
            <span className={classes.contactNameWrapper}>
              <Typography
                className={
                  Number(ticket.unreadMessages) > 0
                    ? classes.contactLastMessageUnread
                    : classes.contactLastMessage
                }
                noWrap
                component="span"
                variant="body2"
              >
                {ticket.lastMessage ? (
                  <>
                    {ticket.lastMessage.includes("fb.me") ? (
                      <MarkdownWrapper>Clique de Anúncio</MarkdownWrapper>
                    ) : ticket.lastMessage.includes("data:image/png;base64") ? (
                      <MarkdownWrapper>Localização</MarkdownWrapper>
                    ) : (
                      <>
                        {ticket.lastMessage.includes("BEGIN:VCARD") ? (
                          <MarkdownWrapper>Contato</MarkdownWrapper>
                        ) : (
                          <MarkdownWrapper>
                            {truncate(ticket.lastMessage, 40)}
                          </MarkdownWrapper>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <br />
                )}

                <span className={classes.secondaryContentSecond}>
                  {ticket?.whatsapp ? (
                    <span
                      className={classes.connectionTag}
                      style={{
                        backgroundColor:
                          ticket.channel === "whatsapp"
                            ? "#25D366"
                            : ticket.channel === "facebook"
                            ? "#4267B2"
                            : "#E1306C",
                      }}
                    >
                      {ticket.whatsapp?.name.toUpperCase()}
                    </span>
                  ) : null}
                  <span
                    style={{
                      backgroundColor: ticket.queue?.color || "#7c7c7c",
                    }}
                    className={classes.connectionTag}
                  >
                    {ticket.queueId
                      ? ticket.queue?.name.toUpperCase()
                      : ticket.status === "lgpd"
                      ? "LGPD"
                      : "SEM FILA"}
                  </span>
                  {ticket?.user && (
                    <span
                      style={{ backgroundColor: "#000000" }}
                      className={classes.connectionTag}
                    >
                      {ticket.user?.name.toUpperCase()}
                    </span>
                  )}
                </span>

                <span className={classes.secondaryContentSecond}>
                  {ticket.tags?.map((tag) => (
                    <ContactTag
                      tag={tag}
                      key={`ticket-contact-tag-${ticket.id}-${tag.id}`}
                    />
                  ))}
                </span>
              </Typography>
            </span>
          }
        />

        {/* META (bolinha + horário) no topo direito */}
        <div className={classes.metaTopRight}>
          <Badge
            className={classes.newMessagesCount}
            badgeContent={ticket.unreadMessages}
            classes={{ badge: classes.badgeStyle }}
          />
          {ticket.lastMessage && (
            <Typography
              className={
                Number(ticket.unreadMessages) > 0
                  ? classes.lastMessageTimeUnread
                  : classes.lastMessageTime
              }
              component="span"
              variant="body2"
              style={{ top: 0, marginRight: 0 }}
            >
              {isSameDay(parseISO(ticket.updatedAt), new Date())
                ? format(parseISO(ticket.updatedAt), "HH:mm")
                : format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}
            </Typography>
          )}
        </div>

        {/* AÇÕES */}
        <ListItemSecondaryAction className={classes.actionBar}>
          {(ticket.status === "pending" || ticket.status === "closed") && (
            <ButtonWithSpinner
              size="small"
              loading={loading}
              className={`${classes.actionBtn} ${classes.btnGreen}`}
              onClick={() =>
                ticket.status === "closed"
                  ? handleAcepptTicket(ticket.id)
                  : ticket.queueId
                  ? handleAcepptTicket(ticket.id)
                  : handleOpenAcceptTicketWithouSelectQueue()
              }
              variant="contained"
            >
              {ticket.status === "closed" ? (
                <Tooltip title={i18n.t("ticketsList.buttons.reopen")}>
                  <Replay />
                </Tooltip>
              ) : (
                <Tooltip title={i18n.t("ticketsList.buttons.accept")}>
                  <Done />
                </Tooltip>
              )}
            </ButtonWithSpinner>
          )}

          {/* <<< ALTERAÇÃO ÚNICA: remover 'pending' da condição >>> */}
          {(ticket.status === "open" || ticket.status === "group" || ticket.status === "pending") && (
            <ButtonWithSpinner
              size="small"
              loading={loading}
              className={`${classes.actionBtn} ${classes.btnBlue}`}
              onClick={handleOpenTransferModal}
              variant="contained"
            >
              <Tooltip title={i18n.t("ticketsList.buttons.transfer")}>
                <SwapHoriz />
              </Tooltip>
            </ButtonWithSpinner>
          )}

          {(ticket.status === "open" || ticket.status === "group") && (
            <ButtonWithSpinner
              size="small"
              loading={loading}
              className={`${classes.actionBtn} ${classes.btnRed}`}
              onClick={() => handleCloseTicket(ticket.id)}
              variant="contained"
            >
              <Tooltip title={i18n.t("ticketsList.buttons.closed")}>
                <HighlightOff />
              </Tooltip>
            </ButtonWithSpinner>
          )}

          {(ticket.status === "pending" || ticket.status === "lgpd") &&
            (user.userClosePendingTicket === "enabled" ||
              user.profile === "admin") && (
              <ButtonWithSpinner
                size="small"
                loading={loading}
                className={`${classes.actionBtn} ${classes.btnRed}`}
                onClick={() => handleCloseIgnoreTicket(ticket.id)}
                variant="contained"
              >
                <Tooltip title={i18n.t("ticketsList.buttons.ignore")}>
                  <HighlightOff />
                </Tooltip>
              </ButtonWithSpinner>
            )}
        </ListItemSecondaryAction>
      </ListItem>
    </React.Fragment>
  );
};

export default TicketListItemCustom;
