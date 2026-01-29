import React, { useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import {
  makeStyles,
  Paper,
  InputBase,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Typography,
  Grid,
  Tooltip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";
import {
  Group,
  MoveToInbox as MoveToInboxIcon,
  CheckBox as CheckBoxIcon,
  MessageSharp as MessageSharpIcon,
  AccessTime as ClockIcon,
  Search as SearchIcon,
  Add as AddIcon,
  TextRotateUp,
  TextRotationDown,
  ViewAgenda,
  ViewStream,
} from "@material-ui/icons";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import ToggleButton from "@material-ui/lab/ToggleButton";

import { FilterAltOff, FilterAlt, PlaylistAddCheckOutlined } from "@mui/icons-material";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";
import { StatusFilter } from "../StatusFilter";
import { WhatsappsFilter } from "../WhatsappsFilter";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { QueueSelectedContext } from "../../context/QueuesSelected/QueuesSelectedContext";
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';

import api from "../../services/api";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    background: "transparent",
    border: "none",
    boxShadow: "none",
  },

  tabsHeader: {
    minWidth: "auto",
    width: "auto",
    borderRadius: 14,
    margin: theme.spacing(1, 1, 0.5, 1),
    overflow: "hidden",
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: theme.spacing(1),
  },

  tab: {
    minWidth: "auto",
    width: "auto",
    padding: theme.spacing(0.5, 1),
    borderRadius: 12,
    transition: "0.3s",
    borderColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    borderWidth: "1px",
    borderStyle: "solid",
    marginRight: theme.spacing(0.75),
    marginLeft: theme.spacing(0.75),

    [theme.breakpoints.down("lg")]: {
      fontSize: "0.9rem",
      padding: theme.spacing(0.4, 0.8),
      marginRight: theme.spacing(0.4),
      marginLeft: theme.spacing(0.4),
    },

    [theme.breakpoints.down("md")]: {
      fontSize: "0.8rem",
      padding: theme.spacing(0.3, 0.6),
      marginRight: theme.spacing(0.3),
      marginLeft: theme.spacing(0.3),
    },

    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    },
  },

  tabPanelItem: {
    minWidth: "33%",
    fontSize: 11,
    marginLeft: 0,
  },

  tabIndicator: {
    height: 3,
    bottom: 0,
    borderRadius: 3,
    background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
  },
  tabsBadge: {
    top: "110%",
    right: "50%",
    transform: "translate(50%, 0)",
    whiteSpace: "nowrap",
    borderRadius: 999,
    padding: "2px 10px",
    background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
    color: "white",
    boxShadow: theme.palette.type === "dark" ? "0 10px 24px rgba(0,0,0,0.35)" : "0 10px 22px rgba(0,0,0,0.10)",
  },
  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255,255,255,0.70)",
    borderRadius: 16,
    borderColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
    borderWidth: "1px",
    borderStyle: "solid",
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    backdropFilter: "blur(18px)",
  },

  serachInputWrapper: {
    flex: 1,
    minHeight: 48,
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255,255,255,0.70)",
    display: "flex",
    borderRadius: 16,
    padding: theme.spacing(0.5, 1),
    borderColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
    borderWidth: "1px",
    borderStyle: "solid",
    margin: theme.spacing(1, 1, 0.5, 1),
    backdropFilter: "blur(18px)",
  },

  searchIcon: {
    color: theme.palette.type === "dark" ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.55)",
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 12,
  },
  filterIcon: {
    borderRadius: 12,
    padding: 10,
  },

  badge: {
    right: "-10px",
  },

  customBadge: {
    right: "-10px",
    backgroundColor: "#f44336",
    color: "#fff",
  },

  show: {
    display: "block",
  },

  hide: {
    display: "none !important",
  },

  closeAllFab: {
    backgroundColor: "red",
    marginBottom: "4px",
    "&:hover": {
      backgroundColor: "darkred",
    },
  },

  speedDial: {
    position: "absolute",
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    "& .MuiFab-root": {
      width: "40px",
      height: "40px",
      marginTop: "4px",
    },
    "& .MuiFab-label": {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },

  dialog: {
    borderRadius: 18,
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.92)" : "rgba(255,255,255,0.98)",
    boxShadow: theme.palette.type === "dark" ? "0 18px 60px rgba(0,0,0,0.65)" : "0 18px 60px rgba(0,0,0,0.18)",
  },
  dialogTitle: {
    background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
    color: "white",
    textAlign: "center",
    padding: theme.spacing(2),
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  dialogContent: {
    padding: theme.spacing(3),
    textAlign: "center",
    fontSize: "1rem",
  },
  dialogActions: {
    justifyContent: "center",
    padding: theme.spacing(2),
  },
  confirmButton: {
    backgroundColor: "#4ec24e",
    color: "white",
    padding: "8px 20px",
    borderRadius: "4px",
    fontWeight: "bold",
    textTransform: "uppercase",
    border: "1px solid black", // Adicionando borda preta
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#388e3c",
    },
  },
  cancelButton: {
    backgroundColor: "#db6565",
    color: "white",
    padding: "8px 20px",
    borderRadius: "4px",
    fontWeight: "bold",
    textTransform: "uppercase",
    border: "1px solid black", // Adicionando borda preta
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#c62828",
    },
  },
  button: {
    height: 42,
    width: 42,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)",
    borderRadius: 14,
    marginRight: 8,
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.30)" : "rgba(255,255,255,0.70)",
    backdropFilter: "blur(16px)",
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
  },
  icon: {
    color: theme.palette.type === "dark" ? "rgba(255,255,255,0.85)" : "rgba(17, 24, 39, 0.85)",
    "&:hover": {
      color: theme.palette.type === "dark" ? "white" : "rgba(17, 24, 39, 1)",
    },
  },
}));

