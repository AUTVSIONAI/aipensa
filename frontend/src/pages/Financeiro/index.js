import React, { useState, useEffect, useReducer, useContext, useCallback, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { Grid, Card, CardContent, Typography, Box } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@material-ui/icons/Business';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import Chart from "react-apexcharts";

import moment from "moment";

const reducer = (state, action) => {
  if (action.type === "LOAD_INVOICES") {
    const invoices = action.payload;
    const newUsers = [];

    invoices.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "visible",
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // Changed for icon alignment
    position: 'relative',
    overflow: 'visible',
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.55)" : "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(14px)",
    boxShadow: theme.palette.type === "dark" ? "0 18px 44px rgba(0,0,0,0.45)" : "0 8px 24px rgba(0,0,0,0.10)",
    transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.palette.type === "dark" ? "0 22px 56px rgba(0,0,0,0.55)" : "0 14px 34px rgba(0,0,0,0.14)",
    },
  },
  cardContent: {
    position: 'relative',
    zIndex: 1
  },
  cardTitle: {
    fontSize: 14,
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: theme.spacing(1)
  },
  iconWrapper: {
    position: 'absolute',
    right: 10,
    top: 10,
    color: 'rgba(0,0,0,0.1)',
    fontSize: 40
  },
  chartCard: {
    height: '100%',
    padding: theme.spacing(2),
  },
  emptyState: {
    padding: theme.spacing(4),
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
  },
  payButton: {
    color: "white",
    backgroundColor: theme.palette.primary.main,
    boxShadow: "none",
    borderRadius: 12,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: "none",
    },
  },
}));

