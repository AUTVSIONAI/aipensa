import React, { useState, useEffect, useReducer, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { Grid, Card, CardContent, Typography } from "@material-ui/core";
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
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Invoices = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { findAll: findAllCompanies } = useCompanies();
  const { list: listPlans } = usePlans();
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (user.super) {
        try {
          const companiesData = await findAllCompanies();
          const plansData = await listPlans();
          setCompanies(companiesData);
          setPlans(plansData);
        } catch (err) {
          console.error(err);
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

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

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
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Empresas
                </Typography>
                <Typography variant="h5" component="h2">
                  {companies.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
           <Grid item xs={12} sm={9}>
            <Card>
              <CardContent>
                 <Typography color="textSecondary" gutterBottom>
                  Gestão de Assinaturas (Todas as Empresas)
                </Typography>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Empresa</TableCell>
                                <TableCell>Plano</TableCell>
                                <TableCell>Vencimento</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {companies.map(company => {
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
                </div>
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
        onScroll={handleScroll}
      >
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
                    {rowStatus(invoices) !== "Pago" ?
                      <Button
                        startIcon={<AttachMoneyIcon />}
                        size="small"
                        variant="outlined"
                        style={{
                        color: "white",
                        backgroundColor: "#437db5",
                        boxShadow: "none",
                        borderRadius: "5px",
                        }}
                        onClick={() => handleOpenContactModal(invoices)}
                      >
                        PAGAR
                      </Button> :
                      <Button
                        startIcon={<AttachMoneyIcon />}
                        size="small"
                        variant="outlined"
                        style={{
                        color: "white",
                        backgroundColor: "#437db5",
                        boxShadow: "none",
                        borderRadius: "5px",
                        }}
                      >
                        PAGO
                      </Button>}

                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Invoices;
