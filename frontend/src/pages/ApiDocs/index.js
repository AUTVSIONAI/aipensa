import React from "react";
import { Container, Typography, Box, Card, CardContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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

const ApiDocs = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="md" className={classes.root}>
      <Box mb={4} textAlign="center">
        <Typography variant="h3">API Docs</Typography>
        <Typography variant="body1" style={{ color: "#6b7280" }}>
          Endpoints REST para integrações com sua operação
        </Typography>
      </Box>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6">Autenticação</Typography>
          <Typography variant="body2">POST /auth/login</Typography>
          <Typography variant="body2">POST /auth/refresh_token</Typography>
          <Box mt={2} />
          <Typography variant="h6">Mensagens</Typography>
          <Typography variant="body2">POST /api/messages/send</Typography>
          <Typography variant="body2">GET /api/messages/history</Typography>
          <Box mt={2} />
          <Typography variant="h6">Contatos</Typography>
          <Typography variant="body2">POST /api/contacts</Typography>
          <Typography variant="body2">GET /api/contacts</Typography>
          <Box mt={2} />
          <Typography variant="body2" style={{ color: "#6b7280" }}>
            Para documentação completa, acesse o painel e consulte a seção “Documentação”.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ApiDocs;
