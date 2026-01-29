import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { useHistory } from "react-router-dom";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { makeStyles, Paper, Tabs, Tab, Box, Button, Typography, Divider, TextField, Chip, InputAdornment, Fab, Tooltip, Popper, ClickAwayListener, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from "@material-ui/core";

import TabPanel from "../../components/TabPanel";

import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import Whitelabel from "../../components/Settings/Whitelabel";
import GlassCard from "../../components/UI/GlassCard";
import PrimaryButton from "../../components/UI/PrimaryButton";
import SectionChip from "../../components/UI/SectionChip";
import OutlinedButton from "../../components/UI/OutlinedButton";

// New Imports for Consolidated Flow
import Connections from "../Connections";
import Queues from "../Queues";
import Users from "../Users";
import Tags from "../Tags";
import Prompts from "../Prompts"; // AI/Prompts
import QueueIntegration from "../QueueIntegration"; // Integrations
import Files from "../Files";
import Financeiro from "../Financeiro";
import Annoucements from "../Annoucements";

import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import { AuthContext } from "../../context/Auth/AuthContext";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import useSettings from "../../hooks/useSettings";

// Icons
import SettingsIcon from "@material-ui/icons/Settings";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/List";
import LabelIcon from "@material-ui/icons/Label";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import MemoryIcon from "@material-ui/icons/Memory"; // For AI
import BusinessIcon from "@material-ui/icons/Business";
import HelpIcon from "@material-ui/icons/Help";
import DescriptionIcon from "@material-ui/icons/Description";
import ExtensionIcon from "@material-ui/icons/Extension";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import SearchIcon from "@material-ui/icons/Search";
 
import SecurityIcon from "@material-ui/icons/Security";
import PaymentIcon from "@material-ui/icons/Payment";
import ChatIcon from "@material-ui/icons/Chat";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import StarIcon from "@material-ui/icons/Star";
import CloseIcon from "@material-ui/icons/Close";
import ViewCompactIcon from "@material-ui/icons/ViewCompact";
import ViewStreamIcon from "@material-ui/icons/ViewStream";

const useStyles = makeStyles((theme) => ({
  page: {
    flex: 1,
    height: "100%",
    minHeight: 0,
    display: "flex",
  },
  root: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    height: "100%", // Full height to fit MainContainer
    overflow: "hidden",
    minHeight: 0,
  },
  tabsWrapper: {
    minWidth: 240,
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.65)" : "rgba(255, 255, 255, 0.75)",
    borderRight: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(18px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "100%",
    minHeight: 0,
  },
  tabs: {
    borderRight: "none",
    minWidth: 240,
    background: "transparent",
    flex: "1 1 auto",
    minHeight: 0,
    "& .MuiTabs-scroller": {
      overflowY: "auto",
      ...theme.scrollbarStylesSoft,
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
    "& .MuiTab-wrapper": {
        alignItems: "flex-start",
        paddingLeft: theme.spacing(2),
        flexDirection: "row",
        justifyContent: "flex-start",
        flexWrap: "nowrap",
    },
    "& .MuiTab-root": {
        minHeight: 50,
        textTransform: "none",
        fontSize: "0.95rem",
        opacity: 0.7,
        transition: "all 0.3s",
        margin: "4px 8px",
        borderRadius: "8px",
        "&.Mui-selected": {
            opacity: 1,
            fontWeight: "bold",
            background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)",
            color: "#fff",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }
    },
    "& .MuiSvgIcon-root": {
        marginRight: theme.spacing(2),
        marginBottom: "0 !important",
        flexShrink: 0,
        fontSize: 22,
    }
  },
  settingsSearchContainer: {
    padding: theme.spacing(2, 1, 1, 1),
    flex: "0 0 auto",
  },
  sidebarBrand: {
    padding: theme.spacing(2, 2, 1, 2),
    borderBottom: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
  },
  sidebarBrandTitle: {
    fontWeight: 900,
    letterSpacing: 0.2,
  },
  sidebarBrandSubtitle: {
    opacity: 0.8,
  },
  settingsSearchResults: {
    padding: theme.spacing(1),
    maxHeight: "45vh",
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
    flex: "0 0 auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  settingsSearchResultButton: {
    justifyContent: "flex-start",
    textTransform: "none",
    borderRadius: 12,
    padding: theme.spacing(1.25, 1.5),
  },
  content: {
    flex: 1,
    padding: theme.spacing(0), // No padding here, as children have their own containers
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
    minHeight: 0,
    background:
      theme.palette.type === "dark"
        ? "radial-gradient(1200px 600px at 20% 10%, rgba(0, 242, 255, 0.12) 0%, rgba(0,0,0,0) 55%), radial-gradient(900px 500px at 80% 30%, rgba(189, 0, 255, 0.10) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(17, 24, 39, 0.55) 0%, rgba(17, 24, 39, 0.35) 100%)"
        : "radial-gradient(1200px 600px at 20% 10%, rgba(37, 117, 252, 0.08) 0%, rgba(255,255,255,0) 55%), radial-gradient(900px 500px at 80% 30%, rgba(106, 17, 203, 0.08) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, rgba(244, 246, 248, 1) 0%, rgba(255,255,255,1) 100%)",
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  embeddedPaper: {
    padding: 0,
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    marginBottom: theme.spacing(2),
    background: "transparent",
  },
  // Custom container style for embedded pages to override/adjust their MainContainer
  embeddedContainer: {
      height: "100%",
      "& .MuiContainer-root": {
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          height: "100%",
      }
  },
  studioHeader: {
    padding: theme.spacing(2),
    position: "sticky",
    top: 0,
    zIndex: 10,
    borderBottom: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(16px)",
  },
  progressTrack: {
    height: 3,
    borderRadius: 999,
    background: theme.palette.type === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    overflow: "hidden",
    marginTop: theme.spacing(1.25),
  },
  progressBar: {
    height: "100%",
    width: 0,
    borderRadius: 999,
    background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
    transition: "width .12s ease",
  },
  sectionNavRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    overflowX: "auto",
    paddingTop: theme.spacing(1.5),
    marginTop: theme.spacing(1.5),
    borderTop: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  sectionChip: {
    borderRadius: 999,
    fontWeight: 700,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.25)" : "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    "& .MuiChip-icon": {
      color: "inherit",
    },
  },
  sectionChipActive: {
    color: "white",
    border: "1px solid rgba(0, 242, 255, 0.35)",
    background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
    boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
  },
  studioTabs: {
    padding: theme.spacing(0, 2),
    "& .MuiTabs-indicator": {
      height: 3,
      borderRadius: 3,
      background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
    },
    "& .MuiTab-root": {
      textTransform: "none",
      fontWeight: 600,
      minHeight: 44,
      opacity: 0.75,
    },
    "& .Mui-selected": {
      opacity: 1,
    },
  },
  studioPanel: {
    padding: theme.spacing(2),
  },
  studioCard: {
    padding: theme.spacing(2),
    borderRadius: 16,
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.45)" : "rgba(255, 255, 255, 0.85)",
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(16px)",
    boxShadow: theme.palette.type === "dark" ? "0 12px 32px rgba(0,0,0,0.35)" : "0 6px 18px rgba(0,0,0,0.06)",
  },
  studioFavoriteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  studioFavoriteItem: {
    padding: theme.spacing(2),
    borderRadius: 16,
    background: theme.palette.type === "dark" ? "rgba(30, 30, 47, 0.55)" : "rgba(255, 255, 255, 0.9)",
    border: theme.palette.type === "dark" ? "1px solid rgba(0, 242, 255, 0.18)" : "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(16px)",
    boxShadow: theme.palette.type === "dark"
      ? "0 0 0 1px rgba(189, 0, 255, 0.12), 0 12px 32px rgba(0,0,0,0.35)"
      : "0 6px 18px rgba(0,0,0,0.06)",
  },
  studioFavoriteTitle: {
    fontWeight: 800,
    marginBottom: theme.spacing(1),
  },
  studioFavoriteActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  studioPrimaryButton: {
    color: "white",
    background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    textTransform: "none",
  },
  backToTopFab: {
    position: "fixed",
    right: theme.spacing(3),
    bottom: theme.spacing(3),
    zIndex: 1400,
    color: "white",
    background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
    boxShadow: theme.palette.type === "dark" ? "0 18px 44px rgba(0,0,0,0.45)" : "0 12px 32px rgba(0,0,0,0.12)",
    "&:hover": {
      background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
      filter: "brightness(1.02)",
    },
  },
  progressMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
    flexWrap: "wrap",
  },
  progressPercent: {
    fontWeight: 800,
    letterSpacing: 0.2,
    opacity: 0.85,
  },
  quickJumpField: {
    minWidth: 260,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      minWidth: 0,
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 999,
      background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.75)",
      backdropFilter: "blur(12px)",
    },
  },
  quickJumpPaper: {
    marginTop: theme.spacing(1),
    width: 360,
    maxWidth: "calc(100vw - 32px)",
    borderRadius: 16,
    overflow: "hidden",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.92)" : "rgba(255, 255, 255, 0.96)",
    backdropFilter: "blur(16px)",
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    boxShadow: theme.palette.type === "dark" ? "0 24px 64px rgba(0,0,0,0.55)" : "0 18px 44px rgba(0,0,0,0.14)",
  },
  quickJumpList: {
    padding: theme.spacing(0.5),
    maxHeight: 320,
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
  },
  quickJumpItem: {
    borderRadius: 12,
    "&:hover": {
      background: theme.palette.type === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    },
  },
  favoritesRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    marginTop: theme.spacing(1.25),
  },
  favoritesLabel: {
    fontWeight: 800,
    opacity: 0.8,
  },
  favoriteChip: {
    borderRadius: 999,
    fontWeight: 700,
    background: theme.palette.type === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
    "& .MuiChip-deleteIcon": {
      opacity: 0.85,
    },
  },
  quickActionsRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    marginTop: theme.spacing(1.25),
  },
  quickActionsLabel: {
    fontWeight: 800,
    opacity: 0.8,
  },
  quickActionChip: {
    borderRadius: 999,
    fontWeight: 700,
  },
}));

