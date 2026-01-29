import React, { useMemo, useState, useEffect, useContext } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";

import AddIcon from "@mui/icons-material/Add";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { DevicesFold, MoreVert } from "@mui/icons-material";

import {
  Button,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
} from "@mui/material";

import FlowBuilderModal from "../../components/FlowBuilderModal";

import UploadIcon from "@mui/icons-material/Upload";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Input from "@mui/material/Input";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
  },
  mainPaper: {
    flex: 1,
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
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.palette.type === "dark" ? "0 22px 56px rgba(0,0,0,0.55)" : "0 14px 34px rgba(0,0,0,0.14)",
    },
  },
  entityCardContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
  },
  flowName: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    minWidth: 0,
  },
  flowNameText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 800,
  },
  emptyState: {
    padding: theme.spacing(4),
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
  },
}));

const FlowBuilder = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [flows, setFlows] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWebhookName, setSelectedWebhookName] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);

  const [reloadData, setReloadData] = useState(false);
  const { user } = useContext(AuthContext);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [navigationConfirmOpen, setNavigationConfirmOpen] = useState(false);
  const [successfulImport, setSuccessfulImport] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      (async () => {
        try {
          const { data } = await api.get("/flowbuilder");
          if (!isMounted) return;
          setFlows(Array.isArray(data?.flows) ? data.flows : []);
        } catch (err) {
          if (!isMounted) return;
          toastError(err);
        } finally {
          if (!isMounted) return;
          setLoading(false);
        }
      })();
    }, 300);
    return () => {
      isMounted = false;
      clearTimeout(delayDebounceFn);
    };
  }, [reloadData]);

  const filteredFlows = useMemo(() => {
    const q = (searchParam || "").trim().toLowerCase();
    if (!q) return flows;
    return flows.filter((flow) => String(flow?.name || "").toLowerCase().includes(q));
  }, [flows, searchParam]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const hadleEditContact = () => {
    setSelectedContactId(deletingContact.id);
    setSelectedWebhookName(deletingContact.name);
    setContactModalOpen(true);
  };

  const handleDeleteWebhook = async (webhookId) => {
    try {
      await api.delete(`/flowbuilder/${webhookId}`).then((res) => {
        setDeletingContact(null);
        setReloadData((old) => !old);
      });
      toast.success("Fluxo excluído com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const handleDuplicateFlow = async (flowId) => {
    try {
      await api
        .post(`/flowbuilder/duplicate`, { flowId: flowId })
        .then((res) => {
          setDeletingContact(null);
          setReloadData((old) => !old);
        });
      toast.success("Fluxo duplicado com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportLink = () => {
    history.push(`/flowbuilder/${deletingContact.id}`);
  };

  const handleExportFlow = async (flowId) => {
    try {
      toast.info("Preparando exportação do fluxo...");

      const response = await api.get(`/flowbuilder/export/${flowId}`, {
        responseType: "blob",
      });

      if (response.data.size === 0) {
        toast.error("Erro: O arquivo exportado está vazio");
        return;
      }

      const flowToExport = flows.find((wh) => wh.id === flowId);
      const flowName = flowToExport ? flowToExport.name : "fluxo";

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${flowName.replace(/\s+/g, "_").toLowerCase()}_export.json`
      );
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("Fluxo exportado com sucesso");
    } catch (error) {
      console.error("Erro ao exportar fluxo:", error);
      toast.error(
        "Erro ao exportar fluxo: " +
          (error.response?.data?.error || "Erro desconhecido")
      );
    }
  };

  const handleImportFlow = async () => {
    if (!importFile) {
      toast.error("Selecione um arquivo para importar");
      return;
    }

    if (!importFile.name.toLowerCase().endsWith(".json")) {
      toast.error("O arquivo deve ser do tipo JSON");
      return;
    }

    try {
      setImportLoading(true);
      toast.info("Importando fluxo, por favor aguarde...");

      const formData = new FormData();
      formData.append("file", importFile);

      const response = await api.post("/flowbuilder/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Fluxo "${response.data.name}" importado com sucesso!`);
      setImportModalOpen(false);
      setImportFile(null);
      setReloadData((old) => !old);

      setSuccessfulImport(true);
      setNavigationConfirmOpen(true);
    } catch (error) {
      console.error("Erro ao importar fluxo:", error);
      const errorMsg = error.response?.data?.error || "Erro desconhecido";
      toast.error(`Erro ao importar fluxo: ${errorMsg}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleNavigationConfirm = () => {
    setReloadData((old) => !old);
    setNavigationConfirmOpen(false);
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <FlowBuilderModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        flowId={selectedContactId}
        nameWebhook={selectedWebhookName}
        onSave={() => setReloadData((old) => !old)}
      ></FlowBuilderModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact ? handleDeleteWebhook(deletingContact.id) : () => {}
        }
      >
        {deletingContact
          ? `Tem certeza que deseja deletar este fluxo? Todas as integrações relacionados serão perdidos.`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `Deseja duplicar o fluxo ${deletingContact.name}?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmDuplicateOpen}
        onClose={setConfirmDuplicateOpen}
        onConfirm={(e) =>
          deletingContact ? handleDuplicateFlow(deletingContact.id) : () => {}
        }
      >
        {deletingContact
          ? `Tem certeza que deseja duplicar este fluxo?`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <Dialog open={importModalOpen} onClose={() => setImportModalOpen(false)}>
        <DialogTitle>Importar Fluxo</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Selecione um arquivo JSON exportado do FlowBuilder para importar.
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: "1px dashed #ccc",
                borderRadius: "4px",
                padding: "16px",
                marginTop: "16px",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#0872B9",
                },
              }}
            >
              <Input
                type="file"
                id="flow-import"
                accept="application/json"
                style={{ display: "none" }}
                onChange={(e) => setImportFile(e.target.files[0])}
              />
              <label htmlFor="flow-import">
                <UploadIcon sx={{ color: "#0872B9", fontSize: "40px" }} />
                <Typography
                  variant="body1"
                  sx={{ color: "#0872B9", marginTop: "8px" }}
                >
                  {importFile
                    ? `${importFile.name} (${(importFile.size / 1024).toFixed(
                        2
                      )} KB)`
                    : "Escolha um arquivo JSON"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#666", marginTop: "4px" }}
                >
                  {importFile
                    ? "Arquivo selecionado"
                    : "Clique para selecionar o arquivo"}
                </Typography>
              </label>
            </Box>
            {importFile && (
              <Typography
                variant="body2"
                sx={{ color: "green", mt: 2, textAlign: "center" }}
              >
                Arquivo pronto para importação! Clique em "Importar" para
                continuar.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleImportFlow}
            disabled={!importFile || importLoading}
            variant="contained"
            color="primary"
          >
            {importLoading ? <CircularProgress size={24} /> : "Importar"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={navigationConfirmOpen}
        onClose={handleNavigationConfirm}
      >
        <DialogTitle>Importação Concluída</DialogTitle>
        <DialogContent>
          <Typography>
            {successfulImport
              ? "Fluxo importado com sucesso! A lista foi atualizada."
              : "A lista de fluxos foi atualizada."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleNavigationConfirm}
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <MainHeader>
        <Title>Flow Builder</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            sx={{ marginLeft: "10px", marginRight: "10px" }}
            variant="contained"
            color="primary"
            onClick={() => setImportModalOpen(true)}
            startIcon={<UploadIcon />}
          >
            Importar Fluxo
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenContactModal}
            startIcon={<AddIcon />}
          >
            Adicionar Fluxo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
      >
        {filteredFlows.length === 0 && !loading && (
          <div className={classes.emptyState}>
            <Typography variant="subtitle1" color="text.primary">
              Nenhum fluxo encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie um fluxo novo ou ajuste a busca.
            </Typography>
          </div>
        )}
        <Grid container spacing={2}>
          {filteredFlows.map((flow) => (
            <Grid item xs={12} sm={6} md={4} key={flow.id}>
              <Paper
                variant="outlined"
                className={classes.entityCard}
                onClick={() => history.push(`/flowbuilder/${flow.id}`)}
              >
                <Box className={classes.entityCardContent} p={2}>
                  <div className={classes.flowName}>
                    <DevicesFold fontSize="small" />
                    <Typography className={classes.flowNameText} color="text.primary">
                      {flow.name}
                    </Typography>
                  </div>
                  <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                    <Chip
                      size="small"
                      label={flow.active ? "Ativo" : "Desativado"}
                      color={flow.active ? "primary" : "default"}
                      variant={flow.active ? "default" : "outlined"}
                    />
                    <Button
                      id="basic-button"
                      aria-controls={open ? "basic-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(e);
                        setDeletingContact(flow);
                      }}
                      sx={{ borderRadius: "36px", minWidth: "24px" }}
                    >
                      <MoreVert sx={{ width: "21px", height: "21px" }} />
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
          {loading && (
            <Grid item xs={12}>
              <CircularProgress style={{ display: "block", margin: "16px auto" }} />
            </Grid>
          )}
        </Grid>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          sx={{ borderRadius: "40px" }}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              hadleEditContact();
            }}
          >
            Editar nome
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              exportLink();
            }}
          >
            Editar fluxo
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              handleExportFlow(deletingContact.id);
            }}
          >
            Exportar Fluxo
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              setConfirmDuplicateOpen(true);
            }}
          >
            Duplicar
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              setConfirmOpen(true);
            }}
          >
            Excluir
          </MenuItem>
        </Menu>
      </Paper>
    </MainContainer>
  );
};

export default FlowBuilder;