const Invoices = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { list: listCompanies } = useCompanies();
  const { list: listPlans } = usePlans();
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  
  // Chart Data
  const [planSeries, setPlanSeries] = useState([]);
  const [planOptions, setPlanOptions] = useState({});
  const [statusSeries, setStatusSeries] = useState([]);
  const [statusOptions, setStatusOptions] = useState({});
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [revenueOptions, setRevenueOptions] = useState({});

  useEffect(() => {
    async function fetchData() {
      if (user.super) {
        try {
          const { data } = await api.get("/companiesPlan", {
            params: { searchParam: "", pageNumber: 1 }
          });
          const companiesData = data.companies;
          const plansData = await listPlans();
          
          if (Array.isArray(companiesData)) {
            setCompanies(companiesData);
            
            // Prepare Chart Data
            if (Array.isArray(plansData)) {
              setPlans(plansData);
              
              // 1. Companies per Plan
              const companiesPerPlan = plansData.map(plan => {
                return {
                  name: plan.name,
                  data: [companiesData.filter(c => (c.plan?.id || c.planId) === plan.id).length]
                };
              });
              
              setPlanSeries(companiesPerPlan.map(p => ({ name: p.name, data: p.data })));
              setPlanOptions({
                chart: { type: 'bar', height: 350 },
                plotOptions: {
                  bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' },
                },
                dataLabels: { enabled: false },
                stroke: { show: true, width: 2, colors: ['transparent'] },
                xaxis: { categories: ['Empresas por Plano'] },
                fill: { opacity: 1 },
                title: { text: 'Distribuição por Plano', align: 'left' }
              });

              // 2. Status Distribution
              const activeCount = companiesData.filter(c => c.status === true).length;
              const inactiveCount = companiesData.filter(c => c.status === false).length;
              
              setStatusSeries([activeCount, inactiveCount]);
              setStatusOptions({
                chart: { type: 'donut' },
                labels: ['Ativas', 'Inativas'],
                colors: ['#4caf50', '#f44336'],
                title: { text: 'Status das Empresas', align: 'left' },
                legend: { position: 'bottom' }
              });

              // 3. Revenue per Plan (Estimated)
              const revenueData = plansData.map(plan => {
                const amount = parseFloat(plan.amount ? plan.amount.replace(',', '.') : 0);
                const count = companiesData.filter(c => (c.plan?.id || c.planId) === plan.id).length;
                return amount * count;
              });
              
              setRevenueSeries(revenueData);
              setRevenueOptions({
                chart: { type: 'pie' },
                labels: plansData.map(p => p.name),
                title: { text: 'Receita Estimada por Plano', align: 'left' },
                legend: { position: 'bottom' }
              });
            }
          }
        } catch (err) {
          console.error(err);
          toastError(err);
        }
      }
    }
    fetchData();
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, ] = useState("");
  const [invoices, dispatch] = useReducer(reducer, []);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleOpenContactModal = (invoices) => {
    setStoragePlans(invoices);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchInvoices = async () => {
        try {
          const { data } = await api.get("/invoices/all", {
            params: { searchParam, pageNumber },
          });

          dispatch({ type: "LOAD_INVOICES", payload: data });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchInvoices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const loadMoreIfNeeded = useCallback(() => {
    if (!hasMore || loading) return;
    loadMore();
  }, [hasMore, loading]);

  const loadMoreSentinelRef = useRef(null);

  useEffect(() => {
    const root = document.querySelector("main");
    const target = loadMoreSentinelRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreIfNeeded();
      },
      { root, rootMargin: "400px 0px 400px 0px", threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMoreIfNeeded]);

  const rowStyle = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();
    if (dias < 0 && record.status !== "paid") {
      return { backgroundColor: "#ffbcbc9c" };
    }
  };

  const rowStatus = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();
    const status = record.status;
    if (status === "paid") {
      return "Pago";
    }
    if (dias < 0) {
      return "Vencido";
    } else {
      return "Em Aberto"
    }
  }
  
  const renderUseWhatsapp = (row) => { return row.status === false ? "Não" : "Sim" };
  const renderUseFacebook = (row) => { return row.status === false ? "Não" : "Sim" };
  const renderUseInstagram = (row) => { return row.status === false ? "Não" : "Sim" };
  const renderUseCampaigns = (row) => { return row.status === false ? "Não" : "Sim" };
  const renderUseSchedules = (row) => { return row.status === false ? "Não" : "Sim" };
  const renderUseInternalChat = (row) => { return row.status === false ? "Não" : "Sim" };
  const renderUseExternalApi = (row) => { return row.status === false ? "Não" : "Sim" };

  return (
    <MainContainer>
      {user.super && (
        <Grid container spacing={3} style={{ marginBottom: "20px" }}>
          {/* Métricas Gerais */}
          <Grid item xs={12} sm={3}>
            <Card className={classes.card}>
              <CardContent>
                <Typography className={classes.cardTitle}>
                  Total de Empresas
                </Typography>
                <Typography className={classes.cardValue}>
                  {companies.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card className={classes.card}>
              <CardContent>
                <Typography className={classes.cardTitle}>
                  Empresas Ativas
                </Typography>
                <Typography className={classes.cardValue} style={{ color: '#4caf50' }}>
                  {companies.filter(c => c.status).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card className={classes.card}>
              <CardContent>
                <Typography className={classes.cardTitle}>
                  Empresas Inativas
                </Typography>
                <Typography className={classes.cardValue} style={{ color: '#f44336' }}>
                  {companies.filter(c => !c.status).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card className={classes.card}>
              <CardContent>
                <Typography className={classes.cardTitle}>
                  Receita Mensal Estimada
                </Typography>
                <Typography className={classes.cardValue} style={{ color: '#2196f3' }}>
                  {companies.reduce((sum, c) => {
                    const plan = plans.find(p => p.id === c.planId);
                    return sum + (plan ? parseFloat(plan.value) : 0);
                  }, 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráficos */}
          <Grid item xs={12} md={8}>
             <Card className={classes.card}>
               <CardContent>
                 <Typography variant="h6" gutterBottom>Distribuição por Plano</Typography>
                 <Chart options={planOptions} series={planSeries} type="bar" height={350} />
               </CardContent>
             </Card>
          </Grid>
          <Grid item xs={12} md={4}>
             <Card className={classes.card}>
               <CardContent>
                 <Typography variant="h6" gutterBottom>Status das Empresas</Typography>
                 <Chart options={statusOptions} series={statusSeries} type="donut" height={350} />
               </CardContent>
             </Card>
          </Grid>

          {/* Tabela de Empresas */}
           <Grid item xs={12}>
            <Card className={classes.card}>
              <CardContent>
                 <Typography color="textSecondary" gutterBottom>
                  Gestão de Assinaturas (Todas as Empresas)
                </Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Empresa</TableCell>
                                <TableCell>Plano</TableCell>
                                <TableCell>Vencimento</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(companies) && companies.map(company => {
                                const plan = plans.find(p => p.id === company.planId);
                                const dueDate = moment(company.dueDate);
                                const daysLeft = dueDate.diff(moment(), 'days');
                                return (
                                    <TableRow key={company.id}>
                                        <TableCell>{company.name}</TableCell>
                                        <TableCell>{plan ? plan.name : '-'}</TableCell>
                                        <TableCell>{dueDate.format('DD/MM/YYYY')}</TableCell>
                                        <TableCell style={{ color: daysLeft < 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                                            {daysLeft} dias {daysLeft < 0 ? '(Vencido)' : ''}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={storagePlans}
        contactId={selectedContactId}

      ></SubscriptionModal>
      <MainHeader>
        <Title>Faturas ({invoices.length})</Title>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
      >
        {invoices.length === 0 && !loading && (
          <div className={classes.emptyState}>
            <Typography variant="subtitle1" color="textPrimary">
              Nenhuma fatura encontrada
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Aguarde a sincronização ou verifique permissões.
            </Typography>
          </div>
        )}
        <Table size="small">
          <TableHead>
            <TableRow>
              {/* <TableCell align="center">Id</TableCell> */}
              <TableCell align="center">Detalhes</TableCell>

              <TableCell align="center">Usuários</TableCell>
              <TableCell align="center">Conexões</TableCell>
              <TableCell align="center">Filas</TableCell>
              {/* <TableCell align="center">Whatsapp</TableCell>
              <TableCell align="center">Facebook</TableCell>
              <TableCell align="center">Instagram</TableCell> */}
              {/* <TableCell align="center">Campanhas</TableCell>
              <TableCell align="center">Agendamentos</TableCell>
              <TableCell align="center">Chat Interno</TableCell>
              <TableCell align="center">Rest PI</TableCell> */}

              <TableCell align="center">Valor</TableCell>
              <TableCell align="center">Data Venc.</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {invoices.map((invoices) => (
                <TableRow style={rowStyle(invoices)} key={invoices.id}>
                  {/* <TableCell align="center">{invoices.id}</TableCell> */}
                  <TableCell align="center">{invoices.detail}</TableCell>

                  <TableCell align="center">{invoices.users}</TableCell>
                  <TableCell align="center">{invoices.connections}</TableCell>
                  <TableCell align="center">{invoices.queues}</TableCell>
                  {/* <TableCell align="center">{renderUseWhatsapp(invoices.useWhatsapp)}</TableCell>
                  <TableCell align="center">{renderUseFacebook(invoices.useFacebook)}</TableCell>
                  <TableCell align="center">{renderUseInstagram(invoices.useInstagram)}</TableCell> */}
                  {/* <TableCell align="center">{renderUseCampaigns(invoices.useCampaigns)}</TableCell>
                  <TableCell align="center">{renderUseSchedules(invoices.useSchedules)}</TableCell>
                  <TableCell align="center">{renderUseInternalChat(invoices.useInternalChat)}</TableCell>
                  <TableCell align="center">{renderUseExternalApi(invoices.useExternalApi)}</TableCell> */}

                  <TableCell style={{ fontWeight: 'bold' }} align="center">{invoices.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</TableCell>
                  <TableCell align="center">{moment(invoices.dueDate).format("DD/MM/YYYY")}</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }} align="center">{rowStatus(invoices)}</TableCell>
                  <TableCell align="center">
                    {rowStatus(invoices) !== "Pago" ? (
                      <Button
                        startIcon={<AttachMoneyIcon />}
                        size="small"
                        variant="contained"
                        className={classes.payButton}
                        onClick={() => handleOpenContactModal(invoices)}
                      >
                        PAGAR
                      </Button>
                    ) : (
                      <Button
                        startIcon={<AttachMoneyIcon />}
                        size="small"
                        variant="contained"
                        className={classes.payButton}
                        disabled
                      >
                        PAGO
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
        <div ref={loadMoreSentinelRef} />
      </Paper>
    </MainContainer>
  );
};


export default Invoices;
