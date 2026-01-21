import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import { MenuItem, FormControl, InputLabel, Select, Typography, Box, Chip } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { InputAdornment, IconButton } from "@material-ui/core";
import QueueSelectSingle from "../QueueSelectSingle";

// Ícones modernos
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import Filter9PlusIcon from '@mui/icons-material/Filter9Plus';
import ChatIcon from '@mui/icons-material/Chat';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    multFieldLine: {
        display: "flex",
        gap: theme.spacing(2),
        "& > *": {
            flex: 1,
        },
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
            gap: theme.spacing(1),
        }
    },
    dialogPaper: {
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0px 16px 24px rgba(0, 0, 0, 0.12), 0px 6px 30px rgba(0, 0, 0, 0.08)",
        fontFamily: "'Inter', sans-serif",
        maxWidth: "1000px",
        width: "98%",
        margin: "auto",
    },
    dialogHeader: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: theme.spacing(1.2),
        color: "white",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('data:image/svg+xml,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23ffffff\" fill-opacity=\"0.05\"><circle cx=\"30\" cy=\"30\" r=\"4\"/></g></g></svg>') repeat",
            opacity: 0.3,
        }
    },
    dialogTitle: {
        fontWeight: 600,
        fontSize: "0.875rem",
        flexGrow: 1,
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        zIndex: 1,
    },
    dialogIcon: {
        marginRight: theme.spacing(1),
        fontSize: "1.25rem",
        position: "relative",
        zIndex: 1,
    },
    dialogContent: {
        padding: theme.spacing(1.5),
        backgroundColor: "#fafafa",
        fontFamily: "'Inter', sans-serif",
    },
    sectionTitle: {
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "#374151",
        marginBottom: theme.spacing(0.6),
        marginTop: theme.spacing(1.5),
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        "&:first-child": {
            marginTop: 0,
        }
    },
    sectionIcon: {
        marginRight: theme.spacing(0.5),
        color: "#6366f1",
        fontSize: "1rem",
    },
    formControl: {
        margin: theme.spacing(0.5, 0),
        "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "white",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.875rem",
            "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#6366f1",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#6366f1",
                borderWidth: "2px",
            }
        },
        "& .MuiInputLabel-outlined": {
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "0.875rem",
        }
    },
    fieldIcon: {
        color: "#6b7280",
    },
    providerChip: {
        height: 32,
        borderRadius: 16,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        "& .MuiChip-label": {
            paddingLeft: 12,
            paddingRight: 12,
        }
    },
    openaiChip: {
        backgroundColor: "#10b981",
        color: "white",
        "&:hover": {
            backgroundColor: "#059669",
        }
    },
    geminiChip: {
        backgroundColor: "#3b82f6",
        color: "white",
        "&:hover": {
            backgroundColor: "#2563eb",
        }
    },
    openrouterChip: {
        backgroundColor: "#7c3aed",
        color: "white",
        "&:hover": {
            backgroundColor: "#6d28d9",
        }
    },
    modelSelect: {
        "& .MuiSelect-select": {
            display: 'flex',
            alignItems: 'center',
            fontFamily: "'Inter', sans-serif",
        },
        "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "white",
        }
    },
    freeLabel: {
        fontSize: "0.625rem",
        backgroundColor: "#dcfce7",
        color: "#166534",
        padding: "2px 6px",
        borderRadius: "4px",
        fontWeight: 600,
        marginLeft: theme.spacing(1),
        fontFamily: "'Inter', sans-serif",
    },
    saveButton: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        fontWeight: 600,
        borderRadius: "8px",
        padding: "8px 20px",
        fontSize: "0.8rem",
        textTransform: "none",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Inter', sans-serif",
        '&:hover': {
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-1px)",
        },
        transition: "all 0.2s ease-in-out",
    },
    cancelButton: {
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        color: "white",
        fontWeight: 600,
        borderRadius: "8px",
        padding: "8px 20px",
        fontSize: "0.8rem",
        textTransform: "none",
        marginRight: theme.spacing(1.5),
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Inter', sans-serif",
        '&:hover': {
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-1px)",
        },
        transition: "all 0.2s ease-in-out",
    },
    dialogActions: {
        padding: theme.spacing(1.5, 3),
        backgroundColor: "white",
        borderTop: "1px solid #e5e7eb",
        justifyContent: "flex-end",
    },
    voiceSection: {
        backgroundColor: "white",
        borderRadius: "8px",
        padding: theme.spacing(1.5),
        border: "1px solid #e5e7eb",
        marginTop: theme.spacing(1),
    },
    configSection: {
        backgroundColor: "white",
        borderRadius: "8px", 
        padding: theme.spacing(1.5),
        border: "1px solid #e5e7eb",
        marginTop: theme.spacing(1),
    },
}));

