import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Collapse from "@material-ui/core/Collapse";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

// Ícones modernos
import DashboardIcon from "@mui/icons-material/Dashboard";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CodeIcon from "@mui/icons-material/Code";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ForumIcon from "@mui/icons-material/Forum";
import BusinessIcon from "@mui/icons-material/Business";
import CampaignIcon from "@mui/icons-material/Campaign";
import ShapeLineIcon from "@mui/icons-material/ShapeLine";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import AndroidIcon from "@mui/icons-material/Android";
import PaymentIcon from "@mui/icons-material/Payment";
import AssignmentIcon from "@mui/icons-material/Assignment";

import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";
import { Can } from "../components/Can";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import { i18n } from "../translate/i18n";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "48px",
    width: "auto",
    borderRadius: "12px", // Modern rounded corners
    margin: "4px 8px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.type === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
      transform: "translateX(4px)", // Subtle slide effect
    },
    "&.active": {
      backgroundColor: theme.palette.type === 'dark' ? "rgba(0, 242, 255, 0.1)" : "rgba(0, 124, 102, 0.1)",
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      "& .MuiTypography-root": {
        fontWeight: "600",
        color: theme.palette.primary.main,
        textShadow: theme.palette.type === 'dark' ? "0 0 10px rgba(0, 242, 255, 0.4)" : "none",
      },
    },
  },
  listItemText: {
    fontSize: "14px",
    fontWeight: 500,
    color: theme.palette.text.secondary,
    transition: "color 0.3s",
    "&.active": {
      fontWeight: "600",
      color: theme.palette.primary.main,
    },
  },
  iconHoverActive: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10px",
    height: 36,
    width: 36,
    backgroundColor: "transparent",
    color: theme.palette.text.secondary,
    transition: "all 0.3s ease",
    "&:hover, &.active": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      boxShadow: `0 0 12px ${theme.palette.primary.main}`, // Glow effect
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.4rem",
    },
  },
  submenu: {
    backgroundColor: theme.palette.type === 'dark' ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.02)",
    borderRadius: "12px",
    margin: "4px 8px",
    padding: "4px 0",
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
  subheader: {
    backgroundColor: "transparent",
    color: theme.palette.text.secondary,
    fontWeight: "bold",
    padding: theme.spacing(1, 2),
  },
  activeSubmenuHeader: {
    backgroundColor: theme.palette.type === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
    "& .MuiTypography-root": {
      fontWeight: "bold",
      color: theme.palette.primary.main,
    },
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge, onClick } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <li>
        <ListItem 
          button 
          component={renderLink} 
          onClick={onClick}
          className={`${classes.listItem} ${isActive ? "active" : ""}`}
        >
          {icon ? (
            <ListItemIcon>
              {showBadge ? (
                <Badge badgeContent="!" color="error" overlap="circular">
                  <Avatar className={`${classes.iconHoverActive} ${isActive ? "active" : ""}`}>{icon}</Avatar>
                </Badge>
              ) : (
                <Avatar className={`${classes.iconHoverActive} ${isActive ? "active" : ""}`}>{icon}</Avatar>
              )}
            </ListItemIcon>
          ) : null}
          <ListItemText 
            primary={
              <Typography className={`${classes.listItemText} ${isActive ? "active" : ""}`}>
                {primary}
              </Typography>
            } 
          />
        </ListItem>
      </li>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CHATS":
      return [...state, ...action.payload];
    case "UPDATE_CHATS":
      return state.map((chat) => (chat.id === action.payload.id ? action.payload : chat));
    case "DELETE_CHAT":
      return state.filter((chat) => chat.id !== action.payload);
    case "RESET":
      return [];
    case "CHANGE_CHAT":
      return state.map((chat) => (chat.id === action.payload.chat.id ? action.payload.chat : chat));
    default:
      return state;
  }
};

