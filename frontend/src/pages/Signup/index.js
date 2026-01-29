import React, { useState, useEffect } from "react";
import qs from 'query-string';
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import usePlans from "../../hooks/usePlans";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import {
    IconButton,
    InputAdornment,
    TextField,
    Button,
    Grid,
    Box,
    Typography,
    Container,
    CssBaseline,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    AppBar,
    Toolbar,
    CircularProgress,
    Fade,
    useTheme,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Card,
    CardContent,
    CardActions,
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import SaveIcon from '@mui/icons-material/Save';
import LoginIcon from '@mui/icons-material/Login';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import Lock from "@material-ui/icons/Lock";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";
import logo from "../../assets/logo.png";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Link from "@material-ui/core/Link";
import { versionSystem } from "../../../package.json";
import { nomeEmpresa } from "../../../package.json";
import wallfundo from "../../assets/f002.png";
import ColorModeContext from "../../layout/themeContext";

const Copyright = () => {
    return (
      <Typography variant="body2" color="textSecondary" align="center" style={{ 
        color: "#9ca3af", 
        fontSize: "0.75rem",
        fontWeight: 300 
      }}>
        © {new Date().getFullYear()}
        {" - "}
        <Link color="inherit" href="#" style={{ color: "#9ca3af" }}>
          { nomeEmpresa } - v { versionSystem }
        </Link>
      </Typography>
    );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `radial-gradient(1200px circle at 10% 10%, ${theme.palette.primary.main}22 0, transparent 40%), radial-gradient(800px circle at 90% 80%, ${theme.palette.secondary ? theme.palette.secondary.main : "#6A0DAD"}22 0, transparent 50%), linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(180deg, ${theme.palette.mode === "dark" ? "#00000099" : "#00000033"} 0%, transparent 60%)`,
      zIndex: 1,
    }
  },

  signupCard: {
    position: "relative",
    zIndex: 2,
    maxWidth: "450px",
    width: "100%",
    margin: "20px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    maxHeight: "85vh",
    overflowY: "auto",
  },

  cardContent: {
    padding: "20px 24px",
    [theme.breakpoints.down('sm')]: {
      padding: "18px 20px",
    },
  },

  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  },

  logoImg: {
    maxWidth: "280px",
    height: "auto",
    maxHeight: "100px",
    content:
      "url(" +
      (theme.mode === "light"
        ? theme.calculatedLogoLight()
        : theme.calculatedLogoDark()) +
      ")",
  },

  form: {
    width: "100%",
  },

  inputField: {
    marginBottom: "8px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f9fafb",
      border: "1px solid #e5e7eb",
      transition: "all 0.2s ease-in-out",
      fontSize: "0.9rem",
      fontWeight: 500,
      "&:hover": {
        borderColor: "#d1d5db",
        backgroundColor: "#ffffff",
      },
      "&.Mui-focused": {
        borderColor: "#3b82f6",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputLabel-outlined": {
      color: "#6b7280",
      fontSize: "0.9rem",
      fontWeight: 500,
      "&.Mui-focused": {
        color: "#3b82f6",
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "10px",
      color: "#1f2937",
      fontSize: "0.9rem",
      "&::placeholder": {
        color: "#9ca3af",
        opacity: 1,
      },
    },
  },

  phoneInputContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "10px",
    width: "100%",
    marginBottom: "8px",
    transition: "all 0.2s ease-in-out",
    "&:focus-within": {
      borderColor: "#3b82f6",
      backgroundColor: "#ffffff",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
    "&:hover": {
      borderColor: "#d1d5db",
      backgroundColor: "#ffffff",
    },
  },

  phoneInput: {
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    width: "100%",
    color: "#1f2937",
    fontSize: "0.9rem",
  },

  planButton: {
    width: '100%',
    marginBottom: "8px",
    padding: "10px",
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    textAlign: 'left',
    transition: 'all 0.3s ease',
    border: '1px solid #e5e7eb',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#ffffff',
    },
  },

  planButtonContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },

  planName: {
    fontWeight: 600,
    color: '#3b82f6',
    fontSize: '0.95rem',
    marginBottom: "2px",
  },

  planDetails: {
    color: '#6b7280',
    fontSize: '0.8rem',
    marginBottom: "2px",
  },

  planPrice: {
    color: '#3b82f6',
    fontWeight: 600,
    fontSize: '0.85rem',
  },

  selectPlanText: {
    color: '#9ca3af',
    fontSize: '0.95rem',
    textAlign: 'center',
    width: '100%',
  },

  submitButton: {
    width: "100%",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#3b82f6",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 600,
    textTransform: "none",
    marginBottom: "8px",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#2563eb",
      boxShadow: "0 6px 16px rgba(59, 130, 246, 0.5)",
      transform: "translateY(-1px)",
    },
    "&:disabled": {
      backgroundColor: "#9ca3af",
      boxShadow: "none",
      transform: "none",
    },
  },

  loginButton: {
    width: "100%",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: "#6366f1",
    fontSize: "0.9rem",
    fontWeight: 600,
    textTransform: "none",
    border: "2px solid #6366f1",
    marginBottom: "8px",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#6366f1",
      color: "white",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
    },
  },

  termsCheckbox: {
    marginBottom: "8px",
    "& .MuiFormControlLabel-label": {
      fontSize: "0.75rem",
      color: "#6b7280",
      fontWeight: 500,
    },
    "& .MuiCheckbox-root": {
      color: "#9ca3af",
      padding: "4px",
      "&.Mui-checked": {
        color: "#3b82f6",
      },
    },
  },

  sslInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    fontSize: "0.7rem",
    fontWeight: 500,
    marginBottom: "8px",
  },

  lockIcon: {
    fontSize: "0.9rem",
    marginRight: "4px",
  },

  footer: {
    textAlign: "center",
    marginTop: "4px",
  },

  visibilityIcon: {
    color: "#9ca3af",
    "&:hover": {
      color: "#6b7280",
    },
  },

  progressContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    textAlign: "center",
  },

  progressText: {
    marginTop: theme.spacing(2),
    color: "#3b82f6",
    fontWeight: 600,
  },

  planDialog: {
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },

  planCard: {
    borderRadius: '12px',
    margin: theme.spacing(2),
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'visible',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
    },
  },

  popularBadge: {
    position: 'absolute',
    top: theme.spacing(-1),
    right: theme.spacing(2),
    backgroundColor: '#ff9800',
    color: 'white',
    padding: theme.spacing(0.5, 2),
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureList: {
    paddingLeft: 0,
    listStyleType: 'none',
    marginTop: theme.spacing(2),
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    fontSize: '0.9rem',
  },

  featureIcon: {
    marginRight: theme.spacing(1),
    color: '#4caf50',
    fontSize: '1rem',
  },

  dialogPlanPrice: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#3b82f6',
    margin: theme.spacing(1, 0),
    textAlign: 'center',
  },

  planPeriod: {
    fontSize: '0.9rem',
    color: '#666',
    textAlign: 'center',
  },
}));

const UserSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Muito curto!")
        .max(50, "Muito extenso!")
        .required("Obrigatório"),
    password: Yup.string()
        .min(5, "Muito curto!")
        .max(50, "Muito extenso!")
        .required("Obrigatório"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], "As senhas não são iguais.")
        .required("Por favor, confirme sua senha."),
    email: Yup.string()
        .email("Email inválido")
        .required("Obrigatório"),
    planId: Yup.string()
        .required("Por favor, selecione um plano.")
});

const SignupFormRenderer = (props) => {
    const { 
        selectedPlan, 
        values, 
        errors, 
        touched, 
        isSubmitting, 
        setFieldValue, 
        classes, 
        showPassword, 
        toggleShowPassword, 
        handleOpen: handleOpenTermsParent,
        agreeToTerms, 
        setAgreeToTerms, 
        termsModalOpen: termsModalOpenParent,
        handleClose: handleCloseTermsParent,
        openPlanModal 
    } = props;

    React.useEffect(() => {
        if (selectedPlan && (!values.planId || values.planId !== selectedPlan.id)) {
            setFieldValue('planId', selectedPlan.id);
        } else if (!selectedPlan && values.planId) {
            setFieldValue('planId', '');
        }
    }, [selectedPlan, setFieldValue, values.planId]);

    const isSubmitDisabled = !agreeToTerms || isSubmitting || !selectedPlan || !values.planId;

    return (
        <Form className={classes.form}>
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        id="companyName"
                        error={touched.companyName && Boolean(errors.companyName)}
                        helperText={touched.companyName && errors.companyName}
                        name="companyName"
                        placeholder="Nome da Empresa"
                        autoFocus
                        className={classes.inputField}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <BusinessIcon style={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        autoComplete="name"
                        name="name"
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        id="name"
                        placeholder="Nome Completo"
                        className={classes.inputField}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon style={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        id="email"
                        name="email"
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        placeholder="Email"
                        className={classes.inputField}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon style={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        variant="outlined"
                        margin="dense"
                        required
                        fullWidth
                        name="password"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Senha"
                        className={classes.inputField}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon style={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        className={classes.visibilityIcon}
                                        aria-label="toggle password visibility"
                                        onClick={toggleShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        variant="outlined"
                        margin="dense"
                        required
                        fullWidth
                        name="confirmPassword"
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="Confirme a Senha"
                        className={classes.inputField}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon style={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        className={classes.visibilityIcon}
                                        aria-label="toggle password visibility"
                                        onClick={toggleShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <div className={classes.phoneInputContainer}>
                        <Field name="phone">
                            {({ field }) => (
                                <PhoneInput
                                    {...field}
                                    international
                                    defaultCountry="BR"
                                    onChange={(value) => setFieldValue('phone', value)}
                                    className={classes.phoneInput}
                                    placeholder="Telefone"
                                    icon={<PhoneIcon style={{ color: "#9ca3af", fontSize: "1.2rem", marginRight: "8px" }} />}
                                />
                            )}
                        </Field>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CardMembershipIcon />}
                        onClick={openPlanModal}
                        className={classes.planButton}
                        style={{
                            backgroundColor: selectedPlan ? '#e3f2fd' : '#f9fafb',
                            border: selectedPlan ? '2px solid #3b82f6' : touched.planId && errors.planId ? '2px solid #ef4444' : '1px solid #e5e7eb',
                        }}
                    >
                        <div className={classes.planButtonContent}>
                            {selectedPlan ? (
                                <>
                                    <Typography className={classes.planName}>
                                        {selectedPlan.name}
                                    </Typography>
                                    <Typography className={classes.planDetails}>
                                        Atendentes: {selectedPlan.users} | Conexões: {selectedPlan.connections} | Filas: {selectedPlan.queues}
                                    </Typography>
                                    <Typography className={classes.planPrice}>
                                        R$ {selectedPlan.amount}/mês
                                    </Typography>
                                </>
                            ) : (
                                <Typography className={classes.selectPlanText}>
                                    Selecione um plano...
                                </Typography>
                            )}
                        </div>
                    </Button>
                    {touched.planId && errors.planId && (
                        <Typography color="error" variant="caption" style={{ marginLeft: '14px', display: 'block', fontSize: '0.75rem' }}>
                            {errors.planId}
                        </Typography>
                    )}
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        className={classes.termsCheckbox}
                        control={
                            <Checkbox
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                name="agreeToTerms"
                                size="small"
                            />
                        }
                        label={
                            <span>
                                Eu concordo com os {" "}
                                <span
                                    onClick={handleOpenTermsParent}
                                    style={{ color: "#3b82f6", textDecoration: "none", cursor: "pointer", fontWeight: 600 }}
                                >
                                    Termos e Condições
                                </span>
                            </span>
                        }
                    />
                    <Dialog open={termsModalOpenParent} onClose={handleCloseTermsParent} maxWidth="md" fullWidth>
                        <DialogTitle>TERMOS DE USO DO SISTEMA</DialogTitle>
                        <DialogContent dividers>
                            <p><strong>1. ACEITAÇÃO DOS TERMOS</strong></p>
                            <p>1.1. Estes Termos de Uso ("Termos") regem o uso do sistema web, disponibilizado pela Empresa ZapChatPro. 1.2. Ao acessar ou utilizar o Sistema, o usuário concorda em cumprir estes Termos. Caso não concorde, deve cessar o uso do Sistema imediatamente.</p>
                            <p><strong>2. LICENÇA DE USO</strong></p>
                            <p>2.1. O Licenciante concede ao Usuário uma licença limitada, não exclusiva, intransferível e revogável para uso do Sistema de acordo com estes Termos. 2.2. O Usuário não poderá modificar, distribuir, vender, alugar, sublicenciar ou realizar engenharia reversa sobre o Sistema, salvo quando expressamente permitido por lei.</p>
                            <p><strong>3. DIREITOS AUTORAIS E PROPRIEDADE INTELECTUAL</strong></p>
                            <p>3.1. O Sistema, incluindo código-fonte, design, logotipos e demais conteúdos, é protegido por leis de direitos autorais e outras leis de propriedade intelectual. 3.2. Nenhuma parte do Sistema poderá ser copiada, reproduzida ou utilizada sem a autorização expressa do Licenciante. 3.3. O Licenciante detém todos os direitos, títulos e interesses relacionados ao Sistema.</p>
                            <p><strong>4. ACESSO E DISPONIBILIDADE</strong></p>
                            <p>4.1. O Licenciante se esforçará para manter o Sistema disponível de forma contínua, mas não garante que o acesso será ininterrupto ou livre de erros. 4.2. O Usuário reconhece que o acesso ao Sistema pode ser temporariamente interrompido para manutenção, atualizações ou fatores externos.</p>
                            <p><strong>5. ATUALIZAÇÕES E MODIFICAÇÕES</strong></p>
                            <p>5.1. O Licenciante poderá, a seu critério, fornecer atualizações e melhorias no Sistema, sendo que algumas funcionalidades podem ser alteradas ou descontinuadas sem aviso prévio. 5.2. O Usuário deve manter-se informado sobre as atualizações para garantir sua funcionalidade adequada.</p>
                            <p><strong>6. RESPONSABILIDADES DO USUÁRIO</strong></p>
                            <p>6.1. O Usuário se compromete a utilizar o Sistema de forma lícita e em conformidade com estes Termos. 6.2. O Licenciante não se responsabiliza por qualquer dano decorrente do uso indevido do Sistema pelo Usuário. 6.3. O Usuário é responsável por manter a segurança de suas credenciais de acesso e por todas as atividades realizadas em sua conta.</p>
                            <p><strong>7. LIMITAÇÃO DE RESPONSABILIDATE</strong></p>
                            <p>7.1. O Sistema é fornecido, com garantias de uso e funcionalidades, expressas ou implícitas. 7.2. O Licenciante não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequentes resultantes do uso ou impossibilidade de uso do Sistema.</p>
                            <p><strong>8. CONTATO</strong></p>
                            <p>Para dúvidas ou esclarecimentos, o Usuário pode entrar em contato com o Licenciante pelo e-mail <strong>zapchatprobr@gmail.com</strong> ou pelo Whatsapp <strong><a href="https://wa.me/5527996716613" target="_blank" rel="noopener noreferrer">+55 27996716613</a></strong>.</p>
                            <p><em>Última atualização: 07-02-2025</em></p>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseTermsParent} color="primary">Fechar</Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        startIcon={<SaveIcon />}
                        className={classes.submitButton}
                        disabled={isSubmitDisabled}
                    >
                        Criar conta
                    </Button>
                    
                    <Button
                        fullWidth
                        variant="outlined"
                        component={RouterLink}
                        to="/login"
                        startIcon={<LoginIcon />}
                        className={classes.loginButton}
                    >
                        Já tenho uma conta
                    </Button>

                    {/* SSL Info */}
                    <div className={classes.sslInfo}>
                        <Lock className={classes.lockIcon} />
                        <span>Conexão segura SSL/TLS</span>
                    </div>
                </Grid>
            </Grid>
        </Form>
    );
};

const SignUp = () => {
    const theme = useTheme();
    const classes = useStyles();
    const history = useHistory();
    
    const [showPassword, setShowPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [termsModalOpen, setTermsModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [processingModalOpen, setProcessingModalOpen] = useState(false);
    const [processingText, setProcessingText] = useState("Realizando cadastro...");
    const { getPlanList } = usePlans();
    const [loading, setLoading] = useState(false);
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    
    let companyId = null;
    const params = qs.parse(window.location.search);
    if (params.companyId !== undefined) {
        companyId = params.companyId;
    }

    const initialState = { name: "", email: "", password: "", confirmPassword: "", phone: "", companyId, companyName: "", planId: "" };

    const [plans, setPlans] = useState([]);

    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                const planList = await getPlanList();
                
                if (isMounted) {
                    setPlans(planList);
                }
            } catch (error) {
                if (isMounted) {
                    toastError("Erro ao carregar planos. Tente novamente.");
                    console.error("Plan fetch error:", error);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        fetchData();
        
        return () => {
            isMounted = false;
        };
    }, [getPlanList]);

    const toggleShowPassword = () => {
        setShowPassword(prevShowPassword => !prevShowPassword);
    };

    const handleOpenTermsModal = () => {
        setTermsModalOpen(true);
    };

    const handleCloseTermsModal = () => {
        setTermsModalOpen(false);
    };
    
    const dueDate = moment().add(7, "day").format();
    const handleSignUp = async (values) => {
        setProcessingModalOpen(true);
        setProcessingText("Validando dados...");
        
        const stages = [
            "Criando conta...",
            "Configurando ambiente...",
            "Finalizando cadastro..."
        ];
        
        for (let i = 0; i < stages.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 700));
            setProcessingText(stages[i]);
        }
        
        const dataToSend = {
            ...values,
            phone: values.phone ? values.phone.replace(/\D/g, '') : '',
            recurrence: "MENSAL",
            dueDate: dueDate,
            status: "t",
            campaignsEnabled: true,
        };
        
        try {
            await openApi.post("/auth/signup", dataToSend);
            await new Promise(resolve => setTimeout(resolve, 500));
            setProcessingModalOpen(false);
            setSuccessModalOpen(true);
        } catch (err) {
            setProcessingModalOpen(false);
            toastError(err);
        }
    };

    const handleCloseSuccessModal = () => {
        setSuccessModalOpen(false);
        history.push("/login");
    };

    const openPlanModal = () => {
        setPlanModalOpen(true);
    };

    const closePlanModal = () => {
        setPlanModalOpen(false);
    };

    const selectPlan = (plan) => {
        setSelectedPlan(plan);
        setPlanModalOpen(false);
    };

    return (
        <div className={classes.root}>
            <Card className={classes.signupCard}>
                <CardContent className={classes.cardContent}>
                    {/* Logo */}
                    <div className={classes.logoContainer}>
                        <img src={logo} alt="logo" className={classes.logoImg} />
                    </div>

                    {/* Signup Form */}
                    <Formik
                        initialValues={initialState}
                        enableReinitialize={false} 
                        validationSchema={UserSchema}
                        onSubmit={(values, actions) => {
                            if (!values.planId) {
                                setProcessingModalOpen(false);
                                toastError("Por favor, selecione um plano para prosseguir.");
                                actions.setSubmitting(false); 
                                return;
                            }
                            handleSignUp(values).finally(() => {
                            });
                        }}
                    >
                        {(formikProps) => (
                            <SignupFormRenderer
                                selectedPlan={selectedPlan}
                                classes={classes}
                                showPassword={showPassword}
                                toggleShowPassword={toggleShowPassword}
                                handleOpen={handleOpenTermsModal}
                                agreeToTerms={agreeToTerms}
                                setAgreeToTerms={setAgreeToTerms}
                                termsModalOpen={termsModalOpen}
                                handleClose={handleCloseTermsModal}
                                openPlanModal={openPlanModal}
                                {...formikProps}
                            />
                        )}
                    </Formik>

                    {/* Footer */}
                    <div className={classes.footer}>
                        <Copyright />
                    </div>
                </CardContent>
            </Card>

            {/* Plan Selection Modal */}
            <Dialog
                open={planModalOpen}
                onClose={closePlanModal}
                maxWidth="md"
                fullWidth
                classes={{
                    paper: classes.planDialog,
                }}
            >
                <DialogTitle style={{ textAlign: 'center', color: '#3b82f6', fontWeight: 'bold', paddingBottom: '8px' }}>
                    Escolha o Plano Ideal para Você
                    <Typography variant="body2" style={{ color: '#666', marginTop: '8px' }}>
                        Todos os planos incluem suporte e atualizações gratuitas
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {loading && (
                        <Box display="flex" justifyContent="center" my={3}>
                            <CircularProgress />
                        </Box>
                    )}
                    {!loading && plans.length === 0 && (
                         <Typography color="textSecondary" align="center" style={{padding: "20px"}}>
                             Nenhum plano disponível no momento.
                         </Typography>
                    )}
                    {!loading && plans.length > 0 && (
                        <Grid container spacing={2} justifyContent="center">
                            {plans.map((plan, index) => (
                                <Grid item xs={12} sm={6} md={4} key={plan.id}>
                                    <Card 
                                        className={classes.planCard} 
                                        style={{ 
                                            border: selectedPlan?.id === plan.id ? '2px solid #3b82f6' : '1px solid #e0e0e0',
                                            backgroundColor: selectedPlan?.id === plan.id ? '#f0f7ff' : '#ffffff',
                                        }}
                                    >
                                        {index === 1 && (
                                            <div className={classes.popularBadge}>
                                                <StarIcon style={{ fontSize: '1rem', marginRight: '4px' }} />
                                                POPULAR
                                            </div>
                                        )}
                                        <CardContent style={{paddingTop: index === 1 ? theme.spacing(5) : theme.spacing(3)}}>
                                            <Typography variant="h5" component="h2" style={{ 
                                                color: '#3b82f6', 
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}>
                                                {plan.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', minHeight: '3em' }}>
                                                Ideal para {plan.users === 1 ? 'pequenas empresas' : plan.users <= 3 ? 'empresas em crescimento' : 'grandes empresas'}
                                            </Typography>
                                            <Typography className={classes.dialogPlanPrice}>
                                                R$ {plan.amount}
                                                <span className={classes.planPeriod}>/mês</span>
                                            </Typography>
                                            <ul className={classes.featureList}>
                                                <li className={classes.featureItem}>
                                                    <CheckCircleIcon className={classes.featureIcon} />
                                                    {plan.users} Atendente(s)
                                                </li>
                                                <li className={classes.featureItem}>
                                                    <CheckCircleIcon className={classes.featureIcon} />
                                                    {plan.connections} Conexão(ões) WhatsApp
                                                </li>
                                                <li className={classes.featureItem}>
                                                    <CheckCircleIcon className={classes.featureIcon} />
                                                    {plan.queues} Fila(s) de atendimento
                                                </li>
                                                <li className={classes.featureItem}>
                                                    <CheckCircleIcon className={classes.featureIcon} />
                                                    Suporte prioritário
                                                </li>
                                                <li className={classes.featureItem}>
                                                    <CheckCircleIcon className={classes.featureIcon} />
                                                    Atualizações gratuitas
                                                </li>
                                            </ul>
                                        </CardContent>
                                        <CardActions style={{ justifyContent: 'center' }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                onClick={() => selectPlan(plan)}
                                                style={{
                                                    backgroundColor: selectedPlan?.id === plan.id ? '#3b82f6' : '#757de8',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    margin: '0 16px',
                                                    padding: '10px 0',
                                                }}
                                            >
                                                {selectedPlan?.id === plan.id ? 'Selecionado' : 'Selecionar Plano'}
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', padding: '16px' }}>
                    <Button 
                        onClick={closePlanModal} 
                        style={{ 
                            color: '#3b82f6',
                            fontWeight: 'bold',
                        }}
                    >
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Processing Modal */}
            <Dialog 
                open={processingModalOpen} 
                disableEscapeKeyDown
                PaperProps={{
                    style: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    }
                }}
            >
                <DialogContent className={classes.progressContainer}>
                    <Fade
                        in={processingModalOpen}
                        style={{
                            transitionDelay: processingModalOpen ? '300ms' : '0ms',
                        }}
                        unmountOnExit
                    >
                        <CircularProgress 
                            size={60} 
                            thickness={4}
                            style={{ color: '#3b82f6' }}
                        />
                    </Fade>
                    <Typography variant="h6" className={classes.progressText}>
                        {processingText}
                    </Typography>
                    <Typography variant="body2" style={{ marginTop: '10px', color: '#666' }}>
                        Por favor, aguarde enquanto processamos seu cadastro...
                    </Typography>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog 
                open={successModalOpen} 
                onClose={handleCloseSuccessModal}
                PaperProps={{
                    style: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        textAlign: 'center',
                    }
                }}
            >
                <DialogTitle style={{ color: "#4caf50", fontWeight: "bold", paddingBottom: "0" }}>
                    <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
                        <CheckCircleIcon style={{ fontSize: 64, color: "#4caf50" }}/>
                    </Box>
                    Cadastro Realizado com Sucesso!
                </DialogTitle>
                <DialogContent>
                    <DialogContentText style={{ color: "#555", fontSize: "16px" }}>
                        Seu cadastro foi realizado com sucesso. Agora você pode fazer login e começar a usar o sistema.
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', paddingBottom: '20px' }}>
                    <Button 
                        onClick={handleCloseSuccessModal} 
                        variant="contained" 
                        style={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            borderRadius: '8px',
                            padding: '8px 24px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            fontSize: '16px',
                            boxShadow: 'none',
                        }}
                        autoFocus
                    >
                        Fazer Login
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SignUp;