const TicketsManagerTabs = () => {
  const theme = useTheme();
  const classes = useStyles();
  const history = useHistory();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [sortTickets, setSortTickets] = useState(false);

  const searchInputRef = useRef();
  const [searchOnMessages, setSearchOnMessages] = useState(false);

  const { user } = useContext(AuthContext);
  const { profile } = user;
  const { setSelectedQueuesMessage } = useContext(QueueSelectedContext);
  const { tabOpen, setTabOpen } = useContext(TicketsContext);

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [groupingCount, setGroupingCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [availableQueues, setAvailableQueues] = useState(user.queues || []);
  const queuesInitializedRef = useRef(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [forceSearch, setForceSearch] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [filter, setFilter] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isHoveredAll, setIsHoveredAll] = useState(false);
  const [isHoveredNew, setIsHoveredNew] = useState(false);
  const [isHoveredResolve, setIsHoveredResolve] = useState(false);
  const [isHoveredOpen, setIsHoveredOpen] = useState(false);
  const [isHoveredClosed, setIsHoveredClosed] = useState(false);
  const [isHoveredSort, setIsHoveredSort] = useState(false);

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [compactList, setCompactList] = useState(() => {
    try {
      return localStorage.getItem("zpTicketsListDensity") === "compact";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("zpTicketsListDensity", compactList ? "compact" : "comfortable");
    } catch (e) {}
  }, [compactList]);

  useEffect(() => {
    setSelectedQueuesMessage(selectedQueueIds);
  }, [selectedQueueIds]);

  useEffect(() => {
    const loadQueues = async () => {
      if (queuesInitializedRef.current) return;
      queuesInitializedRef.current = true;

      if (user?.queues?.length) {
        setAvailableQueues(user.queues);
        return;
      }

      if (user?.profile?.toUpperCase?.() !== "ADMIN") {
        setAvailableQueues([]);
        return;
      }

      try {
        const { data } = await api.get("/queue");
        setAvailableQueues(data);
        if (!selectedQueueIds?.length && data?.length) {
          setSelectedQueueIds(data.map((q) => q.id));
        }
      } catch (err) {}
    };

    loadQueues();
  }, []);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN" || user.allUserChat.toUpperCase() === "ENABLED") {
      setShowAllTickets(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
    setForceSearch(!forceSearch);
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setForceSearch(!forceSearch);
      setTab("open");
      return;
    } else if (tab !== "search") {
      handleFilter();
      setTab("search");
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleBack = () => {
    history.push("/tickets");
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleSnackbarOpen = () => {
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const CloseAllTicket = async () => {
    try {
      const { data } = await api.post("/tickets/closeAll", {
        status: tabOpen,
        selectedQueueIds,
      });
      handleSnackbarClose();
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);

    clearTimeout(searchTimeout);

    if (tags.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }

    searchTimeout = setTimeout(() => {
      setSelectedTags(tags);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);

    clearTimeout(searchTimeout);

    if (users.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }
    searchTimeout = setTimeout(() => {
      setSelectedUsers(users);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);

    clearTimeout(searchTimeout);

    if (whatsapp.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }
    searchTimeout = setTimeout(() => {
      setSelectedWhatsapp(whatsapp);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);

    clearTimeout(searchTimeout);

    if (statusFilter.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }

    searchTimeout = setTimeout(() => {
      setSelectedStatus(statusFilter);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleFilter = () => {
    if (filter) {
      setFilter(false);
      setTab("open");
    } else setFilter(true);
    setTab("search");
  };

  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  const handleVisibility = () => {
    setHidden((prevHidden) => !prevHidden);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClosed = () => {
    setOpen(false);
  };

  const tooltipTitleStyle = {
    fontSize: "10px",
  };

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <div className={classes.serachInputWrapper}>
        <SearchIcon className={classes.searchIcon} />
        <InputBase
          className={classes.searchInput}
          inputRef={searchInputRef}
          placeholder={i18n.t("tickets.search.placeholder")}
          type="search"
          onChange={handleSearch}
        />
        <Tooltip placement="top" title="Marque para pesquisar também nos conteúdos das mensagens (mais lento)">
          <div>
            <Switch
              size="small"
              checked={searchOnMessages}
              onChange={(e) => { setSearchOnMessages(e.target.checked) }}
            />
          </div>
        </Tooltip>
        <IconButton
          style={{
            backgroundColor: "transparent",
            boxShadow: "none",
            border: "none",
            borderRadius: "5px",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          variant="contained"
          aria-label="filter"
          className={classes.filterIcon}
          onClick={() => {
            setIsFilterActive((prevState) => !prevState);
            handleFilter();
          }}
        >
          {isFilterActive ? (
            <FilterAlt style={{ color: "#4ec24e" }} />
          ) : (
            <FilterAltOff style={{ color: "#db6565" }} />
          )}
        </IconButton>
      </div>

      {filter === true && (
        <>
          <TagsFilter onFiltered={handleSelectedTags} />
          <WhatsappsFilter onFiltered={handleSelectedWhatsapps} />
          <StatusFilter onFiltered={handleSelectedStatus} />
          {profile === "admin" && (
            <>
              <UsersFilter onFiltered={handleSelectedUsers} />
            </>
          )}
        </>
      )}

      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Can
              role={user.allUserChat === 'enabled' && user.profile === 'user' ? 'admin' : user.profile}
              perform="tickets-manager:showall"
              yes={() => (
                <Badge
                  color="primary"
                  overlap="rectangular"
                  invisible={
                    !isHoveredAll ||
                    isHoveredNew ||
                    isHoveredResolve ||
                    isHoveredOpen ||
                    isHoveredClosed
                  }
                  badgeContent={"Todos"}
                  classes={{ badge: classes.tabsBadge }}
                >
                  <ToggleButton
                    onMouseEnter={() => setIsHoveredAll(true)}
                    onMouseLeave={() => setIsHoveredAll(false)}
                    className={classes.button}
                    value="uncheck"
                    selected={showAllTickets}
                    onChange={() =>
                      setShowAllTickets((prevState) => !prevState)
                    }
                  >
                    {showAllTickets ? (
                      <VisibilityIcon className={classes.icon} />
                    ) : (
                      <VisibilityOffIcon className={classes.icon} />
                    )}
                  </ToggleButton>
                </Badge>
              )}
            />
            <Dialog
              open={snackbarOpen}
              onClose={handleSnackbarClose}
              classes={{ paper: classes.dialog }}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle className={classes.dialogTitle}>
                {i18n.t("tickets.inbox.closedAllTickets")}
              </DialogTitle>
              <DialogContent className={classes.dialogContent}>
                <Typography>
                  {i18n.t("Esse processo irá fechar todos os Tickets em Aberto, deseja continuar ?")}
                </Typography>
              </DialogContent>
              <DialogActions className={classes.dialogActions}>
                <Button
                  startIcon={<CheckIcon />}
                style={{
                  color: "white",
                  backgroundColor: "#437db5",
                  boxShadow: "none",
                  borderRadius: "5px",
                  fontSize: "12px",
                  padding: "8px 16px",
                }}
                  onClick={CloseAllTicket}
                >
                  {i18n.t("tickets.inbox.yes")}
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                style={{
                  color: "white",
                  backgroundColor: "#db6565",
                  boxShadow: "none",
                  borderRadius: "5px",
                  fontSize: "12px",
                  padding: "8px 16px",
                }}
                  onClick={handleSnackbarClose}
                >
                  {i18n.t("tickets.inbox.no")}
                </Button>
              </DialogActions>
            </Dialog>
            <Badge
              color="primary"
              overlap="rectangular"
              invisible={
                isHoveredAll ||
                !isHoveredNew ||
                isHoveredResolve ||
                isHoveredOpen ||
                isHoveredClosed
              }
              badgeContent={i18n.t("tickets.inbox.newTicket")}
              classes={{ badge: classes.tabsBadge }}
            >
              <IconButton
                onMouseEnter={() => setIsHoveredNew(true)}
                onMouseLeave={() => setIsHoveredNew(false)}
                className={classes.button}
                onClick={() => {
                  setNewTicketModalOpen(true);
                }}
              >
                <AddIcon className={classes.icon} />
              </IconButton>
            </Badge>
            {user.profile === "admin" && (
              <Badge
                color="primary"
                overlap="rectangular"
                invisible={
                  isHoveredAll ||
                  isHoveredNew ||
                  !isHoveredResolve ||
                  isHoveredOpen ||
                  isHoveredClosed
                }
                badgeContent={i18n.t("tickets.inbox.closedAll")}
                classes={{ badge: classes.tabsBadge }}
              >
                <IconButton
                  onMouseEnter={() => setIsHoveredResolve(true)}
                  onMouseLeave={() => setIsHoveredResolve(false)}
                  className={classes.button}
                  onClick={handleSnackbarOpen}
                >
                  <PlaylistAddCheckOutlined className={classes.icon} />
                </IconButton>
              </Badge>
            )}
            <Badge
              overlap="rectangular"
              invisible={
                !(
                  tab === "open" &&
                  !isHoveredAll &&
                  !isHoveredNew &&
                  !isHoveredResolve &&
                  !isHoveredClosed &&
                  !isHoveredSort
                ) && !isHoveredOpen
              }
              badgeContent={i18n.t("tickets.inbox.open")}
              classes={{ badge: classes.tabsBadge }}
            >
              <IconButton
                onMouseEnter={() => {
                  setIsHoveredOpen(true);
                  setHoveredButton("open");
                }}
                onMouseLeave={() => {
                  setIsHoveredOpen(false);
                  setHoveredButton(null);
                }}
                style={{
                  height: 40, // Aumentando a altura do botão
                  width: 40, // Aumentando a largura do botão
                  border: isHoveredOpen
                    ? "3px solid #1e3a8a" // Alterando a cor da borda para azul escuro
                    : tab === "open"
                      ? "3px solid #1e3a8a" // Alterando a cor da borda para azul escuro
                      : "2px solid #1e3a8a", // Alterando a cor da borda para azul escuro
                  borderRadius: 0,
                  marginRight: 8,
                }}
                onClick={() => handleChangeTab(null, "open")}
              >
                <MoveToInboxIcon className={classes.icon} />
              </IconButton>
            </Badge>

            <Badge
              color="primary"
              overlap="rectangular"
              invisible={
                !(
                  tab === "closed" &&
                  !isHoveredAll &&
                  !isHoveredNew &&
                  !isHoveredResolve &&
                  !isHoveredOpen &&
                  !isHoveredSort
                ) && !isHoveredClosed
              }
              badgeContent={i18n.t("tickets.inbox.resolverd")}
              classes={{ badge: classes.tabsBadge }}
            >
              <IconButton
                onMouseEnter={() => {
                  setIsHoveredClosed(true);
                  setHoveredButton("closed");
                }}
                onMouseLeave={() => {
                  setIsHoveredClosed(false);
                  setHoveredButton(null);
                }}
                style={{
                  height: 40, // Aumentando a altura do botão
                  width: 40, // Aumentando a largura do botão
                  border: isHoveredClosed
                    ? "3px solid #1e3a8a" // Alterando a cor da borda para azul escuro
                    : tab === "closed"
                      ? "3px solid #1e3a8a" // Alterando a cor da borda para azul escuro
                      : "2px solid #1e3a8a", // Alterando a cor da borda para azul escuro
                  borderRadius: 0,
                  marginRight: 8,
                }}
                onClick={() => handleChangeTab(null, "closed")}
              >
                <CheckBoxIcon className={classes.icon} />
              </IconButton>
            </Badge>
            {tab !== "closed" && tab !== "search" && (
              <Badge
                overlap="rectangular"
                invisible={
                  !isHoveredSort ||
                  isHoveredAll ||
                  isHoveredNew ||
                  isHoveredResolve ||
                  isHoveredOpen ||
                  isHoveredClosed
                }
                badgeContent={!sortTickets ? "Crescente" : "Decrescente"}
                classes={{ badge: classes.tabsBadge }}
              >
                <ToggleButton
                  onMouseEnter={() => setIsHoveredSort(true)}
                  onMouseLeave={() => setIsHoveredSort(false)}
                  className={classes.button}
                  value="uncheck"
                  selected={sortTickets}
                  onChange={() =>
                    setSortTickets((prevState) => !prevState)
                  }
                >
                  {!sortTickets ? (
                    <TextRotateUp className={classes.icon} />
                  ) : (
                    <TextRotationDown className={classes.icon} />
                  )}
                </ToggleButton>
              </Badge>
            )}

            <Tooltip title={compactList ? "Modo compacto" : "Modo confortável"} placement="top">
              <ToggleButton
                className={classes.button}
                value="density"
                selected={compactList}
                onChange={() => setCompactList((prev) => !prev)}
              >
                {compactList ? (
                  <ViewAgenda className={classes.icon} />
                ) : (
                  <ViewStream className={classes.icon} />
                )}
              </ToggleButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <TicketsQueueSelect
              selectedQueueIds={selectedQueueIds}
              userQueues={availableQueues}
              onChange={(values) => setSelectedQueueIds(values)}
            />
          </Grid>
        </Grid>
      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Grid container alignItems="center" justifyContent="center">
                <Grid item>
                  <Badge
                    overlap="rectangular"
                    classes={{ badge: classes.customBadge }}
                    badgeContent={openCount}
                    color="primary"
                  >
                    <MessageSharpIcon
                      style={{
                        fontSize: 18,
                      }}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i18n.t("ticketsList.assignedHeader")}
                  </Typography>
                </Grid>
              </Grid>
            }
            value={"open"}
            name="open"
            classes={{ root: classes.tabPanelItem }}
          />

          <Tab
            label={
              <Grid container alignItems="center" justifyContent="center">
                <Grid item>
                  <Badge
                    overlap="rectangular"
                    classes={{ badge: classes.customBadge }}
                    badgeContent={pendingCount}
                    color="primary"
                  >
                    <ClockIcon
                      style={{
                        fontSize: 18,
                      }}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i18n.t("ticketsList.pendingHeader")}
                  </Typography>
                </Grid>
              </Grid>
            }
            value={"pending"}
            name="pending"
            classes={{ root: classes.tabPanelItem }}
          />

          {user.allowGroup && (
            <Tab
              label={
                <Grid container alignItems="center" justifyContent="center">
                  <Grid item>
                    <Badge
                      overlap="rectangular"
                      classes={{ badge: classes.customBadge }}
                      badgeContent={groupingCount}
                      color="primary"
                    >
                      <Group
                        style={{
                          fontSize: 18,
                        }}
                      />
                    </Badge>
                  </Grid>
                  <Grid item>
                    <Typography
                      style={{
                        marginLeft: 8,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {i18n.t("ticketsList.groupingHeader")}
                    </Typography>
                  </Grid>
                </Grid>
              }
              value={"group"}
              name="group"
              classes={{ root: classes.tabPanelItem }}
            />
          )}
        </Tabs>

        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            sortTickets={sortTickets ? "ASC" : "DESC"}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
            setTabOpen={setTabOpen}
            compact={compactList}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            sortTickets={sortTickets ? "ASC" : "DESC"}
            showAll={user.profile === "admin" || user.allUserChat === 'enabled' ? showAllTickets : false}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
            setTabOpen={setTabOpen}
            compact={compactList}
          />
          {user.allowGroup && (
            <TicketsList
              status="group"
              showAll={showAllTickets}
              sortTickets={sortTickets ? "ASC" : "DESC"}
              selectedQueueIds={selectedQueueIds}
              updateCount={(val) => setGroupingCount(val)}
              style={applyPanelStyle("group")}
              setTabOpen={setTabOpen}
              compact={compactList}
            />
          )}
        </Paper>
      </TabPanel>
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          setTabOpen={setTabOpen}
          compact={compactList}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        {profile === "admin" && (
          <>
            <TicketsList
              statusFilter={selectedStatus}
              searchParam={searchParam}
              showAll={showAllTickets}
              tags={selectedTags}
              users={selectedUsers}
              selectedQueueIds={selectedQueueIds}
              whatsappIds={selectedWhatsapp}
              forceSearch={forceSearch}
              searchOnMessages={searchOnMessages}
              status="search"
              compact={compactList}
            />
          </>
        )}

        {profile === "user" && (
          <TicketsList
            statusFilter={selectedStatus}
            searchParam={searchParam}
            showAll={false}
            tags={selectedTags}
            selectedQueueIds={selectedQueueIds}
            whatsappIds={selectedWhatsapp}
            forceSearch={forceSearch}
            searchOnMessages={searchOnMessages}
            status="search"
            compact={compactList}
          />
        )}
      </TabPanel>
    </Paper>
  );
};

export default TicketsManagerTabs;
