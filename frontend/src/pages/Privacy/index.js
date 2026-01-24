import React from "react";
import { Container, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  }
}));

const Privacy = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="md" className={classes.root}>
      <Box mb={4}>
        <Typography variant="h3">Política de Privacidade</Typography>
      </Box>
      <Typography variant="body2" paragraph>
        Respeitamos sua privacidade. Coletamos dados mínimos necessários para operar o serviço,
        como informações de conta, conexões de WhatsApp e métricas de uso. Os dados são usados
        para autenticação, atendimento, melhoria do produto e suporte.
      </Typography>
      <Typography variant="body2" paragraph>
        Não vendemos seus dados. Compartilhamento ocorre apenas com provedores essenciais
        (ex.: hospedagem, IA, pagamentos) sob contratos e boas práticas de segurança.
      </Typography>
      <Typography variant="body2" paragraph>
        Você pode solicitar acesso, correção e exclusão dos seus dados. Contato: contato@aipensa.com.
      </Typography>
      <Typography variant="body2" paragraph>
        Esta política atende os requisitos para integração com provedores de login (Google) e LGPD.
      </Typography>
    </Container>
  );
};

export default Privacy;
