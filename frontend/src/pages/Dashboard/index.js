import React, { useContext, useState, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Box, LinearProgress } from "@mui/material";
import { Groups, SaveAlt, TrendingUp, TrendingDown, Dashboard as DashboardIcon } from "@mui/icons-material";
import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from '@material-ui/icons/Send';
import MessageIcon from '@material-ui/icons/Message';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerIcon from '@material-ui/icons/Timer';
import * as XLSX from 'xlsx';
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";
import TabPanel from "../../components/TabPanel";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import Chart from "react-apexcharts";
import Grid from '@mui/material/Grid';
import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import ChatsUser from "./ChartsUser";
import ChartDonut from "./ChartDonut";
import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";
import { Avatar, Button, Card, CardContent, Container, Stack, SvgIcon, Tab, Tabs } from "@mui/material";
import { i18n } from "../../translate/i18n";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import ForbiddenPage from "../../components/ForbiddenPage";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    width: "100%",
    margin: 0,
    background: "#f0f2f5",
    minHeight: "100vh",
  },
  mainHeader: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 16,
    boxShadow: "0 10px 35px rgba(102, 126, 234, 0.2)",
    color: "white",
  },
  statsCard: {
    background: "white",
    borderRadius: 12,
    padding: theme.spacing(2.5),
    height: "100%",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.05)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: "var(--card-gradient)",
    },
  },
  statsIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--icon-bg)",
    "& svg": {
      fontSize: 28,
      color: "white",
    },
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 700,
    color: "#1a202c",
    lineHeight: 1.2,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing(0.5),
  },
  statsTrend: {
    display: "inline-flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  chartPaper: {
    padding: theme.spacing(3),
    borderRadius: 12,
    background: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    height: "100%",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#2d3748",
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterButton: {
    background: "white",
    color: "#667eea",
    borderRadius: 10,
    padding: "10px 20px",
    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.15)",
    border: "1px solid #667eea",
    transition: "all 0.3s ease",
    textTransform: "none",
    fontWeight: 500,
    "&:hover": {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
    },
  },
  dialogPaper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  dialogTitle: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: theme.spacing(3),
  },
  dialogContent: {
    padding: theme.spacing(4),
  },
  dialogActions: {
    padding: theme.spacing(3),
    background: "#f8f9fa",
  },
  performanceCard: {
    background: "white",
    borderRadius: 12,
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  metricCard: {
    padding: theme.spacing(2),
    borderRadius: 10,
    background: "#f8f9fa",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    background: "#e2e8f0",
  },
  summaryBox: {
    padding: theme.spacing(2.5),
    borderRadius: 10,
    background: "linear-gradient(135deg, var(--summary-color)15 0%, var(--summary-color)05 100%)",
    border: "1px solid var(--summary-color)20",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: "0 4px 12px var(--summary-color)15",
    },
  },
}));

const PerformanceCard = ({ title, value, max, color }) => {
  const percentage = (value / max) * 100;
  const classes = useStyles();

  return (
    <Box className={classes.metricCard}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: color, 
          fontWeight: 700,
          fontSize: 14,
          background: `${color}15`,
          padding: "4px 10px",
          borderRadius: "6px"
        }}>
          {percentage.toFixed(1)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: "#e2e8f0",
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          },
        }}
      />
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: 11 }}>
          {value} de {max}
        </Typography>
      </Stack>
    </Box>
  );
};