const MainListItems = ({ collapsed, drawerClose, onExpand }) => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();
  const isMountedRef = React.useRef(false);

  const [openManagementSubmenu, setOpenManagementSubmenu] = useState(false);
  const [openCommunicationSubmenu, setOpenCommunicationSubmenu] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openAdministrationSubmenu, setOpenAdministrationSubmenu] = useState(false);
  const [openIntegrationSubmenu, setOpenIntegrationSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [planExpired, setPlanExpired] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [managementHover, setManagementHover] = useState(false);
  const [communicationHover, setCommunicationHover] = useState(false);
  const [administrationHover, setAdministrationHover] = useState(false);
  const { list } = useHelps();
  const [hasHelps, setHasHelps] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    async function checkHelps() {
      const helps = await list();
      if (isMountedRef.current) {
        setHasHelps(helps.length > 0);
      }
    }
    checkHelps();
  }, [list]);

  // Verifica qual submenu deve estar aberto com base na rota atual
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard") ||
        location.pathname.startsWith("/reports") || 
        location.pathname.startsWith("/moments")) {
      setOpenManagementSubmenu(true);
    }

    if (location.pathname.startsWith("/tickets") ||
        location.pathname.startsWith("/quick-messages") ||
        location.pathname.startsWith("/contacts") ||
        location.pathname.startsWith("/schedules") ||
        location.pathname.startsWith("/tags") ||
        location.pathname.startsWith("/chats")) {
      setOpenCommunicationSubmenu(true);
    }

    if (location.pathname.startsWith("/campaigns") || 
        location.pathname.startsWith("/contact-lists") || 
        location.pathname.startsWith("/campaigns-config")) {
      setOpenCampaignSubmenu(true);
    }

 

    if (location.pathname.startsWith("/users") ||
        location.pathname.startsWith("/queues") ||
        location.pathname.startsWith("/prompts") ||
        location.pathname.startsWith("/queue-integration") ||
        location.pathname.startsWith("/connections") ||
        location.pathname.startsWith("/allConnections") ||
        location.pathname.startsWith("/files") ||
        location.pathname.startsWith("/financeiro") ||
        location.pathname.startsWith("/settings") ||
        location.pathname.startsWith("/companies")) {
      setOpenAdministrationSubmenu(true);
    }

    if (location.pathname.startsWith("/messages-api") ||
        location.pathname.startsWith("/kanban")) {
      setOpenIntegrationSubmenu(true);
    }
  }, [location.pathname]);

  const isManagementActive =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/reports") || 
    location.pathname.startsWith("/moments");

  const isCommunicationActive =
    location.pathname.startsWith("/tickets") ||
    location.pathname.startsWith("/quick-messages") ||
    location.pathname.startsWith("/contacts") ||
    location.pathname.startsWith("/schedules") ||
    location.pathname.startsWith("/tags") ||
    location.pathname.startsWith("/chats");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

 

  const isAdministrationActive =
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/queues") ||
    location.pathname.startsWith("/prompts") ||
    location.pathname.startsWith("/queue-integration") ||
    location.pathname.startsWith("/connections") ||
    location.pathname.startsWith("/allConnections") ||
    location.pathname.startsWith("/files") ||
    location.pathname.startsWith("/financeiro") ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/companies");

  const isIntegrationActive =
    location.pathname.startsWith("/messages-api") ||
    location.pathname.startsWith("/kanban");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();

 

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      if (user?.companyId) {
        const companyId = user.companyId;
        const planConfigs = await getPlanCompany(undefined, companyId);
        
        if (!isMountedRef.current) return;

        setShowCampaigns(planConfigs.plan.useCampaigns);
        setShowKanban(planConfigs.plan.useKanban);
        setShowInternalChat(planConfigs.plan.useInternalChat);
        setShowExternalApi(planConfigs.plan.useExternalApi);
        
        if (user?.company?.dueDate) {
          setPlanExpired(moment(moment().format()).isBefore(user.company.dueDate));
        }
      }
    }
    fetchData();
  }, [user, getPlanCompany]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id) {
      const companyId = user.companyId;
      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };

      socket.on(`company-${companyId}-chat`, onCompanyChatMainListItems);
      return () => {
        socket.off(`company-${companyId}-chat`, onCompanyChatMainListItems);
      };
    }
  }, [socket, user.companyId, user.id]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

 

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      if (isMountedRef.current) {
        dispatch({ type: "LOAD_CHATS", payload: data.records });
      }
    } catch (err) {
      if (isMountedRef.current) {
        toastError(err);
      }
    }
  };

  return (
    <div>
      {/* Seção de Gerenciamento */}
      {planExpired && (
        <Can
          role={
            (user.profile === "user" && user.showDashboard === "enabled") || user.allowRealTime === "enabled"
              ? "admin"
              : user.profile
          }
          perform={"drawer-admin-items:view"}
          yes={() => (
            <>
              <Tooltip title={collapsed ? i18n.t("mainDrawer.listItems.management") : ""} placement="right">
                <ListItem
                  dense
                  button
                  onClick={() => {
                    if (collapsed && typeof onExpand === "function") onExpand();
                    setOpenManagementSubmenu((prev) => !prev);
                  }}
                  onMouseEnter={() => setManagementHover(true)}
                  onMouseLeave={() => setManagementHover(false)}
                  className={isManagementActive ? classes.activeSubmenuHeader : ""}
                >
                  <ListItemIcon>
                    <Avatar
                      className={`${classes.iconHoverActive} ${isManagementActive || managementHover ? "active" : ""}`}
                    >
                      <DashboardIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography className={`${classes.listItemText} ${isManagementActive ? "active" : ""}`}>
                        {i18n.t("mainDrawer.listItems.management")}
                      </Typography>
                    }
                  />
                  {openManagementSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItem>
              </Tooltip>
               <Collapse in={openManagementSubmenu && !collapsed} timeout="auto" unmountOnExit className={classes.submenu}>
        <Can
          role={user.profile === "user" && user.showDashboard === "enabled" ? "admin" : user.profile}
          perform={"drawer-admin-items:view"}
          yes={() => (
            <>
              <ListItemLink
                small
                to="/dashboard"
                primary="Dashboard"
                icon={<DashboardIcon />}
                tooltip={collapsed}
                  onClick={drawerClose}
              />
              <ListItemLink
                small
                to="/reports"
                primary={i18n.t("mainDrawer.listItems.reports")}
                icon={<ListAltIcon />}
                tooltip={collapsed}
                  onClick={drawerClose}
              />
            </>
          )}
        />
        <Can
          role={user.profile === "user" && user.allowRealTime === "enabled" ? "admin" : user.profile}
          perform={"drawer-admin-items:view"}
          yes={() => (
            <ListItemLink
              to="/moments"
              primary={i18n.t("mainDrawer.listItems.chatsTempoReal")}
              icon={<ForumIcon />}
              tooltip={collapsed}
                onClick={drawerClose}
            />
          )}
        />
      </Collapse>
            </>
          )}
        />
      )}

      {/* Seção de Comunicação */}
      <Tooltip title={collapsed ? i18n.t("Comunicação") : ""} placement="right">
        <ListItem
          dense
          button
          onClick={() => {
            if (collapsed && typeof onExpand === "function") onExpand();
            setOpenCommunicationSubmenu((prev) => !prev);
          }}
          onMouseEnter={() => setCommunicationHover(true)}
          onMouseLeave={() => setCommunicationHover(false)}
          className={isCommunicationActive ? classes.activeSubmenuHeader : ""}
        >
          <ListItemIcon>
            <Avatar
              className={`${classes.iconHoverActive} ${isCommunicationActive || communicationHover ? "active" : ""}`}
            >
              <ChatBubbleIcon />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography className={`${classes.listItemText} ${isCommunicationActive ? "active" : ""}`}>
                Atendimento
              </Typography>
            }
          />
          {openCommunicationSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>
      </Tooltip>
      <Collapse in={openCommunicationSubmenu && !collapsed} timeout="auto" unmountOnExit className={classes.submenu}>
        {planExpired && (
          <ListItemLink
            to="/tickets"
            primary={i18n.t("mainDrawer.listItems.tickets")}
            icon={<WhatsAppIcon />}
            tooltip={collapsed}
            onClick={drawerClose}
          />
        )}

        {planExpired && (
          <ListItemLink
            to="/quick-messages"
            primary={i18n.t("mainDrawer.listItems.quickMessages")}
            icon={<FlashOnIcon />}
            tooltip={collapsed}
            onClick={drawerClose}
          />
        )}

        {planExpired && (
          <ListItemLink
            to="/schedules"
            primary={i18n.t("mainDrawer.listItems.schedules")}
            icon={<EventAvailableIcon />}
            tooltip={collapsed}
            onClick={drawerClose}
          />
        )}

        {showInternalChat && planExpired && (
          <ListItemLink
            to="/chats"
            primary={i18n.t("mainDrawer.listItems.chats")}
            icon={
              <Badge color="secondary" variant="dot" invisible={invisible} overlap="rectangular">
                <ForumIcon />
              </Badge>
            }
            tooltip={collapsed}
            onClick={drawerClose}
          />
        )}
      </Collapse>

      {/* Seção de CRM (Novo) */}
      <Tooltip title={collapsed ? "CRM" : ""} placement="right">
        <ListItem
            dense
            button
            onClick={() => {
              if (collapsed && typeof onExpand === "function") onExpand();
              setOpenIntegrationSubmenu((prev) => !prev);
            }}
            className={isIntegrationActive ? classes.activeSubmenuHeader : ""}
        >
            <ListItemIcon>
                <Avatar className={classes.iconHoverActive}><PeopleIcon /></Avatar>
            </ListItemIcon>
            <ListItemText primary={<Typography className={classes.listItemText}>CRM</Typography>} />
            {openIntegrationSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>
      </Tooltip>
      <Collapse in={openIntegrationSubmenu && !collapsed} timeout="auto" unmountOnExit className={classes.submenu}>
        <ListItemLink
            to="/contacts"
            primary={i18n.t("mainDrawer.listItems.contacts")}
            icon={<ContactPhoneIcon />}
            tooltip={collapsed}
            onClick={drawerClose}
        />
        {showKanban && planExpired && (
          <ListItemLink
            to="/kanban"
            primary={i18n.t("mainDrawer.listItems.kanban")}
            icon={<ViewKanbanIcon />}
            tooltip={collapsed}
            onClick={drawerClose}
          />
        )}
        <ListItemLink
            to="/todolist"
            primary={i18n.t("Tarefas")}
            icon={<AssignmentIcon />}
            onClick={drawerClose}
        />
      </Collapse>


      {/* Seção de Campanhas & Marketing */}
      {showCampaigns && planExpired && (
        <Can
          role={user.profile}
          perform="dashboard:view"
          yes={() => (
            <>
              <Tooltip title={collapsed ? i18n.t("mainDrawer.listItems.campaigns") : ""} placement="right">
                <ListItem
                  dense
                  button
                  onClick={() => {
                    if (collapsed && typeof onExpand === "function") onExpand();
                    setOpenCampaignSubmenu((prev) => !prev);
                  }}
                  className={isCampaignRouteActive ? classes.activeSubmenuHeader : ""}
                >
                  <ListItemIcon>
                    <Avatar className={classes.iconHoverActive}><CampaignIcon /></Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography className={classes.listItemText}>
                        Marketing
                      </Typography>
                    }
                  />
                  {openCampaignSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItem>
              </Tooltip>
              <Collapse in={openCampaignSubmenu && !collapsed} timeout="auto" unmountOnExit className={classes.submenu}>
                  <ListItemLink
                    to="/phrase-lists"
                    primary={"Fluxo de Campanha"}
                    icon={<CampaignIcon />}
                    tooltip={collapsed}
                    onClick={drawerClose}
                  />
                  <ListItemLink
                    to="/marketing"
                    primary={"Marketing Pro"}
                    icon={<CampaignIcon />}
                    tooltip={collapsed}
                    onClick={drawerClose}
                  />
                  <ListItemLink
                    to="/campaigns"
                    primary={i18n.t("campaigns.subMenus.list")}
                    icon={<ListAltIcon />}
                    tooltip={collapsed}
                    onClick={drawerClose}
                  />
                  <ListItemLink
                    to="/contact-lists"
                    primary={i18n.t("campaigns.subMenus.listContacts")}
                    icon={<PeopleIcon />}
                    tooltip={collapsed}
                    onClick={drawerClose}
                  />
                  <ListItemLink
                    to="/campaigns-config"
                    primary={i18n.t("campaigns.subMenus.settings")}
                    icon={<SettingsIcon />}
                    tooltip={collapsed}
                    onClick={drawerClose}
                  />
              </Collapse>
            </>
          )}
        />
      )}

      {/* Seção de Administração */}
      <Can
        role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            
            <Tooltip title={collapsed ? "Administração" : ""} placement="right">
              <ListItem
                dense
                button
                onClick={() => {
                  if (collapsed && typeof onExpand === "function") onExpand();
                  setOpenAdministrationSubmenu((prev) => !prev);
                }}
                onMouseEnter={() => setAdministrationHover(true)}
                onMouseLeave={() => setAdministrationHover(false)}
                className={isAdministrationActive ? classes.activeSubmenuHeader : ""}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${isAdministrationActive || administrationHover ? "active" : ""}`}
                  >
                    <SettingsIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className={`${classes.listItemText} ${isAdministrationActive ? "active" : ""}`}>
                      Administração
                    </Typography>
                  }
                />
                {openAdministrationSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
            </Tooltip>
            <Collapse in={openAdministrationSubmenu && !collapsed} timeout="auto" unmountOnExit className={classes.submenu}>
              <ListItemLink
                to="/agent-setup"
                primary="Canal & Robô"
                icon={<AndroidIcon />}
                tooltip={collapsed}
                onClick={drawerClose}
              />
              <ListItemLink
                to="/queue-integration"
                primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                icon={<ShapeLineIcon />}
                tooltip={collapsed}
                onClick={drawerClose}
              />
              <ListItemLink
                to="/subscription"
                primary="Planos e Assinatura"
                icon={<PaymentIcon />}
                tooltip={collapsed}
                onClick={drawerClose}
              />
              {user.super && (
                <ListItemLink
                  to="/announcements"
                  primary={i18n.t("mainDrawer.listItems.annoucements")}
                  icon={<AnnouncementIcon />}
                  tooltip={collapsed}
                  onClick={drawerClose}
                />
              )}

              {showExternalApi && planExpired && (
                <Can
                  role={user.profile}
                  perform="drawer-admin-items:view"
                  yes={() => (
                    <ListItemLink
                      to="/messages-api"
                      primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                      icon={<CodeIcon />}
                      tooltip={collapsed}
                      onClick={drawerClose}
                    />
                  )}
                />
              )}

              {user.super && (
                <ListItemLink
                  to="/allConnections"
                  primary={i18n.t("mainDrawer.listItems.allConnections")}
                  icon={<SyncAltIcon />}
                  tooltip={collapsed}
                  onClick={drawerClose}
                />
              )}

              {user.super && (
                <ListItemLink
                  to="/companies"
                  primary={i18n.t("mainDrawer.listItems.companies")}
                  icon={<BusinessIcon />}
                  tooltip={collapsed}
                  onClick={drawerClose}
                />
              )}

              {planExpired && (
                <Can
                  role={user.profile}
                  perform="drawer-admin-items:view"
                  yes={() => (
                    <ListItemLink
                      to="/settings"
                      primary={i18n.t("mainDrawer.listItems.settings")}
                      icon={<SettingsIcon />}
                      tooltip={collapsed}
                      onClick={drawerClose}
                    />
                  )}
                />
              )}

              <ListItemLink
                to="/helps"
                primary={i18n.t("mainDrawer.listItems.helps")}
                icon={<HelpOutlineIcon />}
                tooltip={collapsed}
                onClick={drawerClose}
              />
              <ListItemLink
                to="/documentacao"
                primary={i18n.t("Documentação")}
                icon={<CodeIcon />}
                tooltip={collapsed}
                onClick={drawerClose}
              />
            </Collapse>
          </>
        )}
      />

      {!collapsed && (
        <React.Fragment>
          <Divider />
          <Typography
            style={{
              fontSize: "12px",
              padding: "10px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
           
          </Typography>
        </React.Fragment>
      )}
    </div>
  );
};

export default MainListItems;
