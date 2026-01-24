import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody } from "@material-ui/core";
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
  const [insights, setInsights] = useState([]);
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

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get("/marketing/status");
        setStatus(data);
      } catch (err) {
        toastError(err);
      }
    };
    const fetchInsights = async () => {
      try {
        const { data } = await api.get("/marketing/insights");
        setInsights(data.data || []);
      } catch (err) {
        toastError(err);
      }
    };
    fetchStatus();
    fetchInsights();
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
        <Typography variant="h3">Marketing (Meta)</Typography>
        <Typography variant="body1" style={{ color: "#6b7280" }}>
          Criar campanha e visualizar insights da conta
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Status</Typography>
              <Typography variant="body2">
                {status ? `Conectado: ${status?.me?.name} (${status?.me?.id})` : "Carregando..."}
              </Typography>
              <Typography variant="body2">
                {status ? `Ad Account: ${status?.adAccountId || "-"}` : ""}
              </Typography>
              <Typography variant="body2">
                {status ? `Business: ${status?.businessId || "-"}` : ""}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
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
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Insights (últimos 7 dias)</Typography>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Marketing;
