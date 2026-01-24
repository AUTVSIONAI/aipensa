import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Tabs, Tab, Divider, Chip, Stepper, Step, StepLabel, CircularProgress, Avatar, Tooltip, InputAdornment } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import CampaignIcon from "@mui/icons-material/Campaign";
import PublicIcon from "@mui/icons-material/Public";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import WidgetsIcon from "@mui/icons-material/Widgets";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import LinkIcon from "@mui/icons-material/Link";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    padding: theme.spacing(2)
  }
}));

const Marketing = () => {
  const classes = useStyles();
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
  const [tab, setTab] = useState(0);
  const [flowStep, setFlowStep] = useState(0);
  const [lastActionSummary, setLastActionSummary] = useState("");
  const Section = ({ icon, title, children }) => (
    <Box mb={2}>
      <Box display="flex" alignItems="center" gridGap={8} mb={1}>
        <Avatar style={{ width: 28, height: 28, backgroundColor: "#1f2937" }}>{icon}</Avatar>
        <Typography variant="subtitle1">{title}</Typography>
      </Box>
      <Divider style={{ marginBottom: 12 }} />
      {children}
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
        toastError(err);
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
        toastError(err);
        setPagesError(true);
        setPagesErrorMsg(String(err?.response?.data?.error || err?.message || "Erro ao obter páginas"));
      } finally {
        setPagesLoading(false);
      }
    };
    fetchPages();
  }, []);

  useEffect(() => {
    const refetchInsights = async () => {
      try {
        setInsightsLoading(true);
        const { data } = await api.get("/marketing/insights", { params: { date_preset: datePreset } });
        setInsights(data.data || []);
      } catch (err) {
        toastError(err);
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

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Box mb={4}>
        <Typography variant="h3">Marketing</Typography>
        <Typography variant="body1" style={{ color: "#6b7280" }}>
          Conecte sua conta Meta, crie campanhas e acompanhe resultados
        </Typography>
        <Box mt={2} display="flex" gap={8}>
          <Chip label={status?.adAccountId ? "Ad Account conectado" : "Ad Account não conectado"} color={status?.adAccountId ? "primary" : "default"} />
          <Chip label={status?.businessId ? "Business conectado" : "Business não conectado"} color={status?.businessId ? "primary" : "default"} />
          <Chip label={`Objetivo: ${objective}`} />
        </Box>
        <Box mt={2}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Visão Geral" />
            <Tab label="Criador de Campanha" />
            <Tab label="AdSet" />
            <Tab label="Creative & Ad" />
            <Tab label="Fluxo WhatsApp" />
            <Tab label="Controles" />
            <Tab label="Insights" />
            <Tab label="Postagens" />
          </Tabs>
        </Box>
      </Box>

      <Grid container spacing={3} hidden={tab !== 0}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<PublicIcon style={{ color: "white" }} />} title="Status da Conta">
              {!statusError ? (
                <>
                  {statusLoading ? (
                    <Box display="flex" alignItems="center" gap={8}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Carregando status...</Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2">
                        {status ? `Conectado: ${status?.me?.name} (${status?.me?.id})` : "-"}
                      </Typography>
                      <Typography variant="body2">
                        {status ? `Ad Account: ${status?.adAccountId || "-"}` : "-"}
                      </Typography>
                      <Typography variant="body2">
                        {status ? `Business: ${status?.businessId || "-"}` : "-"}
                      </Typography>
                      {status?.adAccountId && (
                        <Box mt={2}>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              const act = status?.adAccountId;
                              const url = `https://www.facebook.com/adsmanager/manage?act=act_${act}`;
                              window.open(url, "_blank");
                            }}
                          >
                            Abrir Ads Manager
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <Typography variant="body2" style={{ color: "#ef4444" }}>
                    Não autorizado ou configuração ausente.
                  </Typography>
                  {statusErrorMsg && <Chip label={statusErrorMsg} color="secondary" style={{ marginTop: 8 }} />}
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => (window.location.href = "/connections")}
                    >
                      Conectar Facebook/Instagram
                    </Button>
                  </Box>
                </>
              )}
              </Section>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<SettingsSuggestIcon style={{ color: "white" }} />} title="Última Ação">
                <Typography variant="body2">{lastActionSummary || "-"}</Typography>
              </Section>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 5}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<SettingsSuggestIcon style={{ color: "white" }} />} title="Controles de Status">
              <TextField fullWidth label="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} style={{ marginTop: 12 }} />
              <Box mt={2} display="flex">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    try {
                      await api.post("/marketing/campaign/status", { campaign_id: campaignId, status: "ACTIVE" });
                      toast.success("Campanha ativada");
                      setLastActionSummary(`Campanha ativada: ${campaignId}`);
                    } catch (err) {
                      toastError(err);
                    }
                  }}
                >
                  Ativar Campanha
                </Button>
                <Box ml={2}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={async () => {
                      try {
                        await api.post("/marketing/campaign/status", { campaign_id: campaignId, status: "PAUSED" });
                        toast.success("Campanha pausada");
                        setLastActionSummary(`Campanha pausada: ${campaignId}`);
                      } catch (err) {
                        toastError(err);
                      }
                    }}
                  >
                    Pausar Campanha
                  </Button>
                </Box>
              </Box>
              <TextField fullWidth label="AdSet ID" value={adsetId} onChange={(e) => setAdsetId(e.target.value)} style={{ marginTop: 12 }} />
              <Box mt={2} display="flex">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    try {
                      await api.post("/marketing/adset/status", { adset_id: adsetId, status: "ACTIVE" });
                      toast.success("AdSet ativado");
                      setLastActionSummary(`AdSet ativado: ${adsetId}`);
                    } catch (err) {
                      toastError(err);
                    }
                  }}
                >
                  Ativar AdSet
                </Button>
                <Box ml={2}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={async () => {
                      try {
                        await api.post("/marketing/adset/status", { adset_id: adsetId, status: "PAUSED" });
                        toast.success("AdSet pausado");
                        setLastActionSummary(`AdSet pausado: ${adsetId}`);
                      } catch (err) {
                        toastError(err);
                      }
                    }}
                  >
                    Pausar AdSet
                  </Button>
                </Box>
              </Box>
              {status?.adAccountId && (
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      const act = status?.adAccountId;
                      const url = `https://www.facebook.com/adsmanager/manage?act=act_${act}`;
                      window.open(url, "_blank");
                    }}
                  >
                    Abrir Ads Manager
                  </Button>
                </Box>
              )}
              </Section>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 3}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<WidgetsIcon style={{ color: "white" }} />} title="Imagem para Creative">
                <Typography variant="body2" style={{ color: "#6b7280", marginBottom: 12 }}>
                  Faça upload para gerar image_hash e use no campo acima.
                </Typography>
              <input
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
              </Section>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<WidgetsIcon style={{ color: "white" }} />} title="Enviar DM por Ticket">
              <TextField fullWidth label="Ticket ID" onChange={(e) => (window.__ticketId = e.target.value)} style={{ marginTop: 12 }} />
              <TextField fullWidth label="Mensagem" onChange={(e) => (window.__dmMessage = e.target.value)} style={{ marginTop: 12 }} />
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    try {
                      await api.post("/instagram/message", { ticketId: window.__ticketId, message: window.__dmMessage });
                      toast.success("Mensagem enviada");
                      setLastActionSummary("DM enviada");
                    } catch (err) {
                      toastError(err);
                    }
                  }}
                >
                  Enviar DM
                </Button>
              </Box>
              </Section>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 1}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<CampaignIcon style={{ color: "white" }} />} title="Criar Campanha">
                <TextField fullWidth label="Nome da Campanha" value={name} onChange={(e) => setName(e.target.value)} style={{ marginTop: 12, marginBottom: 12 }} />
                <TextField fullWidth label="Objetivo (MESSAGES)" value={objective} onChange={(e) => setObjective(e.target.value)} helperText="Use 'MESSAGES' para campanhas de mensagens." InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="Objetivo de mensagens para WhatsApp"><InfoOutlinedIcon fontSize="small" /></Tooltip></InputAdornment> }} />
              <Box mt={2}>
                <Button variant="contained" color="primary" disabled={creating} onClick={handleCreateCampaign}>
                  {creating ? "Criando..." : "Criar campanha PAUSED"}
                </Button>
              </Box>
              <Box mt={2}>
                <TextField fullWidth label="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
              </Box>
              </Section>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 2}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<AutoGraphIcon style={{ color: "white" }} />} title="Criar AdSet">
                <TextField fullWidth label="Nome do AdSet" value={adsetName} onChange={(e) => setAdsetName(e.target.value)} style={{ marginTop: 12, marginBottom: 12 }} />
                <TextField fullWidth label="Daily Budget (centavos)" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} error={!!dailyBudget && !/^\d+$/.test(dailyBudget)} helperText={/^\d+$/.test(dailyBudget) ? "Ex.: 1000 = R$10,00" : "Informe apenas números em centavos"} InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="Valor em centavos"><InfoOutlinedIcon fontSize="small" /></Tooltip></InputAdornment> }} />
                <TextField fullWidth label="Start Time (ISO)" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ marginTop: 12 }} helperText="Opcional. Ex.: 2026-01-25T00:00:00Z" InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="Data e hora em ISO 8601"><InfoOutlinedIcon fontSize="small" /></Tooltip></InputAdornment> }} />
                <TextField fullWidth label="End Time (ISO)" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ marginTop: 12 }} helperText="Opcional. Ex.: 2026-02-01T00:00:00Z" InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="Data e hora em ISO 8601"><InfoOutlinedIcon fontSize="small" /></Tooltip></InputAdornment> }} />
              <Box mt={2}>
                <Button variant="contained" color="primary" disabled={adsetCreating || !campaignId || !/^\d+$/.test(dailyBudget)} onClick={handleCreateAdSet}>
                  {adsetCreating ? "Criando..." : "Criar AdSet PAUSED"}
                </Button>
              </Box>
              <Box mt={2}>
                <TextField fullWidth label="AdSet ID" value={adsetId} onChange={(e) => setAdsetId(e.target.value)} />
              </Box>
              </Section>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 3}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<WidgetsIcon style={{ color: "white" }} />} title="Criar Creative (Link)">
                <TextField fullWidth label="Page ID" value={pageId} onChange={(e) => setPageId(e.target.value)} style={{ marginTop: 12, marginBottom: 12 }} helperText="Selecione a Página conectada em Conexões ou informe o ID manualmente." InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="ID da Página do Facebook"><InfoOutlinedIcon fontSize="small" /></Tooltip></InputAdornment> }} />
                <TextField fullWidth label="Link" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} helperText="Use um link válido. Para WhatsApp: https://wa.me/5511912499850" InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="URL de destino do anúncio"><InfoOutlinedIcon fontSize="small" /></Tooltip></InputAdornment> }} />
                <TextField fullWidth label="Image Hash" value={imageHash} onChange={(e) => setImageHash(e.target.value)} style={{ marginTop: 12 }} helperText="Gere em 'Imagem para Creative' (upload)." InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="Hash da imagem enviada"><InfoOutlinedIcon fontSize="small" /></Tooltip></InputAdornment> }} />
                <TextField fullWidth label="Mensagem" value={messageText} onChange={(e) => setMessageText(e.target.value)} style={{ marginTop: 12 }} helperText="Texto exibido no anúncio (call-to-action)." />
              <Box mt={2}>
                <Button variant="contained" color="primary" disabled={creativeCreating || !pageId} onClick={handleCreateCreative}>
                  {creativeCreating ? "Criando..." : "Criar Creative"}
                </Button>
              </Box>
              <Box mt={2}>
                <TextField fullWidth label="Creative ID" value={creativeId} onChange={(e) => setCreativeId(e.target.value)} />
              </Box>
              </Section>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<CampaignIcon style={{ color: "white" }} />} title="Criar Ad">
                <TextField fullWidth label="Nome do Ad" value={adName} onChange={(e) => setAdName(e.target.value)} style={{ marginTop: 12, marginBottom: 12 }} />
                <TextField fullWidth required label="AdSet ID" value={adsetId} onChange={(e) => setAdsetId(e.target.value)} helperText="Informe o AdSet ID criado acima." />
                <TextField fullWidth required label="Creative ID" value={creativeId} onChange={(e) => setCreativeId(e.target.value)} style={{ marginTop: 12 }} helperText="Informe o Creative ID criado acima." />
              <Box mt={2}>
                <Button variant="contained" color="primary" disabled={adCreating || !adsetId || !creativeId} onClick={handleCreateAd}>
                  {adCreating ? "Criando..." : "Criar Ad PAUSED"}
                </Button>
              </Box>
              </Section>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 4}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<LinkIcon style={{ color: "white" }} />} title="Fluxo WhatsApp (Campanha+AdSet+Creative+Ad)">
              <Box mt={1} mb={2}>
                <Stepper activeStep={flowStep} alternativeLabel>
                  <Step><StepLabel>Campanha</StepLabel></Step>
                  <Step><StepLabel>AdSet</StepLabel></Step>
                  <Step><StepLabel>Creative</StepLabel></Step>
                  <Step><StepLabel>Ad</StepLabel></Step>
                </Stepper>
              </Box>
              <Typography variant="body2" style={{ color: "#6b7280", marginBottom: 12 }}>
                Use Page ID e o número em E.164 sem símbolos (ex.: 5511912499850). Image Hash é opcional.
              </Typography>
              <TextField fullWidth label="Page ID" value={pageId} onChange={(e) => setPageId(e.target.value)} style={{ marginTop: 12 }} helperText="Selecione abaixo para preencher automaticamente." InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="ID da Página do Facebook"><InfoOutlinedIcon fontSize="small" /></Tooltip></InputAdornment> }} />
              <TextField
                select
                fullWidth
                label="Selecionar Página"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                style={{ marginTop: 12 }}
              >
                {pagesLoading ? (
                  <MenuItem disabled value="">
                    <Box display="flex" alignItems="center" gridGap={8}>
                      <Skeleton variant="text" width={120} />
                    </Box>
                  </MenuItem>
                ) : pagesError ? (
                  <MenuItem disabled value="">
                    Erro ao carregar páginas. Verifique a conexão.
                  </MenuItem>
                ) : (
                  pages.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name} ({p.id})</MenuItem>
                  ))
                )}
              </TextField>
              <TextField fullWidth label="Número E.164 (ex.: 5511912499850)" value={waPhoneE164} onChange={(e) => setWaPhoneE164(e.target.value)} style={{ marginTop: 12 }} helperText="Formato internacional sem símbolos." InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="Número internacional sem símbolos"><InfoOutlinedIcon fontSize="small" /></Tooltip></InputAdornment> }} />
              <TextField fullWidth label="Image Hash (opcional)" value={imageHash} onChange={(e) => setImageHash(e.target.value)} style={{ marginTop: 12 }} helperText="Se vazio, será criado um anúncio de link sem imagem." InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="Hash da imagem enviada"><InfoOutlinedIcon fontSize="small" /></Tooltip></InputAdornment> }} />
              <TextField fullWidth label="Mensagem" value={messageText} onChange={(e) => setMessageText(e.target.value)} style={{ marginTop: 12 }} helperText="Texto do anúncio (call-to-action)." />
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={waFlowCreating || !pageId || !/^\d{10,15}$/.test(waPhoneE164)}
                  onClick={async () => {
                    setWaFlowCreating(true);
                    try {
                      const { data } = await api.post("/marketing/whatsapp-adflow", {
                        page_id: pageId,
                        phone_number_e164: waPhoneE164,
                        image_hash: imageHash || undefined,
                        message_text: messageText || "Fale conosco no WhatsApp",
                        targeting: { geo_locations: { countries: ["BR"] } },
                        daily_budget: dailyBudget || 1000
                      });
                      setFlowStep(3);
                      toast.success(`Fluxo criado: Campaign ${data.campaign_id}, AdSet ${data.adset_id}, Creative ${data.creative_id}, Ad ${data.ad_id}`);
                      setLastActionSummary(`Fluxo criado: ${data.campaign_id}/${data.adset_id}/${data.creative_id}/${data.ad_id}`);
                    } catch (err) {
                      toastError(err);
                    } finally {
                      setWaFlowCreating(false);
                    }
                  }}
                >
                  {waFlowCreating ? "Criando..." : "Criar fluxo completo (PAUSED)"}
                </Button>
              </Box>
              </Section>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 6}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<AutoGraphIcon style={{ color: "white" }} />} title="Insights (últimos 7 dias)">
              <Box mb={2} display="flex" gridGap={12}>
                <TextField
                  select
                  label="Período"
                  value={datePreset}
                  onChange={(e) => setDatePreset(e.target.value)}
                  style={{ minWidth: 220 }}
                >
                  {[
                    { v: "today", l: "Hoje" },
                    { v: "yesterday", l: "Ontem" },
                    { v: "last_7d", l: "Últimos 7 dias" },
                    { v: "last_14d", l: "Últimos 14 dias" },
                    { v: "last_30d", l: "Últimos 30 dias" },
                    { v: "this_month", l: "Este mês" },
                    { v: "last_month", l: "Mês passado" }
                  ].map(opt => (
                    <MenuItem key={opt.v} value={opt.v}>{opt.l}</MenuItem>
                  ))}
                </TextField>
                <Button variant="outlined" color="primary" onClick={exportInsightsCsv}>
                  Exportar CSV
                </Button>
              </Box>
              {!insightsError && !insightsLoading && (
                <Grid container spacing={2} style={{ marginBottom: 12 }}>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card className={classes.card}><CardContent><Typography variant="subtitle2">Impressões</Typography><Typography>{agg.impressions}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card className={classes.card}><CardContent><Typography variant="subtitle2">Alcance</Typography><Typography>{agg.reach}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card className={classes.card}><CardContent><Typography variant="subtitle2">Cliques</Typography><Typography>{agg.clicks}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card className={classes.card}><CardContent><Typography variant="subtitle2">Gasto</Typography><Typography>{agg.spend}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card className={classes.card}><CardContent><Typography variant="subtitle2">CPM médio</Typography><Typography>{agg.avgCpm.toFixed(2)}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Card className={classes.card}><CardContent><Typography variant="subtitle2">CTR médio</Typography><Typography>{agg.avgCtr.toFixed(2)}%</Typography></CardContent></Card>
                  </Grid>
                </Grid>
              )}
              {!insightsError ? (
                insightsLoading ? (
                  <Box>
                    <Skeleton variant="rect" height={28} style={{ marginBottom: 8 }} />
                    <Skeleton variant="rect" height={28} style={{ marginBottom: 8 }} />
                    <Skeleton variant="rect" height={28} />
                  </Box>
                ) : (
                  <Table size="small">
                <TableHead>
                  <TableRow>
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
                    <TableRow key={idx}>
                      <TableCell>{row.impressions}</TableCell>
                      <TableCell>{row.reach}</TableCell>
                      <TableCell>{row.clicks}</TableCell>
                      <TableCell>{row.spend}</TableCell>
                      <TableCell>{row.cpm}</TableCell>
                      <TableCell>{row.ctr}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                  </Table>
                )
              ) : (
                <>
                  <Typography variant="body2" style={{ color: "#ef4444" }}>
                    Não autorizado ou configuração ausente. Conecte em Conexões e tente novamente.
                  </Typography>
                  {insightsErrorMsg && <Chip label={insightsErrorMsg} color="secondary" style={{ marginTop: 8 }} />}
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => (window.location.href = "/connections")}
                    >
                      Ir para Conexões
                    </Button>
                  </Box>
                </>
              )}
              </Section>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 7}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Section icon={<CampaignIcon style={{ color: "white" }} />} title="Criar Publicação">
                {pages.length === 0 && !pagesLoading && (
                  <Box mb={2}>
                    <Typography color="error" variant="body2">
                        Nenhuma página/conta encontrada. Certifique-se de conectar suas contas na aba Conexões e conceder permissões (pages_manage_posts, instagram_content_publish).
                    </Typography>
                  </Box>
                )}
                <Box mb={2}>
                  <TextField
                    select
                    label="Plataforma"
                    fullWidth
                    value={pubPlatform}
                    onChange={(e) => setPubPlatform(e.target.value)}
                  >
                    <MenuItem value="facebook">Facebook (Página)</MenuItem>
                    <MenuItem value="instagram">Instagram</MenuItem>
                  </TextField>
                </Box>
                <Box mb={2}>
                  <TextField
                    select
                    label="Conta / Página"
                    fullWidth
                    value={pubAccountId}
                    onChange={(e) => setPubAccountId(e.target.value)}
                  >
                    {pubPlatform === "facebook" ? (
                       pages.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)
                    ) : (
                       pages.filter(p => p.instagram_business_account).map(p => <MenuItem key={p.instagram_business_account.id} value={p.instagram_business_account.id}>{p.instagram_business_account.username || p.name}</MenuItem>)
                    )}
                  </TextField>
                </Box>
                <Box mb={2}>
                  <TextField
                    label="Mensagem / Legenda"
                    fullWidth
                    multiline
                    rows={4}
                    value={pubMessage}
                    onChange={(e) => setPubMessage(e.target.value)}
                  />
                </Box>
                <Box mb={2}>
                  <TextField
                    label="URL da Imagem (Obrigatório para Instagram)"
                    fullWidth
                    value={pubImageUrl}
                    onChange={(e) => setPubImageUrl(e.target.value)}
                    helperText="Cole o link direto da imagem"
                  />
                </Box>
                <Box mb={2}>
                   <TextField
                    label="Agendar para (Opcional)"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={pubScheduledTime}
                    onChange={(e) => setPubScheduledTime(e.target.value)}
                    helperText="Para agendar, selecione uma data entre 10 minutos e 30 dias no futuro."
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePublish}
                  disabled={pubLoading}
                >
                  {pubLoading ? "Enviando..." : (pubScheduledTime ? "Agendar Publicação" : "Publicar Agora")}
                </Button>
              </Section>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Marketing;
