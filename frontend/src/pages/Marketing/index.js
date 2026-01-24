import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Tabs, Tab, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12
  }
}));

const Marketing = () => {
  const classes = useStyles();
  const [name, setName] = useState("Campanha WhatsApp");
  const [objective, setObjective] = useState("MESSAGES");
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState(false);
  const [insights, setInsights] = useState([]);
  const [insightsError, setInsightsError] = useState(false);
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
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get("/marketing/status");
        setStatus(data);
      } catch (err) {
        toastError(err);
        setStatusError(true);
      }
    };
    const fetchInsights = async () => {
      try {
        const { data } = await api.get("/marketing/insights");
        setInsights(data.data || []);
      } catch (err) {
        toastError(err);
        setInsightsError(true);
      }
    };
    fetchStatus();
    fetchInsights();
    const fetchPages = async () => {
      try {
        const { data } = await api.get("/marketing/pages");
        setPages(data?.data || []);
      } catch (err) {
        toastError(err);
        setPagesError(true);
      }
    };
    fetchPages();
  }, []);

  const handleCreateCampaign = async () => {
    setCreating(true);
    try {
      const { data } = await api.post("/marketing/campaign", {
        name,
        objective,
        status: "PAUSED",
        special_ad_categories: []
      });
      alert(`Campanha criada: ${data.id}`);
      setCampaignId(data.id);
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
      alert(`AdSet criado: ${data.id}`);
      setAdsetId(data.id);
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
      alert(`Creative criado: ${data.id}`);
      setCreativeId(data.id);
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
      alert(`Ad criado: ${data.id}`);
    } catch (err) {
      toastError(err);
    } finally {
      setAdCreating(false);
    }
  };

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Box mb={4}>
        <Typography variant="h3">Marketing</Typography>
        <Typography variant="body1" style={{ color: "#6b7280" }}>
          Conecte sua conta Meta, crie campanhas e acompanhe resultados
        </Typography>
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
          </Tabs>
        </Box>
      </Box>

      <Grid container spacing={3} hidden={tab !== 0}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Status</Typography>
              {!statusError ? (
                <>
                  <Typography variant="body2">
                    {status ? `Conectado: ${status?.me?.name} (${status?.me?.id})` : "Carregando..."}
                  </Typography>
                  <Typography variant="body2">
                    {status ? `Ad Account: ${status?.adAccountId || "-"}` : ""}
                  </Typography>
                  <Typography variant="body2">
                    {status ? `Business: ${status?.businessId || "-"}` : ""}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2" style={{ color: "#ef4444" }}>
                    Não autorizado ou configuração ausente.
                  </Typography>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 5}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Status Campanha/AdSet</Typography>
              <TextField fullWidth label="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} style={{ marginTop: 12 }} />
              <Box mt={2} display="flex">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    try {
                      await api.post("/marketing/campaign/status", { campaign_id: campaignId, status: "ACTIVE" });
                      alert("Campanha ativada");
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
                        alert("Campanha pausada");
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
                      alert("AdSet ativado");
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
                        alert("AdSet pausado");
                      } catch (err) {
                        toastError(err);
                      }
                    }}
                  >
                    Pausar AdSet
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 3}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Imagem para Creative</Typography>
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
                    alert(`Image hash: ${hash}`);
                  } catch (err) {
                    toastError(err);
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Enviar DM por Ticket</Typography>
              <TextField fullWidth label="Ticket ID" onChange={(e) => (window.__ticketId = e.target.value)} style={{ marginTop: 12 }} />
              <TextField fullWidth label="Mensagem" onChange={(e) => (window.__dmMessage = e.target.value)} style={{ marginTop: 12 }} />
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    try {
                      await api.post("/instagram/message", { ticketId: window.__ticketId, message: window.__dmMessage });
                      alert("Mensagem enviada");
                    } catch (err) {
                      toastError(err);
                    }
                  }}
                >
                  Enviar DM
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 1}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Criar Campanha</Typography>
              <TextField fullWidth label="Nome" value={name} onChange={(e) => setName(e.target.value)} style={{ marginTop: 12, marginBottom: 12 }} />
              <TextField fullWidth label="Objetivo" value={objective} onChange={(e) => setObjective(e.target.value)} />
              <Box mt={2}>
                <Button variant="contained" color="primary" disabled={creating} onClick={handleCreateCampaign}>
                  {creating ? "Criando..." : "Criar campanha PAUSED"}
                </Button>
              </Box>
              <Box mt={2}>
                <TextField fullWidth label="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 2}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Criar AdSet</Typography>
              <TextField fullWidth label="Nome do AdSet" value={adsetName} onChange={(e) => setAdsetName(e.target.value)} style={{ marginTop: 12, marginBottom: 12 }} />
              <TextField fullWidth label="Daily Budget (centavos)" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} />
              <TextField fullWidth label="Start Time (ISO)" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ marginTop: 12 }} />
              <TextField fullWidth label="End Time (ISO)" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ marginTop: 12 }} />
              <Box mt={2}>
                <Button variant="contained" color="primary" disabled={adsetCreating} onClick={handleCreateAdSet}>
                  {adsetCreating ? "Criando..." : "Criar AdSet PAUSED"}
                </Button>
              </Box>
              <Box mt={2}>
                <TextField fullWidth label="AdSet ID" value={adsetId} onChange={(e) => setAdsetId(e.target.value)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 3}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Criar Creative (Link)</Typography>
              <TextField fullWidth label="Page ID" value={pageId} onChange={(e) => setPageId(e.target.value)} style={{ marginTop: 12, marginBottom: 12 }} />
              <TextField fullWidth label="Link" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
              <TextField fullWidth label="Image Hash" value={imageHash} onChange={(e) => setImageHash(e.target.value)} style={{ marginTop: 12 }} />
              <TextField fullWidth label="Mensagem" value={messageText} onChange={(e) => setMessageText(e.target.value)} style={{ marginTop: 12 }} />
              <Box mt={2}>
                <Button variant="contained" color="primary" disabled={creativeCreating} onClick={handleCreateCreative}>
                  {creativeCreating ? "Criando..." : "Criar Creative"}
                </Button>
              </Box>
              <Box mt={2}>
                <TextField fullWidth label="Creative ID" value={creativeId} onChange={(e) => setCreativeId(e.target.value)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Criar Ad</Typography>
              <TextField fullWidth label="Nome do Ad" value={adName} onChange={(e) => setAdName(e.target.value)} style={{ marginTop: 12, marginBottom: 12 }} />
              <TextField fullWidth label="AdSet ID" value={adsetId} onChange={(e) => setAdsetId(e.target.value)} />
              <TextField fullWidth label="Creative ID" value={creativeId} onChange={(e) => setCreativeId(e.target.value)} style={{ marginTop: 12 }} />
              <Box mt={2}>
                <Button variant="contained" color="primary" disabled={adCreating} onClick={handleCreateAd}>
                  {adCreating ? "Criando..." : "Criar Ad PAUSED"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 4}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Fluxo WhatsApp (Campanha+AdSet+Creative+Ad)</Typography>
              <Typography variant="body2" style={{ color: "#6b7280", marginBottom: 12 }}>
                Use Page ID e o número em E.164 sem símbolos (ex.: 5511912499850). Image Hash é opcional.
              </Typography>
              <TextField fullWidth label="Page ID" value={pageId} onChange={(e) => setPageId(e.target.value)} style={{ marginTop: 12 }} />
              <TextField
                select
                fullWidth
                label="Selecionar Página"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                style={{ marginTop: 12 }}
              >
                {pages.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name} ({p.id})</MenuItem>
                ))}
              </TextField>
              <TextField fullWidth label="Número E.164 (ex.: 5511912499850)" value={waPhoneE164} onChange={(e) => setWaPhoneE164(e.target.value)} style={{ marginTop: 12 }} />
              <TextField fullWidth label="Image Hash (opcional)" value={imageHash} onChange={(e) => setImageHash(e.target.value)} style={{ marginTop: 12 }} />
              <TextField fullWidth label="Mensagem" value={messageText} onChange={(e) => setMessageText(e.target.value)} style={{ marginTop: 12 }} />
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={waFlowCreating}
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
                      alert(`Fluxo criado: Campaign ${data.campaign_id}, AdSet ${data.adset_id}, Creative ${data.creative_id}, Ad ${data.ad_id}`);
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} hidden={tab !== 6}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Insights (últimos 7 dias)</Typography>
              {!insightsError ? (
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
              ) : (
                <>
                  <Typography variant="body2" style={{ color: "#ef4444" }}>
                    Não autorizado ou configuração ausente. Conecte em Conexões e tente novamente.
                  </Typography>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Marketing;
