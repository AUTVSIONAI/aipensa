/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import DescriptionIcon from "@material-ui/icons/Description";
import TimerOffIcon from "@material-ui/icons/TimerOff";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AddCircle, Build, DevicesFold, TextFields } from "@mui/icons-material";
import { Chip, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { Can } from "../../components/Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import CampaignModalPhrase from "../../components/CampaignModalPhrase";
import { colorBackgroundTable } from "../../styles/styles";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    borderRadius: 12,
    padding: theme.spacing(1),
    overflowY: "visible",
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
  emptyState: {
    padding: theme.spacing(4),
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
  },
}));

const CampaignsPhrase = () => {
  const classes = useStyles();

  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);

  const [campaignflows, setCampaignFlows] = useState([]);
  const [ModalOpenPhrase, setModalOpenPhrase] = useState(false);
  const [campaignflowSelected, setCampaignFlowSelected] = useState();

  const handleDeleteCampaign = async campaignId => {
    try {
      await api.delete(`/flowcampaign/${campaignId}`);
      toast.success("Frase deletada");
      getCampaigns()
    } catch (err) {
      toastError(err);
    }
    
  };

  const getCampaigns =  async() => {
    setLoading(true);
    await api.get("/flowcampaign").then(res => {
      setCampaignFlows(res.data.flow);
      setLoading(false);
    });
  };

  const onSaveModal = () => {
    getCampaigns()
  }

  useEffect(() => {
    getCampaigns();
  }, []);

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingContact &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${
            deletingContact.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingContact.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CampaignModalPhrase
        open={ModalOpenPhrase}
        onClose={() => setModalOpenPhrase(false)}
        FlowCampaignId={campaignflowSelected}
        onSave={onSaveModal}
      />
      <MainHeader>
        <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} sm={8} item>
            <Title>Fluxo de Campanha</Title>
          </Grid>
          <Grid xs={12} sm={4} item>
            <Grid spacing={2} container>
              <Grid xs={6} sm={6} item>
                {/* <TextField
                  fullWidth
                  placeholder={i18n.t("campaigns.searchPlaceholder")}
                  type="search"
                  value={searchParam}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "gray" }} />
                      </InputAdornment>
                    ),
                  }}
                /> */}
              </Grid>
              <Grid xs={6} sm={6} item>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setCampaignFlowSelected();
                    setModalOpenPhrase(true);
                  }}
                  color="primary"
                  style={{ textTransform: "none" }}
                >
                  <Stack direction={"row"} gap={1}>
                    <AddCircle />
                    {"Campanha"}
                  </Stack>
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
        {!loading && campaignflows.length === 0 && (
          <div className={classes.emptyState}>
            <Typography variant="subtitle1" color="text.primary">
              Nenhuma campanha encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clique em “Campanha” para criar um novo fluxo.
            </Typography>
          </div>
        )}
        <Grid container spacing={2}>
          {!loading &&
            campaignflows.map((flow) => (
              <Grid item xs={12} sm={6} md={4} key={flow.id}>
                <Paper variant="outlined" className={classes.entityCard}>
                  <Stack spacing={1} style={{ padding: 16 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextFields fontSize="small" />
                      <Typography variant="subtitle1" color="text.primary" style={{ fontWeight: 800 }}>
                        {flow.name}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Chip
                        size="small"
                        label={flow.status ? "Ativo" : "Desativado"}
                        color={flow.status ? "primary" : "default"}
                        variant={flow.status ? "default" : "outlined"}
                      />
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setCampaignFlowSelected(flow.id);
                            setModalOpenPhrase(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <Can
                          role={user.profile}
                          perform="contacts-page:deleteContact"
                          yes={() => (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setConfirmModalOpen(true);
                                setDeletingContact(flow);
                              }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          )}
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          {loading && (
            <Grid item xs={12}>
              <Stack justifyContent={"center"} alignItems={"center"} minHeight={"50vh"}>
                <CircularProgress />
              </Stack>
            </Grid>
          )}
        </Grid>
      </Paper>
    </MainContainer>
  );
};

export default CampaignsPhrase;
