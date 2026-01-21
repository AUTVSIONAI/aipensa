import React, { useContext, useState, useEffect, useRef, useCallback } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import { green, grey } from "@material-ui/core/colors";
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
    borderBottom: "3px solid #d9d9d9",
  },

  pendingTicket: {
    cursor: "unset",
  },
  ticketUnread: {
  // degradê suave da esquerda pra direita
  background:
    theme.mode === "light"
      ? "linear-gradient(90deg, rgba(144,84,188,0.24) 0%, rgba(144,84,188,0.12) 45%, rgba(144,84,188,0) 80%)"
      : "linear-gradient(90deg, rgba(144,84,188,0.35) 0%, rgba(144,84,188,0.20) 45%, rgba(144,84,188,0) 80%)",
  // “barrinha” roxa à esquerda sem empurrar layout
  boxShadow: "inset 3px 0 0 #9054BC",
  borderRadius: 6,
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
    color: "green",
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
    background: "green",
    color: "#FFF",
    marginRight: 1,
    padding: 1,
    fontWeight: "bold",
    borderRadius: 3,
    fontSize: "0.6em",
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
    width: 50,
    height: 50,
    borderRadius: "50%",
    transition: "border-color .2s ease",
    border: "3px solid transparent",
    boxSizing: "border-box",
  },
  avatarRing: {
    borderColor: "#9054bc", // CORES ROXO anel circular verde
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
  color: theme.mode === "light" ? "#9054BC" : grey[200], // antes: "black"
  width: "50%",
  fontWeight: 400,
},


  badgeStyle: {
  color: "#fff",
  backgroundColor: "#9054bc", // CORES roxo
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
    alignItems: "flex-start",
    flexWrap: "nowrap",
    flexDirection: "row",
    alignContent: "flex-start",
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
    paddingRight: 70,
    boxSizing: "border-box",
    overflow: "hidden",
  },

  /*** META (bolinha + horário) no topo direito, sem invadir botões ***/
  metaTopRight: {
    position: "absolute",
    top: 6,
    right: 18,
    display: "flex",
    alignItems: "center",
    gap: 8,
    zIndex: 3,
    pointerEvents: "none",
  },

  /*** Barra de ações à direita ***/
  actionBar: {
    right: 16,
    display: "flex",
    gap: 10,
    alignItems: "center",
    top: 30,
    transform: "none",
  },
  actionBtn: {
    padding: 8,
    borderRadius: 12,
    minWidth: 40,
    height: 40,
    color: "#fff",
    boxShadow: "none",
  },
  btnBlue: { backgroundColor: "#40BFFF" },
  btnRed: { backgroundColor: "#FF6B6B" },
  btnGreen: { backgroundColor: "#2ECC71" },
}));

const TicketListItemCustom = ({ setTabOpen, ticket }) => {
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
  dense
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
  })}
>

        <ListItemAvatar style={{ marginLeft: "-15px" }}>
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
                    <Badge
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
                    </Badge>
                  ) : (
                    <br />
                  )}
                  <Badge
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
                  </Badge>
                  {ticket?.user && (
                    <Badge
                      style={{ backgroundColor: "#000000" }}
                      className={classes.connectionTag}
                    >
                      {ticket.user?.name.toUpperCase()}
                    </Badge>
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