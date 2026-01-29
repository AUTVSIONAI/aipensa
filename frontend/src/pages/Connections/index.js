import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { add, format, parseISO } from "date-fns";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Table,
  TableHead,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
} from "@material-ui/core";
import {
  Edit,
  CheckCircle,
  SignalCellularConnectedNoInternet2Bar,
  SignalCellularConnectedNoInternet0Bar,
  SignalCellular4Bar,
  CropFree,
  DeleteOutline,
  Facebook,
  Instagram,
  WhatsApp,
} from "@material-ui/icons";

import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import Grid from "@mui/material/Grid";
import CardActions from "@mui/material/CardActions";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import formatSerializedId from "../../utils/formatSerializedId";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import { Can } from "../../components/Can";
import moment from "moment";
import QrCodeIcon from "@mui/icons-material/QrCode";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import LogoutIcon from "@mui/icons-material/Logout";
import RepeatIcon from "@mui/icons-material/Repeat";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ChannelModal from "../../HubEcosystem/components/ChannelModal";
import notificame_logo from "../../assets/notificame_logo.png";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.padding,
    overflowY: "visible",
  },
  emptyState: {
    padding: theme.spacing(4),
    borderRadius: 16,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
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
  actionsRow: {
    justifyContent: "center",
    gap: theme.spacing(1.25),
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  actionButton: {
    borderRadius: 12,
    minWidth: 44,
    width: 44,
    height: 44,
    boxShadow: "none",
    color: "white",
  },
  actionEdit: {
    background: theme.palette.primary.main,
    "&:hover": {
      background: theme.palette.primary.dark,
    },
  },
  actionDelete: {
    background: theme.palette.error.main,
    "&:hover": {
      background: theme.palette.error.dark,
    },
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(14),
    border: "1px solid #dadde9",
    maxWidth: 450,
  },
  tooltipPopper: {
    textAlign: "center",
  },
  buttonProgress: {
    color: green[500],
  },
}));

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const CustomToolTip = ({ title, content, children }) => {
  const classes = useStyles();

  return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper,
      }}
      title={
        <React.Fragment>
          <Typography gutterBottom color="inherit">
            {title}
          </Typography>
          {content && <Typography>{content}</Typography>}
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
  );
};

const IconChannel = (channel) => {
  switch (channel) {
    case "facebook":
      return <Facebook style={{ color: "#3b5998" }} />;
    case "instagram":
      return <Instagram style={{ color: "#e1306c" }} />;
    case "whatsapp":
      return <WhatsApp style={{ color: "#25d366" }} />;
    default:
      return "error";
  }
};