const SettingsCustom = () => {
  const classes = useStyles();
  const history = useHistory();
  const contentRef = useRef(null);
  const optionsHeaderRef = useRef(null);
  const [tab, setTab] = useState("options");
  const [studioTab, setStudioTab] = useState("ai");
  const [studioQuery, setStudioQuery] = useState("");
  const [studioFavorites, setStudioFavorites] = useState([]);
  const [settingsQuery, setSettingsQuery] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeOptionsSection, setActiveOptionsSection] = useState("settings-section-atendimento");
  const [optionsScrollProgress, setOptionsScrollProgress] = useState(0);
  const [quickJumpQuery, setQuickJumpQuery] = useState("");
  const [quickJumpAnchorEl, setQuickJumpAnchorEl] = useState(null);
  const [optionsFavorites, setOptionsFavorites] = useState([]);
  const [optionsDensity, setOptionsDensity] = useState("comfortable");
  const [optionsSubTab, setOptionsSubTab] = useState("atendimento");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useCompanySettings();
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    async function findData() {
      if (!user?.companyId) return;
      setLoading(true);
      try {
        const companyId = user.companyId;
        const company = await find(companyId);
        const settingList = await getAllSettings(companyId);
        setSettings(settingList);
        setCompany(company);
        setSchedules(company.schedules);

        if (Array.isArray(settingList)) {
          const scheduleType = settingList.find((d) => d.key === "scheduleType");
          if (scheduleType) {
            setSchedulesEnabled(scheduleType.value === "company");
          }
        }
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!socket || !user?.companyId) return;
    const companyId = user.companyId;
    const onSettingsEvent = (data) => {
      if (data.action === "update") {
        setSettings((prevState) => {
          const aux = [...prevState];
          const settingIndex = aux.findIndex((s) => s.key === data.setting.key);
           if (settingIndex !== -1) {
            aux[settingIndex].value = data.setting.value;
          } else {
            aux.push(data.setting);
          }
          return aux;
        });
      }
    };
    socket.on(`company-${companyId}-settings`, onSettingsEvent);
    return () => {
      socket.off(`company-${companyId}-settings`, onSettingsEvent);
    };
  }, [socket, user?.companyId]);

  const favoritesStorageKey = useMemo(() => {
    const companyId = user?.companyId ?? "0";
    const userId = user?.id ?? "0";
    return `zpStudioFavorites:${companyId}:${userId}`;
  }, [user?.companyId, user?.id]);

  const optionsFavoritesStorageKey = useMemo(() => {
    const companyId = user?.companyId ?? "0";
    const userId = user?.id ?? "0";
    return `zpOptionsFavorites:${companyId}:${userId}`;
  }, [user?.companyId, user?.id]);

  const optionsDensityStorageKey = useMemo(() => {
    const companyId = user?.companyId ?? "0";
    const userId = user?.id ?? "0";
    return `zpOptionsDensity:${companyId}:${userId}`;
  }, [user?.companyId, user?.id]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(favoritesStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setStudioFavorites(parsed);
      }
    } catch (e) {}
  }, [favoritesStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(favoritesStorageKey, JSON.stringify(studioFavorites));
    } catch (e) {}
  }, [favoritesStorageKey, studioFavorites]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(optionsFavoritesStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setOptionsFavorites(parsed);
      }
    } catch (e) {}
  }, [optionsFavoritesStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(optionsFavoritesStorageKey, JSON.stringify(optionsFavorites));
    } catch (e) {}
  }, [optionsFavoritesStorageKey, optionsFavorites]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(optionsDensityStorageKey);
      if (raw === "compact" || raw === "comfortable") setOptionsDensity(raw);
    } catch (e) {}
  }, [optionsDensityStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(optionsDensityStorageKey, optionsDensity);
    } catch (e) {}
  }, [optionsDensityStorageKey, optionsDensity]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };
  const handleStudioTabChange = (event, newValue) => {
    setStudioTab(newValue);
  };
  const handleContentScroll = (event) => {
    const el = event.currentTarget;
    const next = el.scrollTop > 280;
    setShowBackToTop(next);
    if (tab === "options") {
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
      setOptionsScrollProgress(Math.max(0, Math.min(100, pct)));
    }
  };
  const scrollToTop = () => {
    if (!contentRef.current) return;
    contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
  };

  const normalizeText = (value) => {
    if (!value) return "";
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const settingsSearchItems = useMemo(() => {
    const base = [
      { id: "options", label: "Opções Gerais", keywords: ["opcoes", "gerais", "configuracoes"], onOpen: () => openSettingsTab("options") },
      { id: "schedules", label: "Horários de Atendimento", keywords: ["horario", "horarios", "atendimento", "expediente"], onOpen: () => openSettingsTab("schedules") },
      { id: "connections", label: "Conexões", keywords: ["conexoes", "whatsapp", "conexao"], onOpen: () => openSettingsTab("connections") },
      { id: "users", label: "Equipe (Usuários)", keywords: ["usuarios", "equipe", "atendentes"], onOpen: () => openSettingsTab("users") },
      { id: "studio", label: "IA & Automações", keywords: ["ia", "automacoes", "automacao", "flowbuilder", "integracoes", "filas"], onOpen: () => openSettingsTab("studio") },
      { id: "tags", label: "Etiquetas (Tags)", keywords: ["tags", "etiquetas"], onOpen: () => openSettingsTab("tags") },
      { id: "files", label: "Arquivos", keywords: ["arquivos", "midia", "files"], onOpen: () => openSettingsTab("files") },
      { id: "financeiro", label: "Financeiro", keywords: ["financeiro", "cobranca", "pagamento"], onOpen: () => openSettingsTab("financeiro") },
      { id: "whitelabel", label: "Whitelabel", keywords: ["whitelabel", "marca", "logo", "cores"], onOpen: () => openSettingsTab("whitelabel") },

      { id: "opt-chatbot", label: "Tipo do Bot (Opções Gerais)", keywords: ["tipo", "bot", "chatbot", "botoes", "lista"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-chatbot-type") },
      { id: "opt-download", label: "Limite de Download (Opções Gerais)", keywords: ["download", "limite", "arquivos", "mb"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-download-limit") },
      { id: "opt-schedule-type", label: "Agendamento de Expediente (Opções Gerais)", keywords: ["agendamento", "expediente", "horario", "schedule", "tipo"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-schedule-type") },
      { id: "opt-user-creation", label: "Criação de Company/Usuários (Opções Gerais)", keywords: ["criacao", "company", "usuarios", "cadastro"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-user-creation") },
      { id: "opt-evaluations", label: "Avaliações (Opções Gerais)", keywords: ["avaliacoes", "rating", "nota"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-user-rating") },
      { id: "opt-greeting", label: "Saudação ao aceitar ticket (Opções Gerais)", keywords: ["saudacao", "aceitar", "ticket", "mensagem"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-send-greeting-accepted") },
      { id: "opt-random-user", label: "Escolher operador aleatório (Opções Gerais)", keywords: ["operador", "aleatorio", "random"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-user-random") },
      { id: "opt-transfer-msg", label: "Mensagem ao transferir (Opções Gerais)", keywords: ["transferir", "transferencia", "mensagem", "setor", "atendente"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-transfer-message") },
      { id: "opt-call-whatsapp", label: "Aviso de ligação WhatsApp (Opções Gerais)", keywords: ["ligacao", "chamada", "whatsapp", "call"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-accept-call-whatsapp") },
      { id: "opt-signature", label: "Permitir retirar assinatura (Opções Gerais)", keywords: ["assinatura", "retirar", "remover"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-send-sign-message") },
      { id: "opt-greeting-one-queue", label: "Saudação com 1 fila (Opções Gerais)", keywords: ["saudacao", "uma fila", "1 fila"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-send-greeting-one-queue") },
      { id: "opt-queue-position", label: "Mensagem posição na fila (Opções Gerais)", keywords: ["posicao", "fila", "mensagem"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-send-queue-position") },
      { id: "opt-farewell", label: "Mensagem despedida no aguardando (Opções Gerais)", keywords: ["despedida", "aguardando", "mensagem"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-send-farewell-waiting") },
      { id: "opt-audio", label: "Aceitar áudio do contato (Opções Gerais)", keywords: ["audio", "aceitar", "contato"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-accept-audio-message-contact") },
      { id: "opt-lgpd-enable", label: "Habilitar LGPD (Opções Gerais)", keywords: ["lgpd", "habilitar", "privacidade"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-enable-lgpd") },
      { id: "opt-required-tag", label: "Tag obrigatória (Opções Gerais)", keywords: ["tag", "obrigatoria", "etiqueta"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-required-tag") },
      { id: "opt-close-on-transfer", label: "Fechar ticket ao transferir (Opções Gerais)", keywords: ["fechar", "ticket", "transferir"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-close-ticket-on-transfer") },
      { id: "opt-notif-pending", label: "Notificação pendente (Opções Gerais)", keywords: ["notificacao", "pendente", "pending"], onOpen: () => openSettingsTabAndScroll("options", "settings-option-show-notification-pending") },

      { id: "lgpd", label: "LGPD (Opções Gerais)", keywords: ["lgpd", "privacidade"], onOpen: () => openSettingsTabAndScroll("options", "settings-lgpd") },
      { id: "efi", label: "PIX Efí / GerenciaNet (Opções Gerais)", keywords: ["pix", "efi", "gerencianet", "gn"], onOpen: () => openSettingsTabAndScroll("options", "settings-payment-efi") },
      { id: "mp", label: "Mercado Pago (Opções Gerais)", keywords: ["mercado", "pago", "mp"], onOpen: () => openSettingsTabAndScroll("options", "settings-payment-mercadopago") },
      { id: "stripe", label: "Stripe (Opções Gerais)", keywords: ["stripe"], onOpen: () => openSettingsTabAndScroll("options", "settings-payment-stripe") },
      { id: "asaas", label: "ASAAS (Opções Gerais)", keywords: ["asaas"], onOpen: () => openSettingsTabAndScroll("options", "settings-payment-asaas") },
      { id: "openai", label: "OpenAI (Transcrição de áudio) (Opções Gerais)", keywords: ["openai", "transcricao", "audio"], onOpen: () => openSettingsTabAndScroll("options", "settings-openai-audio") },
    ];
    if (user?.super) {
      base.push(
        { id: "companies", label: "Empresas", keywords: ["empresas", "company"], onOpen: () => openSettingsTab("companies") },
        { id: "announcements", label: "Avisos", keywords: ["avisos", "anuncios"], onOpen: () => openSettingsTab("announcements") },
        { id: "plans", label: "Planos", keywords: ["planos", "assinatura"], onOpen: () => openSettingsTab("plans") },
        { id: "helps", label: "Ajuda", keywords: ["ajuda", "faq", "suporte"], onOpen: () => openSettingsTab("helps") }
      );
    }
    return base;
  }, [user?.super]);

  const optionsSections = useMemo(() => {
    const base = [
      { id: "settings-section-atendimento", label: "Atendimento", icon: <ChatIcon /> },
      { id: "settings-section-comportamento", label: "Comportamento", icon: <SettingsIcon /> },
      { id: "settings-section-privacidade", label: "Regras", icon: <SecurityIcon /> },
      { id: "settings-lgpd", label: "LGPD", icon: <SecurityIcon /> },
      { id: "settings-custom-messages", label: "Mensagens", icon: <DescriptionIcon /> },
    ];
    if (user?.super) {
      base.splice(4, 0, { id: "settings-payment-efi", label: "Pagamentos", icon: <PaymentIcon /> });
      base.splice(5, 0, { id: "settings-openai-audio", label: "OpenAI", icon: <MemoryIcon /> });
    }
    return base;
  }, [user?.super]);

  const optionsQuickJumpItems = useMemo(() => {
    const q = normalizeText(quickJumpQuery).trim();
    if (!q) return [];
    return settingsSearchItems
      .filter((item) => item?.label?.includes("(Opções Gerais)"))
      .filter((item) => {
        const haystack = normalizeText([item.label, ...(item.keywords || [])].join(" "));
        return haystack.includes(q);
      })
      .slice(0, 10);
  }, [quickJumpQuery, settingsSearchItems]);

  const optionsFavoriteItems = useMemo(() => {
    if (!Array.isArray(optionsFavorites) || !optionsFavorites.length) return [];
    const map = new Map(settingsSearchItems.map((i) => [i.id, i]));
    return optionsFavorites
      .map((id) => map.get(id))
      .filter(Boolean)
      .filter((item) => item?.label?.includes("(Opções Gerais)"));
  }, [optionsFavorites, settingsSearchItems]);

  const optionsSectionShortcuts = useMemo(() => {
    const map = new Map(settingsSearchItems.map((i) => [i.id, i]));
    const sectionToIds = {
      "settings-section-atendimento": ["opt-chatbot", "opt-transfer-msg", "opt-required-tag", "opt-close-on-transfer", "opt-notif-pending"],
      "settings-section-comportamento": ["opt-greeting", "opt-greeting-one-queue", "opt-farewell", "opt-random-user", "opt-signature"],
      "settings-section-privacidade": ["opt-user-creation", "opt-schedule-type", "opt-download", "opt-evaluations", "opt-audio"],
      "settings-lgpd": ["opt-lgpd-enable", "lgpd"],
      "settings-custom-messages": ["opt-greeting", "opt-transfer-msg", "opt-farewell"],
      "settings-payment-efi": ["efi", "mp", "stripe", "asaas"],
      "settings-openai-audio": ["openai"],
    };

    const ids = sectionToIds[activeOptionsSection] || [];
    return ids.map((id) => map.get(id)).filter(Boolean);
  }, [activeOptionsSection, settingsSearchItems]);

  const toggleOptionsFavorite = (id) => {
    setOptionsFavorites((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (list.includes(id)) return list.filter((x) => x !== id);
      return [...list, id].slice(0, 12);
    });
  };

  const handleQuickJumpOpen = (event) => {
    setQuickJumpAnchorEl(event.currentTarget);
  };
  const handleQuickJumpClose = () => {
    setQuickJumpAnchorEl(null);
  };
  const handleQuickJumpSelect = (item) => {
    try {
      if (item && typeof item.onOpen === "function") {
        item.onOpen();
      }
    } finally {
      setQuickJumpQuery("");
      setQuickJumpAnchorEl(null);
    }
  };

  const scrollToSection = (elementId) => {
    const root = contentRef.current;
    if (!root) return;
    const el = document.getElementById(elementId);
    if (!el) return;

    const headerHeight = optionsHeaderRef.current?.getBoundingClientRect?.().height ?? 0;
    const rootTop = root.getBoundingClientRect().top;
    const elTop = el.getBoundingClientRect().top;
    const top = root.scrollTop + (elTop - rootTop) - headerHeight - 12;
    root.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  useEffect(() => {
    if (tab !== "options") return;
    const root = contentRef.current;
    if (!root) return;

    let observer;
    let raf;
    const init = () => {
      const nodes = optionsSections
        .map((s) => document.getElementById(s.id))
        .filter(Boolean);
      if (nodes.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
          if (visible[0]?.target?.id) {
            const nextId = visible[0].target.id;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => setActiveOptionsSection(nextId));
          }
        },
        {
          root,
          threshold: [0.15, 0.25, 0.4],
          rootMargin: "-10% 0px -70% 0px",
        }
      );

      nodes.forEach((n) => observer.observe(n));
      setActiveOptionsSection((prev) => (prev ? prev : nodes[0].id));
    };

    const t = setTimeout(init, 0);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
    };
  }, [tab, optionsSections]);

  const studioActions = useMemo(() => {
    const actions = [
      {
        id: "ai",
        label: "IA (Prompts)",
        keywords: ["ia", "prompts", "openai", "assistente", "bot"],
        onOpen: () => setStudioTab("ai"),
      },
      {
        id: "flowbuilders",
        label: "Flowbuilder (Lista)",
        keywords: ["flow", "flowbuilder", "automacao", "fluxo", "builder"],
        onOpen: () => history.push("/flowbuilders"),
      },
      {
        id: "flowbuilder-new",
        label: "Flowbuilder (Novo Fluxo)",
        keywords: ["flow", "novo", "criar", "flowbuilder", "automacao", "fluxo"],
        onOpen: () => history.push("/flowbuilder"),
      },
      {
        id: "integrations",
        label: "Integrações",
        keywords: ["integracoes", "integracao", "api", "webhook"],
        onOpen: () => setStudioTab("integrations"),
      },
      {
        id: "queues",
        label: "Filas & Chatbots",
        keywords: ["filas", "fila", "chatbot", "setor", "atendimento"],
        onOpen: () => setStudioTab("queues"),
      },
    ];
    return actions;
  }, [history]);

  const favoriteActionItems = useMemo(() => {
    return studioFavorites
      .map((id) => studioActions.find((a) => a.id === id))
      .filter(Boolean);
  }, [studioActions, studioFavorites]);

  const isFavorite = (actionId) => studioFavorites.includes(actionId);
  const toggleFavorite = (actionId) => {
    setStudioFavorites((prev) => {
      if (prev.includes(actionId)) return prev.filter((id) => id !== actionId);
      return [...prev, actionId];
    });
  };

  const filteredStudioActions = useMemo(() => {
    const q = normalizeText(studioQuery).trim();
    if (!q) return [];
    return studioActions.filter((a) => {
      const haystack = normalizeText([a.label, ...(a.keywords || [])].join(" "));
      return haystack.includes(q);
    });
  }, [studioActions, studioQuery]);

  function openSettingsTab(tabValue) {
    setTab(tabValue);
    setSettingsQuery("");
    setStudioQuery("");
    if (tabValue !== "studio") {
      setStudioTab("ai");
    }
  }

  function openSettingsTabAndScroll(tabValue, elementId) {
    setTab(tabValue);
    setSettingsQuery("");
    setStudioQuery("");
    let attempts = 0;
    const tryScroll = () => {
      attempts += 1;
      const root = contentRef.current;
      const el = document.getElementById(elementId);
      if (root && el) {
        const headerHeight = optionsHeaderRef.current?.getBoundingClientRect?.().height ?? 0;
        const rootTop = root.getBoundingClientRect().top;
        const elTop = el.getBoundingClientRect().top;
        const top = root.scrollTop + (elTop - rootTop) - headerHeight - 12;
        root.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        return;
      }
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (attempts < 20) {
        setTimeout(tryScroll, 80);
      }
    };
    setTimeout(tryScroll, 0);
  }

  const filteredSettingsSearchItems = useMemo(() => {
    const q = normalizeText(settingsQuery).trim();
    if (!q) return [];
    return settingsSearchItems.filter((item) => {
      const haystack = normalizeText([item.label, ...(item.keywords || [])].join(" "));
      return haystack.includes(q);
    });
  }, [settingsQuery, settingsSearchItems]);

  const handleSaveSchedules = async (values) => {
    setLoading(true);
    try {
      setSchedules(values);
      await updateSchedules({ id: company.id, schedules: values });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  return (
        <div className={classes.page}>
        <div className={classes.root}>
            <div className={classes.tabsWrapper}>
                <div className={classes.sidebarBrand}>
                    <Typography variant="subtitle1" className={classes.sidebarBrandTitle}>
                        Configurações
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className={classes.sidebarBrandSubtitle}>
                        Painel premium de administração
                    </Typography>
                </div>
                <div className={classes.settingsSearchContainer}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={settingsQuery}
                        onChange={(e) => setSettingsQuery(e.target.value)}
                        placeholder="Buscar nas Configurações…"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>

                {settingsQuery.trim().length > 0 && (
                    <div className={classes.settingsSearchResults}>
                        <GlassCard>
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ gap: 12 }}>
                                <Typography variant="subtitle1" style={{ fontWeight: 800 }}>
                                    Resultados
                                </Typography>
                                <OutlinedButton onClick={() => setSettingsQuery("")}>
                                    Limpar
                                </OutlinedButton>
                            </Box>
                            <Box mt={2} display="flex" flexDirection="column" style={{ gap: 10 }}>
                                {filteredSettingsSearchItems.length === 0 ? (
                                    <Typography variant="body2" color="textSecondary">
                                        Nenhum resultado.
                                    </Typography>
                                ) : (
                                    filteredSettingsSearchItems.map((item) => (
                                        <Button
                                            key={item.id}
                                            variant="outlined"
                                            fullWidth
                                            className={classes.settingsSearchResultButton}
                                            onClick={item.onOpen}
                                        >
                                            {item.label}
                                        </Button>
                                    ))
                                )}
                            </Box>
                        </GlassCard>
                    </div>
                )}

                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={tab}
                    onChange={handleTabChange}
                    aria-label="Settings tabs"
                    className={classes.tabs}
                >
                    <Tab icon={<SettingsIcon />} label="Opções Gerais" value="options" />
                    <Tab icon={<AccessTimeIcon />} label="Horários de Atendimento" value="schedules" />
                    <Tab icon={<WhatsAppIcon />} label="Conexões" value="connections" />
                    <Tab icon={<PeopleIcon />} label="Equipe (Usuários)" value="users" />
                    
                    <Tab icon={<AllInclusiveIcon />} label="IA & Automações" value="studio" />
                    <Tab icon={<LabelIcon />} label="Etiquetas (Tags)" value="tags" />
                    <Tab icon={<AttachFileIcon />} label="Arquivos" value="files" />
                    <Tab icon={<LocalAtmIcon />} label="Financeiro" value="financeiro" />
                    <Tab icon={<ExtensionIcon />} label="Whitelabel" value="whitelabel" />

                    <OnlyForSuperUser
                        user={user}
                        yes={() => (
                            <>
                                <Tab icon={<BusinessIcon />} label="Empresas" value="companies" />
                                <Tab icon={<AnnouncementIcon />} label="Avisos" value="announcements" />
                                <Tab icon={<DescriptionIcon />} label="Planos" value="plans" />
                                <Tab icon={<HelpIcon />} label="Ajuda" value="helps" />
                            </>
                        )}
                    />
                </Tabs>
            </div>

            <div className={classes.content} ref={contentRef} onScroll={handleContentScroll}>
                <TabPanel value={tab} name="options" className={classes.embeddedContainer}>
                    <div className={classes.studioHeader} ref={optionsHeaderRef}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ gap: 12 }}>
                            <Box>
                                <Typography variant="h6" style={{ fontWeight: 800 }}>
                                    Configurações Gerais
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Atendimento, privacidade, integrações e mensagens — tudo organizado em cards.
                                </Typography>
                            </Box>
                            <Box display="flex" flexWrap="wrap" style={{ gap: 10 }}>
                                <OutlinedButton
                                    variant="outlined"
                                    startIcon={<SecurityIcon />}
                                    onClick={() => {
                                        scrollToSection("settings-lgpd");
                                    }}
                                >
                                    LGPD
                                </OutlinedButton>
                                <OutlinedButton
                                    variant="outlined"
                                    startIcon={<PaymentIcon />}
                                    onClick={() => {
                                        scrollToSection("settings-payment-efi");
                                    }}
                                >
                                    Pagamentos
                                </OutlinedButton>
                                <OutlinedButton
                                    startIcon={optionsDensity === "compact" ? <ViewStreamIcon /> : <ViewCompactIcon />}
                                    onClick={() => setOptionsDensity((prev) => (prev === "compact" ? "comfortable" : "compact"))}
                                >
                                    {optionsDensity === "compact" ? "Modo normal" : "Modo compacto"}
                                </OutlinedButton>
                                <PrimaryButton
                                    startIcon={<ChatIcon />}
                                    onClick={() => {
                                        scrollToSection("settings-section-atendimento");
                                    }}
                                >
                                    Atendimento
                                </PrimaryButton>
                            </Box>
                        </Box>
                      <Box mt={2}>
                        <Tabs
                          value={optionsSubTab}
                          onChange={(_, v) => setOptionsSubTab(v)}
                          indicatorColor="primary"
                          textColor="primary"
                          variant="scrollable"
                          scrollButtons="auto"
                        >
                          <Tab value="atendimento" label="Atendimento" />
                          <Tab value="comportamento" label="Comportamento & Mensagens" />
                          <Tab value="privacidade" label="Privacidade & Regras" />
                          <Tab value="lgpd" label="LGPD" />
                          <Tab value="custom" label="Mensagens Personalizadas" />
                        </Tabs>
                      </Box>
                        <div className={classes.sectionNavRow}>
                            {optionsSections.map((s) => (
                                <SectionChip
                                    key={s.id}
                                    icon={s.icon}
                                    label={s.label}
                                    clickable
                                    active={activeOptionsSection === s.id}
                                    onClick={() => scrollToSection(s.id)}
                                  />
                            ))}
                        </div>
                        <div className={classes.progressMetaRow}>
                            <TextField
                                value={quickJumpQuery}
                                onChange={(e) => setQuickJumpQuery(e.target.value)}
                                onFocus={handleQuickJumpOpen}
                                onClick={handleQuickJumpOpen}
                                placeholder="Pular para…"
                                variant="outlined"
                                size="small"
                                className={classes.quickJumpField}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Typography variant="caption" color="textSecondary" className={classes.progressPercent}>
                                {Math.round(optionsScrollProgress)}%
                            </Typography>
                        </div>
                        {optionsFavoriteItems.length > 0 && (
                            <div className={classes.favoritesRow}>
                                <Typography variant="caption" color="textSecondary" className={classes.favoritesLabel}>
                                    Favoritos:
                                </Typography>
                                {optionsFavoriteItems.map((item) => (
                                    <Chip
                                        key={item.id}
                                        label={item.label.replace(" (Opções Gerais)", "")}
                                        onClick={() => handleQuickJumpSelect(item)}
                                        onDelete={() => toggleOptionsFavorite(item.id)}
                                        deleteIcon={<CloseIcon />}
                                        className={classes.favoriteChip}
                                        size="small"
                                    />
                                ))}
                            </div>
                        )}
                        {optionsSectionShortcuts.length > 0 && (
                            <div className={classes.quickActionsRow}>
                                <Typography variant="caption" color="textSecondary" className={classes.quickActionsLabel}>
                                    Ações rápidas:
                                </Typography>
                                {optionsSectionShortcuts.map((item) => (
                                    <Chip
                                        key={item.id}
                                        label={item.label.replace(" (Opções Gerais)", "")}
                                        clickable
                                        onClick={() => handleQuickJumpSelect(item)}
                                        className={classes.quickActionChip}
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                            </div>
                        )}
                        <div className={classes.progressTrack}>
                            <div className={classes.progressBar} style={{ width: `${optionsScrollProgress}%` }} />
                        </div>
                        <Popper
                            open={Boolean(quickJumpAnchorEl) && tab === "options" && quickJumpQuery.trim().length > 0}
                            anchorEl={quickJumpAnchorEl}
                            placement="bottom-start"
                            style={{ zIndex: 1500 }}
                        >
                            <ClickAwayListener onClickAway={handleQuickJumpClose}>
                                <Paper className={classes.quickJumpPaper} elevation={0}>
                                    <List dense className={classes.quickJumpList}>
                                        {optionsQuickJumpItems.length ? (
                                            optionsQuickJumpItems.map((item) => (
                                                <ListItem
                                                    key={item.id}
                                                    button
                                                    className={classes.quickJumpItem}
                                                    onClick={() => handleQuickJumpSelect(item)}
                                                >
                                                    <ListItemText primary={item.label.replace(" (Opções Gerais)", "")} />
                                                    <ListItemSecondaryAction>
                                                        <IconButton
                                                            edge="end"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleOptionsFavorite(item.id);
                                                            }}
                                                            aria-label="Favoritar"
                                                        >
                                                            {optionsFavorites.includes(item.id) ? <StarIcon /> : <StarBorderIcon />}
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))
                                        ) : (
                                            <ListItem className={classes.quickJumpItem}>
                                                <ListItemText primary="Nenhum resultado" />
                                            </ListItem>
                                        )}
                                    </List>
                                </Paper>
                            </ClickAwayListener>
                        </Popper>
                    </div>
                    <div className={classes.studioPanel}>
                        <Paper className={classes.embeddedPaper} elevation={0}>
                            <Options 
                                settings={settings} 
                                scheduleTypeChanged={(value) => setSchedulesEnabled(value === "company")} 
                                user={user}
                                density={optionsDensity}
                            activeSection={
                              optionsSubTab === "atendimento" ? "settings-section-atendimento" :
                              optionsSubTab === "comportamento" ? "settings-section-comportamento" :
                              optionsSubTab === "privacidade" ? "settings-section-privacidade" :
                              optionsSubTab === "lgpd" ? "settings-lgpd" :
                              optionsSubTab === "custom" ? "settings-custom-messages" : undefined
                            }
                            />
                        </Paper>
                    </div>
                </TabPanel>

                <TabPanel value={tab} name="schedules" className={classes.embeddedContainer}>
                    <MainHeader>
                         <Title>Horários de Atendimento</Title>
                    </MainHeader>
                     <Paper className={classes.embeddedPaper} elevation={0}>
                        <SchedulesForm
                            loading={loading}
                            onSubmit={handleSaveSchedules}
                            initialValues={schedules}
                            labelHeader="Horários"
                        />
                     </Paper>
                </TabPanel>

                <TabPanel value={tab} name="connections" className={classes.embeddedContainer}>
                    <Connections />
                </TabPanel>

                <TabPanel value={tab} name="users" className={classes.embeddedContainer}>
                    <Users />
                </TabPanel>

                <TabPanel value={tab} name="marketing" className={classes.embeddedContainer}>
                    <GlassCard>
                        <Marketing />
                    </GlassCard>
                </TabPanel>

                <TabPanel value={tab} name="studio" className={classes.embeddedContainer}>
                    <div className={classes.studioHeader}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ gap: 12 }}>
                            <Box>
                                <Typography variant="h6" style={{ fontWeight: 800 }}>
                                    IA & Automações
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Centralize IA, filas, automações e integrações em um só lugar.
                                </Typography>
                            </Box>
                            <Box display="flex" flexWrap="wrap" style={{ gap: 12 }}>
                                <PrimaryButton
                                    startIcon={<AccountTreeIcon />}
                                    onClick={() => history.push("/flowbuilders")}
                                >
                                    Abrir Flowbuilder
                                </PrimaryButton>
                                <OutlinedButton
                                    variant="outlined"
                                    startIcon={<DeviceHubIcon />}
                                    onClick={() => setStudioTab("integrations")}
                                >
                                    Integrações
                                </OutlinedButton>
                                <OutlinedButton
                                    variant="outlined"
                                    startIcon={<MemoryIcon />}
                                    onClick={() => setStudioTab("ai")}
                                >
                                    IA
                                </OutlinedButton>
                                <OutlinedButton
                                    variant="outlined"
                                    startIcon={<ListIcon />}
                                    onClick={() => setStudioTab("queues")}
                                >
                                    Filas
                                </OutlinedButton>
                            </Box>
                        </Box>
                        <Box mt={2} mb={1}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={studioQuery}
                                onChange={(e) => setStudioQuery(e.target.value)}
                                placeholder="Buscar: fila, prompt, integração, flowbuilder…"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                        {(studioFavorites.length > 0 || studioQuery.trim().length > 0) && (
                            <Box mt={1} display="flex" flexWrap="wrap" style={{ gap: 8 }}>
                                {studioFavorites
                                    .map((id) => studioActions.find((a) => a.id === id))
                                    .filter(Boolean)
                                    .map((a) => (
                                        <Chip
                                            key={a.id}
                                            label={`Fixado: ${a.label}`}
                                            onClick={a.onOpen}
                                            onDelete={() => toggleFavorite(a.id)}
                                            variant="outlined"
                                        />
                                    ))}
                            </Box>
                        )}
                        <Box mt={2}>
                            <Tabs
                                value={studioTab}
                                onChange={handleStudioTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                className={classes.studioTabs}
                            >
                                <Tab icon={<MemoryIcon />} label="IA" value="ai" />
                                <Tab icon={<AccountTreeIcon />} label="Flowbuilder" value="flowbuilder" />
                                <Tab icon={<DeviceHubIcon />} label="Integrações" value="integrations" />
                                <Tab icon={<ListIcon />} label="Filas & Chatbots" value="queues" />
                            </Tabs>
                        </Box>
                    </div>

                    <div className={classes.studioPanel}>
                        {studioQuery.trim().length === 0 && favoriteActionItems.length > 0 && (
                            <div className={classes.studioFavoriteGrid}>
                                {favoriteActionItems.map((a) => (
                                    <GlassCard key={a.id}>
                                        <Typography variant="subtitle1" className={classes.studioFavoriteTitle}>
                                            {a.label}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Acesso rápido fixado.
                                        </Typography>
                                        <div className={classes.studioFavoriteActions}>
                                        <PrimaryButton onClick={a.onOpen}>
                                            Abrir
                                        </PrimaryButton>
                                        <OutlinedButton
                                                onClick={() => toggleFavorite(a.id)}
                                            >
                                                Desafixar
                                        </OutlinedButton>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                        {studioQuery.trim().length > 0 && (
                            <GlassCard style={{ marginBottom: 16 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ gap: 12 }}>
                                    <Typography variant="h6" style={{ fontWeight: 800 }}>
                                        Resultados da busca
                                    </Typography>
                                    <OutlinedButton onClick={() => setStudioQuery("")}>
                                        Limpar
                                    </OutlinedButton>
                                </Box>
                                <Box mt={2} display="flex" flexDirection="column" style={{ gap: 10 }}>
                                    {filteredStudioActions.length === 0 ? (
                                        <Typography variant="body2" color="textSecondary">
                                            Nenhum resultado.
                                        </Typography>
                                    ) : (
                                        filteredStudioActions.map((a) => (
                                            <Box key={a.id} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ gap: 10 }}>
                                                <OutlinedButton
                                                    onClick={() => {
                                                        a.onOpen();
                                                        setStudioQuery("");
                                                    }}
                                                >
                                                    {a.label}
                                                </OutlinedButton>
                                                <OutlinedButton
                                                    onClick={() => toggleFavorite(a.id)}
                                                >
                                                    {isFavorite(a.id) ? "Fixado" : "Fixar"}
                                                </OutlinedButton>
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            </GlassCard>
                        )}
                        {studioTab === "ai" && (
                            <GlassCard>
                                <Prompts />
                            </GlassCard>
                        )}

                        {studioTab === "integrations" && (
                            <GlassCard>
                                <QueueIntegration />
                            </GlassCard>
                        )}

                        {studioTab === "queues" && (
                            <GlassCard>
                                <Queues />
                            </GlassCard>
                        )}

                        {studioTab === "flowbuilder" && (
                            <GlassCard>
                                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ gap: 12 }}>
                                    <Box>
                                        <Typography variant="h6" style={{ fontWeight: 800 }}>
                                            Flowbuilder
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Crie fluxos de automação para marketing, campanhas e atendimento.
                                        </Typography>
                                    </Box>
                                    <Box display="flex" flexWrap="wrap" style={{ gap: 12 }}>
                                        <PrimaryButton
                                            startIcon={<AccountTreeIcon />}
                                            onClick={() => history.push("/flowbuilders")}
                                        >
                                            Ver Fluxos
                                        </PrimaryButton>
                                        <OutlinedButton
                                            onClick={() => history.push("/flowbuilder")}
                                        >
                                            Novo Fluxo
                                        </OutlinedButton>
                                    </Box>
                                </Box>
                                <Box mt={2} mb={2}>
                                    <Divider />
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                    Dica: você também encontra o Flowbuilder no menu lateral em Marketing e em CRM (Automação).
                                </Typography>
                            </GlassCard>
                        )}
                    </div>
                </TabPanel>

                 <TabPanel value={tab} name="tags" className={classes.embeddedContainer}>
                    <Tags />
                </TabPanel>

                <TabPanel value={tab} name="files" className={classes.embeddedContainer}>
                    <Files />
                </TabPanel>

                <TabPanel value={tab} name="financeiro" className={classes.embeddedContainer}>
                    <Financeiro />
                </TabPanel>

                <TabPanel value={tab} name="whitelabel" className={classes.embeddedContainer}>
                     <MainHeader>
                         <Title>Whitelabel</Title>
                    </MainHeader>
                    <Paper className={classes.embeddedPaper} elevation={0}>
                        <Whitelabel settings={settings} />
                    </Paper>
                </TabPanel>

                <OnlyForSuperUser
                    user={user}
                    yes={() => (
                        <>
                            <TabPanel value={tab} name="companies" className={classes.embeddedContainer}>
                                <CompaniesManager />
                            </TabPanel>
                            <TabPanel value={tab} name="announcements" className={classes.embeddedContainer}>
                                <Annoucements />
                            </TabPanel>
                            <TabPanel value={tab} name="plans" className={classes.embeddedContainer}>
                                <PlansManager />
                            </TabPanel>
                            <TabPanel value={tab} name="helps" className={classes.embeddedContainer}>
                                <HelpsManager />
                            </TabPanel>
                        </>
                    )}
                />
            </div>
        </div>
        {showBackToTop && (
            <Tooltip title="Voltar ao topo" placement="left">
                <Fab className={classes.backToTopFab} onClick={scrollToTop} aria-label="Voltar ao topo" size="medium">
                    <KeyboardArrowUpIcon />
                </Fab>
            </Tooltip>
        )}
        </div>
  );
};

export default SettingsCustom;
