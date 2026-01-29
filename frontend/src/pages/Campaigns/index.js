/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useReducer, useContext, useCallback, useRef } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import AddIcon from '@mui/icons-material/Add';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import CircularProgress from "@mui/material/CircularProgress";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import DescriptionIcon from "@material-ui/icons/Description";
 

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
 
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import ForbiddenPage from "../../components/ForbiddenPage";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const campaignIndex = state.findIndex((u) => u.id === campaign.id);
        if (campaignIndex !== -1) {
          state[campaignIndex] = campaign;
        } else {
          newCampaigns.push(campaign);
        }
      });
    }

    return [...state, ...newCampaigns];
  }

  if (action.type === "UPDATE_CAMPAIGNS") {
    const campaign = action.payload;
    const campaignIndex = state.findIndex((u) => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex((u) => u.id === campaignId);
    if (campaignIndex !== -1) {
      state.splice(campaignIndex, 1);
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
    // padding: theme.spacing(1),
    padding: theme.padding,
    overflowY: "visible",
  },
  searchIcon: {
    color: theme.palette.primary.main,
  },
  entityCard: {
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
  actions: {
    justifyContent: "center",
    gap: theme.spacing(1.25),
    paddingBottom: theme.spacing(2),
  },
  actionButton: {
    borderRadius: 12,
    padding: theme.spacing(1),
  },
  actionIconReport: {
    backgroundColor: "#25D366",
    color: "#fff",
  },
  actionIconEdit: {
    backgroundColor: "#40BFFF",
    color: "#fff",
  },
  actionIconDelete: {
    backgroundColor: "#FF6B6B",
    color: "#fff",
  },
  emptyState: {
    padding: theme.spacing(4),
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
  },
  primaryButton: {
    color: "white",
    backgroundColor: theme.palette.primary.main,
    boxShadow: "none",
    borderRadius: 12,
    textTransform: "none",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: "none",
    },
  },
}));

const Campaigns = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [campaigns, dispatch] = useReducer(reducer, []);
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);


  const { datetimeToClient } = useDate();
  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useCampaigns) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    // const socket = socketManager.GetSocket();

    const onCompanyCampaign = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CAMPAIGN", payload: +data.id });
      }
    }

    socket.on(`company-${companyId}-campaign`, onCompanyCampaign);
    return () => {
      socket.off(`company-${companyId}-campaign`, onCompanyCampaign);
    };
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get("/campaigns/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CAMPAIGNS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(true);
  };

  const handleCloseCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success(i18n.t("campaigns.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCampaign(null);
    setSearchParam("");
    setPageNumber(1);
  };

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

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return "Inativa";
      case "PROGRAMADA":
        return "Programada";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "CANCELADA":
        return "Cancelada";
      case "FINALIZADA":
        return "Finalizada";
      default:
        return val;
    }
  };

  const cancelCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingCampaign &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${deletingCampaign.name}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingCampaign.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      {campaignModalOpen && (
        <CampaignModal
          resetPagination={() => {
            setPageNumber(1);
            fetchCampaigns();
          }}
          open={campaignModalOpen}
          onClose={handleCloseCampaignModal}
          aria-labelledby="form-dialog-title"
          campaignId={selectedCampaign && selectedCampaign.id}
        />
      )}
      {
        user.profile === "user"?
          <ForbiddenPage />
          :
          <>
            <MainHeader>
              <Grid style={{ width: "99.6%" }} container>
                <Grid xs={12} sm={8} item>
                  <Title>{i18n.t("campaigns.title")}</Title>
                </Grid>
                <Grid xs={12} sm={4} item>
                  <Grid spacing={2} container>
                    <Grid xs={6} sm={6} item>
                      <TextField
                        fullWidth
                        placeholder={i18n.t("campaigns.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon className={classes.searchIcon} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid xs={6} sm={6} item>
                      <Button
                        startIcon={<AddIcon />}
                        fullWidth
                        variant="contained"
                        onClick={handleOpenCampaignModal}
                        className={classes.primaryButton}
                      >
                        {i18n.t("campaigns.buttons.add")}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </MainHeader>
            <Paper
              className={classes.mainPaper}
              variant="outlined"
            >
<Grid container spacing={2}>
  {!loading && campaigns.length === 0 && (
    <Grid item xs={12}>
      <div className={classes.emptyState}>
        <Typography variant="subtitle1" color="text.primary">
          Nenhuma campanha encontrada
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crie uma campanha ou ajuste a busca.
        </Typography>
      </div>
    </Grid>
  )}
  {campaigns.map((campaign) => (
      <Grid item xs={12} sm={6} md={4} key={campaign.id}>
        <Card
          variant="outlined"
          className={classes.entityCard}
       >
          <CardContent>
            <Typography variant="h6" color="text.primary" align="center">
              {campaign.name}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Status: {formatStatus(campaign.status)}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Lista de Contatos: {campaign.contactListId ? campaign.contactList.name : "Não definida"}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              WhatsApp: {campaign.whatsappId ? campaign.whatsapp.name : "Não definido"}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Agendamento: {campaign.scheduledAt ? datetimeToClient(campaign.scheduledAt) : "Sem agendamento"}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Conclusão: {campaign.completedAt ? datetimeToClient(campaign.completedAt) : "Não concluída"}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Confirmação: {campaign.confirmation ? "Habilitada" : "Desabilitada"}
            </Typography>
          </CardContent>
          <CardActions className={classes.actions}>
  <IconButton
    onClick={() => history.push(`/campaign/${campaign.id}/report`)}
    size="small"
    className={`${classes.actionButton} ${classes.actionIconReport}`}
  >
    <DescriptionIcon />
  </IconButton>

  <IconButton
    size="small"
    onClick={() => handleEditCampaign(campaign)}
    className={`${classes.actionButton} ${classes.actionIconEdit}`}
  >
    <EditIcon />
  </IconButton>

  <IconButton
    size="small"
    onClick={() => {
      setConfirmModalOpen(true);
      setDeletingCampaign(campaign);
    }}
    className={`${classes.actionButton} ${classes.actionIconDelete}`}
  >
    <DeleteOutlineIcon />
  </IconButton>
</CardActions>
        </Card>
      </Grid>
    ))}
  {loading && (
    <Grid item xs={12}>
      <CircularProgress style={{ display: "block", margin: "16px auto" }} />
    </Grid>
  )}
</Grid>
              <div ref={loadMoreSentinelRef} />

            </Paper>
          </>}
    </MainContainer>
  );
};

export default Campaigns;
