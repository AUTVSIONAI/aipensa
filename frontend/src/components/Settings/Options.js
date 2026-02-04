import React, { useEffect, useState, useContext } from "react";

import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputAdornment from "@material-ui/core/InputAdornment";

import useSettings from "../../hooks/useSettings";
import { ToastContainer, toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";

import Switch from "@material-ui/core/Switch";
import { TextField, Typography, Box } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import useCompanySettings from "../../hooks/useSettings/companySettings";

// Ícones nativos do Material-UI
import ChatIcon from "@material-ui/icons/Chat";
import ScheduleIcon from "@material-ui/icons/Schedule";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import StarIcon from "@material-ui/icons/Star";
import SendIcon from "@material-ui/icons/Send";
import PeopleIcon from "@material-ui/icons/People";
import TransferWithinAStationIcon from "@material-ui/icons/TransferWithinAStation";
import CallIcon from "@material-ui/icons/Call";
import SignatureIcon from "@material-ui/icons/Edit"; // Substituído por um ícone genérico
import QueueIcon from "@material-ui/icons/Queue";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import MicIcon from "@material-ui/icons/Mic";
import SecurityIcon from "@material-ui/icons/Security";
import TagIcon from "@material-ui/icons/Label"; // Substituído por um ícone genérico
import CloseIcon from "@material-ui/icons/Close";
import NotificationsIcon from "@material-ui/icons/Notifications";
import LinkIcon from "@material-ui/icons/Link";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import PhoneIcon from "@material-ui/icons/Phone";
import PaymentIcon from "@material-ui/icons/Payment";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import LockIcon from "@material-ui/icons/Lock";
import DownloadIcon from "@material-ui/icons/GetApp";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  switchContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    width: "100%",
  },
  switchLabel: (props) => ({
    fontSize: props && props.density === "compact" ? "0.875rem" : "0.95rem",
    color: theme.palette.text.secondary,
  }),
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: (props) => ({
    width: "100%",
    textAlign: "left",
    padding: theme.spacing(props && props.density === "compact" ? 1.5 : 1.75),
    borderRadius: 14,
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.45)" : "rgba(255, 255, 255, 0.85)",
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(16px)",
    boxShadow: theme.palette.type === "dark"
      ? "0 12px 32px rgba(0,0,0,0.35)"
      : "0 6px 18px rgba(0,0,0,0.06)",
    minHeight: 104,
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
    "&:before": {
      content: '""',
      position: "absolute",
      inset: 0,
      opacity: theme.palette.type === "dark" ? 0.55 : 0.25,
      background: "radial-gradient(600px 140px at 20% 0%, rgba(0, 242, 255, 0.22) 0%, rgba(0,0,0,0) 55%), radial-gradient(520px 140px at 85% 40%, rgba(189, 0, 255, 0.18) 0%, rgba(0,0,0,0) 60%)",
      pointerEvents: "none",
    },
    "&:after": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: "linear-gradient(180deg, #00f2ff 0%, #bd00ff 100%)",
      opacity: 0.75,
      pointerEvents: "none",
    },
    "& > *": {
      position: "relative",
      zIndex: 1,
    },
    "&:hover": {
      transform: "translateY(-1px)",
      borderColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)",
      boxShadow: theme.palette.type === "dark"
        ? "0 18px 44px rgba(0,0,0,0.45)"
        : "0 12px 32px rgba(0,0,0,0.10)",
    },
    "& .MuiInputBase-root": {
      background: "transparent",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
    },
    "& .MuiInputAdornment-root": {
      flexShrink: 0,
    },
    "& .MuiInputAdornment-positionStart": {
      minWidth: 34,
      marginRight: theme.spacing(1),
    },
    "& .MuiInputAdornment-positionStart > *": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": {
      fontSize: props && props.density === "compact" ? 23 : 24,
      flexShrink: 0,
    },
    "& .MuiInputLabel-root": {
      fontWeight: 700,
    },
  }),
  sectionTitle: {
    fontWeight: 800,
    letterSpacing: 0.2,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
  sectionHeaderIcon: (props) => ({
    width: props && props.density === "compact" ? 46 : 48,
    height: props && props.density === "compact" ? 46 : 48,
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: theme.palette.type === "dark" ? "0 18px 44px rgba(0,0,0,0.45)" : "0 12px 32px rgba(0,0,0,0.10)",
    flexShrink: 0,
  },
  sectionSubtitle: {
    opacity: 0.85,
  },
  sectionBlock: (props) => ({
    padding: theme.spacing(props && props.density === "compact" ? 2.25 : 2.5),
    marginBottom: theme.spacing(2),
    borderRadius: 18,
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.25)" : "rgba(255, 255, 255, 0.6)",
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(18px)",
  },
  sectionGuide: {
    margin: theme.spacing(1, 0, 2, 0),
    padding: theme.spacing(1.5),
    borderRadius: 12,
    border: theme.palette.type === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.type === "dark" ? "rgba(17, 24, 39, 0.25)" : "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(10px)",
  },
  tab: {
    backgroundColor: theme.mode === 'light' ? "#f2f2f2" : "#7f7f7f",
    borderRadius: 0,
    width: "100%",
    "& .MuiTabs-flexContainer": {
      justifyContent: "center"
    }
  },
}));

