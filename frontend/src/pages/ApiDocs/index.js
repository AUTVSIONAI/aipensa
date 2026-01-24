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
    borderRadius: 12,
    marginBottom: theme.spacing(3)
  },
  code: {
    backgroundColor: "#111827",
    color: "#f3f4f6",
    borderRadius: 8,
    padding: theme.spacing(2),
    fontFamily: "Roboto Mono, monospace",
    fontSize: "0.85rem",
    overflowX: "auto"
  }
}));

const ApiDocs = () => {
  const classes = useStyles();
  const curlExample = `curl -X POST "$BACKEND_URL/auth/login" \\
-H "Content-Type: application/json" \\
-d '{"email":"admin@aipensa.com","password":"SECRETA"}'`;

  const nodeExample = `import fetch from "node-fetch";

async function sendMessage(token) {
  const res = await fetch(process.env.BACKEND_URL + "/api/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      number: "5511999999999",
      body: "Olá, mundo!"
    })
  });
  console.log(await res.json());
}`;

  const pythonExample = `import requests, os

def send_message(token):
    url = os.getenv("BACKEND_URL") + "/api/messages/send"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    }
    data = {
        "number": "5511999999999",
        "body": "Olá, mundo!"
    }
    r = requests.post(url, json=data, headers=headers)
    print(r.json())`;

  return (
    <Container maxWidth="md" className={classes.root}>
      <Box mb={4} textAlign="center">
        <Typography variant="h3">API Docs</Typography>
        <Typography variant="body1" style={{ color: "#6b7280" }}>
          Endpoints REST e exemplos rápidos
        </Typography>
      </Box>

      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6">Autenticação</Typography>
          <Typography variant="body2">POST /auth/login</Typography>
          <Typography variant="body2">POST /auth/refresh_token</Typography>
        </CardContent>
      </Card>

      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6">Mensagens</Typography>
          <Typography variant="body2">POST /api/messages/send</Typography>
          <Typography variant="body2">GET /api/messages/history</Typography>
        </CardContent>
      </Card>

      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6">Contatos</Typography>
          <Typography variant="body2">POST /api/contacts</Typography>
          <Typography variant="body2">GET /api/contacts</Typography>
        </CardContent>
      </Card>

      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6">Exemplos</Typography>
          <Box mt={2} className={classes.code}><pre>{curlExample}</pre></Box>
          <Box mt={2} className={classes.code}><pre>{nodeExample}</pre></Box>
          <Box mt={2} className={classes.code}><pre>{pythonExample}</pre></Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ApiDocs;
