import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Tabs, Tab, Divider, Chip, Stepper, Step, StepLabel, CircularProgress, Avatar, Tooltip, InputAdornment, List, ListItem, ListItemAvatar, ListItemText, IconButton, Paper, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, FormControl, InputLabel, Select } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import api from "../../services/api";
import { socketConnection } from "../../services/socket";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import SendIcon from "@material-ui/icons/Send";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CampaignIcon from "@mui/icons-material/Campaign";
import PublicIcon from "@mui/icons-material/Public";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import WidgetsIcon from "@mui/icons-material/Widgets";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import LinkIcon from "@mui/icons-material/Link";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PostAddIcon from "@mui/icons-material/PostAdd";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import TabPanel from "../../components/TabPanel";
import { Skeleton } from "@material-ui/lab";
import Chart from "react-apexcharts";
import CardBalance from "../../components/CardBalance/CardBalance";
import CardDeposit from "../../components/CardDeposit/CardDeposit";
import useSettings from "../../hooks/useSettings";
import useWhatsApps from "../../hooks/useWhatsApps";
import ConnectionIcon from "../../components/ConnectionIcon";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
    height: "calc(100vh - 48px)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    backgroundAttachment: "fixed",
    background:
      theme.palette.type === "dark"
        ? "radial-gradient(1200px 600px at 20% 10%, rgba(37, 117, 252, 0.10) 0%, rgba(0,0,0,0) 55%), radial-gradient(900px 500px at 80% 30%, rgba(106, 17, 203, 0.10) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(17, 24, 39, 0.65) 0%, rgba(17, 24, 39, 0.35) 100%)"
        : "radial-gradient(1200px 600px at 20% 10%, rgba(37, 117, 252, 0.08) 0%, rgba(255,255,255,0) 55%), radial-gradient(900px 500px at 80% 30%, rgba(106, 17, 203, 0.08) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, rgba(244, 246, 248, 1) 0%, rgba(255,255,255,1) 100%)",
    color: theme.palette.text.primary,
    flex: 1,
    overflowX: "hidden"
  },
  header: {
    marginBottom: theme.spacing(4)
  },
  card: {
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.55)" : "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(14px)",
    boxShadow: theme.palette.type === "dark" ? "0 18px 44px rgba(0,0,0,0.45)" : "0 8px 24px rgba(0,0,0,0.10)",
    height: "100%",
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: theme.palette.type === "dark" ? "0 22px 56px rgba(0,0,0,0.55)" : "0 14px 34px rgba(0,0,0,0.14)",
    },
    color: theme.palette.text.primary
  },
  cardHeader: {
    padding: theme.spacing(2),
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.02)",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2)
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: "1.1rem",
    color: theme.palette.text.primary
  },
  cardContent: {
    padding: theme.spacing(3),
    color: theme.palette.text.primary,
  },
  tabRoot: {
    borderRadius: 16,
    marginBottom: theme.spacing(3),
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(14px)",
    boxShadow: theme.palette.type === "dark" ? "0 18px 44px rgba(0,0,0,0.35)" : "0 8px 24px rgba(0,0,0,0.08)",
    "& .MuiTab-root": {
      color: theme.palette.text.secondary,
      "&.Mui-selected": {
        color: theme.palette.primary.main,
        fontWeight: 700
      }
    },
    "& .MuiTabs-indicator": {
      backgroundColor: theme.palette.primary.main
    }
  },
  mutedText: {
    color: theme.palette.text.secondary,
  },
  backButton: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
    textTransform: "none",
  },
  pageTitle: {
    fontWeight: 800,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    backgroundColor: theme.palette.primary.main,
  },
  statVal: {
    fontWeight: 800,
    fontSize: "2rem",
    background: "linear-gradient(45deg, #60a5fa 30%, #a78bfa 90%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  input: {
    "& .MuiOutlinedInput-root": {
      color: theme.palette.text.primary,
      "& fieldset": {
        borderColor:
          theme.palette.type === "dark"
            ? "rgba(255, 255, 255, 0.23)"
            : "rgba(0, 0, 0, 0.23)",
      },
      "&:hover fieldset": {
        borderColor:
          theme.palette.type === "dark"
            ? "rgba(255, 255, 255, 0.5)"
            : "rgba(0, 0, 0, 0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#60a5fa",
      },
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.text.secondary,
      "&.Mui-focused": {
        color: "#60a5fa",
      },
    },
    "& .MuiInputBase-input": {
        color: theme.palette.text.primary
    }
  },
  button: {
    background: "linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)",
    border: 0,
    borderRadius: 30,
    boxShadow: "0 3px 5px 2px rgba(37, 99, 235, .3)",
    color: "white",
    height: 48,
    padding: "0 30px",
    fontWeight: "bold",
    "&:hover": {
      background: "linear-gradient(45deg, #1d4ed8 30%, #6d28d9 90%)",
      boxShadow: "0 6px 10px 4px rgba(37, 99, 235, .3)",
    }
  }
}));

const Section = ({ icon, title, children }) => {
  const classes = useStyles();
  return (
    <Box>
      <div className={classes.cardHeader}>
        <Avatar className={classes.sectionIcon}>{icon}</Avatar>
        <Typography className={classes.cardTitle}>{title}</Typography>
      </div>
      <div className={classes.cardContent}>
        {children}
      </div>
    </Box>
  );
};

