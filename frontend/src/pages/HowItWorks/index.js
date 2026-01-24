import React from "react";
import { Container, Typography, Box, Grid, Card, CardContent, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    height: "100%"
  },
  iconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
    color: "#2563eb"
  }
}));

const HowItWorks = () => {
  const classes = useStyles();
  const history = useHistory();
  return (
    <Container maxWidth="lg" className={classes.root}>
      <Box mb={6} textAlign="center">
        <Typography variant="h3">Como funciona</Typography>
        <Typography variant="body1" style={{ color: "#6b7280" }}>
          Três passos simples para começar
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardContent>
              <div className={classes.iconBox}><QrCodeScannerIcon /></div>
              <Typography variant="h6">Conecte o WhatsApp</Typography>
              <Typography variant="body2">
                Gere o QR Code em Conexões e leia com seu WhatsApp. Em minutos você está atendendo centralizado.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardContent>
              <div className={classes.iconBox}><PsychologyIcon /></div>
              <Typography variant="h6">Ative a IA</Typography>
              <Typography variant="body2">
                No menu Prompts, crie seu agente com a chave de IA e vincule ao WhatsApp para respostas automáticas.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardContent>
              <div className={classes.iconBox}><TrendingUpIcon /></div>
              <Typography variant="h6">Escale as vendas</Typography>
              <Typography variant="body2">
                Use campanhas, agendamentos e fluxos para automatizar o funil e aumentar conversões.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box mt={6} display="flex" justifyContent="center">
        <Button variant="contained" color="primary" onClick={() => history.push("/signup")}>
          Começar Agora
        </Button>
      </Box>
    </Container>
  );
};

export default HowItWorks;
