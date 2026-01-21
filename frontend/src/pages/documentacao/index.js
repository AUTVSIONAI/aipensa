import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { Typography, Grid, Select, MenuItem, FormControl, InputLabel, Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    paddingBottom: 100,
  },
  mainHeader: {
    marginTop: theme.spacing(1),
  },
  elementMargin: {
    padding: theme.spacing(2),
  },
  formContainer: {
    width: "100%",
    margin: theme.spacing(2, 0),
  },
  select: {
    width: "100%",
    maxWidth: 600,
    height: 45,
    border: "2px solid #4caf50",
    borderRadius: "4px",
    "&:hover": {
      borderColor: "#388e3c",
    },
    "&.Mui-focused": {
      borderColor: "#81c784",
    },
    backgroundColor: "#e8f5e9",
    fontSize: "16px",
  },
  inputLabel: {
    color: "#388e3c",
    fontWeight: "bold",
    width: "100%",
  },
  preCode: {
    backgroundColor: "#f4f4f4",
    padding: "10px",
    borderRadius: "5px",
  },
}));

const ApiDocumentation = () => {
  const classes = useStyles();
  const [language, setLanguage] = useState("React");

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const getCodeExample = (endpoint, method, url, body = null) => {
    switch (language) {
      case "React":
        return `fetch('${url}', {
  method: '${method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {token_de_autenticacao}'
  },
  ${body ? `body: JSON.stringify(${JSON.stringify(body, null, 2)})` : ""}
})
  .then(response => response.json())
  .then(data => console.log(data));`;

      case "Javascript":
        return `fetch('${url}', {
  method: '${method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {token_de_autenticacao}'
  },
  ${body ? `body: JSON.stringify(${JSON.stringify(body, null, 2)})` : ""}
})
  .then(response => response.json())
  .then(data => console.log(data));`;

      case "Python":
        return `import requests

url = '${url}'
headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token_de_autenticacao}'
}
${body ? `data = ${JSON.stringify(body, null, 2)}` : ""}
response = requests.${method.toLowerCase()}(${body ? "url, json=data, headers=headers" : "url, headers=headers"})

print(response.json())`;

      case "PHP":
        return `<?php
$url = '${url}';
$headers = [
  'Content-Type: application/json',
  'Authorization: Bearer {token_de_autenticacao}'
];
${body ? `$data = ${JSON.stringify(body, null, 2)};` : ""}

$options = [
  'http' => [
    'method' => '${method}',
    'header' => implode("\\r\\n", $headers),
    ${body ? `'content' => json_encode($data)` : ""}
  ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

echo $response;`;

      case "Vue":
        return `<template>
  <div>
    <button @click="makeRequest">${method} Request</button>
  </div>
</template>

<script>
export default {
  methods: {
    makeRequest() {
      fetch('${url}', {
        method: '${method}',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {token_de_autenticacao}'
        },
        ${body ? `body: JSON.stringify(${JSON.stringify(body, null, 2)})` : ""}
      })
        .then(response => response.json())
        .then(data => console.log(data));
    }
  }
};
</script>`;

      case "Laravel":
        return `<?php
use Illuminate\\Support\\Facades\\Http;

$response = Http::withHeaders([
  'Authorization' => 'Bearer {token_de_autenticacao}'
])->${method.toLowerCase()}('${url}'${body ? ", " + JSON.stringify(body, null, 2) : ""});

dd($response->json());`;

      default:
        return `// Código não disponível para a linguagem selecionada.`;
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/kmenu_postman.json';  // Path to the file you want to download
    link.download = 'kmenu_postman.json';
    link.click();
  };

  return (
    <Paper className={classes.mainPaper} variant="outlined">
      <Typography variant="h5">Documentação da API</Typography>

      <FormControl className={classes.formContainer}>
        <InputLabel id="language-select-label" className={classes.inputLabel}>Selecione a Linguagem</InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          className={classes.select}
        >
          <MenuItem value="React">React</MenuItem>
          <MenuItem value="Javascript">JavaScript</MenuItem>
          <MenuItem value="Python">Python</MenuItem>
          <MenuItem value="PHP">PHP</MenuItem>
          <MenuItem value="Vue">Vue</MenuItem>
          <MenuItem value="Laravel">Laravel</MenuItem>
        </Select>
      </FormControl>


      {/* API Documentation */}
      <Typography variant="h6" className={classes.elementMargin}>
        Exemplo de código na linguagem {language}:
      </Typography>
      <pre className={classes.preCode}>
        {getCodeExample("POST", "https://demo.kmenu.com.br/api/auth/login", {
          username: "usuario",
          password: "senha",
        })}
      </pre>

      {/* 1. Autenticação */}
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        1. Autenticação
      </Typography>
      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            POST /auth/login
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/auth/login
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("POST", "https://demo.kmenu.com.br/api/auth/login", {
              username: "usuario",
              password: "senha",
            })}
          </pre>
        </Typography>
      </Grid>

      {/* 2. Tickets */}
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        2. Tickets
      </Typography>
      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            GET /ticket/list
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/ticket/list
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("GET", "https://demo.kmenu.com.br/api/ticket/list")}
          </pre>
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            POST /ticket/create
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/ticket/create
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("POST", "https://demo.kmenu.com.br/api/ticket/create", {
              title: "Novo ticket de teste",
              description: "Descrição do problema",
              priority: "alta",
            })}
          </pre>
        </Typography>
      </Grid>

      {/* 3. Mensagens */}
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        3. Mensagens
      </Typography>
      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            GET /message/list
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/message/list
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("GET", "https://demo.kmenu.com.br/api/message/list")}
          </pre>
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            POST /message/send
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/message/send
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("POST", "https://demo.kmenu.com.br/api/message/send", {
              recipient: "João",
              message: "Oi, como você está?",
            })}
          </pre>
        </Typography>
      </Grid>

      {/* 4. Contatos */}
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        4. Contatos
      </Typography>
      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            GET /contact/list
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/contact/list
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("GET", "https://demo.kmenu.com.br/api/contact/list")}
          </pre>
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            POST /contact/create
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/contact/create
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("POST", "https://demo.kmenu.com.br/api/contact/create", {
              name: "Joao Roberto",
              phone: "2799671-6613",
            })}
          </pre>
        </Typography>
      </Grid>

      {/* 5. Faturas */}
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        5. Faturas
      </Typography>
      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            GET /invoice/list
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/invoice/list
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("GET", "https://demo.kmenu.com.br/api/invoice/list")}
          </pre>
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            POST /invoice/create
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/invoice/create
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("POST", "https://demo.kmenu.com.br/api/invoice/create", {
              amount: 200.0,
              due_date: "2025-03-10",
              customer_id: 1,
            })}
          </pre>
        </Typography>
      </Grid>

      {/* 6. Webhook */}
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        6. Webhook
      </Typography>
      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            POST /webhook
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/webhook
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("POST", "https://demo.kmenu.com.br/api/webhook", {
              event: "new_ticket",
              data: {
                ticket_id: 1,
                title: "Novo problema",
                status: "aberto",
              },
            })}
          </pre>
        </Typography>
      </Grid>

      {/* 7. Sessões do WhatsApp */}
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        7. Sessões do WhatsApp
      </Typography>
      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            POST /whatsapp/session
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo.kmenu.com.br/api/whatsapp/session
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("POST", "https://demo.kmenu.com.br/api/whatsapp/session", {
              phone_number: "5527996716613",
              session_name: "Sessão WhatsApp 1",
            })}
          </pre>
        </Typography>
      </Grid>

      {/* 8. Agendamentos */}
      <Typography variant="h6" color="primary" className={classes.elementMargin}>
        8. Agendamentos
      </Typography>
      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            GET /schedules
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo5.kmenu.com.br/schedules
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("GET", "https://demo5.kmenu.com.br/schedules")}
          </pre>
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            POST /schedules
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo5.kmenu.com.br/schedules
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("POST", "https://demo5.kmenu.com.br/schedules", {
              title: "Reunião de Equipe",
              description: "Reunião para discussão de metas",
              date: "2025-02-28T14:00:00",
              location: "Sala 1",
            })}
          </pre>
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            PUT /schedules/:scheduleId
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo5.kmenu.com.br/schedules/1
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("PUT", "https://demo5.kmenu.com.br/schedules/1", {
              title: "Reunião de Equipe Atualizada",
              description: "Reunião para revisão de progresso",
              date: "2025-02-28T16:00:00",
              location: "Sala 2",
            })}
          </pre>
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            GET /schedules/:scheduleId
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo5.kmenu.com.br/schedules/1
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("GET", "https://demo5.kmenu.com.br/schedules/1")}
          </pre>
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            DELETE /schedules/:scheduleId
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo5.kmenu.com.br/schedules/1
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("DELETE", "https://demo5.kmenu.com.br/schedules/1")}
          </pre>
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            POST /schedules/:id/media-upload
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo5.kmenu.com.br/schedules/1/media-upload
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("POST", "https://demo5.kmenu.com.br/schedules/1/media-upload")}
          </pre>
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" component="span" style={{ fontWeight: "bold" }}>
            DELETE /schedules/:id/media-upload
          </Typography>
          <br />
          <span style={{ color: "green" }}>
            URL: https://demo5.kmenu.com.br/schedules/1/media-upload
          </span>
          <br />
          <pre className={classes.preCode}>
            {getCodeExample("DELETE", "https://demo5.kmenu.com.br/schedules/1/media-upload")}
          </pre>
        </Typography>
      </Grid>
    </Paper>
  );
};

export default ApiDocumentation;