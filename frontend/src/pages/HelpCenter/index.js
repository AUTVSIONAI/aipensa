import React from "react";
import { Container, Typography, Box, Grid, Card, CardContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(2)
  },
  sectionSubtitle: {
    color: "#6b7280",
    marginBottom: theme.spacing(4)
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12
  }
}));

const HelpCenter = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.root}>
      <Box mb={6} textAlign="center">
        <Typography variant="h3" className={classes.sectionTitle}>
          Central de Ajuda
        </Typography>
        <Typography variant="body1" className={classes.sectionSubtitle}>
          Tutoriais e respostas rápidas para começar e escalar seu atendimento
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Conectar WhatsApp</Typography>
              <Typography variant="body2">
                Vá em Conexões, gere o QR Code e leia com seu WhatsApp. Em minutos você estará atendendo centralizado.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Ativar Agente de IA</Typography>
              <Typography variant="body2">
                No menu Prompts, crie o agente com sua chave (OpenRouter/OpenAI) e vincule ao WhatsApp nas configurações.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Campanhas e Agendamento</Typography>
              <Typography variant="body2">
                Use Campanhas para disparos em massa e Schedules para agendar mensagens individuais ou em fluxos.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6">Integrações</Typography>
              <Typography variant="body2">
                Ative integrações oficiais via Queue Integration ou use Webhooks para conectar sistemas externos.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HelpCenter;
