import React from "react";
import { Container, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  }
}));

const Terms = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="md" className={classes.root}>
      <Box mb={4}>
        <Typography variant="h3">Termos de Uso</Typography>
      </Box>
      <Typography variant="body2" paragraph>
        Ao usar a plataforma, você concorda em: manter suas credenciais seguras, não abusar dos recursos
        (envios indevidos, SPAM), respeitar legislações aplicáveis e privacidade de terceiros.
      </Typography>
      <Typography variant="body2" paragraph>
        O serviço é prestado “como está”, podendo sofrer atualizações. Planos com limites de uso,
        recursos e suporte conforme contratação vigente.
      </Typography>
      <Typography variant="body2" paragraph>
        Em caso de dúvidas, entre em contato via contato@aipensa.com.
      </Typography>
    </Container>
  );
};

export default Terms;
