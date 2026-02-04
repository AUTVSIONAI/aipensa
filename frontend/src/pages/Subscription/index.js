import React, { useState, useContext, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import StarIcon from '@material-ui/icons/StarBorder';
import { useHistory } from "react-router-dom";

import SubscriptionModal from "../../components/SubscriptionModal";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import moment from "moment";
import { useDate } from "../../hooks/useDate";
import usePlans from "../../hooks/usePlans";

import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  cardHeader: {
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2),
  },
}));

const Subscription = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { returnDays } = useDate();
  const { getPlanList } = usePlans();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const currentDueDate = localStorage.getItem("dueDate");
    if (currentDueDate && currentDueDate !== "null") {
      setDueDate(moment(currentDueDate).format("DD/MM/YYYY"));
    }

    // If user is super admin, redirect to Plan management page instead of showing subscription page
    if (user.super) {
        history.push("/plans");
        return null;
    }

    const loadPlans = async () => {
        try {
            const data = await getPlanList();
            setPlans(data);
        } catch (e) {
            console.error(e);
            toast.error("Erro ao carregar planos.");
        }
    }
    loadPlans();
  }, [getPlanList, user, history]);

  const handleOpenContactModal = async (plan) => {
    try {
        setLoading(true);
        // Create an invoice for the selected plan
        const { data: invoice } = await api.post('/invoices', {
            companyId: user.companyId,
            dueDate: moment().add(3, 'days').format('YYYY-MM-DD'),
            detail: `Plano ${plan.name}`,
            status: 'open',
            value: plan.amount,
            users: plan.users,
            connections: plan.connections,
            queues: plan.queues,
            useWhatsapp: plan.useWhatsapp,
            useFacebook: plan.useFacebook,
            useInstagram: plan.useInstagram,
            useCampaigns: plan.useCampaigns,
            useSchedules: plan.useSchedules,
            useInternalChat: plan.useInternalChat,
            useExternalApi: plan.useExternalApi,
            useKanban: plan.useKanban,
            useOpenAi: plan.useOpenAi,
            useIntegrations: plan.useIntegrations,
        });
        
        setSelectedInvoice(invoice);
        setSelectedPlan(plan);
        setContactModalOpen(true);
    } catch(e) {
        console.error(e);
        toast.error("Erro ao gerar fatura para o plano selecionado.");
    } finally {
        setLoading(false);
    }
  };

  const handleCloseContactModal = () => {
    setSelectedInvoice(null);
    setSelectedPlan(null);
    setContactModalOpen(false);
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={selectedInvoice}
        plan={selectedPlan}
      ></SubscriptionModal>

      <MainHeader>
        <Title>Assinatura</Title>
      </MainHeader>
      
      <Grid container spacing={3}>
        {/* Current License Info */}
        <Grid item xs={12}>
            <Paper className={classes.mainPaper} variant="outlined">
                <Grid container spacing={2}>
                     <Grid item xs={12} sm={6}>
                        <TextField
                          id="outlined-full-width"
                          label="Período de Licença"
                          defaultValue={returnDays(user?.company?.dueDate) <= 0 ? `Sua licença venceu!` : `Sua licença vence em ${returnDays(user?.company?.dueDate)} dias!`}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{ shrink: true }}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <TextField
                          id="outlined-full-width"
                          label="Email de cobrança"
                          defaultValue={user?.email}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{ shrink: true }}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                        />
                     </Grid>
                </Grid>
            </Paper>
        </Grid>
        
        {/* Plans List */}
        <Grid item xs={12}>
            <Typography variant="h5" component="h2" gutterBottom style={{ marginTop: 20 }}>
                Planos Disponíveis
            </Typography>
        </Grid>
        
        {plans && plans.length > 0 ? plans.map((plan) => (
          <Grid item key={plan.id} xs={12} sm={6} md={4}>
            <Card>
              <CardHeader
                title={plan.name}
                subheader={plan.description}
                titleTypographyProps={{ align: 'center' }}
                subheaderTypographyProps={{ align: 'center' }}
                action={plan.name === 'Gold' ? <StarIcon /> : null}
                className={classes.cardHeader}
              />
              <CardContent>
                <div className={classes.cardPricing}>
                  <Typography component="h2" variant="h3" color="textPrimary">
                    R$ {plan.amount ? Number(plan.amount).toLocaleString('pt-br', {minimumFractionDigits: 2}) : '0,00'}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    /mês
                  </Typography>
                </div>
                <ul>
                    <Typography component="li" variant="subtitle1" align="center">
                      {plan.users} Usuários
                    </Typography>
                    <Typography component="li" variant="subtitle1" align="center">
                      {plan.connections} Conexões
                    </Typography>
                    <Typography component="li" variant="subtitle1" align="center">
                      {plan.queues} Filas
                    </Typography>
                    {plan.useWhatsapp && <Typography component="li" variant="subtitle1" align="center">WhatsApp</Typography>}
                    {plan.useOpenAi && <Typography component="li" variant="subtitle1" align="center">OpenAI (IA)</Typography>}
                </ul>
              </CardContent>
              <CardActions>
                <Button fullWidth variant="contained" color="primary" onClick={() => handleOpenContactModal(plan)} disabled={loading}>
                  {loading ? "Processando..." : "Contratar"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )) : (
            <Grid item xs={12}>
                <Typography variant="body1" align="center">
                    Nenhum plano disponível no momento.
                </Typography>
            </Grid>
        )}
      </Grid>
    </MainContainer>
  );
};

export default Subscription;