const Marketing = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState("Campanha WhatsApp");
  const [objective, setObjective] = useState("MESSAGES");
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusErrorMsg, setStatusErrorMsg] = useState("");
  const [insights, setInsights] = useState([]);
  const [insightsError, setInsightsError] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [datePreset, setDatePreset] = useState("last_7d");
  const [insightsErrorMsg, setInsightsErrorMsg] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [adsetName, setAdsetName] = useState("AdSet WhatsApp");
  const [dailyBudget, setDailyBudget] = useState("1000"); // R$10,00 => 1000 centavos
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [adsetCreating, setAdsetCreating] = useState(false);
  const [pageId, setPageId] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://aipensa.com");
  const [imageHash, setImageHash] = useState("");
  const [messageText, setMessageText] = useState("Fale conosco no WhatsApp");
  const [creativeCreating, setCreativeCreating] = useState(false);
  const [creativeId, setCreativeId] = useState("");
  const [adName, setAdName] = useState("Anúncio WhatsApp");
  const [adsetId, setAdsetId] = useState("");
  const [adCreating, setAdCreating] = useState(false);
  const [waPhoneE164, setWaPhoneE164] = useState("");
  const [waFlowCreating, setWaFlowCreating] = useState(false);
  const [pages, setPages] = useState([]);
  const [pagesError, setPagesError] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesErrorMsg, setPagesErrorMsg] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState({ facebook: true, instagram: false });
  const [pubAccountId, setPubAccountId] = useState("");
  const [pubMessage, setPubMessage] = useState("");
  const [pubImageUrl, setPubImageUrl] = useState("");
  const [pubScheduledTime, setPubScheduledTime] = useState("");
  const [pubLoading, setPubLoading] = useState(false);
  const [contentType, setContentType] = useState("feed"); // feed, reels, story, carousel
  const [mediaType, setMediaType] = useState("photo"); // photo, video
  const [feed, setFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedPageId, setFeedPageId] = useState("");
  const [feedPlatform, setFeedPlatform] = useState("facebook");
  const [tab, setTab] = useState(0);
  const [flowStep, setFlowStep] = useState(0);
  const [lastActionSummary, setLastActionSummary] = useState("");
  const [adAccountError, setAdAccountError] = useState(false);
  
  const [settingLoading, setSettingLoading] = useState(false);
  const [flowImagePreview, setFlowImagePreview] = useState("");
  const [creativeImagePreview, setCreativeImagePreview] = useState("");
  
  // DM Instagram Test State
  const [dmInstagramId, setDmInstagramId] = useState("");
  const [dmRecipientId, setDmRecipientId] = useState("");
  const [dmMessage, setDmMessage] = useState("");
  const [dmLoading, setDmLoading] = useState(false);
  const [dmAttachment, setDmAttachment] = useState(null);
  
  // Feed comments expansion state
  const [expandedComments, setExpandedComments] = useState({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTotalCredits, setWalletTotalCredits] = useState(0);
  const [walletTotalSpend, setWalletTotalSpend] = useState(0);
  const [commentTriggersText, setCommentTriggersText] = useState("");
  const [commentTriggersSaving, setCommentTriggersSaving] = useState(false);
  const [pdfLink, setPdfLink] = useState("");
  const [pdfQuestion, setPdfQuestion] = useState("Posso te enviar um PDF rápido com detalhes e valores?");
  const [pdfSaving, setPdfSaving] = useState(false);

  const settingsApi = useSettings();
  const { get, update } = settingsApi;
  const { whatsApps, loading: whatsAppsLoading } = useWhatsApps();

  useEffect(() => {
    if (pages.length > 0 && !pubAccountId) {
        setPubAccountId(pages[0].id);
    }
  }, [pages, pubAccountId]);

  useEffect(() => {
    if (!pubAccountId || pages.length === 0) return;
    const page = pages.find(p => p.id === pubAccountId);
    if (page) {
      const hasInsta = !!page.instagram_business_account;
      setSelectedPlatforms({
        facebook: true,
        instagram: hasInsta
      });
    }
  }, [pubAccountId, pages]);

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  useEffect(() => {
  const fetchStatus = async () => {
      try {
        setStatusLoading(true);
        const { data } = await api.get("/marketing/status");
        setStatus(data);
      } catch (err) {
        const errorType = err.response && err.response.data && err.response.data.error;
        if (err.response && err.response.status === 400 && (errorType === "ERR_NO_AD_ACCOUNT" || errorType === "ERR_NO_TOKEN")) {
             setAdAccountError(true);
             // Don't toast error for missing config, just warn
             // toast.warn("Configure sua conta de anúncios para continuar.");
        } else if (err.response && err.response.status !== 400) {
          toastError(err);
        }
        setStatusError(true);
        setStatusErrorMsg(String((err && err.response && err.response.data && err.response.data.error) || (err && err.message) || "Erro ao obter status"));
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const fetchMarketingSettings = async () => {
      try {
        const triggersSetting = await get("marketingCommentTriggers");
        if (triggersSetting && triggersSetting.value) {
          const parsed = JSON.parse(triggersSetting.value);
          if (Array.isArray(parsed)) {
            setCommentTriggersText(parsed.join(", "));
          }
        }

        const pdfLinkSetting = await get("marketingPdfLink");
        if (pdfLinkSetting && pdfLinkSetting.value) {
          setPdfLink(pdfLinkSetting.value);
        }

        const pdfQuestionSetting = await get("marketingPdfQuestion");
        if (pdfQuestionSetting && pdfQuestionSetting.value) {
          setPdfQuestion(pdfQuestionSetting.value);
        }
      } catch (err) {
        console.log("Erro ao carregar configurações de marketing:", err);
      }
    };
    fetchMarketingSettings();
  }, [get]);

  const handleSaveCommentTriggers = async () => {
    try {
      setCommentTriggersSaving(true);
      const items = commentTriggersText
        .split(",")
        .map(v => v.trim())
        .filter(v => v.length > 0);
      await update({
        key: "marketingCommentTriggers",
        value: JSON.stringify(items)
      });
      toast.success("Palavras gatilho salvas com sucesso.");
    } catch (err) {
      toastError(err);
    } finally {
      setCommentTriggersSaving(false);
    }
  };

  const handleSavePdfConfig = async () => {
    try {
      setPdfSaving(true);
      await update({
        key: "marketingPdfLink",
        value: pdfLink || ""
      });
      await update({
        key: "marketingPdfQuestion",
        value: pdfQuestion || ""
      });
      toast.success("Configurações de PDF salvas com sucesso.");
    } catch (err) {
      toastError(err);
    } finally {
      setPdfSaving(false);
    }
  };

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setPagesLoading(true);
        setPagesError(false);
        const params = {};

        const { data } = await api.get("/marketing/pages", { params });
        
        if (data.error) {
             setPagesError(true);
             setPagesErrorMsg(String(data.error));
             setPages([]);
             return;
        }

        setPages((data && data.data) || []);
      } catch (err) {
        if (err.response && err.response.status !== 400) {
          toastError(err);
        }
        setPagesError(true);
        setPagesErrorMsg(String((err && err.response && err.response.data && err.response.data.error) || (err && err.message) || "Erro ao obter páginas"));
      } finally {
        setPagesLoading(false);
      }
    };
    fetchPages();
  }, []);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setInsightsLoading(true);
        const params = { date_preset: datePreset };
        
        const { data } = await api.get("/marketing/insights", { params });
        
        if (data.error) {
             setAdAccountError(true);
             setInsightsError(true);
             setInsightsErrorMsg(String(data.message || data.error));
             setInsights([]);
             return;
        }

        setInsights(data.data || []);
      } catch (err) {
        const errorType = err.response && err.response.data && err.response.data.error;
        if (err.response && err.response.status === 400 && (errorType === "ERR_NO_AD_ACCOUNT" || errorType === "ERR_NO_TOKEN")) {
             setAdAccountError(true);
        } else if (err.response && err.response.status !== 400) {
          toastError(err);
        }
        setInsightsError(true);
        setInsightsErrorMsg(String((err && err.response && err.response.data && err.response.data.error) || (err && err.message) || "Erro ao obter insights"));
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [datePreset]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await api.get("/marketing/wallet");
        setWalletBalance(data.balance || 0);
        setWalletTotalCredits(data.totalCredits || 0);
        setWalletTotalSpend(data.totalSpend || 0);
      } catch (err) {
        toastError(err);
      }
    };
    fetchWallet();
  }, []);

  useEffect(() => {
    const socket = socketConnection({ user });

    socket.on(`company-${user.companyId}-marketing-feed`, (data) => {
      if (data.action === "new-comment" || data.action === "new-event") {
        const newItem = data.data;
        // Normalizar estrutura se necessário
        const normalizedItem = {
          id: newItem.id || newItem.comment_id || `temp-${Date.now()}`,
          message: newItem.message || newItem.text || "Novo comentário",
          from: newItem.from || { name: newItem.sender_name || "Usuário", id: newItem.sender_id },
          created_time: newItem.created_time || new Date().toISOString(),
          media: newItem.media || { image_url: "https://via.placeholder.com/150" },
          permalink_url: newItem.permalink_url || "#",
          comments: { data: [] }
        };

        setFeed((prevFeed) => [normalizedItem, ...prevFeed]);
        toast.info("Novo comentário recebido! 💬");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);



  const agg = React.useMemo(() => {
    const rows = insights || [];
    const toNum = (v) => Number(v) || 0;
    const totals = rows.reduce(
      (acc, r) => ({
        impressions: acc.impressions + toNum(r.impressions),
        reach: acc.reach + toNum(r.reach),
        clicks: acc.clicks + toNum(r.clicks),
        spend: acc.spend + toNum(r.spend)
      }),
      { impressions: 0, reach: 0, clicks: 0, spend: 0 }
    );
    const avgCpm = rows.length ? rows.reduce((a, r) => a + toNum(r.cpm), 0) / rows.length : 0;
    const avgCtr = rows.length ? rows.reduce((a, r) => a + toNum(r.ctr), 0) / rows.length : 0;
    return { ...totals, avgCpm, avgCtr };
  }, [insights]);

  const estimatedSpend = agg.spend;

  const exportInsightsCsv = () => {
    const headers = ["impressions", "reach", "clicks", "spend", "cpm", "ctr"];
    const rows = insights || [];
    const csv =
      [headers.join(",")]
        .concat(
          rows.map((r) =>
            headers.map((h) => r[h]).join(",")
          )
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `insights_${datePreset}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPageToken = (pgId) => {
    const page = pages.find(p => p.id === pgId);
    return page ? page.access_token : null;
  };

  const handleFetchFeed = async () => {
    if (!feedPageId) return;
    try {
      setFeedLoading(true);
      
      let targetId = feedPageId;
      const selectedPage = pages.find(p => p.id === feedPageId);
      
      if (feedPlatform === "instagram") {
           if (selectedPage && selectedPage.instagram_business_account) {
               targetId = selectedPage.instagram_business_account.id;
           } else {
               toast.warn("Esta página não possui Instagram conectado.");
               setFeedLoading(false);
               return;
           }
      }

      const params = { pageId: targetId, platform: feedPlatform };

      const { data } = await api.get("/marketing/feed", { params });
      
      if (data.error) {
        toast.error(data.error);
        setFeed([]);
        return;
      }

      setFeed(data.data || []);
    } catch (err) {
      toastError(err);
      setFeed([]);
    } finally {
      setFeedLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const pageAccessToken = getPageToken(feedPageId);
      if (!pageAccessToken) {
          toast.warn("Selecione uma página conectada para interagir.");
          return;
      }
      const payload = { objectId: postId, pageAccessToken };
      
      await api.post("/marketing/like", payload);
      toast.success("Curtiu!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleComment = async (postId, message) => {
    try {
      const pageAccessToken = getPageToken(feedPageId);
      if (!pageAccessToken) {
          toast.warn("Selecione uma página conectada para interagir.");
          return;
      }
      const payload = { objectId: postId, message, pageAccessToken };

      await api.post("/marketing/comment", payload);
      toast.success("Comentário enviado!");
      handleFetchFeed(); // Atualiza feed para ver o comentário
    } catch (err) {
      toastError(err);
    }
  };

  const handleCreateCampaign = async () => {
    if (walletBalance <= 0) {
      toast.error("Você não possui saldo de anúncios. Adicione créditos no Financeiro antes de criar campanhas.");
      return;
    }
    setCreating(true);
    try {
      const payload = {
        name,
        objective,
        status: "PAUSED",
        special_ad_categories: []
      };

      const { data } = await api.post("/marketing/campaign", payload);
      toast.success(`Campanha criada: ${data.id}`);
      setCampaignId(data.id);
      setLastActionSummary(`Campanha criada: ${data.id}`);
    } catch (err) {
      toastError(err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAdSet = async () => {
    if (walletBalance <= 0) {
      toast.error("Você não possui saldo de anúncios. Adicione créditos no Financeiro antes de criar campanhas.");
      return;
    }
    setAdsetCreating(true);
    try {
      const payload = {
        name: adsetName,
        campaign_id: campaignId,
        daily_budget: dailyBudget,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        status: "PAUSED",
        targeting: { geo_locations: { countries: ["BR"] } }
      };

      const { data } = await api.post("/marketing/adset", payload);
      toast.success(`AdSet criado: ${data.id}`);
      setAdsetId(data.id);
      setLastActionSummary(`AdSet criado: ${data.id}`);
    } catch (err) {
      toastError(err);
    } finally {
      setAdsetCreating(false);
    }
  };

  const handleCreateCreative = async () => {
    setCreativeCreating(true);
    try {
      const payload = {
        page_id: pageId,
        link: linkUrl,
        image_hash: imageHash,
        message: messageText
      };

      const { data } = await api.post("/marketing/creative", payload);
      toast.success(`Creative criado: ${data.id}`);
      setCreativeId(data.id);
      setLastActionSummary(`Creative criado: ${data.id}`);
    } catch (err) {
      toastError(err);
    } finally {
      setCreativeCreating(false);
    }
  };

  const handleCreateAd = async () => {
    if (walletBalance <= 0) {
      toast.error("Você não possui saldo de anúncios. Adicione créditos no Financeiro antes de criar campanhas.");
      return;
    }
    setAdCreating(true);
    try {
      const payload = {
        name: adName,
        adset_id: adsetId,
        creative_id: creativeId,
        status: "PAUSED"
      };

      const { data } = await api.post("/marketing/ad", payload);
      toast.success(`Ad criado: ${data.id}`);
      setLastActionSummary(`Ad criado: ${data.id}`);
    } catch (err) {
      toastError(err);
    } finally {
      setAdCreating(false);
    }
  };

  const handleSendDM = async () => {
    setDmLoading(true);
    try {
      if (!dmInstagramId) {
        toast.warn("Informe o ID do Instagram (Business Account ID)");
        return;
      }
      if (!dmRecipientId) {
        toast.warn("Informe o ID do Destinatário (Instagram User ID)");
        return;
      }
      if (!dmMessage && !dmAttachment) {
        toast.warn("Escreva uma mensagem ou anexe um arquivo");
        return;
      }

      let attachmentData = null;

      if (dmAttachment) {
         const formData = new FormData();
         formData.append("file", dmAttachment);
         const { data: uploadData } = await api.post("/marketing/upload-media", formData);
         
         let type = "image";
         if (dmAttachment.type.startsWith("video")) type = "video";
         if (dmAttachment.type.startsWith("audio")) type = "audio";

         attachmentData = {
             url: uploadData.url,
             type
         };
      }

      const payload = {
        instagramId: dmInstagramId,
        recipientId: dmRecipientId,
        message: dmMessage,
        attachment: attachmentData
      };

      await api.post("/marketing/send-dm", payload);
      toast.success("Mensagem enviada com sucesso!");
      setDmMessage(""); // Clear message after success
      setDmAttachment(null);
    } catch (err) {
      toastError(err);
    } finally {
      setDmLoading(false);
    }
  };

  const handlePublish = async () => {
    setPubLoading(true);
    try {
      const selectedPage = pages.find(p => p.id === pubAccountId);
      if (!selectedPage) {
          toast.error("Selecione uma página/conta");
          setPubLoading(false);
          return;
      }
      
      const payload = {
        message: pubMessage,
        imageUrl: pubImageUrl,
        scheduledTime: pubScheduledTime || undefined,
        contentType: contentType, // feed, reels, story, carousel
        mediaType: mediaType     // photo, video
      };
      
      if (selectedPlatforms.facebook) {
          payload.facebookPageId = selectedPage.id;
      }
      
      if (selectedPlatforms.instagram && selectedPage.instagram_business_account) {
          payload.instagramId = selectedPage.instagram_business_account.id;
      }

      if (!payload.facebookPageId && !payload.instagramId) {
          toast.warn("Selecione pelo menos uma plataforma (Facebook ou Instagram)");
          setPubLoading(false);
          return;
      }

      const { data } = await api.post("/marketing/publish", payload);
      
      let successCount = 0;
      let errorCount = 0;

      if (selectedPlatforms.facebook && data.facebook) {
          if (data.facebook.error) {
              toast.error(`Erro Facebook: ${data.facebook.error.message || "Falha desconhecida"}`);
              errorCount++;
          } else {
              successCount++;
          }
      }

      if (selectedPlatforms.instagram && data.instagram) {
          if (data.instagram.error) {
              toast.error(`Erro Instagram: ${data.instagram.error.message || "Falha desconhecida"}`);
              errorCount++;
          } else {
              successCount++;
          }
      }

      if (successCount > 0) {
          toast.success(`${successCount} publicação(ões) realizada(s) com sucesso!`);
          setLastActionSummary("Publicação realizada com sucesso");
          setPubMessage("");
          setPubImageUrl("");
          setPubScheduledTime("");
      } else if (errorCount > 0 && successCount === 0) {
          // All failed
      } else {
          // Should not happen if at least one platform selected
          if (!data.facebook && !data.instagram) {
               toast.success("Comando enviado.");
          }
      }
    } catch (err) {
      toastError(err);
    } finally {
      setPubLoading(false);
    }
  };


  // TabPanel moved outside


  return (
    <div className={classes.root}>
      <Container maxWidth="xl" style={{ flex: 1 }}>
        <Box className={classes.header} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => history.push("/dashboard")}
              className={classes.backButton}
            >
              Voltar
            </Button>
            <Box>
              <Typography variant="h4" className={classes.pageTitle}>
                Marketing Pro
              </Typography>
              <Typography variant="subtitle1" className={classes.mutedText}>
                Gerencie suas campanhas e redes sociais em um único lugar.
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Chip 
               icon={status && status.adAccountId ? <ThumbUpIcon /> : <InfoOutlinedIcon />} 
               label={status && status.adAccountId ? "Meta API Conectada" : "Meta API Desconectada"} 
               color={status && status.adAccountId ? "primary" : "default"} 
               variant={status && status.adAccountId ? "default" : "outlined"}
               style={{ height: 40, borderRadius: 20, paddingLeft: 8, paddingRight: 8 }}
             />
          </Box>
        </Box>

        <Paper className={classes.tabRoot}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            style={{ paddingLeft: 16, paddingRight: 16 }}
          >
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><DashboardIcon style={{marginRight: 8}}/> Dashboard</div>} />
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><CampaignIcon style={{marginRight: 8}}/> Nova Campanha</div>} />
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><AutoGraphIcon style={{marginRight: 8}}/> Novo AdSet</div>} />
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><WidgetsIcon style={{marginRight: 8}}/> Novo Criativo</div>} />
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><LinkIcon style={{marginRight: 8}}/> Fluxo Rápido</div>} />
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><SettingsSuggestIcon style={{marginRight: 8}}/> Gerenciar</div>} />
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><MonetizationOnIcon style={{marginRight: 8}}/> Relatórios</div>} />
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><PostAddIcon style={{marginRight: 8}}/> Publicar & Feed</div>} />
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><SettingsIcon style={{marginRight: 8}}/> Configuração</div>} />
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><MonetizationOnIcon style={{marginRight: 8}}/> Carteira</div>} />
          </Tabs>
        </Paper>

        {(!statusLoading && !insightsLoading && !status && (!Array.isArray(insights) || insights.length === 0)) && (
          <Paper style={{ marginTop: 16, padding: 16 }} elevation={0}>
            <Typography variant="body2" color="textSecondary">
              Nenhum conteúdo disponível nas abas no momento. Verifique suas conexões ou tente novamente.
            </Typography>
          </Paper>
        )}

        <TabPanel value={tab} name={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card className={classes.card}>
                    <Section icon={<AutoGraphIcon style={{ color: "white" }} />} title="Performance Geral (Últimos 7 dias)">
                        {!statusError && !insightsLoading && insights.length > 0 ? (
                          <Chart
                            options={{
                              chart: { id: "mkp-area", toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
                              theme: { mode: theme.palette.type === "dark" ? "dark" : "light" },
                              xaxis: { 
                                categories: (insights || []).map((i, idx) => {
                                  const d = i.date_start ? new Date(i.date_start) : null;
                                  return d && !isNaN(d.valueOf()) ? d.toLocaleDateString().slice(0,5) : `Dia ${idx+1}`;
                                }).reverse(),
                                labels: { style: { colors: theme.palette.text.secondary } }
                              },
                              yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
                              colors: [theme.palette.primary.main, (theme.palette.success && theme.palette.success.main) ? theme.palette.success.main : theme.palette.secondary.main],
                              grid: { borderColor: theme.palette.divider },
                              dataLabels: { enabled: false },
                              stroke: { curve: 'smooth', width: 3 },
                              fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] } }
                            }}
                            series={[
                              { name: "Impressões", data: (insights || []).map(i => Number(i.impressions || 0)).reverse() },
                              { name: "Alcance", data: (insights || []).map(i => Number(i.reach || 0)).reverse() }
                            ]}
                            type="area"
                            height={300}
                            width="100%"
                          />
                        ) : (
                             <Box p={4} textAlign="center">
                                {insightsLoading ? <CircularProgress /> : <Typography className={classes.mutedText}>Sem dados de insights disponíveis para exibir o gráfico.</Typography>}
                             </Box>
                        )}
                    </Section>
                </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card className={classes.card}>
                <Section icon={<PublicIcon style={{ color: theme.palette.text.primary }} />} title="Visão Geral da Conta">
                {!statusError ? (
                  <>
                    {statusLoading ? (
                      <Box display="flex" alignItems="center" gap={2} p={2}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">Carregando status...</Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" style={{ color: theme.palette.text.secondary }}>Conta Conectada</Typography>
                            <Typography variant="h6">{status?.me?.name ? `@${status.me.name}` : "Não conectado"}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" style={{ color: theme.palette.text.secondary }}>Integração</Typography>
                            <Typography variant="h6" style={{ color: status?.adAccountId ? "#10b981" : "#ef4444" }}>
                              {status?.adAccountId ? "Ativa" : "Pendente"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" style={{ color: theme.palette.text.secondary }}>Facebook</Typography>
                            <Typography variant="body2" style={{ color: theme.palette.text.primary }}>
                              {status?.adAccountId ? "Conta de anúncios conectada" : "Nenhuma conta conectada"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" style={{ color: theme.palette.text.secondary }}>Instagram</Typography>
                            <Typography variant="body2" style={{ color: theme.palette.text.primary }}>
                              Conexão via página do Facebook
                            </Typography>
                          </Grid>
                        </Grid>
                        {status && status.adAccountId && (
                          <Box mt={4} display="flex" gap={2}>
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<LinkIcon />}
                              onClick={() => {
                                const act = status && status.adAccountId;
                                const url = `https://www.facebook.com/adsmanager/manage?act=act_${act}`;
                                window.open(url, "_blank");
                              }}
                            >
                              Abrir Gerenciador de Anúncios (Meta)
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </>
                ) : (
                  <Box textAlign="center" py={4}>
                    <InfoOutlinedIcon style={{ fontSize: 48, color: "#ef4444", marginBottom: 16 }} />
                    <Typography variant="h6" gutterBottom>
                       {statusErrorMsg ? "Erro de Conexão" : "Conexão Necessária"}
                    </Typography>
                    <Typography variant="body2" style={{ color: theme.palette.text.secondary, marginBottom: 16 }}>
                      {statusErrorMsg || "Para utilizar as ferramentas de marketing, você precisa conectar sua conta do Facebook/Instagram."}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => (window.location.href = "/connections")}
                      style={{ marginRight: 16 }}
                    >
                      Verificar Conexões
                    </Button>
                    {statusErrorMsg && (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        onClick={() => window.location.reload()}
                      >
                        Tentar Novamente
                      </Button>
                    )}
                  </Box>
                )}
                </Section>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={3} direction="column">
                 <Grid item>
                    <Card className={classes.card}>
                      <Section icon={<InfoOutlinedIcon style={{ color: theme.palette.text.primary }} />} title="Plano Atual">
                        <Box>
                          <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>Limites do Plano</Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Postagens e Feed" 
                                secondary="ILIMITADO" 
                                primaryTypographyProps={{ style: { fontWeight: 500, color: theme.palette.text.primary } }}
                                secondaryTypographyProps={{ style: { color: theme.palette.text.secondary } }}
                              />
                            </ListItem>
                            <Divider component="li" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
                            <ListItem>
                              <ListItemText 
                                primary="Contas Conectadas" 
                                secondary="De acordo com seu plano" 
                                primaryTypographyProps={{ style: { fontWeight: 500, color: theme.palette.text.primary } }}
                                secondaryTypographyProps={{ style: { color: theme.palette.text.secondary } }}
                              />
                            </ListItem>
                            <Divider component="li" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
                            <ListItem>
                              <ListItemText 
                                primary="Agendamento" 
                                secondary="Disponível" 
                                primaryTypographyProps={{ style: { fontWeight: 500, color: theme.palette.text.primary } }}
                                secondaryTypographyProps={{ style: { color: "rgba(255, 255, 255, 0.7)" } }}
                              />
                            </ListItem>
                          </List>
                          <Box mt={1} p={1} bgcolor="rgba(255, 255, 255, 0.05)" borderRadius={4}>
                             <Typography variant="caption" display="block" align="center" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                               Para aumentar seus limites, entre em contato com o suporte.
                             </Typography>
                          </Box>
                        </Box>
                      </Section>
                    </Card>
                 </Grid>
                 <Grid item>
                    <Card className={classes.card}>
                      <Section icon={<SettingsSuggestIcon style={{ color: "white" }} />} title="Última Atividade">
                        <Box p={2} bgcolor="rgba(255, 255, 255, 0.05)" borderRadius={8} border="1px dashed rgba(255, 255, 255, 0.2)">
                          <Typography variant="body2" style={{ fontFamily: 'monospace', color: "rgba(255, 255, 255, 0.7)" }}>
                            {lastActionSummary || "Nenhuma ação recente registrada."}
                          </Typography>
                        </Box>
                      </Section>
                    </Card>
                 </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} name={1}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card className={classes.card}>
                <Section icon={<CampaignIcon style={{ color: theme.palette.text.primary }} />} title="1. Criar Nova Campanha">
                  <Typography variant="body2" paragraph style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    A campanha é o primeiro nível da estrutura de anúncios. Defina o nome e o objetivo principal.
                  </Typography>
                  <TextField fullWidth label="Nome da Campanha" value={name} onChange={(e) => setName(e.target.value)} variant="outlined" margin="normal" className={classes.input} />
                  <TextField fullWidth label="Objetivo" value={objective} onChange={(e) => setObjective(e.target.value)} variant="outlined" margin="normal" helperText="Recomendado para WhatsApp: MESSAGES" InputProps={{ readOnly: true }} className={classes.input} />
                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button variant="contained" color="primary" size="large" disabled={creating} onClick={handleCreateCampaign} className={classes.button}>
                      {creating ? <CircularProgress size={24} /> : "Criar Campanha"}
                    </Button>
                  </Box>
                  {campaignId && (
                    <Box mt={3} p={2} bgcolor="rgba(16, 185, 129, 0.1)" borderRadius={4} border="1px solid #10b981" display="flex" alignItems="center" gap={2}>
                      <ThumbUpIcon style={{ color: "#10b981" }} />
                      <Box>
                         <Typography variant="subtitle2" style={{ color: "#10b981" }}>Campanha Criada com Sucesso!</Typography>
                         <Typography variant="body2" style={{ color: theme.palette.text.primary }}>ID da Campanha: <strong>{campaignId}</strong></Typography>
                      </Box>
                    </Box>
                  )}
                </Section>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} name={2}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card className={classes.card}>
                <Section icon={<AutoGraphIcon style={{ color: theme.palette.text.primary }} />} title="2. Configurar Conjunto de Anúncios (AdSet)">
                  <TextField fullWidth label="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} variant="outlined" margin="normal" required helperText="ID da campanha criada no passo anterior" className={classes.input} />
                  <TextField fullWidth label="Nome do AdSet" value={adsetName} onChange={(e) => setAdsetName(e.target.value)} variant="outlined" margin="normal" className={classes.input} />
                  <TextField fullWidth label="Orçamento Diário (centavos)" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} variant="outlined" margin="normal" helperText="Ex: 1000 = R$ 10,00. O mínimo geralmente é R$ 5,50." className={classes.input} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                       <TextField fullWidth label="Início (ISO 8601)" value={startTime} onChange={(e) => setStartTime(e.target.value)} variant="outlined" margin="normal" placeholder="2023-12-31T23:59:00-0300" helperText="Opcional: Deixe em branco para iniciar imediatamente" className={classes.input} />
                    </Grid>
                    <Grid item xs={6}>
                       <TextField fullWidth label="Fim (ISO 8601)" value={endTime} onChange={(e) => setEndTime(e.target.value)} variant="outlined" margin="normal" placeholder="2024-01-31T23:59:00-0300" helperText="Opcional" className={classes.input} />
                    </Grid>
                  </Grid>
                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button variant="contained" color="primary" size="large" disabled={adsetCreating || !campaignId} onClick={handleCreateAdSet} className={classes.button}>
                      {adsetCreating ? <CircularProgress size={24} /> : "Criar AdSet"}
                    </Button>
                  </Box>
                  {adsetId && (
                    <Box mt={3} p={2} bgcolor="rgba(16, 185, 129, 0.1)" borderRadius={4} border="1px solid #10b981">
                      <Typography variant="subtitle2" style={{ color: "#10b981" }}>AdSet Criado!</Typography>
                      <Typography variant="body2" style={{ color: theme.palette.text.primary }}>ID: {adsetId}</Typography>
                    </Box>
                  )}
                </Section>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} name={3}>
          <Box pb={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className={classes.card} style={{ height: "auto" }}>
                <Section icon={<WidgetsIcon style={{ color: theme.palette.text.primary }} />} title="3.1 Upload de Mídia">
                  <Box p={1} border="2px dashed rgba(255, 255, 255, 0.2)" borderRadius={8} textAlign="center" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="raised-button-file"
                      type="file"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setCreativeImagePreview(URL.createObjectURL(file));
                        try {
                          const form = new FormData();
                          form.append("image", file);
                          const { data } = await api.post("/marketing/adimage", form);
                          const hash = Object.keys(data?.images || {})[0];
                          setImageHash(hash || "");
                          toast.success(`Image hash: ${hash}`);
                          setLastActionSummary(`Image hash gerado: ${hash}`);
                        } catch (err) {
                          toastError(err);
                        }
                      }}
                    />
                    <label htmlFor="raised-button-file">
                      <Button variant="contained" component="span" startIcon={<PublicIcon />} className={classes.button} size="small">
                        Selecionar Imagem
                      </Button>
                    </label>
                    {creativeImagePreview && (
                        <Box mt={2} p={1} bgcolor="rgba(0,0,0,0.1)" borderRadius={8} display="flex" justifyContent="center">
                            <img src={creativeImagePreview} alt="Creative Preview" style={{ maxWidth: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }} />
                        </Box>
                    )}
                    {imageHash && (
                        <Box mt={2} p={1} bgcolor="rgba(255, 255, 255, 0.1)" borderRadius={4}>
                             <Typography variant="caption" display="block" style={{ color: "rgba(255, 255, 255, 0.7)" }}>Hash Gerado:</Typography>
                             <Typography variant="body2" style={{ wordBreak: "break-all", fontWeight: "bold", color: theme.palette.text.primary }}>{imageHash}</Typography>
                        </Box>
                    )}
                  </Box>
                </Section>
              </Card>
              <Box mt={2}>
                    <Card className={classes.card} style={{ height: "auto" }}>
                  <Section icon={<ChatBubbleOutlineIcon style={{ color: theme.palette.text.primary }} />} title="Teste avançado de DM (opcional)">
                    <Typography variant="body2" style={{ marginBottom: 16, color: "rgba(255, 255, 255, 0.7)" }}>
                        Área avançada para quem já conhece a API do Instagram. Usuários comuns não precisam usar esta parte.
                    </Typography>
                    <TextField
                      fullWidth
                      label="ID da conta do Instagram"
                      value={dmInstagramId}
                      onChange={(e) => setDmInstagramId(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      className={classes.input}
                      helperText="Use apenas se souber o ID empresarial da conta."
                    />
                    <TextField
                      fullWidth
                      label="ID do usuário destino"
                      value={dmRecipientId}
                      onChange={(e) => setDmRecipientId(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      className={classes.input}
                      helperText="Use apenas para testes técnicos de DM."
                    />
                    <TextField
                      fullWidth
                      label="Mensagem"
                      value={dmMessage}
                      onChange={(e) => setDmMessage(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      multiline
                      minRows={2}
                      className={classes.input}
                    />
                    <Box mt={2} display="flex" flexDirection="column" gap={1}>
                       <input
                          accept="image/*,video/*,audio/*"
                          style={{ display: 'none' }}
                          id="dm-attachment-upload"
                          type="file"
                          onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) setDmAttachment(file);
                          }}
                       />
                       <label htmlFor="dm-attachment-upload">
                          <Button variant="outlined" component="span" fullWidth className={classes.button} style={{ color: "rgba(255, 255, 255, 0.7)", borderColor: "rgba(255, 255, 255, 0.3)" }}>
                            {dmAttachment ? `Arquivo: ${dmAttachment.name}` : "Anexar Mídia (Imagem/Vídeo/Áudio)"}
                          </Button>
                       </label>
                    </Box>
                    <Box mt={2}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={dmLoading}
                        onClick={handleSendDM}
                        className={classes.button}
                        startIcon={dmLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      >
                        {dmLoading ? "Enviando..." : "Enviar DM Teste"}
                      </Button>
                    </Box>
                  </Section>
                 </Card>
              </Box>

              <Box mt={2}>
                 <Card className={classes.card} style={{ height: "auto" }}>
                  <Section icon={<SettingsSuggestIcon style={{ color: theme.palette.text.primary }} />} title="3.2 Criar Criativo (Creative)">
                    <TextField
                      select
                      fullWidth
                      label="Selecionar Página"
                      value={pageId}
                      onChange={(e) => setPageId(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      className={classes.input}
                    >
                      {pagesLoading ? (
                        <MenuItem disabled>Carregando...</MenuItem>
                      ) : pagesError ? (
                        <MenuItem disabled>Erro ao carregar</MenuItem>
                      ) : (
                        pages.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name} {p.instagram_business_account ? `(IG: ${p.instagram_business_account.username})` : ""}
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                    <TextField fullWidth label="Link Destino" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} variant="outlined" margin="normal" className={classes.input} />
                    <TextField fullWidth label="Image Hash" value={imageHash} onChange={(e) => setImageHash(e.target.value)} variant="outlined" margin="normal" className={classes.input} />
                    <TextField fullWidth label="Texto do Anúncio" value={messageText} onChange={(e) => setMessageText(e.target.value)} variant="outlined" margin="normal" multiline minRows={3} className={classes.input} />
                    <Box mt={2}>
                      <Button fullWidth variant="contained" color="primary" disabled={creativeCreating || !pageId} onClick={handleCreateCreative} className={classes.button}>
                        Criar Creative
                      </Button>
                    </Box>
                    {creativeId && <Typography variant="body2" style={{ marginTop: 8, color: "#10b981", fontWeight: "bold" }}>ID Creative: {creativeId}</Typography>}
                  </Section>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
              <Card className={classes.card} style={{ height: "auto" }}>
                <Section icon={<CampaignIcon style={{ color: theme.palette.text.primary }} />} title="3.3 Publicar Anúncio (Ad)">
                   <TextField fullWidth label="Nome do Anúncio" value={adName} onChange={(e) => setAdName(e.target.value)} variant="outlined" margin="normal" className={classes.input} />
                   <TextField fullWidth label="AdSet ID" value={adsetId} onChange={(e) => setAdsetId(e.target.value)} variant="outlined" margin="normal" className={classes.input} />
                   <TextField fullWidth label="Creative ID" value={creativeId} onChange={(e) => setCreativeId(e.target.value)} variant="outlined" margin="normal" className={classes.input} />
                   <Box mt={3}>
                     <Button fullWidth variant="contained" color="primary" size="large" disabled={adCreating || !adsetId || !creativeId} onClick={handleCreateAd} className={classes.button}>
                       Publicar Anúncio Final
                     </Button>
                   </Box>
                   <Box mt={2}>
                     <Typography variant="caption" style={{ color: "rgba(255, 255, 255, 0.7)" }}>O anúncio será criado com status PAUSED por segurança. Ative-o na aba 'Gerenciar'.</Typography>
                   </Box>
                </Section>
              </Card>
              </Box>
            </Grid>
          </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tab} name={4}>
          <Grid container spacing={3}>
             <Grid item xs={12}>
                <Card className={classes.card}>
                  <Section icon={<LinkIcon style={{ color: theme.palette.text.primary }} />} title="Fluxo Rápido: Anúncio Click-to-WhatsApp">
                     <Box py={2}>
                        <Stepper activeStep={flowStep} alternativeLabel style={{ backgroundColor: 'transparent', padding: 0 }}>
                          <Step><StepLabel style={{ color: theme.palette.text.primary }}>Campanha</StepLabel></Step>
                          <Step><StepLabel style={{ color: theme.palette.text.primary }}>AdSet</StepLabel></Step>
                          <Step><StepLabel style={{ color: theme.palette.text.primary }}>Creative</StepLabel></Step>
                          <Step><StepLabel style={{ color: theme.palette.text.primary }}>Publicação</StepLabel></Step>
                        </Stepper>
                     </Box>
                     <Box maxWidth={700} mx="auto" mt={4} p={3} border="1px solid rgba(255, 255, 255, 0.1)" borderRadius={8} bgcolor="rgba(255, 255, 255, 0.05)">
                        <Typography variant="h6" gutterBottom align="center" style={{ color: theme.palette.text.primary }}>Configuração Expressa</Typography>
                        <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: 16 }} align="center" paragraph>
                           Crie toda a estrutura de campanha para WhatsApp em um clique.
                        </Typography>
                        <Grid container spacing={2}>
                           <Grid item xs={12}>
                              <Box p={2} border="1px dashed rgba(255, 255, 255, 0.2)" borderRadius={8} textAlign="center" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                                <input
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  id="flow-image-upload"
                                  type="file"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setFlowImagePreview(URL.createObjectURL(file));
                                    try {
                                      const form = new FormData();
                                      form.append("image", file);
                                      const { data } = await api.post("/marketing/adimage", form);
                                      const hash = Object.keys(data?.images || {})[0];
                                      setImageHash(hash || "");
                                      toast.success(`Imagem enviada! Hash: ${hash}`);
                                    } catch (err) {
                                      toastError(err);
                                    }
                                  }}
                                />
                                <label htmlFor="flow-image-upload">
                                  <Button variant="contained" component="span" startIcon={<PublicIcon />} size="small" className={classes.button}>
                                    Upload de Imagem do Anúncio
                                  </Button>
                                </label>
                                {flowImagePreview && (
                                    <Box mt={2} p={1} bgcolor="rgba(0,0,0,0.1)" borderRadius={8} display="flex" justifyContent="center">
                                        <img src={flowImagePreview} alt="Ad Preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }} />
                                    </Box>
                                )}
                                {imageHash && (
                                    <Typography variant="caption" display="block" style={{ marginTop: 8, color: "#10b981" }}>
                                        Imagem processada (Hash: {imageHash})
                                    </Typography>
                                )}
                              </Box>
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <TextField
                                 select
                                 fullWidth
                                 label="Selecionar Página"
                                 value={pageId}
                                 onChange={(e) => setPageId(e.target.value)}
                                 variant="outlined"
                                 margin="normal"
                                 className={classes.input}
                               >
                                 {pagesLoading ? <MenuItem disabled>Carregando...</MenuItem> : 
                                  pagesError ? <MenuItem disabled>Erro ao carregar</MenuItem> :
                                  pages.map((p) => <MenuItem key={p.id} value={p.id}>{p.name} ({p.id})</MenuItem>)
                                 }
                               </TextField>
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <TextField fullWidth label="Número WhatsApp (Ex: 5511999999999)" value={waPhoneE164} onChange={(e) => setWaPhoneE164(e.target.value)} variant="outlined" margin="normal" className={classes.input} />
                           </Grid>
                           <Grid item xs={12}>
                              <TextField fullWidth label="Mensagem Inicial (Pre-filled)" value={messageText} onChange={(e) => setMessageText(e.target.value)} variant="outlined" margin="normal" className={classes.input} />
                           </Grid>
                        </Grid>
                        
                        <Box mt={4} textAlign="center">
                           <Button
                              variant="contained"
                              color="primary"
                              size="large"
                              disabled={waFlowCreating}
                              onClick={async () => {
                                if (pages.length === 0) { toast.error("Nenhuma página conectada! Vá em Configurações e conecte uma página."); return; }
                                if (!pageId) { toast.warn("Selecione uma página para o anúncio!"); return; }
                                if (!waPhoneE164 || waPhoneE164.length < 10) { toast.warn("Digite um número de WhatsApp válido!"); return; }
                                if (!imageHash) { toast.warn("Faça o upload da imagem do anúncio primeiro!"); return; }
                                
                                setWaFlowCreating(true);
                                try {
                                  const { data } = await api.post("/marketing/whatsapp-adflow", {
                                    page_id: pageId,
                                    phone_number_e164: waPhoneE164,
                                    message_text: messageText,
                                    targeting: { geo_locations: { countries: ["BR"] } },
                                    daily_budget: dailyBudget || 1000,
                                    image_hash: imageHash
                                  });
                                  setFlowStep(4);
                                  toast.success("Fluxo criado com sucesso! Campanha, AdSet e Anúncio gerados.");
                                } catch (err) { toastError(err); } finally { setWaFlowCreating(false); }
                              }}
                              style={{ paddingLeft: 40, paddingRight: 40, height: 56, fontSize: "1.1rem" }}
                              className={classes.button}
                            >
                              {waFlowCreating ? <CircularProgress size={24} color="inherit" /> : "Criar Campanha Completa Agora"}
                            </Button>
                        </Box>
                     </Box>
                  </Section>
                </Card>
             </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} name={5}>
          <Grid container spacing={3}>
             <Grid item xs={12}>
                <Card className={classes.card}>
                  <Section icon={<SettingsSuggestIcon style={{ color: theme.palette.text.primary }} />} title="Gerenciamento de Status">
                    <Grid container spacing={4}>
                       <Grid item xs={12} md={6}>
                          <Paper elevation={0} style={{ padding: 16, border: "1px solid rgba(255, 255, 255, 0.1)", backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                            <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.palette.text.primary }}>
                               <CampaignIcon color="primary" /> Campanha
                            </Typography>
                            <TextField fullWidth label="ID da Campanha" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} variant="outlined" size="small" margin="normal" className={classes.input} />
                            <Box mt={2} display="flex" gap={2}>
                               <Button variant="contained" style={{ backgroundColor: "#10b981", color: "white", flex: 1 }} onClick={async () => {
                                  try { await api.post("/marketing/campaign/status", { campaign_id: campaignId, status: "ACTIVE" }); toast.success("Ativada"); } catch(e) { toastError(e); }
                               }}>Ativar</Button>
                               <Button variant="contained" style={{ backgroundColor: "#ef4444", color: "white", flex: 1 }} onClick={async () => {
                                  try { await api.post("/marketing/campaign/status", { campaign_id: campaignId, status: "PAUSED" }); toast.success("Pausada"); } catch(e) { toastError(e); }
                               }}>Pausar</Button>
                            </Box>
                          </Paper>
                       </Grid>
                       <Grid item xs={12} md={6}>
                          <Paper elevation={0} style={{ padding: 16, border: "1px solid rgba(255, 255, 255, 0.1)", backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                            <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.palette.text.primary }}>
                               <AutoGraphIcon color="primary" /> Conjunto de Anúncios (AdSet)
                            </Typography>
                            <TextField fullWidth label="ID do AdSet" value={adsetId} onChange={(e) => setAdsetId(e.target.value)} variant="outlined" size="small" margin="normal" className={classes.input} />
                            <Box mt={2} display="flex" gap={2}>
                               <Button variant="contained" style={{ backgroundColor: "#10b981", color: "white", flex: 1 }} onClick={async () => {
                                  try { await api.post("/marketing/adset/status", { adset_id: adsetId, status: "ACTIVE" }); toast.success("Ativado"); } catch(e) { toastError(e); }
                               }}>Ativar</Button>
                               <Button variant="contained" style={{ backgroundColor: "#ef4444", color: "white", flex: 1 }} onClick={async () => {
                                  try { await api.post("/marketing/adset/status", { adset_id: adsetId, status: "PAUSED" }); toast.success("Pausado"); } catch(e) { toastError(e); }
                               }}>Pausar</Button>
                            </Box>
                          </Paper>
                       </Grid>
                    </Grid>
                  </Section>
                </Card>
             </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} name={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
               <Card className={classes.card}>
                  <Section icon={<AutoGraphIcon style={{ color: theme.palette.text.primary }} />} title="Relatórios de Desempenho">
                      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                         <TextField
                            select
                            variant="outlined"
                            size="small"
                            label="Período"
                            value={datePreset}
                            onChange={(e) => setDatePreset(e.target.value)}
                            style={{ width: 200 }}
                            className={classes.input}
                         >
                            <MenuItem value="today">Hoje</MenuItem>
                            <MenuItem value="yesterday">Ontem</MenuItem>
                            <MenuItem value="last_7d">Últimos 7 dias</MenuItem>
                            <MenuItem value="last_30d">Últimos 30 dias</MenuItem>
                         </TextField>
                         <Button variant="outlined" startIcon={<AutoGraphIcon />} onClick={exportInsightsCsv} className={classes.button}>Exportar CSV</Button>
                      </Box>
                      
                      {!insightsLoading && !insightsError && (
                        <Grid container spacing={3} style={{ marginBottom: 32 }}>
                           {[
                             { label: "Impressões", val: agg.impressions, color: "#3b82f6" },
                             { label: "Alcance", val: agg.reach, color: "#10b981" },
                             { label: "Cliques", val: agg.clicks, color: "#f59e0b" },
                             { label: "Gasto Total", val: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(agg.spend), color: "#ef4444" },
                             { label: "CTR Médio", val: agg.avgCtr.toFixed(2) + "%", color: "#6366f1" },
                             { label: "CPM Médio", val: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(agg.avgCpm), color: "#8b5cf6" },
                           ].map((stat, i) => (
                             <Grid item xs={6} md={2} key={i}>
                               <Paper elevation={0} style={{ padding: 16, border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 8, textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                                  <Typography variant="caption" style={{ textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, color: "rgba(255, 255, 255, 0.7)" }}>{stat.label}</Typography>
                                  <Typography variant="h5" style={{ color: stat.color, fontWeight: 700 }}>{stat.val}</Typography>
                               </Paper>
                             </Grid>
                           ))}
                        </Grid>
                      )}

                      {insightsLoading ? <Box p={4} textAlign="center"><CircularProgress /></Box> :
                       insightsError ? <Box p={2} bgcolor="rgba(239, 68, 68, 0.1)" borderRadius={4}><Typography color="error">Erro ao carregar insights: {insightsErrorMsg}</Typography></Box> :
                       <div style={{ overflowX: "auto" }}>
                         <Table size="small">
                            <TableHead>
                              <TableRow style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                                 <TableCell style={{ color: theme.palette.text.primary }}>Impressões</TableCell>
                                 <TableCell style={{ color: theme.palette.text.primary }}>Alcance</TableCell>
                                 <TableCell style={{ color: theme.palette.text.primary }}>Cliques</TableCell>
                                 <TableCell style={{ color: theme.palette.text.primary }}>Gasto</TableCell>
                                 <TableCell style={{ color: theme.palette.text.primary }}>CPM</TableCell>
                                 <TableCell style={{ color: theme.palette.text.primary }}>CTR</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                               {insights.map((row, idx) => (
                                 <TableRow key={idx} hover>
                                    <TableCell style={{ color: theme.palette.text.secondary }}>{row.impressions}</TableCell>
                                    <TableCell style={{ color: theme.palette.text.secondary }}>{row.reach}</TableCell>
                                    <TableCell style={{ color: theme.palette.text.secondary }}>{row.clicks}</TableCell>
                                    <TableCell style={{ color: theme.palette.text.secondary }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.spend || 0)}</TableCell>
                                    <TableCell style={{ color: theme.palette.text.secondary }}>{Number(row.cpm || 0).toFixed(2)}</TableCell>
                                    <TableCell style={{ color: theme.palette.text.secondary }}>{Number(row.ctr || 0).toFixed(2)}%</TableCell>
                                 </TableRow>
                               ))}
                            </TableBody>
                         </Table>
                       </div>
                      }
                   </Section>
               </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} name={7}>
           <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={8}>
                 <Card className={classes.card}>
                    <Section icon={<PostAddIcon style={{ color: theme.palette.text.primary }} />} title="Publicar Conteúdo">
                       <Typography variant="body2" style={{ color: theme.palette.text.secondary }} paragraph>
                          Publique ou agende posts para seu Feed do Instagram e Facebook.
                       </Typography>
                       <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                             <TextField select fullWidth label="Selecionar Página / Conta" value={pubAccountId} onChange={(e) => setPubAccountId(e.target.value)} variant="outlined" className={classes.input}>
                                {pages.map(p => (
                                  <MenuItem key={p.id} value={p.id}>
                                    {p.name} {p.instagram_business_account ? `+ Insta (@${p.instagram_business_account.username})` : ""}
                                  </MenuItem>
                                ))}
                             </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                             <Box display="flex" alignItems="center" height="100%" pl={2}>
                                <FormControlLabel
                                  control={<Checkbox checked={selectedPlatforms.facebook} onChange={(e) => setSelectedPlatforms({...selectedPlatforms, facebook: e.target.checked})} name="facebook" style={{color: '#1877F2'}} />}
                                  label="Facebook"
                                  style={{ color: theme.palette.text.primary }}
                                />
                                <FormControlLabel
                                  control={<Checkbox checked={selectedPlatforms.instagram} onChange={(e) => setSelectedPlatforms({...selectedPlatforms, instagram: e.target.checked})} name="instagram" style={{color: '#E1306C'}} />}
                                  label="Instagram"
                                  style={{ color: theme.palette.text.primary }}
                                />
                             </Box>
                          </Grid>
                          <Grid item xs={12}>
                             <FormControl fullWidth variant="outlined" className={classes.input}>
                               <InputLabel>Tipo de Conteúdo</InputLabel>
                               <Select
                                 value={contentType}
                                 onChange={(e) => setContentType(e.target.value)}
                                 label="Tipo de Conteúdo"
                               >
                                 <MenuItem value="feed">Feed</MenuItem>
                                 <MenuItem value="reels">Reels</MenuItem>
                                 <MenuItem value="story">Stories</MenuItem>
                                 <MenuItem value="carousel">Carrossel</MenuItem>
                               </Select>
                             </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                             <FormControl fullWidth variant="outlined" className={classes.input}>
                               <InputLabel>Tipo de Mídia</InputLabel>
                               <Select
                                 value={mediaType}
                                 onChange={(e) => setMediaType(e.target.value)}
                                 label="Tipo de Mídia"
                               >
                                 <MenuItem value="photo">Foto</MenuItem>
                                 <MenuItem value="video">Vídeo</MenuItem>
                               </Select>
                             </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                             <TextField fullWidth multiline minRows={4} label="Legenda / Texto" value={pubMessage} onChange={(e) => setPubMessage(e.target.value)} variant="outlined" placeholder="Escreva algo interessante..." className={classes.input} />
                          </Grid>
                          <Grid item xs={12}>
                             <Box p={4} border="2px dashed rgba(255, 255, 255, 0.3)" borderRadius={16} textAlign="center" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", cursor: 'pointer', transition: 'all 0.3s' }}>
                               <input
                                 accept="image/*,video/*"
                                 style={{ display: 'none' }}
                                 id="pub-file-upload"
                                 type="file"
                                 onChange={async (e) => {
                                   const file = e.target.files && e.target.files[0];
                                   if (!file) return;
                                   try {
                                     setPubLoading(true);
                                     const form = new FormData();
                                     form.append("file", file);
                                     const { data } = await api.post("/marketing/upload-media", form);
                                     setPubImageUrl(data.url);
                                     toast.success("Mídia enviada com sucesso!");
                                   } catch (err) {
                                     toastError(err);
                                   } finally {
                                     setPubLoading(false);
                                   }
                                 }}
                               />
                               <label htmlFor="pub-file-upload" style={{ width: '100%', display: 'block', cursor: 'pointer' }}>
                                 {pubImageUrl ? (
                                     <Box>
                                        {pubImageUrl.match(/\.(mp4|mov|avi)$/i) ? (
                                            <video src={pubImageUrl} controls style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }} />
                                        ) : (
                                            <img src={pubImageUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }} />
                                        )}
                                        <Box mt={2} display="flex" justifyContent="center" gap={2}>
                                            <Button variant="outlined" color="secondary" onClick={(e) => {
                                                e.preventDefault();
                                                setPubImageUrl("");
                                            }}>Remover Mídia</Button>
                                            <Button variant="contained" component="span" startIcon={<PublicIcon />} color="primary">
                                                Trocar Mídia
                                            </Button>
                                        </Box>
                                     </Box>
                                 ) : (
                                     <Box py={4}>
                                       <PublicIcon style={{ fontSize: 64, color: theme.palette.text.secondary, marginBottom: 16 }} />
                                        <Typography variant="h6" style={{ color: theme.palette.text.primary, marginBottom: 8 }}>
                                            Clique para fazer Upload de Foto ou Vídeo
                                        </Typography>
                                        <Typography variant="body2" style={{ color: theme.palette.text.secondary }}>
                                            Suporta JPG, PNG, MP4, MOV
                                        </Typography>
                                        <Button variant="contained" component="span" startIcon={<PublicIcon />} className={classes.button} style={{ marginTop: 24 }}>
                                            Selecionar da Galeria
                                        </Button>
                                     </Box>
                                 )}
                               </label>
                             </Box>
                          </Grid>
                          <Grid item xs={12}>
                             {!pubImageUrl && (
                                <TextField fullWidth label="Ou insira uma URL de Imagem (Opcional)" value={pubImageUrl} onChange={(e) => setPubImageUrl(e.target.value)} variant="outlined" helperText="Link público direto da imagem" placeholder="https://..." className={classes.input} />
                             )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                             <TextField fullWidth type="datetime-local" label="Agendar para (Opcional)" InputLabelProps={{ shrink: true }} value={pubScheduledTime} onChange={(e) => setPubScheduledTime(e.target.value)} variant="outlined" className={classes.input} />
                          </Grid>
                          <Grid item xs={12}>
                             <Button fullWidth variant="contained" color="primary" size="large" onClick={handlePublish} disabled={pubLoading} className={classes.button}>
                                {pubLoading ? "Processando..." : (pubScheduledTime ? "Agendar Publicação" : "Publicar Agora")}
                             </Button>
                          </Grid>
                       </Grid>
                    </Section>
                 </Card>
              </Grid>
              <Grid item xs={12} md={10}>
                 <Paper elevation={0} style={{ padding: 24, marginTop: 24, borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)" }}>
                   <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                     <Box flexGrow={1}>
                       <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>Feed do Facebook/Instagram</Typography>
                       <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                         Selecione uma página para visualizar e interagir com as postagens recentes.
                       </Typography>
                     </Box>
                     <Box display="flex" gap={2} alignItems="center">
                       <TextField
                         select
                         label="Onde estão suas postagens"
                         value={feedPlatform}
                         onChange={(e) => setFeedPlatform(e.target.value)}
                         variant="outlined"
                         size="small"
                         className={classes.input}
                         style={{ minWidth: 150 }}
                       >
                         <MenuItem value="facebook">Facebook</MenuItem>
                         <MenuItem value="instagram">Instagram</MenuItem>
                       </TextField>
                       <TextField
                         select
                         label="Escolha a página ou perfil"
                         value={feedPageId}
                         onChange={(e) => setFeedPageId(e.target.value)}
                         variant="outlined"
                         size="small"
                         className={classes.input}
                         style={{ minWidth: 250 }}
                       >
                         {pages.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                       </TextField>
                       <Button
                         className={classes.button}
                         onClick={handleFetchFeed}
                         disabled={feedLoading || !feedPageId}
                         startIcon={feedLoading ? <CircularProgress size={20} color="inherit" /> : <DynamicFeedIcon />}
                       >
                         {feedLoading ? "Carregando..." : "Atualizar Feed"}
                       </Button>
                     </Box>
                   </Box>
                 </Paper>
 
                 {feedLoading ? (
                   <Grid container spacing={3} style={{ marginTop: 8 }}>
                     {[1, 2, 3].map((i) => (
                       <Grid item xs={12} md={6} key={i}>
                         <Card className={classes.card}>
                           <CardContent>
                             <Box display="flex" alignItems="center" mb={2}>
                               <Skeleton variant="circle" width={40} height={40} style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                               <Box ml={2} width="100%">
                                 <Skeleton variant="text" width="60%" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                                 <Skeleton variant="text" width="40%" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                               </Box>
                             </Box>
                             <Skeleton variant="rect" height={200} style={{ borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)" }} />
                             <Box mt={2}>
                               <Skeleton variant="text" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                               <Skeleton variant="text" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                             </Box>
                           </CardContent>
                         </Card>
                       </Grid>
                     ))}
                   </Grid>
                 ) : feed.length === 0 && feedPageId ? (
                   <Box textAlign="center" py={8} bgcolor="rgba(255, 255, 255, 0.05)" borderRadius={16} border="1px dashed rgba(255, 255, 255, 0.2)" style={{ marginTop: 8 }}>
                     <DynamicFeedIcon style={{ fontSize: 64, color: "rgba(255, 255, 255, 0.3)", marginBottom: 16 }} />
                     <Typography variant="h6" style={{ color: "rgba(255, 255, 255, 0.7)" }}>Nenhuma publicação encontrada</Typography>
                     <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.5)" }}>Tente selecionar outra página ou verifique se há postagens recentes.</Typography>
                   </Box>
                 ) : (
                   <Grid container spacing={3} style={{ marginTop: 8 }}>
                     {feed.map((post) => (
                       <Grid item xs={12} md={6} lg={6} key={post.id}>
                         <Card className={classes.card} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                           <Box p={2} display="flex" alignItems="center" borderBottom="1px solid rgba(255, 255, 255, 0.1)">
                             <Avatar src={post.from && post.from.picture && post.from.picture.data && post.from.picture.data.url} style={{ border: "2px solid #3b82f6" }}>{(post.from && post.from.name && post.from.name[0]) || "?"}</Avatar>
                             <Box ml={2}>
                               <Typography variant="subtitle2" style={{ fontWeight: 700, color: theme.palette.text.primary }}>{(post.from && post.from.name) || "Usuário"}</Typography>
                               <Typography variant="caption" style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255, 255, 255, 0.7)" }}>
                                 {new Date(post.created_time).toLocaleDateString()} às {new Date(post.created_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 <PublicIcon style={{ fontSize: 12 }} />
                               </Typography>
                             </Box>
                           </Box>
                           {post.full_picture && (
                             <Box 
                               style={{ 
                                 width: "100%", 
                                 paddingTop: "56.25%",
                                 backgroundImage: `url(${post.full_picture})`, 
                                 backgroundSize: "cover", 
                                 backgroundPosition: "center",
                                 backgroundColor: "rgba(0,0,0,0.2)"
                               }} 
                             />
                           )}
                           <CardContent style={{ flexGrow: 1, paddingTop: 16, paddingBottom: 8 }}>
                             <Typography variant="body2" style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", lineHeight: 1.5, color: "rgba(255, 255, 255, 0.7)" }}>{post.message}</Typography>
                           </CardContent>
                           <Divider style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
                           <Box p={1} display="flex" justifyContent="space-between" alignItems="center">
                             <Box display="flex" gap={1}>
                               <Button 
                                 startIcon={<ThumbUpIcon />} 
                                 size="small" 
                                 onClick={() => handleLike(post.id)}
                                 color="primary"
                               >
                                 Curtir ({(post.likes && post.likes.summary && post.likes.summary.total_count) || 0})
                               </Button>
                               <Button 
                                 startIcon={<ChatBubbleOutlineIcon />} 
                                 size="small" 
                                 onClick={() => toggleComments(post.id)}
                                 color="primary"
                               >
                                 Comentar ({(post.comments && post.comments.summary && post.comments.summary.total_count) || 0})
                               </Button>
                             </Box>
                             <IconButton size="small" onClick={() => window.open(post.permalink_url, "_blank")} style={{ color: theme.palette.text.secondary }}>
                               <LinkIcon fontSize="small" />
                             </IconButton>
                           </Box>
                           
                           <Collapse in={expandedComments[post.id]} timeout="auto" unmountOnExit>
                             <Box p={2} bgcolor={theme.palette.type === "dark" ? "rgba(0, 0, 0, 0.3)" : "#f5f5f5"} borderTop="1px solid rgba(128, 128, 128, 0.1)">
                               <Box style={{ maxHeight: 300, overflowY: "auto", marginBottom: 16, paddingRight: 8 }}>
                                 {post.comments && post.comments.data && post.comments.data.length > 0 ? (
                                   post.comments.data.map((c) => (
                                     <Box key={c.id} mb={2} display="flex" alignItems="flex-start">
                                       <Avatar style={{ width: 32, height: 32, marginRight: 12, fontSize: 14 }}>{(c.from && c.from.name && c.from.name[0]) || "?"}</Avatar>
                                       <Box bgcolor={theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff"} p={2} borderRadius="0 12px 12px 12px" border={`1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"}`} flexGrow={1}>
                                         <Typography variant="subtitle2" style={{ fontSize: "0.85rem", fontWeight: "bold", color: theme.palette.text.primary }}>{(c.from && c.from.name) || "Usuário"}</Typography>
                                         <Typography variant="body2" style={{ fontSize: "0.9rem", color: theme.palette.text.primary }}>{c.message}</Typography>
                                       </Box>
                                     </Box>
                                   ))
                                 ) : (
                                   <Box py={2} textAlign="center">
                                     <Typography variant="caption" color="textSecondary">Seja o primeiro a comentar.</Typography>
                                   </Box>
                                 )}
                               </Box>
                               <Box display="flex" gap={1} alignItems="center">
                                 <Avatar style={{ width: 32, height: 32 }} />
                                 <TextField 
                                   fullWidth 
                                   placeholder="Escreva um comentário..." 
                                   size="small" 
                                   variant="outlined" 
                                   className={classes.input}
                                   id={`comment-${post.id}`} 
                                   InputProps={{ 
                                     style: { backgroundColor: theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff", borderRadius: 20 },
                                     endAdornment: (
                                       <InputAdornment position="end">
                                         <IconButton size="small" edge="end" color="primary" onClick={() => {
                                           const el = document.getElementById(`comment-${post.id}`);
                                           if (el && el.value) { handleComment(post.id, el.value); el.value = ""; }
                                         }}>
                                           <SendIcon fontSize="small" />
                                         </IconButton>
                                       </InputAdornment>
                                     )
                                   }}
                                 />
                               </Box>
                             </Box>
                           </Collapse>
                         </Card>
                       </Grid>
                     ))}
                   </Grid>
                 )}
              </Grid>
           </Grid>
        </TabPanel>

        <TabPanel value={tab} name={-1}>
           <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={10}>
                 <Paper elevation={0} style={{ padding: 24, marginBottom: 24, borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)" }}>
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                       <Box flexGrow={1}>
                          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>Feed do Facebook/Instagram</Typography>
                          <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>Selecione uma página para visualizar e interagir com as postagens recentes.</Typography>
                       </Box>
                       <Box display="flex" gap={2} alignItems="center">
                          <TextField 
                            select 
                            label="Onde estão suas postagens" 
                            value={feedPlatform} 
                            onChange={(e) => setFeedPlatform(e.target.value)} 
                            variant="outlined" 
                            size="small" 
                            className={classes.input}
                            style={{ minWidth: 150 }}
                          >
                             <MenuItem value="facebook">Facebook</MenuItem>
                             <MenuItem value="instagram">Instagram</MenuItem>
                          </TextField>
                          <TextField 
                            select 
                            label="Escolha a página ou perfil" 
                            value={feedPageId} 
                            onChange={(e) => setFeedPageId(e.target.value)} 
                            variant="outlined" 
                            size="small" 
                            className={classes.input}
                            style={{ minWidth: 250 }}
                          >
                             {pages.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                          </TextField>
                          <Button 
                            className={classes.button}
                            onClick={handleFetchFeed} 
                            disabled={feedLoading || !feedPageId}
                            startIcon={feedLoading ? <CircularProgress size={20} color="inherit" /> : <DynamicFeedIcon />}
                          >
                             {feedLoading ? "Carregando..." : "Atualizar Feed"}
                          </Button>
                       </Box>
                    </Box>
                 </Paper>
                 
                 {feedLoading ? (
                    <Grid container spacing={3}>
                       {[1, 2, 3].map((i) => (
                          <Grid item xs={12} md={6} key={i}>
                             <Card className={classes.card}>
                                <CardContent>
                                   <Box display="flex" alignItems="center" mb={2}>
                                      <Skeleton variant="circle" width={40} height={40} style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                                      <Box ml={2} width="100%">
                                         <Skeleton variant="text" width="60%" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                                         <Skeleton variant="text" width="40%" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                                      </Box>
                                   </Box>
                                   <Skeleton variant="rect" height={200} style={{ borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)" }} />
                                   <Box mt={2}>
                                      <Skeleton variant="text" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                                      <Skeleton variant="text" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                                   </Box>
                                </CardContent>
                             </Card>
                          </Grid>
                       ))}
                    </Grid>
                 ) : feed.length === 0 && feedPageId ? (
                    <Box textAlign="center" py={8} bgcolor="rgba(255, 255, 255, 0.05)" borderRadius={16} border="1px dashed rgba(255, 255, 255, 0.2)">
                       <DynamicFeedIcon style={{ fontSize: 64, color: "rgba(255, 255, 255, 0.3)", marginBottom: 16 }} />
                       <Typography variant="h6" style={{ color: "rgba(255, 255, 255, 0.7)" }}>Nenhuma publicação encontrada</Typography>
                       <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.5)" }}>Tente selecionar outra página ou verifique se há postagens recentes.</Typography>
                    </Box>
                 ) : (
                    <Grid container spacing={3}>
                       {feed.map((post) => (
                         <Grid item xs={12} md={6} lg={6} key={post.id}>
                            <Card className={classes.card} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                               <Box p={2} display="flex" alignItems="center" borderBottom="1px solid rgba(255, 255, 255, 0.1)">
                                  <Avatar src={post.from && post.from.picture && post.from.picture.data && post.from.picture.data.url} style={{ border: "2px solid #3b82f6" }}>{(post.from && post.from.name && post.from.name[0]) || "?"}</Avatar>
                                  <Box ml={2}>
                                     <Typography variant="subtitle2" style={{ fontWeight: 700, color: theme.palette.text.primary }}>{(post.from && post.from.name) || "Usuário"}</Typography>
                                     <Typography variant="caption" style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255, 255, 255, 0.7)" }}>
                                        {new Date(post.created_time).toLocaleDateString()} às {new Date(post.created_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        <PublicIcon style={{ fontSize: 12 }} />
                                     </Typography>
                                  </Box>
                               </Box>
                               {post.full_picture && (
                                  <Box 
                                    style={{ 
                                      width: "100%", 
                                      paddingTop: "56.25%", // 16:9 Aspect Ratio
                                      backgroundImage: `url(${post.full_picture})`, 
                                      backgroundSize: "cover", 
                                      backgroundPosition: "center",
                                      backgroundColor: "rgba(0,0,0,0.2)"
                                    }} 
                                  />
                               )}
                               <CardContent style={{ flexGrow: 1, paddingTop: 16, paddingBottom: 8 }}>
                                  <Typography variant="body2" style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", lineHeight: 1.5, color: "rgba(255, 255, 255, 0.7)" }}>{post.message}</Typography>
                               </CardContent>
                               <Divider style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
                               <Box p={1} display="flex" justifyContent="space-between" alignItems="center">
                                  <Box display="flex" gap={1}>
                                     <Button 
                                      startIcon={<ThumbUpIcon />} 
                                      size="small" 
                                      onClick={() => handleLike(post.id)}
                                      color="primary"
                                    >
                                       Curtir ({(post.likes && post.likes.summary && post.likes.summary.total_count) || 0})
                                    </Button>
                                    <Button 
                                      startIcon={<ChatBubbleOutlineIcon />} 
                                      size="small" 
                                      onClick={() => toggleComments(post.id)}
                                      color="primary"
                                    >
                                       Comentar ({(post.comments && post.comments.summary && post.comments.summary.total_count) || 0})
                                    </Button>
                                  </Box>
                                  <IconButton size="small" onClick={() => window.open(post.permalink_url, "_blank")} style={{ color: theme.palette.text.secondary }}>
                                     <LinkIcon fontSize="small" />
                                  </IconButton>
                               </Box>
                               
                               <Collapse in={expandedComments[post.id]} timeout="auto" unmountOnExit>
                                   <Box p={2} bgcolor={theme.palette.type === "dark" ? "rgba(0, 0, 0, 0.3)" : "#f5f5f5"} borderTop="1px solid rgba(128, 128, 128, 0.1)">
                                      <Box style={{ maxHeight: 300, overflowY: "auto", marginBottom: 16, paddingRight: 8 }}>
                                         {post.comments && post.comments.data && post.comments.data.length > 0 ? (
                                           post.comments.data.map((c) => (
                                             <Box key={c.id} mb={2} display="flex" alignItems="flex-start">
                                                <Avatar style={{ width: 32, height: 32, marginRight: 12, fontSize: 14 }}>{(c.from && c.from.name && c.from.name[0]) || "?"}</Avatar>
                                                <Box bgcolor={theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff"} p={2} borderRadius="0 12px 12px 12px" border={`1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "#e0e0e0"}`} flexGrow={1}>
                                                   <Typography variant="subtitle2" style={{ fontSize: "0.85rem", fontWeight: "bold", color: theme.palette.text.primary }}>{(c.from && c.from.name) || "Usuário"}</Typography>
                                                   <Typography variant="body2" style={{ fontSize: "0.9rem", color: theme.palette.text.primary }}>{c.message}</Typography>
                                                </Box>
                                             </Box>
                                           ))
                                         ) : (
                                           <Box py={2} textAlign="center">
                                              <Typography variant="caption" color="textSecondary">Seja o primeiro a comentar.</Typography>
                                           </Box>
                                         )}
                                      </Box>
                                      <Box display="flex" gap={1} alignItems="center">
                                         <Avatar style={{ width: 32, height: 32 }} />
                                         <TextField 
                                           fullWidth 
                                           placeholder="Escreva um comentário..." 
                                           size="small" 
                                           variant="outlined" 
                                           className={classes.input}
                                           id={`comment-${post.id}`} 
                                           InputProps={{ 
                                              style: { backgroundColor: theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff", borderRadius: 20 },
                                              endAdornment: (
                                                <InputAdornment position="end">
                                                  <IconButton size="small" edge="end" color="primary" onClick={() => {
                                                     const el = document.getElementById(`comment-${post.id}`);
                                                     if (el && el.value) { handleComment(post.id, el.value); el.value = ""; }
                                                  }}>
                                                     <SendIcon fontSize="small" />
                                                  </IconButton>
                                                </InputAdornment>
                                              )
                                           }}
                                         />
                                      </Box>
                                   </Box>
                               </Collapse>
                            </Card>
                         </Grid>
                       ))}
                    </Grid>
                 )}
              </Grid>
           </Grid>
        </TabPanel>

        <TabPanel value={tab} name={8}>
           <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={8}>
                 <Card className={classes.card}>
                    <Section icon={<SettingsIcon style={{ color: "white" }} />} title="Configurações">
                       <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }} paragraph>
                          Configure as conexões com as plataformas de Marketing e Redes Sociais.
                       </Typography>
                       
                       <Box mb={4} p={3} border="1px solid rgba(255, 255, 255, 0.1)" borderRadius={8} bgcolor="rgba(255, 255, 255, 0.05)">
                          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>Meta (Facebook & Instagram)</Typography>
                          
                          {status?.adAccountId ? (
                                <Box>
                                   <Box display="flex" alignItems="center" gap={2} mb={2}>
                                      <CheckCircleIcon style={{ color: "#10b981" }} />
                                      <Typography variant="body1" style={{ color: theme.palette.text.primary }}>
                                        Conexão com Facebook e Instagram ativa para <strong>{status.me?.name}</strong>
                                      </Typography>
                                   </Box>
                                   <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                                     Suas contas já estão conectadas. Você não precisa se preocupar com IDs técnicos.
                                   </Typography>
                                   <Box mt={3}>
                                      <Button variant="outlined" color="secondary" onClick={() => window.location.href = "/connections"}>
                                         Ajustar conexões
                                      </Button>
                                   </Box>
                                </Box>
                          ) : (
                             <Box>
                                <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: 16 }}>
                                   Você precisa conectar sua conta do Facebook para utilizar os recursos de Marketing.
                                </Typography>
                                <Button variant="contained" color="primary" onClick={() => window.location.href = "/connections"}>
                                   Conectar Agora
                                </Button>
                             </Box>
                          )}
                       </Box>
                       
                       <Box mb={4} p={3} border="1px solid rgba(255, 255, 255, 0.1)" borderRadius={8} bgcolor="rgba(255, 255, 255, 0.05)">
                          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>OpenAI / LLM</Typography>
                          <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: 16 }}>
                             A configuração da IA é feita no menu "OpenAI" ou "Integrações".
                          </Typography>
                          <Button variant="outlined" color="primary" onClick={() => history.push("/settings", { tab: "options", subTab: "settings-openai-audio" })}>
                             Ir para Configurações de IA
                          </Button>
                       </Box>

                       <Box mb={4} p={3} border="1px solid rgba(255, 255, 255, 0.1)" borderRadius={8} bgcolor="rgba(255, 255, 255, 0.05)">
                          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
                            Palavras gatilho para comentários (captar leads)
                          </Typography>
                          <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: 16 }}>
                            Quando alguém comentar usando uma dessas palavras ou frases, vamos enviar uma mensagem no Direct e abrir um atendimento automaticamente.
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            variant="outlined"
                            className={classes.input}
                            label="Palavras ou frases separadas por vírgula"
                            placeholder='Ex: "quero orçamento, quero comprar, mais informações"'
                            value={commentTriggersText}
                            onChange={e => setCommentTriggersText(e.target.value)}
                          />
                          <Box mt={2}>
                            <Button
                              variant="contained"
                              color="primary"
                              className={classes.button}
                              onClick={handleSaveCommentTriggers}
                              disabled={commentTriggersSaving}
                            >
                              {commentTriggersSaving ? "Salvando..." : "Salvar palavras gatilho"}
                            </Button>
                          </Box>
                        </Box>

                        <Box mb={4} p={3} border="1px solid rgba(255, 255, 255, 0.1)" borderRadius={8} bgcolor="rgba(255, 255, 255, 0.05)">
                          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
                            PDF de resposta rápida no DM
                          </Typography>
                          <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: 16 }}>
                            Configure um link de PDF e a frase que o agente/robô usa para oferecer esse material quando o lead chega pelo Instagram ou Facebook.
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            className={classes.input}
                            label="Link do PDF (Google Drive, site, etc.)"
                            placeholder="https://seusite.com/material.pdf"
                            value={pdfLink}
                            onChange={e => setPdfLink(e.target.value)}
                            style={{ marginBottom: 16 }}
                          />
                          <TextField
                            fullWidth
                            variant="outlined"
                            className={classes.input}
                            label="Pergunta para iniciar o diálogo"
                            placeholder="Posso te enviar um PDF com mais detalhes sobre a oferta?"
                            value={pdfQuestion}
                            onChange={e => setPdfQuestion(e.target.value)}
                          />
                          <Box mt={2}>
                            <Button
                              variant="contained"
                              color="primary"
                              className={classes.button}
                              onClick={handleSavePdfConfig}
                              disabled={pdfSaving}
                            >
                              {pdfSaving ? "Salvando..." : "Salvar configurações de PDF"}
                            </Button>
                          </Box>
                          <Box mt={2} p={2} border="1px dashed rgba(255, 255, 255, 0.2)" borderRadius={8}>
                            <Typography variant="subtitle2" gutterBottom style={{ color: theme.palette.text.primary }}>
                              Pré-visualização da mensagem no Direct
                            </Typography>
                            <Box p={2} bgcolor={theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff"} borderRadius={12}>
                              <Typography variant="body2" style={{ color: theme.palette.text.primary, whiteSpace: "pre-wrap" }}>
                                {`Olá Cliente! Vi seu comentário no seu interesse. Vou te atender aqui no direct para continuar a conversa. 😊`}
                                {pdfLink ? `\n\n${pdfQuestion || "Posso te enviar um PDF com mais detalhes?"}\n${pdfLink}` : ""}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box mb={4} p={3} border="1px solid rgba(255, 255, 255, 0.1)" borderRadius={8} bgcolor="rgba(255, 255, 255, 0.05)">
                          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
                            Redes sociais conectadas para DM
                          </Typography>
                          {pagesLoading ? (
                            <Box display="flex" alignItems="center" gap={2}>
                              <CircularProgress size={20} />
                              <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                                Carregando páginas conectadas...
                              </Typography>
                            </Box>
                          ) : pagesError ? (
                            <Typography variant="body2" style={{ color: "#f97316" }}>
                              {pagesErrorMsg || "Não foi possível carregar as páginas conectadas."}
                            </Typography>
                          ) : Array.isArray(pages) && pages.length > 0 ? (
                            <List dense>
                              {pages.map((pg) => (
                                <ListItem key={pg.id}>
                                  <ListItemAvatar>
                                    <Avatar>
                                      <ConnectionIcon connectionType="facebook" />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Typography variant="subtitle2" style={{ color: theme.palette.text.primary }}>
                                        {pg.name}
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                                        {pg.instagram_business_account
                                          ? "Instagram profissional conectado para receber comentários e DMs."
                                          : "Sem Instagram profissional conectado nesta página."}
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                              Nenhuma página Meta conectada ainda. Conecte em "Conexões" para ativar DM automático.
                            </Typography>
                          )}
                        </Box>

                        <Box mb={2} p={3} border="1px solid rgba(255, 255, 255, 0.1)" borderRadius={8} bgcolor="rgba(255, 255, 255, 0.05)">
                          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
                            Canais que recebem esses leads
                          </Typography>
                          <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: 12 }}>
                            Aqui você vê em quais canais o agente/robô pode atender os leads que chegam dos comentários.
                          </Typography>
                          {whatsAppsLoading ? (
                            <Box display="flex" alignItems="center" gap={2}>
                              <CircularProgress size={20} />
                              <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                                Carregando canais de atendimento...
                              </Typography>
                            </Box>
                          ) : Array.isArray(whatsApps) && whatsApps.length > 0 ? (
                            <List dense>
                              {whatsApps
                                .filter((w) => w.channel === "facebook" || w.channel === "instagram")
                                .map((w) => {
                                  const hasAutomation = !!w.promptId || !!w.integrationId;
                                  return (
                                    <ListItem key={w.id}>
                                      <ListItemAvatar>
                                        <Avatar>
                                          <ConnectionIcon connectionType={w.channel} />
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={
                                          <Typography variant="subtitle2" style={{ color: theme.palette.text.primary }}>
                                            {w.name || "Canal Meta"} ({w.channel})
                                          </Typography>
                                        }
                                        secondary={
                                          <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                                            Status: {w.status || "desconhecido"} •{" "}
                                            {hasAutomation
                                              ? "Agente/fluxo automático configurado para este canal."
                                              : "Atendimento manual. Configure IA nas opções de OpenAI/Integrações."}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  );
                                })}
                            </List>
                          ) : (
                            <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                              Nenhum canal de atendimento configurado ainda. Crie conexões em "Conexões".
                            </Typography>
                          )}
                        </Box>
                    </Section>
                 </Card>
              </Grid>
           </Grid>
        </TabPanel>

        <TabPanel value={tab} name={9}>
           <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                 <Card className={classes.card}>
                    <Section icon={<MonetizationOnIcon style={{ color: theme.palette.text.primary }} />} title="Saldo de Anúncios">
                       <Box display="flex" justifyContent="center" mb={3}>
                         <CardBalance balance={walletBalance} />
                       </Box>
                       <Box display="flex" justifyContent="space-between" mb={2}>
                         <Box>
                           <Typography variant="subtitle2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                             Créditos comprados
                           </Typography>
                           <Typography variant="body1" style={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                             {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(walletTotalCredits || 0)}
                           </Typography>
                         </Box>
                         <Box textAlign="right">
                           <Typography variant="subtitle2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                             Gasto acumulado
                           </Typography>
                           <Typography variant="body1" style={{ color: "#f97316", fontWeight: 600 }}>
                             {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(walletTotalSpend || 0)}
                           </Typography>
                         </Box>
                       </Box>
                       {walletBalance < 0 && (
                         <Box mb={2}>
                           <Typography variant="body2" style={{ color: "#f97316" }}>
                             Atenção: você já gastou acima do crédito comprado. Ajuste seu orçamento ou compre mais créditos.
                           </Typography>
                         </Box>
                       )}
                       <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }} paragraph>
                         O saldo de anúncios é cobrado diretamente pela Meta na sua conta de anúncios.
                         Aqui você acompanha um resumo para controlar quanto está disposto a investir.
                       </Typography>
                       <Box mt={2} p={2} border="1px solid rgba(255, 255, 255, 0.1)" borderRadius={8}>
                          <Typography variant="subtitle2" gutterBottom style={{ color: theme.palette.text.primary }}>
                             Gasto estimado no período selecionado
                          </Typography>
                          <Typography variant="h5" style={{ color: "#ef4444", fontWeight: 700 }}>
                             {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(estimatedSpend || 0)}
                          </Typography>
                          <Typography variant="body2" style={{ marginTop: 8, color: "rgba(255, 255, 255, 0.7)" }}>
                             Estes valores vêm dos relatórios da Meta em "Relatórios" e ajudam a entender
                             quanto está sendo investido em seus anúncios.
                          </Typography>
                       </Box>
                    </Section>
                 </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                 <Card className={classes.card}>
                    <Section icon={<MonetizationOnIcon style={{ color: theme.palette.text.primary }} />} title="Adicionar Crédito / Controle">
                       <Box display="flex" justifyContent="center" mb={2}>
                         <CardDeposit isActive />
                       </Box>
                       <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }} paragraph>
                         Use esta seção como controle interno de orçamento. Caso queira vender
                         créditos de mídia pela plataforma, você poderá integrar esta área com o seu
                         módulo financeiro.
                       </Typography>
                       <Box mt={2}>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            className={classes.button}
                            onClick={() => history.push("/financeiro")}
                          >
                            Abrir Financeiro
                          </Button>
                       </Box>
                    </Section>
                 </Card>
              </Grid>
           </Grid>
        </TabPanel>
      </Container>
    </div>
  );
};

export default Marketing;