const PromptSchema = Yup.object().shape({
    name: Yup.string().min(5, "Muito curto!").max(100, "Muito longo!").required("Obrigatório"),
    prompt: Yup.string().min(50, "Muito curto!").required("Descreva o treinamento para Inteligência Artificial"),
    voice: Yup.string().required("Informe o modo para Voz"),
    max_tokens: Yup.number().required("Informe o número máximo de tokens"),
    temperature: Yup.number().required("Informe a temperatura"),
    apikey: Yup.string().required("Informe a API Key"),
    queueId: Yup.number().required("Informe a fila"),
    max_messages: Yup.number().required("Informe o número máximo de mensagens"),
    provider: Yup.string().required("Selecione o provedor de IA"),
    model: Yup.string().required("Selecione o modelo")
});

const openaiModels = [
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" }
];

const geminiModels = [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", free: true },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite", free: false },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", free: false },
    { value: "gemini-1.5-flash-8b", label: "Gemini 1.5 Flash-8B", free: false },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", free: false },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", free: false },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite", free: false }
];

const openRouterModels = [
    { value: "google/gemini-2.0-flash-lite-preview-02-05:free", label: "Gemini 2.0 Flash Lite (Free)", free: true },
    { value: "google/gemini-2.0-pro-exp-02-05:free", label: "Gemini 2.0 Pro (Free)", free: true },
    { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 (Free)", free: true },
    { value: "deepseek/deepseek-chat:free", label: "DeepSeek Chat (Free)", free: true },
    { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder 32B (Free)", free: true },
    { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)", free: true }
];

const PromptModal = ({ open, onClose, promptId }) => {
    const classes = useStyles();
    const [selectedVoice, setSelectedVoice] = useState("texto");
    const [showApiKey, setShowApiKey] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState("openai");
    const [selectedModel, setSelectedModel] = useState("");

    const handleToggleApiKey = () => {
        setShowApiKey(!showApiKey);
    };

    const initialState = {
        name: "",
        prompt: "",
        voice: "texto",
        voiceKey: "",
        voiceRegion: "",
        maxTokens: 100,
        temperature: 1,
        apiKey: "",
        queueId: null,
        maxMessages: 10,
        provider: "openai",
        model: ""
    };

    const [prompt, setPrompt] = useState(initialState);

    useEffect(() => {
        const fetchPrompt = async () => {
            if (!promptId) {
                setPrompt(initialState);
                setSelectedProvider("openai");
                setSelectedModel("");
                return;
            }
            try {
                const { data } = await api.get(`/prompt/${promptId}`);
                setPrompt(prevState => {
                    return { ...prevState, ...data };
                });
                setSelectedVoice(data.voice);
                setSelectedProvider(data.provider || "openai");
                setSelectedModel(data.model || "");
            } catch (err) {
                toastError(err);
            }
        };

        fetchPrompt();
    }, [promptId, open]);

    const handleClose = () => {
        setPrompt(initialState);
        setSelectedVoice("texto");
        setSelectedProvider("openai");
        setSelectedModel("");
        onClose();
    };

    const handleChangeVoice = (e) => {
        setSelectedVoice(e.target.value);
    };

    const handleProviderChange = (e) => {
        const newProvider = e.target.value;
        setSelectedProvider(newProvider);
        setSelectedModel(""); // Reset model when provider changes
    };

    const handleModelChange = (e) => {
        setSelectedModel(e.target.value);
    };

    const getCurrentModels = () => {
        if (selectedProvider === "openai") return openaiModels;
        if (selectedProvider === "gemini") return geminiModels;
        if (selectedProvider === "openrouter") return openRouterModels;
        return openaiModels;
    };

    const handleSavePrompt = async values => {
        const promptData = { 
            ...values, 
            voice: selectedVoice, 
            provider: selectedProvider,
            model: selectedModel 
        };
        if (!values.queueId) {
            toastError("Informe o setor");
            return;
        }
        if (!selectedProvider) {
            toastError("Selecione o provedor de IA");
            return;
        }
        if (!selectedModel) {
            toastError("Selecione o modelo");
            return;
        }
        try {
            if (promptId) {
                await api.put(`/prompt/${promptId}`, promptData);
            } else {
                await api.post("/prompt", promptData);
            }
            toast.success(i18n.t("promptModal.success"));
        } catch (err) {
            toastError(err);
        }
        handleClose();
    };

    return (
        <div className={classes.root}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                scroll="paper"
                fullWidth
                classes={{ paper: classes.dialogPaper }}
            >
                <div className={classes.dialogHeader}>
                    <SmartToyIcon className={classes.dialogIcon} />
                    <Typography variant="h6" className={classes.dialogTitle}>
                        {promptId
                            ? `${i18n.t("promptModal.title.edit")}`
                            : `${i18n.t("promptModal.title.add")}`}
                    </Typography>
                </div>
                
                <DialogContent className={classes.dialogContent}>
                    <Formik
                        initialValues={prompt}
                        enableReinitialize={true}
                        onSubmit={(values, actions) => {
                            setTimeout(() => {
                                handleSavePrompt(values);
                                actions.setSubmitting(false);
                            }, 400);
                        }}
                    >
                        {({ touched, errors, isSubmitting, values }) => (
                            <Form style={{ width: "100%" }}>
                                {/* Seção Principal */}
                                <Typography className={classes.sectionTitle}>
                                    <PersonIcon className={classes.sectionIcon} />
                                    Informações Básicas
                                </Typography>
                                
                                <Field
                                    as={TextField}
                                    label={i18n.t("promptModal.form.name")}
                                    name="name"
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    required
                                    className={classes.formControl}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon className={classes.fieldIcon} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Field
                                    as={TextField}
                                    label={i18n.t("promptModal.form.prompt")}
                                    name="prompt"
                                    error={touched.prompt && Boolean(errors.prompt)}
                                    helperText={touched.prompt && errors.prompt}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    required
                                    rows={6}
                                    multiline={true}
                                    className={classes.formControl}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TextFieldsIcon className={classes.fieldIcon} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <QueueSelectSingle 
                                    className={classes.formControl}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountTreeIcon className={classes.fieldIcon} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Seção IA */}
                                <Typography className={classes.sectionTitle}>
                                    <SmartToyIcon className={classes.sectionIcon} />
                                    Configuração de IA
                                </Typography>

                                <div className={classes.multFieldLine}>
                                    <FormControl 
                                        variant="outlined" 
                                        className={classes.formControl}
                                        margin="dense"
                                    >
                                        <InputLabel>Provedor de IA</InputLabel>
                                        <Select
                                            value={selectedProvider}
                                            onChange={handleProviderChange}
                                            label="Provedor de IA"
                                            className={classes.modelSelect}
                                        >
                                            <MenuItem value="openai">
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    OpenAI (GPT)
                                                </div>
                                            </MenuItem>
                                            <MenuItem value="gemini">
                                                Google Gemini
                                            </MenuItem>
                                            <MenuItem value="openrouter">
                                                OpenRouter (Free/Paid)
                                            </MenuItem>
                                            <MenuItem value="external">
                                                Integração Externa (DireitaI)
                                            </MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl 
                                        variant="outlined" 
                                        className={classes.formControl}
                                        margin="dense"
                                    >
                                        <InputLabel>Modelo</InputLabel>
                                        <Select
                                            value={selectedModel}
                                            onChange={handleModelChange}
                                            label="Modelo"
                                            className={classes.modelSelect}
                                        >
                                            {getCurrentModels().map((model) => (
                                                <MenuItem key={model.value} value={model.value}>
                                                    <Box display="flex" alignItems="center" width="100%">
                                                        {model.label}
                                                        {model.free && (
                                                            <span className={classes.freeLabel}>
                                                                Grátis
                                                            </span>
                                                        )}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                <Field
                                    as={TextField}
                                    label={i18n.t("promptModal.form.apikey")}
                                    name="apiKey"
                                    type={showApiKey ? 'text' : 'password'}
                                    error={touched.apiKey && Boolean(errors.apiKey)}
                                    helperText={touched.apiKey && errors.apiKey}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    required
                                    className={classes.formControl}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <VpnKeyIcon className={classes.fieldIcon} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleToggleApiKey}>
                                                    {showApiKey ? <VisibilityOff style={{ color: "#ef4444" }} /> : <Visibility style={{ color: "#6366f1" }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Seção Configurações Avançadas */}
                                <div className={classes.configSection}>
                                    <Typography className={classes.sectionTitle}>
                                        <ModelTrainingIcon className={classes.sectionIcon} />
                                        Configurações Avançadas
                                    </Typography>

                                    <div className={classes.multFieldLine}>
                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.temperature")}
                                            name="temperature"
                                            type="number"
                                            inputProps={{ min: 0, max: 2, step: 0.1 }}
                                            error={touched.temperature && Boolean(errors.temperature)}
                                            helperText={touched.temperature && errors.temperature}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            className={classes.formControl}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <ThermostatIcon className={classes.fieldIcon} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.max_tokens")}
                                            name="maxTokens"
                                            type="number"
                                            inputProps={{ min: 1, max: 4000 }}
                                            error={touched.maxTokens && Boolean(errors.maxTokens)}
                                            helperText={touched.maxTokens && errors.maxTokens}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            className={classes.formControl}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Filter9PlusIcon className={classes.fieldIcon} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.max_messages")}
                                            name="maxMessages"
                                            type="number"
                                            inputProps={{ min: 1, max: 50 }}
                                            error={touched.maxMessages && Boolean(errors.maxMessages)}
                                            helperText={touched.maxMessages && errors.maxMessages}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            className={classes.formControl}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <ChatIcon className={classes.fieldIcon} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Seção Voz */}
                                <div className={classes.voiceSection}>
                                    <Typography className={classes.sectionTitle}>
                                        <HeadsetMicIcon className={classes.sectionIcon} />
                                        Configurações de Voz
                                    </Typography>

                                    <div className={classes.multFieldLine}>
                                        <FormControl 
                                            margin="dense" 
                                            variant="outlined" 
                                            className={classes.formControl}
                                        >
                                            <InputLabel>{i18n.t("promptModal.form.voice")}</InputLabel>
                                            <Select
                                                value={selectedVoice}
                                                onChange={handleChangeVoice}
                                                label={i18n.t("promptModal.form.voice")}
                                                className={classes.modelSelect}
                                            >
                                                <MenuItem value={"texto"}>Texto</MenuItem>
                                                <MenuItem value={"pt-BR-FranciscaNeural"}>Francisa</MenuItem>
                                                <MenuItem value={"pt-BR-AntonioNeural"}>Antônio</MenuItem>
                                                <MenuItem value={"pt-BR-BrendaNeural"}>Brenda</MenuItem>
                                                <MenuItem value={"pt-BR-DonatoNeural"}>Donato</MenuItem>
                                                <MenuItem value={"pt-BR-ElzaNeural"}>Elza</MenuItem>
                                                <MenuItem value={"pt-BR-FabioNeural"}>Fábio</MenuItem>
                                                <MenuItem value={"pt-BR-GiovannaNeural"}>Giovanna</MenuItem>
                                                <MenuItem value={"pt-BR-HumbertoNeural"}>Humberto</MenuItem>
                                                <MenuItem value={"pt-BR-JulioNeural"}>Julio</MenuItem>
                                                <MenuItem value={"pt-BR-LeilaNeural"}>Leila</MenuItem>
                                                <MenuItem value={"pt-BR-LeticiaNeural"}>Letícia</MenuItem>
                                                <MenuItem value={"pt-BR-ManuelaNeural"}>Manuela</MenuItem>
                                                <MenuItem value={"pt-BR-NicolauNeural"}>Nicolau</MenuItem>
                                                <MenuItem value={"pt-BR-ValerioNeural"}>Valério</MenuItem>
                                                <MenuItem value={"pt-BR-YaraNeural"}>Yara</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.voiceKey")}
                                            name="voiceKey"
                                            error={touched.voiceKey && Boolean(errors.voiceKey)}
                                            helperText={touched.voiceKey && errors.voiceKey}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            className={classes.formControl}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <VpnKeyIcon className={classes.fieldIcon} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.voiceRegion")}
                                            name="voiceRegion"
                                            error={touched.voiceRegion && Boolean(errors.voiceRegion)}
                                            helperText={touched.voiceRegion && errors.voiceRegion}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            className={classes.formControl}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SettingsInputAntennaIcon className={classes.fieldIcon} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <DialogActions className={classes.dialogActions}>
                                    <Button
                                        startIcon={<CancelIcon />}
                                        onClick={handleClose}
                                        className={classes.cancelButton}
                                        disabled={isSubmitting}
                                        variant="contained"
                                    >
                                        {i18n.t("promptModal.buttons.cancel")}
                                    </Button>
                                    <Button
                                        startIcon={<SaveIcon />}
                                        type="submit"
                                        className={classes.saveButton}
                                        disabled={isSubmitting}
                                        variant="contained"
                                    >
                                        {promptId
                                            ? `${i18n.t("promptModal.buttons.okEdit")}`
                                            : `${i18n.t("promptModal.buttons.okAdd")}`}
                                        {isSubmitting && (
                                            <CircularProgress
                                                size={24}
                                                style={{
                                                    color: "white",
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    marginTop: -12,
                                                    marginLeft: -12,
                                                }}
                                            />
                                        )}
                                    </Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PromptModal;