export default function Options(props) {
  const { oldSettings, settings, scheduleTypeChanged, user, density = "comfortable", activeSection } = props;

  const classes = useStyles({ density });
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [chatBotType, setChatBotType] = useState("text");

  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);

  const [userCreation, setUserCreation] = useState("disabled");
  const [loadingUserCreation, setLoadingUserCreation] = useState(false);

  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("enabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);

  const [UserRandom, setUserRandom] = useState("enabled");
  const [loadingUserRandom, setLoadingUserRandom] = useState(false);

  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("enabled");
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] = useState(false);

  const [AcceptCallWhatsapp, setAcceptCallWhatsapp] = useState("enabled");
  const [loadingAcceptCallWhatsapp, setLoadingAcceptCallWhatsapp] = useState(false);

  const [sendSignMessage, setSendSignMessage] = useState("enabled");
  const [loadingSendSignMessage, setLoadingSendSignMessage] = useState(false);

  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] = useState("enabled");
  const [loadingSendGreetingMessageOneQueues, setLoadingSendGreetingMessageOneQueues] = useState(false);

  const [sendQueuePosition, setSendQueuePosition] = useState("enabled");
  const [loadingSendQueuePosition, setLoadingSendQueuePosition] = useState(false);

  const [sendFarewellWaitingTicket, setSendFarewellWaitingTicket] = useState("enabled");
  const [loadingSendFarewellWaitingTicket, setLoadingSendFarewellWaitingTicket] = useState(false);

  const [acceptAudioMessageContact, setAcceptAudioMessageContact] = useState("enabled");
  const [loadingAcceptAudioMessageContact, setLoadingAcceptAudioMessageContact] = useState(false);

  // PAYMENT METHODS
  const [eficlientidType, setEfiClientidType] = useState('');
  const [loadingEfiClientidType, setLoadingEfiClientidType] = useState(false);

  const [eficlientsecretType, setEfiClientsecretType] = useState('');
  const [loadingEfiClientsecretType, setLoadingEfiClientsecretType] = useState(false);

  const [efichavepixType, setEfiChavepixType] = useState('');
  const [loadingEfiChavepixType, setLoadingEfiChavepixType] = useState(false);

  const [mpaccesstokenType, setmpaccesstokenType] = useState('');
  const [loadingmpaccesstokenType, setLoadingmpaccesstokenType] = useState(false);

  const [stripeprivatekeyType, setstripeprivatekeyType] = useState('');
  const [loadingstripeprivatekeyType, setLoadingstripeprivatekeyType] = useState(false);

  const [asaastokenType, setasaastokenType] = useState('');
  const [loadingasaastokenType, setLoadingasaastokenType] = useState(false);

  // OPENAI API KEY TRANSCRIÇÃO DE ÁUDIO
  const [openaitokenType, setopenaitokenType] = useState('');
  const [loadingopenaitokenType, setLoadingopenaitokenType] = useState(false);
  
  // OPENROUTER API KEY
  const [openroutertokenType, setopenroutertokenType] = useState('');
  const [loadingopenroutertokenType, setLoadingopenroutertokenType] = useState(false);

  // LGPD
  const [enableLGPD, setEnableLGPD] = useState("disabled");
  const [loadingEnableLGPD, setLoadingEnableLGPD] = useState(false);

  const [lgpdMessage, setLGPDMessage] = useState("");
  const [loadinglgpdMessage, setLoadingLGPDMessage] = useState(false);

  const [lgpdLink, setLGPDLink] = useState("");
  const [loadingLGPDLink, setLoadingLGPDLink] = useState(false);

  const [lgpdDeleteMessage, setLGPDDeleteMessage] = useState("disabled");
  const [loadingLGPDDeleteMessage, setLoadingLGPDDeleteMessage] = useState(false);

  // LIMITAR DOWNLOAD
  const [downloadLimit, setdownloadLimit] = useState("64");
  const [loadingDownloadLimit, setLoadingdownloadLimit] = useState(false);

  const [lgpdConsent, setLGPDConsent] = useState("disabled");
  const [loadingLGPDConsent, setLoadingLGPDConsent] = useState(false);

  const [lgpdHideNumber, setLGPDHideNumber] = useState("disabled");
  const [loadingLGPDHideNumber, setLoadingLGPDHideNumber] = useState(false);

  // Tag obrigatória
  const [requiredTag, setRequiredTag] = useState("enabled");
  const [loadingRequiredTag, setLoadingRequiredTag] = useState(false);

  // Fechar ticket ao transferir para outro setor
  const [closeTicketOnTransfer, setCloseTicketOnTransfer] = useState(false);
  const [loadingCloseTicketOnTransfer, setLoadingCloseTicketOnTransfer] = useState(false);

  // Usar carteira de clientes
  const [directTicketsToWallets, setDirectTicketsToWallets] = useState(false);
  const [loadingDirectTicketsToWallets, setLoadingDirectTicketsToWallets] = useState(false);

  // MENSAGENS CUSTOMIZADAS
  const [transferMessage, setTransferMessage] = useState("");
  const [loadingTransferMessage, setLoadingTransferMessage] = useState(false);

  const [greetingAcceptedMessage, setGreetingAcceptedMessage] = useState("");
  const [loadingGreetingAcceptedMessage, setLoadingGreetingAcceptedMessage] = useState(false);

  const [AcceptCallWhatsappMessage, setAcceptCallWhatsappMessage] = useState("");
  const [loadingAcceptCallWhatsappMessage, setLoadingAcceptCallWhatsappMessage] = useState(false);

  const [sendQueuePositionMessage, setSendQueuePositionMessage] = useState("");
  const [loadingSendQueuePositionMessage, setLoadingSendQueuePositionMessage] = useState(false);

  const [showNotificationPending, setShowNotificationPending] = useState(false);
  const [loadingShowNotificationPending, setLoadingShowNotificationPending] = useState(false);

  const [notificameHubToken, setNotificameHubToken] = useState("");
  const [loadingNotificameHubToken, setLoadingNotificameHubToken] = useState(false);
  
  const [enableAutoStatus, setEnableAutoStatus] = useState("disabled");
  const [loadingEnableAutoStatus, setLoadingEnableAutoStatus] = useState(false);

  const { update: updateUserCreation, getAll } = useSettings();
  const { update: updatedownloadLimit } = useSettings();
  const { update: updateeficlientid } = useSettings();
  const { update: updateeficlientsecret } = useSettings();
  const { update: updateefichavepix } = useSettings();
  const { update: updatempaccesstoken } = useSettings();
  const { update: updatestripeprivatekey } = useSettings();
  const { update: updateasaastoken } = useSettings();
  const { update: updateopenaitoken } = useSettings();
  const { update: updateopenroutertoken } = useSettings();
  const { update } = useCompanySettings();

  const isSuper = () => {
    return user.super;
  };
  const show = (id) => !activeSection || activeSection === id;

  useEffect(() => {
    if (Array.isArray(oldSettings) && oldSettings.length) {
      const userPar = oldSettings.find((s) => s.key === "userCreation");
      if (userPar) setUserCreation(userPar.value);

      const downloadLimit = oldSettings.find((s) => s.key === "downloadLimit");
      if (downloadLimit) setdownloadLimit(downloadLimit.value);

      const eficlientidType = oldSettings.find((s) => s.key === 'eficlientid');
      if (eficlientidType) setEfiClientidType(eficlientidType.value);

      const eficlientsecretType = oldSettings.find((s) => s.key === 'eficlientsecret');
      if (eficlientsecretType) setEfiClientsecretType(eficlientsecretType.value);

      const efichavepixType = oldSettings.find((s) => s.key === 'efichavepix');
      if (efichavepixType) setEfiChavepixType(efichavepixType.value);

      const mpaccesstokenType = oldSettings.find((s) => s.key === 'mpaccesstoken');
      if (mpaccesstokenType) setmpaccesstokenType(mpaccesstokenType.value);

      const stripeprivatekeyType = oldSettings.find((s) => s.key === 'stripeprivatekey');
      if (stripeprivatekeyType) setstripeprivatekeyType(stripeprivatekeyType.value);

      const asaastokenType = oldSettings.find((s) => s.key === 'asaastoken');
      if (asaastokenType) setasaastokenType(asaastokenType.value);

      const openaitokenType = oldSettings.find((s) => s.key === 'openaikeyaudio');
      if (openaitokenType) setopenaitokenType(openaitokenType.value);

      const openroutertokenType = oldSettings.find((s) => s.key === 'globalOpenRouterKey');
      if (openroutertokenType) setopenroutertokenType(openroutertokenType.value);
    }
  }, [oldSettings]);

  useEffect(() => {
    for (const [key, value] of Object.entries(settings)) {
      if (key === "userRating") setUserRating(value);
      if (key === "scheduleType") setScheduleType(value);
      if (key === "chatBotType") setChatBotType(value);
      if (key === "acceptCallWhatsapp") setAcceptCallWhatsapp(value);
      if (key === "userRandom") setUserRandom(value);
      if (key === "sendGreetingMessageOneQueues") setSendGreetingMessageOneQueues(value);
      if (key === "sendSignMessage") setSendSignMessage(value);
      if (key === "sendFarewellWaitingTicket") setSendFarewellWaitingTicket(value);
      if (key === "sendGreetingAccepted") setSendGreetingAccepted(value);
      if (key === "sendQueuePosition") setSendQueuePosition(value);
      if (key === "acceptAudioMessageContact") setAcceptAudioMessageContact(value);
      if (key === "enableLGPD") setEnableLGPD(value);
      if (key === "requiredTag") setRequiredTag(value);
      if (key === "lgpdDeleteMessage") setLGPDDeleteMessage(value);
      if (key === "lgpdHideNumber") setLGPDHideNumber(value);
      if (key === "lgpdConsent") setLGPDConsent(value);
      if (key === "lgpdMessage") setLGPDMessage(value);
      if (key === "sendMsgTransfTicket") setSettingsTransfTicket(value);
      if (key === "lgpdLink") setLGPDLink(value);
      if (key === "DirectTicketsToWallets") setDirectTicketsToWallets(value);
      if (key === "closeTicketOnTransfer") setCloseTicketOnTransfer(value);
      if (key === "transferMessage") setTransferMessage(value);
      if (key === "greetingAcceptedMessage") setGreetingAcceptedMessage(value);
      if (key === "AcceptCallWhatsappMessage") setAcceptCallWhatsappMessage(value);
      if (key === "sendQueuePositionMessage") setSendQueuePositionMessage(value);
      if (key === "showNotificationPending") setShowNotificationPending(value);
      if (key === "notificameHub") setNotificameHubToken(value);
      if (key === "enableAutoStatus") setEnableAutoStatus(value);
    }
  }, [settings]);

  async function handleChangeUserCreation(value) {
    setUserCreation(value);
    setLoadingUserCreation(true);
    await updateUserCreation({ key: "userCreation", value });
    setLoadingUserCreation(false);
  }

  async function handleDownloadLimit(value) {
    setdownloadLimit(value);
    setLoadingdownloadLimit(true);
    await updatedownloadLimit({ key: "downloadLimit", value });
    setLoadingdownloadLimit(false);
  }

  async function handleChangeEfiClientid(value) {
    setEfiClientidType(value);
  }

  async function handleBlurEfiClientid() {
    setLoadingEfiClientidType(true);
    await updateeficlientid({ key: 'eficlientid', value: eficlientidType });
    toast.success('Operação atualizada com sucesso.');
    setLoadingEfiClientidType(false);
  }

  async function handleChangeEfiClientsecret(value) {
    setEfiClientsecretType(value);
  }

  async function handleBlurEfiClientsecret() {
    setLoadingEfiClientsecretType(true);
    await updateeficlientsecret({ key: 'eficlientsecret', value: eficlientsecretType });
    toast.success('Operação atualizada com sucesso.');
    setLoadingEfiClientsecretType(false);
  }

  async function handleChangeEfiChavepix(value) {
    setEfiChavepixType(value);
  }

  async function handleBlurEfiChavepix() {
    setLoadingEfiChavepixType(true);
    await updateefichavepix({ key: 'efichavepix', value: efichavepixType });
    toast.success('Operação atualizada com sucesso.');
    setLoadingEfiChavepixType(false);
  }

  async function handleChangempaccesstoken(value) {
    setmpaccesstokenType(value);
  }

  async function handleBlurmpaccesstoken() {
    setLoadingmpaccesstokenType(true);
    await updatempaccesstoken({ key: 'mpaccesstoken', value: mpaccesstokenType });
    toast.success('Operação atualizada com sucesso.');
    setLoadingmpaccesstokenType(false);
  }

  async function handleChangestripeprivatekey(value) {
    setstripeprivatekeyType(value);
  }

  async function handleBlurstripeprivatekey() {
    setLoadingstripeprivatekeyType(true);
    await updatestripeprivatekey({ key: 'stripeprivatekey', value: stripeprivatekeyType });
    toast.success('Operação atualizada com sucesso.');
    setLoadingstripeprivatekeyType(false);
  }

  async function handleChangeasaastoken(value) {
    setasaastokenType(value);
  }

  async function handleBlurasaastoken() {
    setLoadingasaastokenType(true);
    await updateasaastoken({ key: 'asaastoken', value: asaastokenType });
    toast.success('Operação atualizada com sucesso.');
    setLoadingasaastokenType(false);
  }

  async function handleChangeopenaitoken(value) {
    setopenaitokenType(value);
  }

  async function handleBluropenaitoken() {
    setLoadingopenaitokenType(true);
    await updateopenaitoken({ key: 'openaikeyaudio', value: openaitokenType });
    toast.success('Operação atualizada com sucesso.');
    setLoadingopenaitokenType(false);
  }

  async function handleChangeopenroutertoken(value) {
    setopenroutertokenType(value);
  }

  async function handleBluropenroutertoken() {
    setLoadingopenroutertokenType(true);
    await updateopenroutertoken({ key: 'globalOpenRouterKey', value: openroutertokenType });
    toast.success('Operação atualizada com sucesso.');
    setLoadingopenroutertokenType(false);
  }

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({ column: "userRating", data: value });
    setLoadingUserRating(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({ column: "scheduleType", data: value });
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleChatBotType(value) {
    setChatBotType(value);
    await update({ column: "chatBotType", data: value });
    if (typeof scheduleTypeChanged === "function") {
      setChatBotType(value);
    }
  }

  async function handleLGPDMessage(value) {
    setLGPDMessage(value);
    setLoadingLGPDMessage(true);
    await update({ column: "lgpdMessage", data: value });
    setLoadingLGPDMessage(false);
  }

  async function handletransferMessage(value) {
    setTransferMessage(value);
    setLoadingTransferMessage(true);
    await update({ column: "transferMessage", data: value });
    setLoadingTransferMessage(false);
  }

  async function handleGreetingAcceptedMessage(value) {
    setGreetingAcceptedMessage(value);
    setLoadingGreetingAcceptedMessage(true);
    await update({ column: "greetingAcceptedMessage", data: value });
    setLoadingGreetingAcceptedMessage(false);
  }

  async function handleAcceptCallWhatsappMessage(value) {
    setAcceptCallWhatsappMessage(value);
    setLoadingAcceptCallWhatsappMessage(true);
    await update({ column: "AcceptCallWhatsappMessage", data: value });
    setLoadingAcceptCallWhatsappMessage(false);
  }

  async function handlesendQueuePositionMessage(value) {
    setSendQueuePositionMessage(value);
    setLoadingSendQueuePositionMessage(true);
    await update({ column: "sendQueuePositionMessage", data: value });
    setLoadingSendQueuePositionMessage(false);
  }

  async function handleShowNotificationPending(value) {
    setShowNotificationPending(value);
    setLoadingShowNotificationPending(true);
    await update({ column: "showNotificationPending", data: value });
    setLoadingShowNotificationPending(false);
  }

  async function handleLGPDLink(value) {
    setLGPDLink(value);
    setLoadingLGPDLink(true);
    await update({ column: "lgpdLink", data: value });
    setLoadingLGPDLink(false);
  }

  async function handleLGPDDeleteMessage(value) {
    setLGPDDeleteMessage(value);
    setLoadingLGPDDeleteMessage(true);
    await update({ column: "lgpdDeleteMessage", data: value });
    setLoadingLGPDDeleteMessage(false);
  }

  async function handleLGPDConsent(value) {
    setLGPDConsent(value);
    setLoadingLGPDConsent(true);
    await update({ column: "lgpdConsent", data: value });
    setLoadingLGPDConsent(false);
  }

  async function handleLGPDHideNumber(value) {
    setLGPDHideNumber(value);
    setLoadingLGPDHideNumber(true);
    await update({ column: "lgpdHideNumber", data: value });
    setLoadingLGPDHideNumber(false);
  }

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    await update({ column: "sendGreetingAccepted", data: value });
    setLoadingSendGreetingAccepted(false);
  }

  async function handleUserRandom(value) {
    setUserRandom(value);
    setLoadingUserRandom(true);
    await update({ column: "userRandom", data: value });
    setLoadingUserRandom(false);
  }

  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value);
    setLoadingSettingsTransfTicket(true);
    await update({ column: "sendMsgTransfTicket", data: value });
    setLoadingSettingsTransfTicket(false);
  }

  async function handleAcceptCallWhatsapp(value) {
    setAcceptCallWhatsapp(value);
    setLoadingAcceptCallWhatsapp(true);
    await update({ column: "acceptCallWhatsapp", data: value });
    setLoadingAcceptCallWhatsapp(false);
  }

  async function handleSendSignMessage(value) {
    setSendSignMessage(value);
    setLoadingSendSignMessage(true);
    await update({ column: "sendSignMessage", data: value });
    localStorage.setItem("sendSignMessage", value === "enabled" ? true : false);
    setLoadingSendSignMessage(false);
  }

  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value);
    setLoadingSendGreetingMessageOneQueues(true);
    await update({ column: "sendGreetingMessageOneQueues", data: value });
    setLoadingSendGreetingMessageOneQueues(false);
  }

  async function handleSendQueuePosition(value) {
    setSendQueuePosition(value);
    setLoadingSendQueuePosition(true);
    await update({ column: "sendQueuePosition", data: value });
    setLoadingSendQueuePosition(false);
  }

  async function handleSendFarewellWaitingTicket(value) {
    setSendFarewellWaitingTicket(value);
    setLoadingSendFarewellWaitingTicket(true);
    await update({ column: "sendFarewellWaitingTicket", data: value });
    setLoadingSendFarewellWaitingTicket(false);
  }

  async function handleAcceptAudioMessageContact(value) {
    setAcceptAudioMessageContact(value);
    setLoadingAcceptAudioMessageContact(true);
    await update({ column: "acceptAudioMessageContact", data: value });
    setLoadingAcceptAudioMessageContact(false);
  }

  async function handleEnableLGPD(value) {
    setEnableLGPD(value);
    setLoadingEnableLGPD(true);
    await update({ column: "enableLGPD", data: value });
    setLoadingEnableLGPD(false);
  }

  async function handleRequiredTag(value) {
    setRequiredTag(value);
    setLoadingRequiredTag(true);
    await update({ column: "requiredTag", data: value });
    setLoadingRequiredTag(false);
  }

  async function handleCloseTicketOnTransfer(value) {
    setCloseTicketOnTransfer(value);
    setLoadingCloseTicketOnTransfer(true);
    await update({ column: "closeTicketOnTransfer", data: value });
    setLoadingCloseTicketOnTransfer(false);
  }

  async function handleDirectTicketsToWallets(value) {
    setDirectTicketsToWallets(value);
    setLoadingDirectTicketsToWallets(true);
    await update({ column: "DirectTicketsToWallets", data: value });
    setLoadingDirectTicketsToWallets(false);
  }

  async function handleChangeNotificameHub(value) {
    setNotificameHubToken(value);
    setLoadingNotificameHubToken(true);
    await update({
      column: "notificameHub",
      data: value,
    });
    setLoadingNotificameHubToken(false);
  }
  
  async function handleEnableAutoStatus(value) {
    setEnableAutoStatus(value);
    setLoadingEnableAutoStatus(true);
    await update({ column: "enableAutoStatus", data: value });
    setLoadingEnableAutoStatus(false);
  }

  return (
    <>
      {show("settings-section-atendimento") && (
      <div id="settings-section-atendimento" className={classes.sectionBlock}>
        <div className={classes.sectionHeader}>
          <div
            className={classes.sectionHeaderIcon}
            style={{ background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)" }}
          >
            <ChatIcon />
          </div>
          <div>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              Atendimento
            </Typography>
            <Typography variant="body2" color="textSecondary" className={classes.sectionSubtitle}>
              Bot, horários e limites para manter tudo rápido e consistente.
            </Typography>
          </div>
        </div>
        <Box className={classes.sectionGuide}>
          <Typography variant="subtitle2">Passos sugeridos</Typography>
          <Typography variant="body2" color="textSecondary">1. Defina o tipo de chatbot. 2. Configure o agendamento. 3. Ajuste limite de downloads.</Typography>
          <Typography variant="subtitle2" style={{ marginTop: 6 }}>Por que configurar</Typography>
          <Typography variant="body2" color="textSecondary">Acelera o atendimento e mantém consistência evitando sobrecarga.</Typography>
        </Box>
        <Grid spacing={2} container>
          <Grid item xs={12} md={6} lg={6}>
            <FormControl className={classes.selectContainer} id="settings-option-chatbot-type">
              <InputLabel id="chatBotType-label">{i18n.t("settings.settings.options.chatBotType")}</InputLabel>
              <Select
                labelId="chatBotType-label"
                value={chatBotType}
                onChange={(e) => handleChatBotType(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <ChatIcon style={{ color: grey[500] }} />
                  </InputAdornment>
                }
              >
                <MenuItem value={"text"}>Texto</MenuItem>
                <MenuItem value={"list"}>Lista</MenuItem>
                <MenuItem value={"button"}>{i18n.t("settings.settings.options.buttons")}</MenuItem>
              </Select>
              <FormHelperText>{loadingScheduleType && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          {isSuper() ? (
            <Grid item xs={12} md={6} lg={6}>
              <FormControl className={classes.selectContainer} id="settings-option-download-limit">
                <InputLabel id="downloadLimit-label">Limite de Download de Arquivos (MB)</InputLabel>
                <Select
                  labelId="downloadLimit-label"
                  value={downloadLimit}
                  size="small"
                  onChange={(e) => handleDownloadLimit(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <DownloadIcon style={{ color: grey[500] }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value={"32"}>32</MenuItem>
                  <MenuItem value={"64"}>64</MenuItem>
                  <MenuItem value={"128"}>128</MenuItem>
                  <MenuItem value={"256"}>256</MenuItem>
                  <MenuItem value={"512"}>512</MenuItem>
                  <MenuItem value={"1024"}>1024</MenuItem>
                  <MenuItem value={"2048"}>2048</MenuItem>
                </Select>
                <FormHelperText>{loadingDownloadLimit && "Atualizando..."}</FormHelperText>
              </FormControl>
            </Grid>
          ) : null}

          <Grid item xs={12} md={6} lg={6}>
            <FormControl className={classes.selectContainer} id="settings-option-schedule-type">
              <InputLabel id="schedule-type-label">{i18n.t("settings.settings.options.officeScheduling")}</InputLabel>
              <Select
                labelId="schedule-type-label"
                value={scheduleType}
                onChange={(e) => handleScheduleType(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <ScheduleIcon style={{ color: grey[500] }} />
                  </InputAdornment>
                }
              >
                <MenuItem value={"disabled"}>{i18n.t("settings.settings.options.disabled")}</MenuItem>
                <MenuItem value={"queue"}>{i18n.t("settings.settings.options.queueManagement")}</MenuItem>
                <MenuItem value={"company"}>{i18n.t("settings.settings.options.companyManagement")}</MenuItem>
                <MenuItem value={"connection"}>{i18n.t("settings.settings.options.connectionManagement")}</MenuItem>
              </Select>
              <FormHelperText>{loadingScheduleType && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </div>
      )}

      {show("settings-section-comportamento") && (
      <div id="settings-section-comportamento" className={classes.sectionBlock}>
        <div className={classes.sectionHeader}>
          <div
            className={classes.sectionHeaderIcon}
            style={{ background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)" }}
          >
            <SendIcon />
          </div>
          <div>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              Comportamento & Mensagens
            </Typography>
            <Typography variant="body2" color="textSecondary" className={classes.sectionSubtitle}>
              Automatize boas práticas e padronize respostas do time.
            </Typography>
          </div>
        </div>
        <Box className={classes.sectionGuide}>
          <Typography variant="subtitle2">Passos sugeridos</Typography>
          <Typography variant="body2" color="textSecondary">1. Ative mensagens padrão. 2. Habilite avaliações e assinatura. 3. Configure saudação e posição na fila.</Typography>
          <Typography variant="subtitle2" style={{ marginTop: 6 }}>Por que configurar</Typography>
          <Typography variant="body2" color="textSecondary">Padroniza comunicação e melhora a experiência do usuário.</Typography>
        </Box>
        <Grid spacing={2} container>
          {isSuper() ? (
            <Grid xs={12} sm={6} md={6} lg={6} item>
              <FormControl className={classes.selectContainer} id="settings-option-user-creation">
                <div className={classes.switchContainer}>
                  <Switch
                    checked={userCreation === "enabled"}
                    onChange={(e) => handleChangeUserCreation(e.target.checked ? "enabled" : "disabled")}
                    color="primary"
                  />
                  <span className={classes.switchLabel}>{i18n.t("settings.settings.options.creationCompanyUser")}</span>
                </div>
                <FormHelperText>{loadingUserCreation && i18n.t("settings.settings.options.updating")}</FormHelperText>
              </FormControl>
            </Grid>
          ) : null}

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-user-rating">
              <div className={classes.switchContainer}>
                <Switch
                  id="userRating-switch"
                  checked={userRating === "enabled"}
                  onChange={(e) => handleChangeUserRating(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.evaluations")}</span>
              </div>
              <FormHelperText>{loadingUserRating && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-send-greeting-accepted">
              <div className={classes.switchContainer}>
                <Switch
                  id="sendGreetingAccepted-switch"
                  checked={SendGreetingAccepted === "enabled"}
                  onChange={(e) => handleSendGreetingAccepted(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>
                  {i18n.t("settings.settings.options.sendGreetingAccepted")}
                </span>
              </div>
              <FormHelperText>
                {loadingSendGreetingAccepted && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-user-random">
              <div className={classes.switchContainer}>
                <Switch
                  id="userRandom-switch"
                  checked={UserRandom === "enabled"}
                  onChange={(e) => handleUserRandom(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.userRandom")}</span>
              </div>
              <FormHelperText>{loadingUserRandom && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-transfer-message">
              <div className={classes.switchContainer}>
                <Switch
                  checked={SettingsTransfTicket === "enabled"}
                  onChange={(e) => handleSettingsTransfTicket(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.sendMsgTransfTicket")}</span>
              </div>
              <FormHelperText>{loadingSettingsTransfTicket && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-accept-call-whatsapp">
              <div className={classes.switchContainer}>
                <Switch
                  id="acceptCallWhatsapp-switch"
                  checked={AcceptCallWhatsapp === "enabled"}
                  onChange={(e) => handleAcceptCallWhatsapp(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.acceptCallWhatsapp")}</span>
              </div>
              <FormHelperText>{loadingAcceptCallWhatsapp && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-send-sign-message">
              <div className={classes.switchContainer}>
                <Switch
                  checked={sendSignMessage === "enabled"}
                  onChange={(e) => handleSendSignMessage(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.sendSignMessage")}</span>
              </div>
              <FormHelperText>{loadingSendSignMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-send-greeting-one-queue">
              <div className={classes.switchContainer}>
                <Switch
                  id="sendGreetingMessageOneQueues-switch"
                  checked={sendGreetingMessageOneQueues === "enabled"}
                  onChange={(e) => handleSendGreetingMessageOneQueues(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.sendGreetingMessageOneQueues")}</span>
              </div>
              <FormHelperText>{loadingSendGreetingMessageOneQueues && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-enable-auto-status">
              <div className={classes.switchContainer}>
                <Switch
                  id="enableAutoStatus-switch"
                  checked={enableAutoStatus === "enabled"}
                  onChange={(e) => handleEnableAutoStatus(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>Status do WhatsApp (IA)</span>
              </div>
              <FormHelperText>{loadingEnableAutoStatus && "Atualizando..."}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-send-queue-position">
              <div className={classes.switchContainer}>
                <Switch
                  id="sendQueuePosition-switch"
                  checked={sendQueuePosition === "enabled"}
                  onChange={(e) => handleSendQueuePosition(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.sendQueuePosition")}</span>
              </div>
              <FormHelperText>{loadingSendQueuePosition && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-send-farewell-waiting">
              <div className={classes.switchContainer}>
                <Switch
                  checked={sendFarewellWaitingTicket === "enabled"}
                  onChange={(e) => handleSendFarewellWaitingTicket(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.sendFarewellWaitingTicket")}</span>
              </div>
              <FormHelperText>{loadingSendFarewellWaitingTicket && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-accept-audio-message-contact">
              <div className={classes.switchContainer}>
                <Switch
                  id="acceptAudioMessageContact-switch"
                  checked={acceptAudioMessageContact === "enabled"}
                  onChange={(e) => handleAcceptAudioMessageContact(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.acceptAudioMessageContact")}</span>
              </div>
              <FormHelperText>{loadingAcceptAudioMessageContact && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </div>
      )}

      {show("settings-section-privacidade") && (
      <div id="settings-section-privacidade" className={classes.sectionBlock}>
        <div className={classes.sectionHeader}>
          <div
            className={classes.sectionHeaderIcon}
            style={{ background: "linear-gradient(90deg, #111827 0%, #334155 100%)" }}
          >
            <SecurityIcon />
          </div>
          <div>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              Privacidade & Regras
            </Typography>
            <Typography variant="body2" color="textSecondary" className={classes.sectionSubtitle}>
              Controle de LGPD, regras do atendimento e notificações.
            </Typography>
          </div>
        </div>
        <Box className={classes.sectionGuide}>
          <Typography variant="subtitle2">Passos sugeridos</Typography>
          <Typography variant="body2" color="textSecondary">1. Exija tags obrigatórias. 2. Defina regras de fechamento. 3. Ative notificações pendentes.</Typography>
          <Typography variant="subtitle2" style={{ marginTop: 6 }}>Por que configurar</Typography>
          <Typography variant="body2" color="textSecondary">Garante conformidade e disciplina operacional.</Typography>
        </Box>
        <Grid spacing={2} container>
          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-enable-lgpd">
              <div className={classes.switchContainer}>
                <Switch
                  id="enableLGPD-switch"
                  checked={enableLGPD === "enabled"}
                  onChange={(e) => handleEnableLGPD(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.enableLGPD")}</span>
              </div>
              <FormHelperText>{loadingEnableLGPD && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-required-tag">
              <div className={classes.switchContainer}>
                <Switch
                  id="requiredTag-switch"
                  checked={requiredTag === "enabled"}
                  onChange={(e) => handleRequiredTag(e.target.checked ? "enabled" : "disabled")}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.requiredTag")}</span>
              </div>
              <FormHelperText>{loadingRequiredTag && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-close-ticket-on-transfer">
              <div className={classes.switchContainer}>
                <Switch
                  id="closeTicketOnTransfer-switch"
                  checked={closeTicketOnTransfer}
                  onChange={(e) => handleCloseTicketOnTransfer(e.target.checked)}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.closeTicketOnTransfer")}</span>
              </div>
              <FormHelperText>{loadingCloseTicketOnTransfer && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} lg={6} item>
            <FormControl className={classes.selectContainer} id="settings-option-show-notification-pending">
              <div className={classes.switchContainer}>
                <Switch
                  id="showNotificationPending-switch"
                  checked={showNotificationPending}
                  onChange={(e) => handleShowNotificationPending(e.target.checked)}
                  color="primary"
                />
                <span className={classes.switchLabel}>{i18n.t("settings.settings.options.showNotificationPending")}</span>
              </div>
              <FormHelperText>{loadingShowNotificationPending && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </div>
      )}

      {enableLGPD === "enabled" && show("settings-lgpd") && (
        <div id="settings-lgpd" className={classes.sectionBlock}>
          <div className={classes.sectionHeader}>
            <div
              className={classes.sectionHeaderIcon}
              style={{ background: "linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)" }}
            >
              <LockIcon />
            </div>
            <div>
              <Typography variant="subtitle1" className={classes.sectionTitle}>
                {i18n.t("settings.settings.LGPD.title")}
              </Typography>
              <Typography variant="body2" color="textSecondary" className={classes.sectionSubtitle}>
                Ajustes finos de privacidade e consentimento.
              </Typography>
            </div>
          </div>
          <Box className={classes.sectionGuide}>
            <Typography variant="subtitle2">Passos sugeridos</Typography>
            <Typography variant="body2" color="textSecondary">1. Redija mensagem de consentimento. 2. Informe link de política. 3. Ajuste preferências.</Typography>
            <Typography variant="subtitle2" style={{ marginTop: 6 }}>Por que configurar</Typography>
            <Typography variant="body2" color="textSecondary">Garante transparência e conformidade com LGPD.</Typography>
          </Box>
          <Grid spacing={1} container>
            <Grid xs={12} sm={6} md={12} item>
              <FormControl className={classes.selectContainer}>
                <TextField
                  id="lgpdMessage"
                  name="lgpdMessage"
                  margin="dense"
                  multiline
                  rows={3}
                  label={i18n.t("settings.settings.LGPD.welcome")}
                  variant="outlined"
                  value={lgpdMessage}
                  onChange={(e) => handleLGPDMessage(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ChatIcon style={{ color: grey[500] }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormHelperText>{loadinglgpdMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6} md={12} item>
              <FormControl className={classes.selectContainer}>
                <TextField
                  id="lgpdLink"
                  name="lgpdLink"
                  margin="dense"
                  label={i18n.t("settings.settings.LGPD.linkLGPD")}
                  variant="outlined"
                  value={lgpdLink}
                  onChange={(e) => handleLGPDLink(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon style={{ color: grey[500] }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormHelperText>{loadingLGPDLink && i18n.t("settings.settings.options.updating")}</FormHelperText>
              </FormControl>
            </Grid>
            {/* LGPD Manter ou não mensagem deletada pelo contato */}
            <Grid xs={12} sm={6} md={6} lg={6} item>
              <FormControl className={classes.selectContainer}>
                <InputLabel id="lgpdDeleteMessage-label">{i18n.t("settings.settings.LGPD.obfuscateMessageDelete")}</InputLabel>
                <Select
                  labelId="lgpdDeleteMessage-label"
                  value={lgpdDeleteMessage}
                  onChange={(e) => handleLGPDDeleteMessage(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <DeleteIcon style={{ color: grey[500] }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value={"disabled"}>{i18n.t("settings.settings.LGPD.disabled")}</MenuItem>
                  <MenuItem value={"enabled"}>{i18n.t("settings.settings.LGPD.enabled")}</MenuItem>
                </Select>
                <FormHelperText>{loadingLGPDDeleteMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
              </FormControl>
            </Grid>
            {/* LGPD Sempre solicitar confirmação / consentimento dos dados */}
            <Grid xs={12} sm={6} md={6} lg={6} item>
              <FormControl className={classes.selectContainer}>
                <InputLabel id="lgpdConsent-label">{i18n.t("settings.settings.LGPD.alwaysConsent")}</InputLabel>
                <Select
                  labelId="lgpdConsent-label"
                  value={lgpdConsent}
                  onChange={(e) => handleLGPDConsent(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <CheckCircleIcon style={{ color: grey[500] }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value={"disabled"}>{i18n.t("settings.settings.LGPD.disabled")}</MenuItem>
                  <MenuItem value={"enabled"}>{i18n.t("settings.settings.LGPD.enabled")}</MenuItem>
                </Select>
                <FormHelperText>{loadingLGPDConsent && i18n.t("settings.settings.options.updating")}</FormHelperText>
              </FormControl>
            </Grid>
            {/* LGPD Ofuscar número telefone para usuários */}
            <Grid xs={12} sm={6} md={6} lg={6} item>
              <FormControl className={classes.selectContainer}>
                <InputLabel id="lgpdHideNumber-label">{i18n.t("settings.settings.LGPD.obfuscatePhoneUser")}</InputLabel>
                <Select
                  labelId="lgpdHideNumber-label"
                  value={lgpdHideNumber}
                  onChange={(e) => handleLGPDHideNumber(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <PhoneIcon style={{ color: grey[500] }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value={"disabled"}>{i18n.t("settings.settings.LGPD.disabled")}</MenuItem>
                  <MenuItem value={"enabled"}>{i18n.t("settings.settings.LGPD.enabled")}</MenuItem>
                </Select>
                <FormHelperText>{loadingLGPDHideNumber && i18n.t("settings.settings.options.updating")}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </div>
      )}

      {isSuper() ? (
        <>
          <div id="settings-payment-efi" className={classes.sectionBlock}>
            <div className={classes.sectionHeader}>
              <div
                className={classes.sectionHeaderIcon}
                style={{ background: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)" }}
              >
                <PaymentIcon />
              </div>
              <div>
                <Typography variant="subtitle1" className={classes.sectionTitle}>
                  Configuração Pix Efí (GerenciaNet)
                </Typography>
                <Typography variant="body2" color="textSecondary" className={classes.sectionSubtitle}>
                  Credenciais e chave PIX para cobrança automatizada.
                </Typography>
              </div>
            </div>
            <Grid spacing={2} container>
              <Grid xs={12} sm={6} md={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='eficlientid'
                    name='eficlientid'
                    margin='dense'
                    label='Client ID'
                    variant='outlined'
                    value={eficlientidType}
                    onChange={(e) => handleChangeEfiClientid(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKeyIcon style={{ color: grey[500] }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormHelperText>{loadingEfiClientidType && 'Atualizando...'}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='eficlientsecret'
                    name='eficlientsecret'
                    margin='dense'
                    label='Client Secret'
                    variant='outlined'
                    value={eficlientsecretType}
                    onChange={(e) => handleChangeEfiClientsecret(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon style={{ color: grey[500] }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormHelperText>{loadingEfiClientsecretType && 'Atualizando...'}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='efichavepix'
                    name='efichavepix'
                    margin='dense'
                    label='Chave PIX'
                    variant='outlined'
                    value={efichavepixType}
                    onChange={(e) => handleChangeEfiChavepix(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaymentIcon style={{ color: grey[500] }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormHelperText>{loadingEfiChavepixType && 'Atualizando...'}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </div>

          <div id="settings-payment-mercadopago" className={classes.sectionBlock}>
            <div className={classes.sectionHeader}>
              <div
                className={classes.sectionHeaderIcon}
                style={{ background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)" }}
              >
                <PaymentIcon />
              </div>
              <div>
                <Typography variant="subtitle1" className={classes.sectionTitle}>
                  Mercado Pago
                </Typography>
                <Typography variant="body2" color="textSecondary" className={classes.sectionSubtitle}>
                  Token de acesso para pagamentos e webhooks.
                </Typography>
              </div>
            </div>
            <Grid spacing={2} container>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='mpaccesstoken'
                    name='mpaccesstoken'
                    margin='dense'
                    label='Access Token'
                    variant='outlined'
                    value={mpaccesstokenType}
                    onChange={(e) => handleChangempaccesstoken(e.target.value)}
                    onBlur={handleBlurmpaccesstoken}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKeyIcon style={{ color: grey[500] }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormHelperText>{loadingmpaccesstokenType && 'Atualizando...'}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </div>

          <div id="settings-payment-stripe" className={classes.sectionBlock}>
            <div className={classes.sectionHeader}>
              <div
                className={classes.sectionHeaderIcon}
                style={{ background: "linear-gradient(90deg, #6366f1 0%, #4338ca 100%)" }}
              >
                <PaymentIcon />
              </div>
              <div>
                <Typography variant="subtitle1" className={classes.sectionTitle}>
                  Stripe
                </Typography>
                <Typography variant="body2" color="textSecondary" className={classes.sectionSubtitle}>
                  Chave privada para processar pagamentos.
                </Typography>
              </div>
            </div>
            <Grid spacing={2} container>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='stripeprivatekey'
                    name='stripeprivatekey'
                    margin='dense'
                    label='Stripe Private Key'
                    variant='outlined'
                    value={stripeprivatekeyType}
                    onChange={(e) => handleChangestripeprivatekey(e.target.value)}
                    onBlur={handleBlurstripeprivatekey}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon style={{ color: grey[500] }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormHelperText>{loadingstripeprivatekeyType && 'Atualizando...'}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </div>

          <div id="settings-payment-asaas" className={classes.sectionBlock}>
            <div className={classes.sectionHeader}>
              <div
                className={classes.sectionHeaderIcon}
                style={{ background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)" }}
              >
                <PaymentIcon />
              </div>
              <div>
                <Typography variant="subtitle1" className={classes.sectionTitle}>
                  ASAAS
                </Typography>
                <Typography variant="body2" color="textSecondary" className={classes.sectionSubtitle}>
                  Token para cobranças e integração financeira.
                </Typography>
              </div>
            </div>
            <Grid spacing={2} container>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='asaastoken'
                    name='asaastoken'
                    margin='dense'
                    label='Token Asaas'
                    variant='outlined'
                    value={asaastokenType}
                    onChange={(e) => handleChangeasaastoken(e.target.value)}
                    onBlur={handleBlurasaastoken}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKeyIcon style={{ color: grey[500] }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormHelperText>{loadingasaastokenType && 'Atualizando...'}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </div>

          <div id="settings-openai-audio" className={classes.sectionBlock}>
            <div className={classes.sectionHeader}>
              <div
                className={classes.sectionHeaderIcon}
                style={{ background: "linear-gradient(90deg, #111827 0%, #0f172a 100%)" }}
              >
                <VpnKeyIcon />
              </div>
              <div>
                <Typography variant="subtitle1" className={classes.sectionTitle}>
                  OpenAI & LLM
                </Typography>
                <Typography variant="body2" color="textSecondary" className={classes.sectionSubtitle}>
                  Chaves de API para Inteligência Artificial (OpenAI, OpenRouter, etc).
                </Typography>
              </div>
            </div>
            <Grid spacing={2} container>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='openaikeyaudio'
                    name='openaikeyaudio'
                    margin='dense'
                    label='OpenAI API Key (Transcrição de áudio)'
                    variant='outlined'
                    value={openaitokenType}
                    onChange={(e) => handleChangeopenaitoken(e.target.value)}
                    onBlur={handleBluropenaitoken}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKeyIcon style={{ color: grey[500] }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormHelperText>{loadingopenaitokenType && 'Atualizando...'}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={12} md={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='globalOpenRouterKey'
                    name='globalOpenRouterKey'
                    margin='dense'
                    label='Global OpenRouter Key (LLM)'
                    variant='outlined'
                    value={openroutertokenType}
                    onChange={(e) => handleChangeopenroutertoken(e.target.value)}
                    onBlur={handleBluropenroutertoken}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKeyIcon style={{ color: grey[500] }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormHelperText>{loadingopenroutertokenType && 'Atualizando...'}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </div>
        </>
      ) : null}

      {show("settings-custom-messages") && (
      <div id="settings-custom-messages" className={classes.sectionBlock}>
        <div className={classes.sectionHeader}>
          <div
            className={classes.sectionHeaderIcon}
            style={{ background: "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)" }}
          >
            <ChatIcon />
          </div>
          <div>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              Mensagens Personalizadas
            </Typography>
            <Typography variant="body2" color="textSecondary" className={classes.sectionSubtitle}>
              Textos padrões usados em transferências, avisos e automações.
            </Typography>
          </div>
        </div>
        <Box className={classes.sectionGuide}>
          <Typography variant="subtitle2">Passos sugeridos</Typography>
          <Typography variant="body2" color="textSecondary">1. Escreva mensagem de transferência. 2. Ajuste saudação aceita. 3. Defina texto de ligação e posição na fila.</Typography>
          <Typography variant="subtitle2" style={{ marginTop: 6 }}>Por que configurar</Typography>
          <Typography variant="body2" color="textSecondary">Oferece contexto e previsibilidade ao usuário.</Typography>
        </Box>
        <Grid spacing={2} container>
          <Grid xs={12} sm={6} md={6} item>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="transferMessage"
                name="transferMessage"
                margin="dense"
                multiline
                minRows={3}
                label={i18n.t("settings.settings.customMessages.transferMessage")}
                variant="outlined"
                value={transferMessage || ""}
                required={SettingsTransfTicket === "enabled"}
                onChange={(e) => handletransferMessage(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TransferWithinAStationIcon style={{ color: grey[500] }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormHelperText>{loadingTransferMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} item>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="greetingAcceptedMessage"
                name="greetingAcceptedMessage"
                margin="dense"
                multiline
                minRows={3}
                label={i18n.t("settings.settings.customMessages.greetingAcceptedMessage")}
                variant="outlined"
                value={greetingAcceptedMessage || ""}
                required={SendGreetingAccepted === "enabled"}
                onChange={(e) => handleGreetingAcceptedMessage(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SendIcon style={{ color: grey[500] }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormHelperText>{loadingGreetingAcceptedMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} item>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="AcceptCallWhatsappMessage"
                name="AcceptCallWhatsappMessage"
                margin="dense"
                multiline
                minRows={3}
                label={i18n.t("settings.settings.customMessages.AcceptCallWhatsappMessage")}
                variant="outlined"
                required={AcceptCallWhatsapp === "disabled"}
                value={AcceptCallWhatsappMessage}
                onChange={(e) => handleAcceptCallWhatsappMessage(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CallIcon style={{ color: grey[500] }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormHelperText>{loadingAcceptCallWhatsappMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={6} item>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="sendQueuePositionMessage"
                name="sendQueuePositionMessage"
                margin="dense"
                multiline
                required={sendQueuePosition === "enabled"}
                minRows={3}
                label={i18n.t("settings.settings.customMessages.sendQueuePositionMessage")}
                variant="outlined"
                value={sendQueuePositionMessage}
                onChange={(e) => handlesendQueuePositionMessage(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QueueIcon style={{ color: grey[500] }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormHelperText>{loadingSendQueuePositionMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={12} md={12} item>
            <FormControl className={`${classes.selectFocus} ${classes.labelFocus} ${classes.selectContainer}`}>
              <TextField
                id="HUB"
                name="HUB"
                margin="dense"
                multiline
                minRows={3}
                label="Token NotificameHub"
                variant="outlined"
                value={notificameHubToken || ""}
                onChange={async (e) => {
                  handleChangeNotificameHub(e.target.value);
                }}
              />
              <FormHelperText>
                {loadingNotificameHubToken && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </div>
      )}
    </>
  );
}
