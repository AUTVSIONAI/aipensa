import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Tabs, Tab, Divider, Chip, Stepper, Step, StepLabel, CircularProgress, Avatar, Tooltip, InputAdornment, List, ListItem, ListItemAvatar, ListItemText, IconButton, Paper, Collapse } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
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
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
    backgroundColor: "#f3f4f6",
    minHeight: "100vh"
  },
  header: {
    marginBottom: theme.spacing(4)
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
    height: "100%",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 15px rgba(0,0,0,0.08)"
    }
  },
  cardHeader: {
    padding: theme.spacing(2),
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2)
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#1f2937"
  },
  cardContent: {
    padding: theme.spacing(3)
  },
  tabRoot: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: theme.spacing(3),
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
  },
  statVal: {
    fontWeight: 700,
    fontSize: "1.5rem"
  }
}));

const Marketing = () => {
  const classes = useStyles();
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
  const [pubPlatform, setPubPlatform] = useState("facebook");
  const [pubAccountId, setPubAccountId] = useState("");
  const [pubMessage, setPubMessage] = useState("");
  const [pubImageUrl, setPubImageUrl] = useState("");
  const [pubScheduledTime, setPubScheduledTime] = useState("");
  const [pubLoading, setPubLoading] = useState(false);
  const [feed, setFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedPageId, setFeedPageId] = useState("");
  const [tab, setTab] = useState(0);
  const [flowStep, setFlowStep] = useState(0);
  const [lastActionSummary, setLastActionSummary] = useState("");
  
  // Feed comments expansion state
  const [expandedComments, setExpandedComments] = useState({});

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const Section = ({ icon, title, children }) => (
    <Box>
      <div className={classes.cardHeader}>
        <Avatar style={{ width: 32, height: 32, backgroundColor: "#3b82f6" }}>{icon}</Avatar>
        <Typography className={classes.cardTitle}>{title}</Typography>
      </div>
      <div className={classes.cardContent}>
        {children}
      </div>
    </Box>
  );

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setStatusLoading(true);
        const { data } = await api.get("/marketing/status");
        setStatus(data);
      } catch (err) {
        toastError(err);
        setStatusError(true);
        setStatusErrorMsg(String(err?.response?.data?.error || err?.message || "Erro ao obter status"));
      } finally {
        setStatusLoading(false);
      }
    };
    const fetchInsights = async () => {
      try {
        setInsightsLoading(true);
        const { data } = await api.get("/marketing/insights", { params: { date_preset: datePreset } });
        setInsights(data.data || []);
      } catch (err) {
        if (err.response?.status !== 400) {
          toastError(err);
        }
        setInsightsError(true);
        setInsightsErrorMsg(String(err?.response?.data?.error || err?.message || "Erro ao obter insights"));
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchStatus();
    fetchInsights();
    const fetchPages = async () => {
      try {
        setPagesLoading(true);
        setPagesError(false);
        const { data } = await api.get("/marketing/pages");
        setPages(data?.data || []);
      } catch (err) {
        if (err.response?.status !== 400) {
          toastError(err);
        }
        setPagesError(true);
        setPagesErrorMsg(String(err?.response?.data?.error || err?.message || "Erro ao obter páginas"));
      } finally {
        setPagesLoading(false);
      }
    };
    fetchPages();
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

  useEffect(() => {
    const refetchInsights = async () => {
      try {
        setInsightsLoading(true);
        const { data } = await api.get("/marketing/insights", { params: { date_preset: datePreset } });
        setInsights(data.data || []);
      } catch (err) {
        if (err.response?.status !== 400) {
          toastError(err);
        }
        setInsightsError(true);
        setInsightsErrorMsg(String(err?.response?.data?.error || err?.message || "Erro ao obter insights"));
      } finally {
        setInsightsLoading(false);
      }
    };
    refetchInsights();
  }, [datePreset]);

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
      const { data } = await api.get("/marketing/feed", { params: { pageId: feedPageId } });
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
      await api.post("/marketing/like", { objectId: postId, pageAccessToken });
      toast.success("Curtiu!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleComment = async (postId, message) => {
    try {
      const pageAccessToken = getPageToken(feedPageId);
      await api.post("/marketing/comment", { objectId: postId, message, pageAccessToken });
      toast.success("Comentário enviado!");
      handleFetchFeed(); // Atualiza feed para ver o comentário
    } catch (err) {
      toastError(err);
    }
  };

  const handleCreateCampaign = async () => {
    setCreating(true);
    try {
      const { data } = await api.post("/marketing/campaign", {
        name,
        objective,
        status: "PAUSED",
        special_ad_categories: []
      });
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
    setAdsetCreating(true);
    try {
      const { data } = await api.post("/marketing/adset", {
        name: adsetName,
        campaign_id: campaignId,
        daily_budget: dailyBudget,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        status: "PAUSED",
        targeting: { geo_locations: { countries: ["BR"] } }
      });
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
      const { data } = await api.post("/marketing/creative", {
        page_id: pageId,
        link: linkUrl,
        image_hash: imageHash,
        message: messageText
      });
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
    setAdCreating(true);
    try {
      const { data } = await api.post("/marketing/ad", {
        name: adName,
        adset_id: adsetId,
        creative_id: creativeId,
        status: "PAUSED"
      });
      toast.success(`Ad criado: ${data.id}`);
      setLastActionSummary(`Ad criado: ${data.id}`);
    } catch (err) {
      toastError(err);
    } finally {
      setAdCreating(false);
    }
  };

  const handlePublish = async () => {
    setPubLoading(true);
    try {
      await api.post("/marketing/publish", {
        platform: pubPlatform,
        accountId: pubAccountId,
        message: pubMessage,
        imageUrl: pubImageUrl,
        scheduledTime: pubScheduledTime || undefined
      });
      toast.success("Publicado/Agendado com sucesso!");
      setLastActionSummary("Publicação realizada com sucesso");
      setPubMessage("");
      setPubImageUrl("");
      setPubScheduledTime("");
    } catch (err) {
      toastError(err);
    } finally {
      setPubLoading(false);
    }
  };

  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`marketing-tabpanel-${index}`}
        aria-labelledby={`marketing-tab-${index}`}
        {...other}
        style={{ display: value === index ? "block" : "none" }}
      >
        {value === index && (
          <Box p={3}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <Container maxWidth="xl">
        <Box className={classes.header} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => history.push("/")}
              style={{ color: "#4b5563", marginRight: 16 }}
            >
              Voltar
            </Button>
            <Box>
              <Typography variant="h4" style={{ fontWeight: 700, color: "#111827" }}>
                Marketing Pro
              </Typography>
              <Typography variant="subtitle1" style={{ color: "#6b7280" }}>
                Gerencie suas campanhas e redes sociais em um único lugar.
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Chip 
               icon={status?.adAccountId ? <ThumbUpIcon /> : <InfoOutlinedIcon />} 
               label={status?.adAccountId ? "Meta API Conectada" : "Meta API Desconectada"} 
               color={status?.adAccountId ? "primary" : "default"} 
               variant={status?.adAccountId ? "default" : "outlined"}
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
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><PostAddIcon style={{marginRight: 8}}/> Publicar</div>} />
            <Tab label={<div style={{display:'flex', alignItems:'center'}}><DynamicFeedIcon style={{marginRight: 8}}/> Feed</div>} />
          </Tabs>
        </Paper>

        <TabPanel value={tab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card className={classes.card}>
                <Section icon={<PublicIcon style={{ color: "white" }} />} title="Visão Geral da Conta">
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
                            <Typography variant="caption" color="textSecondary">Usuário Conectado</Typography>
                            <Typography variant="h6">{status?.me?.name || "-"}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                             <Typography variant="caption" color="textSecondary">Ad Account ID</Typography>
                             <Typography variant="h6">{status?.adAccountId || "-"}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                             <Typography variant="caption" color="textSecondary">Business Manager ID</Typography>
                             <Typography variant="h6">{status?.businessId || "-"}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                             <Typography variant="caption" color="textSecondary">Status da API</Typography>
                             <Typography variant="h6" style={{ color: "#10b981" }}>Ativo</Typography>
                          </Grid>
                        </Grid>
                        {status?.adAccountId && (
                          <Box mt={4} display="flex" gap={2}>
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<LinkIcon />}
                              onClick={() => {
                                const act = status?.adAccountId;
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
                    <Typography variant="h6" gutterBottom>Conexão Necessária</Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Para utilizar as ferramentas de marketing, você precisa conectar sua conta do Facebook/Instagram.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => (window.location.href = "/connections")}
                    >
                      Conectar Agora
                    </Button>
                  </Box>
                )}
                </Section>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={3} direction="column">
                 <Grid item>
                    <Card className={classes.card}>
                      <Section icon={<InfoOutlinedIcon style={{ color: "white" }} />} title="Custos e Limites">
                        <Box>
                          <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>Integrações Meta (Facebook/Instagram)</Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Postagens e Feed" 
                                secondary="GRATUITO (API Orgânica)" 
                                primaryTypographyProps={{ style: { fontWeight: 500 } }}
                              />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                              <ListItemText 
                                primary="Anúncios (Ads)" 
                                secondary="Custo por visualização/clique (pago ao Facebook)" 
                                primaryTypographyProps={{ style: { fontWeight: 500 } }}
                              />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                              <ListItemText 
                                primary="Agendamento" 
                                secondary="GRATUITO (Incluso na API)" 
                                primaryTypographyProps={{ style: { fontWeight: 500 } }}
                              />
                            </ListItem>
                          </List>
                          <Box mt={1} p={1} bgcolor="#f3f4f6" borderRadius={4}>
                             <Typography variant="caption" display="block" align="center" color="textSecondary">
                               Os custos de anúncios são cobrados diretamente na sua conta do Gerenciador de Anúncios.
                             </Typography>
                          </Box>
                        </Box>
                      </Section>
                    </Card>
                 </Grid>
                 <Grid item>
                    <Card className={classes.card}>
                      <Section icon={<SettingsSuggestIcon style={{ color: "white" }} />} title="Última Atividade">
                        <Box p={2} bgcolor="#f9fafb" borderRadius={8} border="1px dashed #d1d5db">
                          <Typography variant="body2" style={{ fontFamily: 'monospace', color: "#4b5563" }}>
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

        <TabPanel value={tab} index={1}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card className={classes.card}>
                <Section icon={<CampaignIcon style={{ color: "white" }} />} title="1. Criar Nova Campanha">
                  <Typography variant="body2" paragraph color="textSecondary">
                    A campanha é o primeiro nível da estrutura de anúncios. Defina o nome e o objetivo principal.
                  </Typography>
                  <TextField fullWidth label="Nome da Campanha" value={name} onChange={(e) => setName(e.target.value)} variant="outlined" margin="normal" />
                  <TextField fullWidth label="Objetivo" value={objective} onChange={(e) => setObjective(e.target.value)} variant="outlined" margin="normal" helperText="Recomendado para WhatsApp: MESSAGES" InputProps={{ readOnly: true }} />
                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button variant="contained" color="primary" size="large" disabled={creating} onClick={handleCreateCampaign}>
                      {creating ? <CircularProgress size={24} /> : "Criar Campanha"}
                    </Button>
                  </Box>
                  {campaignId && (
                    <Box mt={3} p={2} bgcolor="#ecfdf5" borderRadius={4} border="1px solid #10b981" display="flex" alignItems="center" gap={2}>
                      <ThumbUpIcon style={{ color: "#047857" }} />
                      <Box>
                         <Typography variant="subtitle2" style={{ color: "#047857" }}>Campanha Criada com Sucesso!</Typography>
                         <Typography variant="body2">ID da Campanha: <strong>{campaignId}</strong></Typography>
                      </Box>
                    </Box>
                  )}
                </Section>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card className={classes.card}>
                <Section icon={<AutoGraphIcon style={{ color: "white" }} />} title="2. Configurar Conjunto de Anúncios (AdSet)">
                  <TextField fullWidth label="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} variant="outlined" margin="normal" required helperText="ID da campanha criada no passo anterior" />
                  <TextField fullWidth label="Nome do AdSet" value={adsetName} onChange={(e) => setAdsetName(e.target.value)} variant="outlined" margin="normal" />
                  <TextField fullWidth label="Orçamento Diário (centavos)" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} variant="outlined" margin="normal" helperText="Ex: 1000 = R$ 10,00. O mínimo geralmente é R$ 5,50." />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                       <TextField fullWidth label="Início (ISO 8601)" value={startTime} onChange={(e) => setStartTime(e.target.value)} variant="outlined" margin="normal" placeholder="2023-12-31T23:59:00-0300" helperText="Opcional: Deixe em branco para iniciar imediatamente" />
                    </Grid>
                    <Grid item xs={6}>
                       <TextField fullWidth label="Fim (ISO 8601)" value={endTime} onChange={(e) => setEndTime(e.target.value)} variant="outlined" margin="normal" placeholder="2024-01-31T23:59:00-0300" helperText="Opcional" />
                    </Grid>
                  </Grid>
                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button variant="contained" color="primary" size="large" disabled={adsetCreating || !campaignId} onClick={handleCreateAdSet}>
                      {adsetCreating ? <CircularProgress size={24} /> : "Criar AdSet"}
                    </Button>
                  </Box>
                  {adsetId && (
                    <Box mt={3} p={2} bgcolor="#ecfdf5" borderRadius={4} border="1px solid #10b981">
                      <Typography variant="subtitle2" style={{ color: "#047857" }}>AdSet Criado!</Typography>
                      <Typography variant="body2">ID: {adsetId}</Typography>
                    </Box>
                  )}
                </Section>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className={classes.card}>
                <Section icon={<WidgetsIcon style={{ color: "white" }} />} title="3.1 Upload de Mídia">
                  <Box p={4} border="2px dashed #e5e7eb" borderRadius={8} textAlign="center" style={{ backgroundColor: "#f9fafb" }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="raised-button-file"
                      type="file"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
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
                      <Button variant="contained" color="default" component="span" startIcon={<PublicIcon />}>
                        Selecionar Imagem do Computador
                      </Button>
                    </label>
                    {imageHash && (
                        <Box mt={2} p={1} bgcolor="#e0e7ff" borderRadius={4}>
                             <Typography variant="caption" display="block">Hash Gerado:</Typography>
                             <Typography variant="body2" style={{ wordBreak: "break-all", fontWeight: "bold" }}>{imageHash}</Typography>
                        </Box>
                    )}
                  </Box>
                </Section>
              </Card>
              <Box mt={3}>
                 <Card className={classes.card}>
                  <Section icon={<SettingsSuggestIcon style={{ color: "white" }} />} title="3.2 Criar Criativo (Creative)">
                    <TextField fullWidth label="Page ID" value={pageId} onChange={(e) => setPageId(e.target.value)} variant="outlined" margin="normal" helperText="ID da página do Facebook" />
                    <TextField fullWidth label="Link Destino" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} variant="outlined" margin="normal" />
                    <TextField fullWidth label="Image Hash" value={imageHash} onChange={(e) => setImageHash(e.target.value)} variant="outlined" margin="normal" />
                    <TextField fullWidth label="Texto do Anúncio" value={messageText} onChange={(e) => setMessageText(e.target.value)} variant="outlined" margin="normal" multiline minRows={3} />
                    <Box mt={2}>
                      <Button fullWidth variant="contained" color="primary" disabled={creativeCreating || !pageId} onClick={handleCreateCreative}>
                        Criar Creative
                      </Button>
                    </Box>
                    {creativeId && <Typography variant="body2" style={{ marginTop: 8, color: "green", fontWeight: "bold" }}>ID Creative: {creativeId}</Typography>}
                  </Section>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className={classes.card}>
                <Section icon={<CampaignIcon style={{ color: "white" }} />} title="3.3 Publicar Anúncio (Ad)">
                   <TextField fullWidth label="Nome do Anúncio" value={adName} onChange={(e) => setAdName(e.target.value)} variant="outlined" margin="normal" />
                   <TextField fullWidth label="AdSet ID" value={adsetId} onChange={(e) => setAdsetId(e.target.value)} variant="outlined" margin="normal" />
                   <TextField fullWidth label="Creative ID" value={creativeId} onChange={(e) => setCreativeId(e.target.value)} variant="outlined" margin="normal" />
                   <Box mt={3}>
                     <Button fullWidth variant="contained" color="primary" size="large" disabled={adCreating || !adsetId || !creativeId} onClick={handleCreateAd}>
                       Publicar Anúncio Final
                     </Button>
                   </Box>
                   <Box mt={2}>
                     <Typography variant="caption" color="textSecondary">O anúncio será criado com status PAUSED por segurança. Ative-o na aba 'Gerenciar'.</Typography>
                   </Box>
                </Section>
              </Card>
               <Box mt={3}>
                <Card className={classes.card}>
                  <Section icon={<SendIcon style={{ color: "white" }} />} title="Teste de DM (Instagram)">
                    <Typography variant="body2" color="textSecondary" paragraph>
                       Envie uma mensagem direta de teste para um ticket aberto no sistema.
                    </Typography>
                    <TextField fullWidth label="Ticket ID" onChange={(e) => (window.__ticketId = e.target.value)} variant="outlined" margin="normal" size="small" />
                    <TextField fullWidth label="Mensagem" onChange={(e) => (window.__dmMessage = e.target.value)} variant="outlined" margin="normal" size="small" />
                    <Button variant="outlined" color="primary" onClick={async () => {
                        try {
                          await api.post("/instagram/message", { ticketId: window.__ticketId, message: window.__dmMessage });
                          toast.success("Enviada!");
                        } catch(e) { toastError(e); }
                    }}>Enviar Teste</Button>
                  </Section>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={4}>
          <Grid container spacing={3}>
             <Grid item xs={12}>
                <Card className={classes.card}>
                  <Section icon={<LinkIcon style={{ color: "white" }} />} title="Fluxo Rápido: Anúncio Click-to-WhatsApp">
                     <Box py={2}>
                        <Stepper activeStep={flowStep} alternativeLabel style={{ backgroundColor: 'transparent', padding: 0 }}>
                          <Step><StepLabel>Campanha</StepLabel></Step>
                          <Step><StepLabel>AdSet</StepLabel></Step>
                          <Step><StepLabel>Creative</StepLabel></Step>
                          <Step><StepLabel>Publicação</StepLabel></Step>
                        </Stepper>
                     </Box>
                     <Box maxWidth={700} mx="auto" mt={4} p={3} border="1px solid #e5e7eb" borderRadius={8} bgcolor="#f9fafb">
                        <Typography variant="h6" gutterBottom align="center">Configuração Expressa</Typography>
                        <Typography variant="body2" color="textSecondary" align="center" paragraph>
                           Crie toda a estrutura de campanha para WhatsApp em um clique.
                        </Typography>
                        <Grid container spacing={2}>
                           <Grid item xs={12} sm={6}>
                              <TextField
                                 select
                                 fullWidth
                                 label="Selecionar Página"
                                 value={pageId}
                                 onChange={(e) => setPageId(e.target.value)}
                                 variant="outlined"
                                 margin="normal"
                               >
                                 {pagesLoading ? <MenuItem disabled>Carregando...</MenuItem> : 
                                  pagesError ? <MenuItem disabled>Erro ao carregar</MenuItem> :
                                  pages.map((p) => <MenuItem key={p.id} value={p.id}>{p.name} ({p.id})</MenuItem>)
                                 }
                               </TextField>
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <TextField fullWidth label="Número WhatsApp (Ex: 5511999999999)" value={waPhoneE164} onChange={(e) => setWaPhoneE164(e.target.value)} variant="outlined" margin="normal" />
                           </Grid>
                           <Grid item xs={12}>
                              <TextField fullWidth label="Mensagem Inicial (Pre-filled)" value={messageText} onChange={(e) => setMessageText(e.target.value)} variant="outlined" margin="normal" />
                           </Grid>
                        </Grid>
                        
                        <Box mt={4} textAlign="center">
                           <Button
                              variant="contained"
                              color="primary"
                              size="large"
                              disabled={waFlowCreating || !pageId}
                              onClick={async () => {
                                setWaFlowCreating(true);
                                try {
                                  const { data } = await api.post("/marketing/whatsapp-adflow", {
                                    page_id: pageId,
                                    phone_number_e164: waPhoneE164,
                                    message_text: messageText,
                                    targeting: { geo_locations: { countries: ["BR"] } },
                                    daily_budget: dailyBudget || 1000
                                  });
                                  setFlowStep(4);
                                  toast.success("Fluxo criado com sucesso!");
                                } catch (err) { toastError(err); } finally { setWaFlowCreating(false); }
                              }}
                              style={{ paddingLeft: 40, paddingRight: 40 }}
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

        <TabPanel value={tab} index={5}>
          <Grid container spacing={3}>
             <Grid item xs={12}>
                <Card className={classes.card}>
                  <Section icon={<SettingsSuggestIcon style={{ color: "white" }} />} title="Gerenciamento de Status">
                    <Grid container spacing={4}>
                       <Grid item xs={12} md={6}>
                          <Paper elevation={0} style={{ padding: 16, border: "1px solid #e5e7eb" }}>
                            <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                               <CampaignIcon color="primary" /> Campanha
                            </Typography>
                            <TextField fullWidth label="ID da Campanha" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} variant="outlined" size="small" margin="normal" />
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
                          <Paper elevation={0} style={{ padding: 16, border: "1px solid #e5e7eb" }}>
                            <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                               <AutoGraphIcon color="primary" /> Conjunto de Anúncios (AdSet)
                            </Typography>
                            <TextField fullWidth label="ID do AdSet" value={adsetId} onChange={(e) => setAdsetId(e.target.value)} variant="outlined" size="small" margin="normal" />
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

        <TabPanel value={tab} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
               <Card className={classes.card}>
                  <Section icon={<AutoGraphIcon style={{ color: "white" }} />} title="Relatórios de Desempenho">
                      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                         <TextField
                            select
                            variant="outlined"
                            size="small"
                            label="Período"
                            value={datePreset}
                            onChange={(e) => setDatePreset(e.target.value)}
                            style={{ width: 200 }}
                         >
                            <MenuItem value="today">Hoje</MenuItem>
                            <MenuItem value="yesterday">Ontem</MenuItem>
                            <MenuItem value="last_7d">Últimos 7 dias</MenuItem>
                            <MenuItem value="last_30d">Últimos 30 dias</MenuItem>
                         </TextField>
                         <Button variant="outlined" startIcon={<AutoGraphIcon />} onClick={exportInsightsCsv}>Exportar CSV</Button>
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
                               <Paper elevation={0} style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                  <Typography variant="caption" color="textSecondary" style={{ textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{stat.label}</Typography>
                                  <Typography variant="h5" style={{ color: stat.color, fontWeight: 700 }}>{stat.val}</Typography>
                               </Paper>
                             </Grid>
                           ))}
                        </Grid>
                      )}

                      {insightsLoading ? <Box p={4} textAlign="center"><CircularProgress /></Box> :
                       insightsError ? <Box p={2} bgcolor="#fee2e2" borderRadius={4}><Typography color="error">Erro ao carregar insights: {insightsErrorMsg}</Typography></Box> :
                       <div style={{ overflowX: "auto" }}>
                         <Table size="small">
                            <TableHead>
                              <TableRow style={{ backgroundColor: "#f9fafb" }}>
                                 <TableCell>Impressões</TableCell>
                                 <TableCell>Alcance</TableCell>
                                 <TableCell>Cliques</TableCell>
                                 <TableCell>Gasto</TableCell>
                                 <TableCell>CPM</TableCell>
                                 <TableCell>CTR</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                               {insights.map((row, idx) => (
                                 <TableRow key={idx} hover>
                                    <TableCell>{row.impressions}</TableCell>
                                    <TableCell>{row.reach}</TableCell>
                                    <TableCell>{row.clicks}</TableCell>
                                    <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.spend || 0)}</TableCell>
                                    <TableCell>{Number(row.cpm || 0).toFixed(2)}</TableCell>
                                    <TableCell>{Number(row.ctr || 0).toFixed(2)}%</TableCell>
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

        <TabPanel value={tab} index={7}>
           <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={8}>
                 <Card className={classes.card}>
                    <Section icon={<PostAddIcon style={{ color: "white" }} />} title="Publicar Conteúdo">
                       <Typography variant="body2" color="textSecondary" paragraph>
                          Publique ou agende posts para seu Feed do Instagram e Facebook.
                       </Typography>
                       <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                             <TextField select fullWidth label="Plataforma" value={pubPlatform} onChange={(e) => setPubPlatform(e.target.value)} variant="outlined">
                                <MenuItem value="facebook">Facebook</MenuItem>
                                <MenuItem value="instagram">Instagram</MenuItem>
                             </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                             <TextField select fullWidth label="Conta/Página" value={pubAccountId} onChange={(e) => setPubAccountId(e.target.value)} variant="outlined">
                                {pubPlatform === "facebook" ? 
                                   pages.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>) : 
                                   pages.filter(p => p.instagram_business_account).map(p => <MenuItem key={p.instagram_business_account.id} value={p.instagram_business_account.id}>{p.instagram_business_account.username || p.name}</MenuItem>)
                                }
                             </TextField>
                          </Grid>
                          <Grid item xs={12}>
                             <TextField fullWidth multiline minRows={4} label="Legenda / Texto" value={pubMessage} onChange={(e) => setPubMessage(e.target.value)} variant="outlined" placeholder="Escreva algo interessante..." />
                          </Grid>
                          <Grid item xs={12}>
                             <TextField fullWidth label="URL da Imagem" value={pubImageUrl} onChange={(e) => setPubImageUrl(e.target.value)} variant="outlined" helperText="Link público direto da imagem (obrigatório para Instagram)" placeholder="https://..." />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                             <TextField fullWidth type="datetime-local" label="Agendar para (Opcional)" InputLabelProps={{ shrink: true }} value={pubScheduledTime} onChange={(e) => setPubScheduledTime(e.target.value)} variant="outlined" />
                          </Grid>
                          <Grid item xs={12}>
                             <Button fullWidth variant="contained" color="primary" size="large" onClick={handlePublish} disabled={pubLoading}>
                                {pubLoading ? "Processando..." : (pubScheduledTime ? "Agendar Publicação" : "Publicar Agora")}
                             </Button>
                          </Grid>
                       </Grid>
                    </Section>
                 </Card>
              </Grid>
           </Grid>
        </TabPanel>

        <TabPanel value={tab} index={8}>
           <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={10}>
                 <Paper elevation={0} style={{ padding: 24, marginBottom: 24, borderRadius: 16, backgroundColor: "white", border: "1px solid #e5e7eb" }}>
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                       <Box flexGrow={1}>
                          <Typography variant="h6" gutterBottom>Feed do Facebook/Instagram</Typography>
                          <Typography variant="body2" color="textSecondary">Selecione uma página para visualizar e interagir com as postagens recentes.</Typography>
                       </Box>
                       <Box display="flex" gap={2} alignItems="center">
                          <TextField 
                            select 
                            label="Página Conectada" 
                            value={feedPageId} 
                            onChange={(e) => setFeedPageId(e.target.value)} 
                            variant="outlined" 
                            size="small" 
                            style={{ minWidth: 250 }}
                          >
                             {pages.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                          </TextField>
                          <Button 
                            variant="contained" 
                            color="primary" 
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
                                      <Skeleton variant="circle" width={40} height={40} />
                                      <Box ml={2} width="100%">
                                         <Skeleton variant="text" width="60%" />
                                         <Skeleton variant="text" width="40%" />
                                      </Box>
                                   </Box>
                                   <Skeleton variant="rect" height={200} style={{ borderRadius: 8 }} />
                                   <Box mt={2}>
                                      <Skeleton variant="text" />
                                      <Skeleton variant="text" />
                                   </Box>
                                </CardContent>
                             </Card>
                          </Grid>
                       ))}
                    </Grid>
                 ) : feed.length === 0 && feedPageId ? (
                    <Box textAlign="center" py={8} bgcolor="#f9fafb" borderRadius={16} border="1px dashed #d1d5db">
                       <DynamicFeedIcon style={{ fontSize: 64, color: "#9ca3af", marginBottom: 16 }} />
                       <Typography variant="h6" color="textSecondary">Nenhuma publicação encontrada</Typography>
                       <Typography variant="body2" color="textSecondary">Tente selecionar outra página ou verifique se há postagens recentes.</Typography>
                    </Box>
                 ) : (
                    <Grid container spacing={3}>
                       {feed.map((post) => (
                         <Grid item xs={12} md={6} lg={6} key={post.id}>
                            <Card className={classes.card} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                               <Box p={2} display="flex" alignItems="center" borderBottom="1px solid #f3f4f6">
                                  <Avatar src={post.from?.picture?.data?.url} style={{ border: "2px solid #3b82f6" }}>{post.from?.name?.[0]}</Avatar>
                                  <Box ml={2}>
                                     <Typography variant="subtitle2" style={{ fontWeight: 700 }}>{post.from?.name}</Typography>
                                     <Typography variant="caption" color="textSecondary" style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
                                      backgroundColor: "#f3f4f6"
                                    }} 
                                  />
                               )}
                               <CardContent style={{ flexGrow: 1, paddingTop: 16, paddingBottom: 8 }}>
                                  <Typography variant="body2" color="textPrimary" style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", lineHeight: 1.5 }}>{post.message}</Typography>
                               </CardContent>
                               <Divider />
                               <Box p={1} display="flex" justifyContent="space-between" alignItems="center">
                                  <Box display="flex" gap={1}>
                                     <Button 
                                       startIcon={<ThumbUpIcon />} 
                                       size="small" 
                                       onClick={() => handleLike(post.id)}
                                       style={{ color: "#4b5563" }}
                                     >
                                        Curtir ({post.likes?.summary?.total_count || 0})
                                     </Button>
                                     <Button 
                                       startIcon={<ChatBubbleOutlineIcon />} 
                                       size="small" 
                                       onClick={() => toggleComments(post.id)}
                                       style={{ color: "#4b5563" }}
                                     >
                                        Comentar ({post.comments?.summary?.total_count || 0})
                                     </Button>
                                  </Box>
                                  <IconButton size="small" onClick={() => window.open(post.permalink_url, "_blank")}>
                                     <LinkIcon fontSize="small" />
                                  </IconButton>
                               </Box>
                               
                               <Collapse in={expandedComments[post.id]} timeout="auto" unmountOnExit>
                                   <Box p={2} bgcolor="#f9fafb" borderTop="1px solid #e5e7eb">
                                      <Box style={{ maxHeight: 300, overflowY: "auto", marginBottom: 16, paddingRight: 8 }}>
                                         {post.comments?.data?.length > 0 ? (
                                           post.comments.data.map((c) => (
                                             <Box key={c.id} mb={2} display="flex" alignItems="flex-start">
                                                <Avatar style={{ width: 32, height: 32, marginRight: 12, fontSize: 14 }}>{c.from?.name?.[0]}</Avatar>
                                                <Box bgcolor="white" p={2} borderRadius="0 12px 12px 12px" border="1px solid #e5e7eb" flexGrow={1} boxShadow="0 1px 2px rgba(0,0,0,0.05)">
                                                   <Typography variant="subtitle2" style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#111827" }}>{c.from?.name}</Typography>
                                                   <Typography variant="body2" style={{ fontSize: "0.9rem", color: "#374151" }}>{c.message}</Typography>
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
                                           id={`comment-${post.id}`} 
                                           InputProps={{ 
                                              style: { backgroundColor: "white", borderRadius: 20 },
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
      </Container>
    </div>
  );
};

export default Marketing;
