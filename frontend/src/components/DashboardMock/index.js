import React from "react";
import { Box, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 20px rgba(0,0,0,0.06)"
  },
  header: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb"
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
    backgroundColor: "#d1d5db"
  },
  content: {
    padding: 16
  },
  statCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16
  },
  statTitle: {
    color: "#6b7280",
    fontSize: "0.8rem",
    marginBottom: 6
  },
  statValue: {
    fontWeight: 700,
    fontSize: "1.4rem"
  },
  shimmer: {
    height: 6,
    borderRadius: 9999,
    background:
      "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
    animation: "$shine 1.6s linear infinite"
  },
  chartCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    height: "100%"
  },
  bar: {
    width: 20,
    borderRadius: 6,
    backgroundColor: "#3b82f6",
    animation: "$pulseBar 1.8s ease-in-out infinite"
  },
  bar2: {
    width: 20,
    borderRadius: 6,
    backgroundColor: "#6366f1",
    animation: "$pulseBar 2.1s ease-in-out infinite"
  },
  bar3: {
    width: 20,
    borderRadius: 6,
    backgroundColor: "#10b981",
    animation: "$pulseBar 1.5s ease-in-out infinite"
  },
  listCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    height: "100%"
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: "#eff6ff"
  },
  line: {
    flex: 1,
    height: 8,
    borderRadius: 9999,
    backgroundColor: "#f3f4f6",
    animation: "$slideUp 1s ease-in-out"
  },
  "@keyframes shine": {
    "0%": { backgroundPosition: "-100px 0" },
    "100%": { backgroundPosition: "100px 0" }
  },
  "@keyframes pulseBar": {
    "0%": { transform: "scaleY(0.7)" },
    "50%": { transform: "scaleY(1)" },
    "100%": { transform: "scaleY(0.7)" }
  },
  "@keyframes slideUp": {
    "0%": { opacity: 0, transform: "translateY(8px)" },
    "100%": { opacity: 1, transform: "translateY(0)" }
  }
}));

const DashboardMock = () => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <span className={classes.dot} />
        <span className={classes.dot} />
        <span className={classes.dot} />
      </Box>
      <Box className={classes.content}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box className={classes.statCard}>
              <Typography className={classes.statTitle}>Conversas hoje</Typography>
              <Typography className={classes.statValue}>128</Typography>
              <Box mt={1} className={classes.shimmer} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className={classes.statCard}>
              <Typography className={classes.statTitle}>Tempo médio</Typography>
              <Typography className={classes.statValue}>2m 35s</Typography>
              <Box mt={1} className={classes.shimmer} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className={classes.statCard}>
              <Typography className={classes.statTitle}>Satisfação</Typography>
              <Typography className={classes.statValue}>94%</Typography>
              <Box mt={1} className={classes.shimmer} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={classes.listCard}>
              <Typography style={{ marginBottom: 12, fontWeight: 600 }}>
                Últimas mensagens
              </Typography>
              {[...Array(5)].map((_, i) => (
                <Box key={i} className={classes.listItem}>
                  <span className={classes.avatar} />
                  <span className={classes.line} />
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={classes.chartCard}>
              <Typography style={{ marginBottom: 12, fontWeight: 600 }}>
                Volume por hora
              </Typography>
              <Box display="flex" alignItems="flex-end" justifyContent="space-between" height={160}>
                {[40, 80, 120, 70, 100, 60, 140, 90].map((h, i) => (
                  <Box key={i} display="flex" alignItems="flex-end">
                    <span
                      className={[classes.bar, classes[`bar${(i % 3) + 1}`]].join(" ")}
                      style={{ height: h }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardMock;
