import React from "react";
import { Container, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  }
}));

const LGPD = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="md" className={classes.root}>
      <Box mb={4}>
        <Typography variant="h3">LGPD</Typography>
      </Box>
      <Typography variant="body2" paragraph>
        A plataforma está alinhada à Lei Geral de Proteção de Dados (LGPD). Tratamos dados pessoais
        com base legal adequada, minimização, segurança e transparência.
      </Typography>
      <Typography variant="body2" paragraph>
        Direitos do titular: acesso, correção, exclusão e portabilidade. Solicitações podem ser feitas
        pelo e-mail contato@aipensa.com.
      </Typography>
      <Typography variant="body2" paragraph>
        Implementamos controles técnicos e organizacionais para proteção dos dados, incluindo criptografia,
        autenticação, logging e segregação por empresa.
      </Typography>
    </Container>
  );
};

export default LGPD;