const Connections = () => {
  const classes = useStyles();

  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [statusImport, setStatusImport] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hubChannelModalOpen, setHubChannelModalOpen] = useState(false);
  const { handleLogout } = useContext(AuthContext);
  const history = useHistory();
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );
  const [planConfig, setPlanConfig] = useState(false);

  const { user, socket } = useContext(AuthContext);

  const companyId = user.companyId;

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      setPlanConfig(planConfigs);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  var before = moment(moment().format()).isBefore(user.company.dueDate);

  if (before !== true) {
    handleLogout();
  }

  const responseFacebook = (response) => {
    if (response.status !== "unknown") {
      const accessToken = response.accessToken;
      const id = response.id || response.userID;

      api
        .post("/facebook/", {
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  const responseInstagram = (response) => {
    if (response.status !== "unknown") {
      const accessToken = response.accessToken;
      const id = response.id || response.userID;

      api
        .post("/facebook/", {
          addInstagram: true,
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          if (response.data.count === 0) {
            toast.warn("Nenhuma conta do Instagram Business encontrada. Verifique se você selecionou a conta do Instagram e concedeu as permissões necessárias no login do Facebook.");
          } else {
            toast.success(i18n.t("connections.facebook.success"));
          }
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  useEffect(() => {
    if (!process.env.REACT_APP_FACEBOOK_APP_ID) {
      console.warn("REACT_APP_FACEBOOK_APP_ID não definido: conexão Facebook/Instagram ficará desativada.");
    }
  }, []);

  useEffect(() => {
    socket.on(`importMessages-${user.companyId}`, (data) => {
      if (data.action === "refresh") {
        setStatusImport([]);
        history.go(0);
      }
      if (data.action === "update") {
        setStatusImport(data.status);
      }
    });
  }, [whatsApps]);

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleEditWhatsApp = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
      });
    }
    if (action === "closedImported") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.closedImportedTitle"),
        message: i18n.t("connections.confirmationModal.closedImportedMessage"),
        whatsAppId: whatsAppId,
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.deleted"));
      } catch (err) {
        toastError(err);
      }
    }
    if (confirmModalInfo.action === "closedImported") {
      try {
        await api.post(`/closedimported/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.closedimported"));
      } catch (err) {
        toastError(err);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const renderImportButton = (whatsApp) => {
    if (whatsApp?.statusImportMessages === "renderButtonCloseTickets") {
      return (
        <Button
          style={{ marginLeft: 12 }}
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => {
            handleOpenConfirmationModal("closedImported", whatsApp.id);
          }}
        >
          {i18n.t("connections.buttons.closedImported")}
        </Button>
      );
    }

    if (whatsApp?.importOldMessages) {
      let isTimeStamp = !isNaN(
        new Date(Math.floor(whatsApp?.statusImportMessages)).getTime()
      );

      if (isTimeStamp) {
        const ultimoStatus = new Date(
          Math.floor(whatsApp?.statusImportMessages)
        ).getTime();
        const dataLimite = +add(ultimoStatus, { seconds: +35 }).getTime();
        if (dataLimite > new Date().getTime()) {
          return (
            <>
              <Button
                disabled
                style={{ marginLeft: 12 }}
                size="small"
                endIcon={
                  <CircularProgress
                    size={12}
                    className={classes.buttonProgress}
                  />
                }
                variant="outlined"
                color="primary"
              >
                {i18n.t("connections.buttons.preparing")}
              </Button>
            </>
          );
        }
      }
    }
  };

  const renderActionButtons = (whatsApp) => {
    return (
      <>
        {whatsApp.status === "qrcode" && (
          <Can
            role={
              user.profile === "user" && user.allowConnections === "enabled"
                ? "admin"
                : user.profile
            }
            perform="connections-page:addConnection"
            yes={() => (
              <Button
                startIcon={<QrCodeIcon />}
                size="small"
                variant="contained"
                style={{
                  color: "white",
                  backgroundColor: "#437db5",
                  boxShadow: "none",
                  borderRadius: "5px",
                }}
                onClick={() => handleOpenQrModal(whatsApp)}
              >
                {i18n.t("connections.buttons.qrcode")}
              </Button>
            )}
          />
        )}
        {whatsApp.status === "DISCONNECTED" && (
          <Can
            role={
              user.profile === "user" && user.allowConnections === "enabled"
                ? "admin"
                : user.profile
            }
            perform="connections-page:addConnection"
            yes={() => (
              <>
                <Button
                  startIcon={<RepeatIcon />}
                  size="small"
                  variant="outlined"
                  style={{
                    color: "white",
                    backgroundColor: "#4ec24e",
                    boxShadow: "none",
                    borderRadius: "5px",
                  }}
                  onClick={() => handleStartWhatsAppSession(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.tryAgain")}
                </Button>{" "}
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  variant="outlined"
                  style={{
                    color: "white",
                    backgroundColor: "#8A2BE2",
                    boxShadow: "none",
                    borderRadius: "5px",
                  }}
                  onClick={() => handleRequestNewQrCode(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.newQr")}
                </Button>
              </>
            )}
          />
        )}
        {(whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT") && (
          <Can
            role={user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <>
                <Button
                  startIcon={<LogoutIcon />}
                  size="small"
                  variant="outlined"
                  style={{
                    color: "white",
                    backgroundColor: "#db6565",
                    boxShadow: "none",
                    borderRadius: "5px",
                  }}
                  onClick={() => {
                    handleOpenConfirmationModal("disconnect", whatsApp.id);
                  }}
                >
                  {i18n.t("connections.buttons.disconnect")}
                </Button>

                {renderImportButton(whatsApp)}
              </>
            )}
          />
        )}
        {whatsApp.status === "OPENING" && (
          <Button size="small" variant="outlined" disabled color="default">
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </>
    );
  };

  const renderStatusToolTips = (whatsApp) => {
    return (
      <div className={classes.customTableCell}>
        {whatsApp.status === "DISCONNECTED" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.disconnected.title")}
            content={i18n.t("connections.toolTips.disconnected.content")}
          >
            <SignalCellularConnectedNoInternet0Bar color="secondary" />
          </CustomToolTip>
        )}
        {whatsApp.status === "OPENING" && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
        {whatsApp.status === "qrcode" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.qrcode.title")}
            content={i18n.t("connections.toolTips.qrcode.content")}
          >
            <CropFree style={{ color: "#4ec24e" }} />
          </CustomToolTip>
        )}
        {whatsApp.status === "CONNECTED" && (
          <CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
            <SignalCellular4Bar style={{ color: green[500] }} />
          </CustomToolTip>
        )}
        {(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.timeout.title")}
            content={i18n.t("connections.toolTips.timeout.content")}
          >
            <SignalCellularConnectedNoInternet2Bar color="secondary" />
          </CustomToolTip>
        )}
      </div>
    );
  };

  const restartWhatsapps = async () => {
    try {
      await api.post(`/whatsapp-restart/`);
      toast.success(i18n.t("connections.waitConnection"));
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      {qrModalOpen && (
        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
        />
      )}
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
      />
      {user.profile === "user" && user.allowConnections === "disabled" ? (
        <ForbiddenPage />
      ) : (
        <>
          <MainHeader>
            <Title>
              {i18n.t("connections.title")} ({whatsApps.length})
            </Title>
            <MainHeaderButtonsWrapper>
              <Button
                startIcon={<RestartAltIcon />}
                variant="contained"
                style={{
                  color: "white",
                  backgroundColor: "#444394",
                  boxShadow: "none",
                  borderRadius: "5px",
                }}
                onClick={restartWhatsapps}
              >
                {i18n.t("connections.restartConnections")}
              </Button>

              <Button
                startIcon={<WhatsAppIcon />}
                variant="contained"
                style={{
                  color: "white",
                  backgroundColor: "#6959CD",
                  boxShadow: "none",
                  borderRadius: "5px",
                }}
                onClick={() =>
                  openInNewTab(`https://wa.me/${process.env.REACT_APP_SUPPORT_WHATSAPP}`)
                }
              >
                {i18n.t("connections.callSupport")}
              </Button>
              <PopupState variant="popover" popupId="demo-popup-menu">
                {(popupState) => (
                  <React.Fragment>
                    <Can
                      role={user.profile}
                      perform="connections-page:addConnection"
                      yes={() => (
                        <>
                          <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            style={{
                              color: "white",
                              backgroundColor: "#FFA500",
                              boxShadow: "none",
                              borderRadius: "5px",
                            }}
                            {...bindTrigger(popupState)}
                          >
                            {i18n.t("connections.newConnection")}
                          </Button>
                          <Menu {...bindMenu(popupState)}>
                            {/* WHATSAPP */}
                            <MenuItem
                              disabled={
                                planConfig?.plan?.useWhatsapp ? false : true
                              }
                              onClick={() => {
                                handleOpenWhatsAppModal();
                                popupState.close();
                              }}
                            >
                              <WhatsApp
                                fontSize="small"
                                style={{
                                  marginRight: "10px",
                                  color: "#25D366",
                                }}
                              />
                              WhatsApp
                            </MenuItem>

                            <FacebookLogin
                              appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                              autoLoad={false}
                              fields="name,email,picture"
                              version="13.0"
                              scope="public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                              redirectUri={window.location.origin}
                              callback={(response) => {
                                responseFacebook(response);
                                popupState.close();
                              }}
                              render={renderProps => (
                                <MenuItem
                                  disabled={!process.env.REACT_APP_FACEBOOK_APP_ID}
                                  onClick={(e) => {
                                    if (!process.env.REACT_APP_FACEBOOK_APP_ID) return;
                                    renderProps.onClick(e);
                                    popupState.close();
                                  }}
                                >
                                  <Facebook
                                    fontSize="small"
                                    style={{
                                      marginRight: "10px",
                                      color: "#3b5998",
                                    }}
                                  />
                                  Facebook
                                </MenuItem>
                              )}
                            />

                            <FacebookLogin
                              appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                              autoLoad={false}
                              fields="name,email,picture"
                              version="13.0"
                              scope="public_profile,instagram_basic,instagram_manage_messages,instagram_manage_comments,instagram_manage_insights,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management,ads_management,ads_read"
                              auth_type="reauthenticate"
                              redirectUri={window.location.origin}
                              callback={(response) => {
                                responseInstagram(response);
                                popupState.close();
                              }}
                              render={renderProps => (
                                <MenuItem
                                  disabled={!process.env.REACT_APP_FACEBOOK_APP_ID}
                                  onClick={(e) => {
                                    if (!process.env.REACT_APP_FACEBOOK_APP_ID) return;
                                    renderProps.onClick(e);
                                    popupState.close();
                                  }}
                                >
                                  <Instagram
                                    fontSize="small"
                                    style={{
                                      marginRight: "10px",
                                      color: "#e1306c",
                                    }}
                                  />
                                  Instagram
                                </MenuItem>
                              )}
                            />


                            {/* NOTIFICAME HUB */}
                            <MenuItem
                              onClick={() => setHubChannelModalOpen(true)}
                            >
                              <img
                                src={notificame_logo}
                                fontSize="small"
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  marginRight: "10px",
                                  marginLeft: "2px",
                                  color: "#25D366",
                                }}
                              />
                              NotificaMe Hub
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    />
                  </React.Fragment>
                )}
              </PopupState>
            </MainHeaderButtonsWrapper>
          </MainHeader>

          {statusImport?.all ? (
            <>
              <div style={{ margin: "auto", marginBottom: 12 }}>
                <Card className={classes.root}>
                  <CardContent className={classes.content}>
                    <Typography component="h5" variant="h5">
                      {statusImport?.this === -1
                        ? i18n.t("connections.buttons.preparing")
                        : i18n.t("connections.buttons.importing")}
                    </Typography>
                    {statusImport?.this === -1 ? (
                      <Typography component="h6" variant="h6" align="center">
                        <CircularProgress size={24} />
                      </Typography>
                    ) : (
                      <>
                        <Typography component="h6" variant="h6" align="center">
                          {`${i18n.t(`connections.typography.processed`)} ${
                            statusImport?.this
                          } ${i18n.t(`connections.typography.in`)} ${
                            statusImport?.all
                          }  ${i18n.t(`connections.typography.date`)}: ${
                            statusImport?.date
                          } `}
                        </Typography>
                        <Typography align="center">
                          <CircularProgressWithLabel
                            style={{ margin: "auto" }}
                            value={
                              (statusImport?.this / statusImport?.all) * 100
                            }
                          />
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}

          <Paper className={classes.mainPaper} variant="outlined">
            <Grid container spacing={2}>
              {loading ? (
                <Grid item xs={12}>
                  <Card variant="outlined" style={{ padding: "10px" }}>
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t("loading")}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                <>
                  {(!whatsApps || whatsApps.length === 0) && (
                    <Grid item xs={12}>
                      <div className={classes.emptyState}>
                        <Typography variant="subtitle1" color="textPrimary">
                          Nenhuma conexão encontrada
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Adicione uma conexão para começar a atender.
                        </Typography>
                      </div>
                    </Grid>
                  )}
                  {whatsApps?.length > 0 &&
                    whatsApps.map((whatsApp) => (
                      <Grid item xs={12} sm={6} md={4} key={whatsApp.id}>
                        <Card variant="outlined" className={classes.entityCard}>
                          <CardContent>
                            <Typography variant="subtitle1" color="textPrimary" align="center">
                              {IconChannel(whatsApp.channel)}
                            </Typography>
                            <Typography variant="subtitle2" align="center">
                              {whatsApp.channel === "instagram" && (
                                <span style={{ fontSize: "0.8em", color: "#e1306c", display: "block", marginBottom: "5px" }}>
                                  (Instagram)
                                </span>
                              )}
                              {i18n.t("connections.table.name")}: {whatsApp.name}
                            </Typography>
                            <Typography variant="body2" align="center">
                              {i18n.t("connections.table.number")}:{" "}
                              {whatsApp.number && whatsApp.channel === "whatsapp"
                                ? formatSerializedId(whatsApp.number)
                                : whatsApp.number}
                            </Typography>
                            <Typography variant="body2" align="center" component="div">
                              {i18n.t("connections.table.status")}: {renderStatusToolTips(whatsApp)}
                            </Typography>
                            <Typography variant="body2" align="center" component="div">
                              {i18n.t("connections.table.session")}: {renderActionButtons(whatsApp)}
                            </Typography>
                            <Typography variant="body2" align="center">
                              {i18n.t("connections.table.lastUpdate")}: {format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
                            </Typography>
                            {whatsApp.isDefault && (
                              <Typography variant="body2" align="center" style={{ color: green[500] }}>
                                {i18n.t("connections.table.default")}
                              </Typography>
                            )}
                          </CardContent>
                          <Can
                            role={user.profile}
                            perform="connections-page:addConnection"
                            yes={() => (
                              <CardActions className={classes.actionsRow}>
                                <Button
                                  variant="contained"
                                  className={`${classes.actionButton} ${classes.actionEdit}`}
                                  onClick={() => handleEditWhatsApp(whatsApp)}
                                >
                                  <Edit fontSize="small" />
                                </Button>
                                <Button
                                  variant="contained"
                                  className={`${classes.actionButton} ${classes.actionDelete}`}
                                  onClick={() => handleOpenConfirmationModal("delete", whatsApp.id)}
                                >
                                  <DeleteOutline fontSize="small" />
                                </Button>
                              </CardActions>
                            )}
                          />
                        </Card>
                      </Grid>
                    ))}
                </>
              )}
            </Grid>
          </Paper>
        </>
      )}
      <ChannelModal
        open={hubChannelModalOpen}
        onClose={() => setHubChannelModalOpen(false)}
      />
    </MainContainer>
  );
};

export default Connections;
