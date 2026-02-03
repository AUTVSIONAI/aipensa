import React, { useState, useEffect, useContext, useRef } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import { Badge, Tooltip, Typography, Button, TextField, Box, Paper } from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(3),
    height: "100vh",
    backgroundColor: "transparent",
    overflowX: "hidden",
  },
  kanbanContainer: {
    width: "100%",
    height: "calc(100vh - 180px)",
    marginTop: theme.spacing(2),
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: theme.spacing(2),
    background: theme.palette.type === 'dark' ? "rgba(255, 255, 255, 0.05)" : "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
    backdropFilter: "blur(10px)",
  },
  dateInput: {
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(1),
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
    }
  },
  button: {
    marginBottom: theme.spacing(1),
    borderRadius: 30,
    textTransform: "none",
    fontWeight: "bold",
    boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .1)",
  },
  connectionTag: {
    background: "linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)",
    color: "#FFF",
    marginRight: 1,
    padding: "2px 6px",
    fontWeight: 'bold',
    borderRadius: 8,
    fontSize: "0.7em",
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    marginLeft: "auto",
    color: theme.palette.text.secondary,
    fontSize: "0.8rem",
  },
  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    color: theme.palette.success.main,
    fontWeight: "bold",
    marginLeft: "auto",
    fontSize: "0.8rem",
  },
  cardButton: {
    marginRight: theme.spacing(1),
    color: theme.palette.common.white,
    background: "linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)", // Gradient button
    borderRadius: 20,
    textTransform: "none",
    padding: "4px 12px",
    fontSize: "0.8rem",
    "&:hover": {
      background: "linear-gradient(45deg, #1d4ed8 30%, #6d28d9 90%)",
    },
  },
  laneStyle: {
    backgroundColor: theme.palette.type === 'dark' ? "rgba(17, 24, 39, 0.45)" : "rgba(255, 255, 255, 0.85)",
    borderRadius: 16,
    boxShadow: theme.palette.type === 'dark'
      ? `0 0 0 1px rgba(255,255,255,0.08), 0 12px 32px rgba(0,0,0,0.35)`
      : "0 6px 18px rgba(0,0,0,0.08)",
    padding: theme.spacing(1),
    maxHeight: "100%",
    backdropFilter: "blur(16px)",
  },
  cardStyle: {
    borderRadius: 12,
    border: "none",
    boxShadow: theme.palette.type === 'dark'
      ? "0 6px 18px rgba(0,0,0,0.35)"
      : "0 2px 8px rgba(0,0,0,0.08)",
    backgroundColor: theme.palette.type === 'dark' ? "rgba(30, 30, 47, 0.65)" : "#fff",
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    transition: "transform 0.2s",
    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: theme.palette.type === 'dark'
          ? `0 0 0 1px rgba(0, 242, 255, 0.25), 0 10px 28px rgba(0,0,0,0.45)`
          : "0 6px 16px rgba(0,0,0,0.15)",
    }
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [file, setFile] = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [queueIds, setQueueIds] = useState((user.queues || []).map(q => q.id).filter(Boolean));
  const queuesInitializedRef = useRef(false);

  useEffect(() => {
    const loadQueues = async () => {
      if (queuesInitializedRef.current) return;
      queuesInitializedRef.current = true;

      if (user?.queues?.length) {
        setQueueIds(user.queues.map(q => q.id).filter(Boolean));
        return;
      }

      if (user?.profile?.toUpperCase?.() !== "ADMIN") {
        setQueueIds([]);
        return;
      }

      try {
        const { data } = await api.get("/queue");
        setQueueIds((data || []).map(q => q.id).filter(Boolean));
      } catch (_) {
        setQueueIds([]);
      }
    };

    loadQueues();
  }, [user]);

  useEffect(() => {
    fetchTags();
  }, [user]);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(queueIds),
          dateStart: startDate,
          dateEnd: endDate,
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        fetchTickets();
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket, startDate, endDate]);

  const handleSearchClick = () => {
    fetchTickets();
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook style={{ color: "#3b5998", verticalAlign: "middle", fontSize: "16px" }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", verticalAlign: "middle", fontSize: "16px" }} />;
      case "whatsapp":
        return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle", fontSize: "16px" }} />
      default:
        return "error";
    }
  };

  const popularCards = () => {
    if (!tickets) return;
    const filteredTickets = tickets.filter(ticket => (ticket.tags || []).length === 0);

    const laneStyle = {
      backgroundColor: theme.palette.type === 'dark' ? "#2d2b42" : "#f4f5f7",
      color: theme.palette.text.primary,
      borderRadius: 16,
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      padding: "10px",
    };

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <Typography variant="body2" style={{ fontWeight: "bold" }}>{ticket.contact.number}</Typography>
                <Typography
                  className={Number(ticket.unreadMessages) > 0 ? classes.lastMessageTimeUnread : classes.lastMessageTime}
                  component="span"
                  variant="body2"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              </div>
              <div style={{ textAlign: 'left', marginBottom: 10, color: theme.palette.text.secondary }}>{ticket.lastMessage || " "}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  startIcon={<VisibilityIcon />}
                  className={classes.cardButton}
                  onClick={() => handleCardClick(ticket.uuid)}
                  size="small"
                >
                  Ver Ticket
                </Button>
                {ticket?.user && (<Badge className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
              </div>
            </div>
          ),
          title: <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={ticket.whatsapp?.name}>
              {IconChannel(ticket.channel)}
            </Tooltip> 
            <Typography variant="body1" style={{ fontWeight: "bold" }}>{ticket.contact.name}</Typography>
          </Box>,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
        style: { ...laneStyle, borderTop: "4px solid #60a5fa" }
      },
      ...tags.map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          const tagIds = (ticket.tags || []).map(tag => tag.id);
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets?.length.toString(),
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Typography variant="body2" style={{ fontWeight: "bold" }}>{ticket.contact.number}</Typography>
                </div>
                <div style={{ textAlign: 'left', marginBottom: 10, color: theme.palette.text.secondary }}>{ticket.lastMessage || " "}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    startIcon={<VisibilityIcon />}
                    className={classes.cardButton}
                    onClick={() => handleCardClick(ticket.uuid)}
                    size="small"
                  >
                    Ver Ticket
                  </Button>
                  {ticket?.user && (<Badge className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
                </div>
              </div>
            ),
            title: <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title={ticket.whatsapp?.name}>
                {IconChannel(ticket.channel)}
              </Tooltip> 
              <Typography variant="body1" style={{ fontWeight: "bold" }}>{ticket.contact.name}</Typography>
            </Box>,
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
          style: { ...laneStyle, borderTop: `4px solid ${tag.color}` }
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards();
  }, [tags, tickets]);

  const handleCardMove = async (fromLaneId, toLaneId, cardId, index) => {
    try {
      await api.delete(`/ticket-tags/${cardId}`);
      toast.success('Ticket Tag Removido!');
      if(toLaneId !== "lane0") {
        await api.put(`/ticket-tags/${cardId}/${toLaneId}`);
        toast.success('Ticket Tag Adicionado com Sucesso!');
      }
      await fetchTickets();
      popularCards();
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push('/tagsKanban');
  };

  const boardCardStyle = {
    borderRadius: 12,
    border: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    backgroundColor: theme.palette.type === 'dark' ? "#1e1e2f" : "#fff",
    color: theme.palette.text.primary,
    marginBottom: "10px",
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.filterContainer} elevation={0}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Data de início"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            className={classes.dateInput}
            size="small"
          />
          <Box mx={1} />
          <TextField
            label="Data de fim"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            className={classes.dateInput}
            size="small"
          />
          <Box mx={1} />
          <Button
            startIcon={<SearchIcon />}
            style={{
              color: "white",
              backgroundColor: "#FFA500",
              boxShadow: "0 3px 5px 2px rgba(255, 165, 0, .3)",
              borderRadius: 20,
            }}
            className={classes.button}
            onClick={handleSearchClick}
          >
            Buscar
          </Button>
        </div>
        <Can role={user.profile} perform="dashboard:view" yes={() => (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className={`${classes.button} ${classes.cardButton}`}
            onClick={handleAddConnectionClick}
          >
            {'Adicionar Quadro'}
          </Button>
        )} />
      </Paper>
      <div className={classes.kanbanContainer}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{ backgroundColor: 'transparent', padding: 0 }}
          cardStyle={boardCardStyle}
        />
      </div>
    </div>
  );
};

export default Kanban;