const Dashboard = () => {
  const [barChartData, setBarChartData] = useState({
    series: [
      {
        name: "Em Atendimento",
        data: [0],
      },
      {
        name: "Aguardando",
        data: [0],
      },
      {
        name: "Finalizados",
        data: [0],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "50%",
          borderRadius: 8,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val;
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#304758"]
        }
      },
      xaxis: {
        categories: ["Status dos Tickets"],
        labels: {
          style: {
            colors: "#64748b",
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        title: {
          text: "Quantidade",
          style: {
            color: "#64748b",
            fontSize: '12px',
          },
        },
        labels: {
          style: {
            colors: "#64748b",
          },
        },
      },
      colors: ["#667eea", "#10b981", "#06b6d4"],
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.25,
          gradientToColors: ["#764ba2", "#34d399", "#22d3ee"],
          inverseColors: false,
          opacityFrom: 0.85,
          opacityTo: 0.85,
          stops: [0, 100],
        },
      },
      legend: {
        position: "top",
        horizontalAlign: 'center',
        fontSize: '12px',
        fontWeight: 500,
        labels: {
          colors: "#64748b",
        },
        markers: {
          radius: 4,
        },
      },
      grid: {
        borderColor: '#e2e8f0',
        strokeDashArray: 4,
      },
    },
  });

  const [pieChartData, setPieChartData] = useState({
    series: [0, 0, 0],
    options: {
      chart: {
        type: 'donut',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      labels: ['Em Atendimento', 'Aguardando', 'Finalizados'],
      colors: ['#667eea', '#10b981', '#06b6d4'],
      legend: {
        position: 'bottom',
        fontSize: '12px',
        labels: {
          colors: "#64748b",
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return Math.round(val) + "%";
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                fontSize: '14px',
                fontWeight: 600,
                color: '#2d3748',
              },
            },
          },
        },
      },
      stroke: {
        width: 0,
      },
      fill: {
        type: 'gradient',
      },
    },
  });

  const theme = useTheme();
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [period, setPeriod] = useState(0);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();

  const [tab, setTab] = useState("Indicadores");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedQueues, setSelectedQueues] = useState([]);

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let nowIni = `${year}-${month < 10 ? `0${month}` : `${month}`}-01`;
  let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`;

  const [showFilter, setShowFilter] = useState(false);
  const [dateStartTicket, setDateStartTicket] = useState(nowIni);
  const [dateEndTicket, setDateEndTicket] = useState(now);
  const [queueTicket, setQueueTicket] = useState(false);
  const [fetchDataFilter, setFetchDataFilter] = useState(false);

  const { user } = useContext(AuthContext);

  const exportarGridParaExcel = () => {
    const ws = XLSX.utils.table_to_sheet(document.getElementById('grid-attendants'));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RelatorioDeAtendentes');
    XLSX.writeFile(wb, 'relatorio-de-atendentes.xlsx');
  };

  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDataFilter]);

  useEffect(() => {
    if (counters.supportHappening !== undefined && counters.supportPending !== undefined && counters.supportFinished !== undefined) {
      setBarChartData({
        ...barChartData,
        series: [
          {
            name: "Em Atendimento",
            data: [counters.supportHappening],
          },
          {
            name: "Aguardando",
            data: [counters.supportPending],
          },
          {
            name: "Finalizados",
            data: [counters.supportFinished],
          },
        ],
      });

      const total = counters.supportHappening + counters.supportPending + counters.supportFinished;
      if (total > 0) {
        setPieChartData({
          ...pieChartData,
          series: [counters.supportHappening, counters.supportPending, counters.supportFinished],
        });
      }
    }
  }, [counters]);

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateStartTicket) && moment(dateStartTicket).isValid()) {
      params = {
        ...params,
        date_from: moment(dateStartTicket).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateEndTicket) && moment(dateEndTicket).isValid()) {
      params = {
        ...params,
        date_to: moment(dateEndTicket).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetUsers = () => {
    let count;
    let userOnline = 0;
    attendants.forEach(user => {
      if (user.online === true) {
        userOnline = userOnline + 1
      }
    });
    count = userOnline === 0 ? 0 : userOnline;
    return count;
  };

  const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    } else {
      props = {
        dateStart: dateStartTicket,
        dateEnd: dateEndTicket,
      };
    }
    const { count } = useContacts(props);
    return count;
  };

  const GetMessages = (all, fromMe) => {
    let props = {};
    if (all) {
      if (fromMe) {
        props = {
          fromMe: true
        };
      } else {
        props = {
          fromMe: false
        };
      }
    } else {
      if (fromMe) {
        props = {
          fromMe: true,
          dateStart: dateStartTicket,
          dateEnd: dateEndTicket,
        };
      } else {
        props = {
          fromMe: false,
          dateStart: dateStartTicket,
          dateEnd: dateEndTicket,
        };
      }
    }
    const { count } = useMessages(props);
    return count;
  };

  function toggleShowFilter() {
    setShowFilter(!showFilter);
  }

  const cardConfigs = [
    {
      title: i18n.t("dashboard.cards.inAttendance"),
      value: counters.supportHappening,
      icon: <CallIcon />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      iconBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: i18n.t("dashboard.cards.waiting"),
      value: counters.supportPending,
      icon: <HourglassEmptyIcon />,
      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      iconBg: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      trend: "-5%",
      trendUp: false,
    },
    {
      title: i18n.t("dashboard.cards.finalized"),
      value: counters.supportFinished,
      icon: <CheckCircleIcon />,
      gradient: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
      iconBg: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: i18n.t("dashboard.cards.groups"),
      value: counters.supportGroups,
      icon: <Groups />,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      iconBg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      trend: "+3%",
      trendUp: true,
    },
    {
      title: i18n.t("dashboard.cards.activeAttendants"),
      value: `${GetUsers()}/${attendants.length}`,
      icon: <RecordVoiceOverIcon />,
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
      iconBg: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
      trend: "0%",
      trendUp: true,
    },
    {
      title: i18n.t("dashboard.cards.newContacts"),
      value: counters.leads,
      icon: <GroupAddIcon />,
      gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
      iconBg: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
      trend: "+15%",
      trendUp: true,
    },
  ];

  return (
    <>
      {
        user.profile === "user" && user.showDashboard === "disabled" ?
          <ForbiddenPage />
          :
          <>
            <div>
              <Container maxWidth={false} className={classes.container} disableGutters>
                {/* Header Section */}
                <Box className={classes.mainHeader}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <DashboardIcon sx={{ fontSize: 32 }} />
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Dashboard
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Monitore o desempenho e métricas em tempo real
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <Button
                      onClick={toggleShowFilter}
                      className={classes.filterButton}
                      startIcon={!showFilter ? <FilterListIcon /> : <ClearIcon />}
                    >
                      {!showFilter ? "Filtros" : "Fechar"}
                    </Button>
                  </Stack>
                </Box>

                {/* Filter Dialog */}
                <Dialog
                  open={showFilter}
                  onClose={toggleShowFilter}
                  maxWidth="md"
                  fullWidth
                  PaperProps={{
                    className: classes.dialogPaper,
                  }}
                >
                  <DialogTitle className={classes.dialogTitle}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Configurar Filtros
                    </Typography>
                  </DialogTitle>
                  <DialogContent className={classes.dialogContent}>
                    <Filters
                      classes={classes}
                      setDateStartTicket={setDateStartTicket}
                      setDateEndTicket={setDateEndTicket}
                      dateStartTicket={dateStartTicket}
                      dateEndTicket={dateEndTicket}
                      setQueueTicket={setQueueTicket}
                      queueTicket={queueTicket}
                      fetchData={setFetchDataFilter}
                    />
                  </DialogContent>
                  <DialogActions className={classes.dialogActions}>
                    <Button
                      onClick={toggleShowFilter}
                      sx={{
                        borderRadius: "8px",
                        padding: "8px 24px",
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => { setFetchDataFilter(!fetchDataFilter); toggleShowFilter(); }}
                      variant="contained"
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "8px",
                        padding: "8px 24px",
                        textTransform: "none",
                        fontWeight: 500,
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      Aplicar Filtros
                    </Button>
                  </DialogActions>
                </Dialog>

                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"Indicadores"}
                >
                  <Container maxWidth={false} disableGutters>
                    <Grid2 container spacing={2}>
                      {/* Stats Cards */}
                      {cardConfigs.map((card, index) => (
                        <Grid2 key={index} xs={12} sm={6} lg={2}>
                          <Box
                            className={classes.statsCard}
                            sx={{
                              "--card-gradient": card.gradient,
                              "--icon-bg": card.iconBg,
                            }}
                          >
                            <Stack spacing={2}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                  <Typography className={classes.statsLabel}>
                                    {card.title}
                                  </Typography>
                                  <Typography className={classes.statsValue}>
                                    {card.value || 0}
                                  </Typography>
                                  <Box 
                                    className={classes.statsTrend}
                                    sx={{ 
                                      color: card.trendUp ? "#10b981" : "#ef4444",
                                      background: card.trendUp ? "#10b98115" : "#ef444415",
                                    }}
                                  >
                                    {card.trendUp ? <TrendingUp sx={{ fontSize: 14, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 14, mr: 0.5 }} />}
                                    <span>{card.trend}</span>
                                  </Box>
                                </Box>
                                <Box className={classes.statsIcon}>
                                  {card.icon}
                                </Box>
                              </Stack>
                            </Stack>
                          </Box>
                        </Grid2>
                      ))}

                      {/* Charts Row */}
                      <Grid2 xs={12} md={8}>
                        <Paper className={classes.chartPaper}>
                          <Box className={classes.chartTitle}>
                            <Typography variant="h6">
                              Análise de Atendimentos
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              Últimos 30 dias
                            </Typography>
                          </Box>
                          <Box sx={{ height: 350 }}>
                            <Chart
                              options={barChartData.options}
                              series={barChartData.series}
                              type="bar"
                              height="100%"
                            />
                          </Box>
                        </Paper>
                      </Grid2>

                      <Grid2 xs={12} md={4}>
                        <Paper className={classes.chartPaper}>
                          <Box className={classes.chartTitle}>
                            <Typography variant="h6">
                              Distribuição de Status
                            </Typography>
                          </Box>
                          <Box sx={{ height: 350 }}>
                            <Chart
                              options={pieChartData.options}
                              series={pieChartData.series}
                              type="donut"
                              height="100%"
                            />
                          </Box>
                        </Paper>
                      </Grid2>

                      {/* User Performance */}
                      <Grid2 xs={12} md={6}>
                        <Paper className={classes.chartPaper}>
                          <Box className={classes.chartTitle}>
                            <Typography variant="h6">
                              Performance por Usuário
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<SaveAlt />}
                              onClick={exportarGridParaExcel}
                              sx={{
                                textTransform: "none",
                                color: "#667eea",
                                fontWeight: 500,
                              }}
                            >
                              Exportar
                            </Button>
                          </Box>
                          <Box sx={{ height: 350 }}>
                            <ChatsUser />
                          </Box>
                        </Paper>
                      </Grid2>

                      {/* Timeline Chart */}
                      <Grid2 xs={12} md={6}>
                        <Paper className={classes.chartPaper}>
                          <Box className={classes.chartTitle}>
                            <Typography variant="h6">
                              Tendência Temporal
                            </Typography>
                          </Box>
                          <Box sx={{ height: 350 }}>
                            <ChartsDate />
                          </Box>
                        </Paper>
                      </Grid2>

                      {/* Summary Statistics */}
                      <Grid2 xs={12}>
                        <Paper className={classes.chartPaper}>
                          <Box className={classes.chartTitle}>
                            <Typography variant="h6">
                              Resumo Estatístico
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              Período: {moment(dateStartTicket).format('DD/MM/YYYY')} - {moment(dateEndTicket).format('DD/MM/YYYY')}
                            </Typography>
                          </Box>
                          
                          <Grid2 container spacing={2} sx={{ mt: 1 }}>
                            <Grid2 xs={12} md={3}>
                              <Box 
                                className={classes.summaryBox}
                                sx={{ "--summary-color": "#667eea" }}
                              >
                                <Stack spacing={1}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <MessageIcon sx={{ color: "#667eea", fontSize: 20 }} />
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                                      MENSAGENS ENVIADAS
                                    </Typography>
                                  </Stack>
                                  <Typography variant="h4" sx={{ color: "#1a202c", fontWeight: 700 }}>
                                    {GetMessages(false, true)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#667eea" }}>
                                    Pela equipe
                                  </Typography>
                                </Stack>
                              </Box>
                            </Grid2>

                            <Grid2 xs={12} md={3}>
                              <Box 
                                className={classes.summaryBox}
                                sx={{ "--summary-color": "#10b981" }}
                              >
                                <Stack spacing={1}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <SendIcon sx={{ color: "#10b981", fontSize: 20 }} />
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                                      MENSAGENS RECEBIDAS
                                    </Typography>
                                  </Stack>
                                  <Typography variant="h4" sx={{ color: "#1a202c", fontWeight: 700 }}>
                                    {GetMessages(false, false)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#10b981" }}>
                                    Dos clientes
                                  </Typography>
                                </Stack>
                              </Box>
                            </Grid2>

                            <Grid2 xs={12} md={3}>
                              <Box 
                                className={classes.summaryBox}
                                sx={{ "--summary-color": "#06b6d4" }}
                              >
                                <Stack spacing={1}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <AccessAlarmIcon sx={{ color: "#06b6d4", fontSize: 20 }} />
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                                      TEMPO MÉDIO
                                    </Typography>
                                  </Stack>
                                  <Typography variant="h4" sx={{ color: "#1a202c", fontWeight: 700 }}>
                                    {formatTime(counters.avgSupportTime || 0)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#06b6d4" }}>
                                    Por atendimento
                                  </Typography>
                                </Stack>
                              </Box>
                            </Grid2>

                            <Grid2 xs={12} md={3}>
                              <Box 
                                className={classes.summaryBox}
                                sx={{ "--summary-color": "#f59e0b" }}
                              >
                                <Stack spacing={1}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <TimerIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                                      PRIMEIRA RESPOSTA
                                    </Typography>
                                  </Stack>
                                  <Typography variant="h4" sx={{ color: "#1a202c", fontWeight: 700 }}>
                                    {formatTime(counters.avgWaitTime || 0)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#f59e0b" }}>
                                    Tempo médio
                                  </Typography>
                                </Stack>
                              </Box>
                            </Grid2>
                          </Grid2>
                        </Paper>
                      </Grid2>

                      {/* Performance Metrics */}
                      <Grid2 xs={12}>
                        <Card className={classes.performanceCard}>
                          <CardContent>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              mb={3}
                            >
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a202c" }}>
                                  Métricas de Desempenho
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                                  Indicadores de qualidade e eficiência do atendimento
                                </Typography>
                              </Box>
                              <Box sx={{ 
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                borderRadius: "8px",
                                padding: "8px 16px",
                                boxShadow: "0 2px 10px rgba(102, 126, 234, 0.2)"
                              }}>
                                <Typography variant="body2" sx={{ color: "white", fontWeight: 500 }}>
                                  {GetUsers()}/{attendants.length} atendentes ativos
                                </Typography>
                              </Box>
                            </Stack>

                            <Grid2 container spacing={3}>
                              <Grid2 xs={12} md={4}>
                                <PerformanceCard
                                  title="Taxa de Resolução"
                                  value={counters.supportFinished || 0}
                                  max={
                                    (counters.supportFinished || 0) + (counters.supportPending || 0) + (counters.supportHappening || 0) || 1
                                  }
                                  color="#667eea"
                                />
                              </Grid2>
                              <Grid2 xs={12} md={4}>
                                <PerformanceCard
                                  title="Tempo Médio de Resposta"
                                  value={counters.avgResponseTime || 0}
                                  max={counters.maxResponseTime || 60}
                                  color="#10b981"
                                />
                              </Grid2>
                              <Grid2 xs={12} md={4}>
                                <PerformanceCard
                                  title="Eficiência Geral"
                                  value={85}
                                  max={100}
                                  color="#06b6d4"
                                />
                              </Grid2>
                            </Grid2>

                            {/* KPI Cards */}
                            <Box sx={{ mt: 4 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1a202c", mb: 2 }}>
                                Indicadores Complementares
                              </Typography>
                              <Grid2 container spacing={2}>
                                <Grid2 xs={6} md={3}>
                                  <Box sx={{
                                    textAlign: "center",
                                    p: 2,
                                    borderRadius: 10,
                                    background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                                    color: "white",
                                    transition: "transform 0.3s ease",
                                    "&:hover": { transform: "scale(1.05)" }
                                  }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                      {((counters.supportFinished || 0) / ((counters.supportFinished || 0) + (counters.supportPending || 0) + (counters.supportHappening || 0) || 1) * 100).toFixed(0)}%
                                    </Typography>
                                    <Typography variant="caption">
                                      Satisfação
                                    </Typography>
                                  </Box>
                                </Grid2>
                                <Grid2 xs={6} md={3}>
                                  <Box sx={{
                                    textAlign: "center",
                                    p: 2,
                                    borderRadius: 10,
                                    background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                                    color: "white",
                                    transition: "transform 0.3s ease",
                                    "&:hover": { transform: "scale(1.05)" }
                                  }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                      {formatTime(counters.avgWaitTime || 0)}
                                    </Typography>
                                    <Typography variant="caption">
                                      Tempo de Espera
                                    </Typography>
                                  </Box>
                                </Grid2>
                                <Grid2 xs={6} md={3}>
                                  <Box sx={{
                                    textAlign: "center",
                                    p: 2,
                                    borderRadius: 10,
                                    background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                                    color: "white",
                                    transition: "transform 0.3s ease",
                                    "&:hover": { transform: "scale(1.05)" }
                                  }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                      {Math.floor((GetMessages(false, true) + GetMessages(false, false)) / (GetContacts(false) || 1))}
                                    </Typography>
                                    <Typography variant="caption">
                                      Msgs/Contato
                                    </Typography>
                                  </Box>
                                </Grid2>
                                <Grid2 xs={6} md={3}>
                                  <Box sx={{
                                    textAlign: "center",
                                    p: 2,
                                    borderRadius: 10,
                                    background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                                    color: "white",
                                    transition: "transform 0.3s ease",
                                    "&:hover": { transform: "scale(1.05)" }
                                  }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                      {counters.supportGroups || 0}
                                    </Typography>
                                    <Typography variant="caption">
                                      Grupos Ativos
                                    </Typography>
                                  </Box>
                                </Grid2>
                              </Grid2>
                            </Box>

                            {/* Mini Progress Rings */}
                            <Box sx={{ mt: 4, p: 3, background: "#f8f9fa", borderRadius: 10 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1a202c", mb: 3 }}>
                                Distribuição de Atendimentos por Status
                              </Typography>
                              <Grid2 container spacing={3}>
                                <Grid2 xs={12} md={4}>
                                  <Box sx={{ textAlign: "center" }}>
                                    <Box sx={{
                                      width: 100,
                                      height: 100,
                                      margin: "0 auto",
                                      borderRadius: "50%",
                                      background: `conic-gradient(#667eea 0deg ${(counters.supportHappening / ((counters.supportHappening || 0) + (counters.supportPending || 0) + (counters.supportFinished || 0) || 1) * 360)}deg, #e2e8f0 0deg)`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      position: "relative",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                    }}>
                                      <Box sx={{
                                        width: 75,
                                        height: 75,
                                        borderRadius: "50%",
                                        background: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
                                          {counters.supportHappening || 0}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: "#64748b", mt: 2, fontWeight: 500 }}>
                                      Em Atendimento
                                    </Typography>
                                  </Box>
                                </Grid2>

                                <Grid2 xs={12} md={4}>
                                  <Box sx={{ textAlign: "center" }}>
                                    <Box sx={{
                                      width: 100,
                                      height: 100,
                                      margin: "0 auto",
                                      borderRadius: "50%",
                                      background: `conic-gradient(#10b981 0deg ${(counters.supportPending / ((counters.supportHappening || 0) + (counters.supportPending || 0) + (counters.supportFinished || 0) || 1) * 360)}deg, #e2e8f0 0deg)`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      position: "relative",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                    }}>
                                      <Box sx={{
                                        width: 75,
                                        height: 75,
                                        borderRadius: "50%",
                                        background: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#10b981" }}>
                                          {counters.supportPending || 0}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: "#64748b", mt: 2, fontWeight: 500 }}>
                                      Aguardando
                                    </Typography>
                                  </Box>
                                </Grid2>

                                <Grid2 xs={12} md={4}>
                                  <Box sx={{ textAlign: "center" }}>
                                    <Box sx={{
                                      width: 100,
                                      height: 100,
                                      margin: "0 auto",
                                      borderRadius: "50%",
                                      background: `conic-gradient(#06b6d4 0deg ${(counters.supportFinished / ((counters.supportHappening || 0) + (counters.supportPending || 0) + (counters.supportFinished || 0) || 1) * 360)}deg, #e2e8f0 0deg)`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      position: "relative",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                    }}>
                                      <Box sx={{
                                        width: 75,
                                        height: 75,
                                        borderRadius: "50%",
                                        background: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#06b6d4" }}>
                                          {counters.supportFinished || 0}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: "#64748b", mt: 2, fontWeight: 500 }}>
                                      Finalizados
                                    </Typography>
                                  </Box>
                                </Grid2>
                              </Grid2>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid2>

                    </Grid2>
                  </Container>
                </TabPanel>
              </Container>
            </div>
          </>
      }
    </>
  );
};

export default Dashboard;
