import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Card, CardContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";

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

const Status = () => {
  const classes = useStyles();
  const [version, setVersion] = useState("-");
  const [backend, setBackend] = useState("Indisponível");
  const [socket, setSocket] = useState("Indisponível");

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const { data } = await api.get("/version");
        setVersion(data?.version || "-");
        setBackend("OK");
      } catch {
        setBackend("Falha");
      }
    };
    fetchVersion();

    const testSocket = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ""}/socket.io/?EIO=4&transport=polling`, {
          method: "GET",
          mode: "no-cors"
        });
        setSocket("OK");
      } catch {
        setSocket("Falha");
      }
    };
    testSocket();
  }, []);

  return (
    <Container maxWidth="sm" className={classes.root}>
      <Box mb={4} textAlign="center">
        <Typography variant="h3">Status</Typography>
        <Typography variant="body1" style={{ color: "#6b7280" }}>
          Transparência de disponibilidade e versão
        </Typography>
      </Box>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6">Frontend versão</Typography>
          <Typography variant="body2">{version}</Typography>
          <Box mt={2} />
          <Typography variant="h6">Backend</Typography>
          <Typography variant="body2">{backend}</Typography>
          <Box mt={2} />
          <Typography variant="h6">Socket</Typography>
          <Typography variant="body2">{socket}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Status;
