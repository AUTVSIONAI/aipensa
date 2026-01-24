import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import { versionSystem } from "../../../package.json";
import { nomeEmpresa } from "../../../package.json";
import useSettings from "../../hooks/useSettings";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import { Checkbox, FormControlLabel, LinearProgress } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import { Helmet } from "react-helmet";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from "@material-ui/core/Dialog";
import Grow from "@mui/material/Grow";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import wallfundo from "../../assets/f002.png";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import Lock from "@material-ui/icons/Lock";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

// Ícones
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow ref={ref} {...props} />;
});

const handleRedirect = () => {
  window.open(`https://wa.me/${process.env.REACT_APP_SUPPORT_WHATSAPP}`, "_blank");
};

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
        {nomeEmpresa} - v {versionSystem}
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
  networkCanvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    opacity: 0.35,
  },
  
  loginCard: {
    position: "relative",
    zIndex: 2,
    maxWidth: "380px",
    width: "100%",
    margin: "20px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },

  cardContent: {
    padding: "36px 32px",
    [theme.breakpoints.down('sm')]: {
      padding: "32px 28px",
    },
  },

  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
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

  welcomeTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: "8px",
    textAlign: "center",
    letterSpacing: "-0.02em",
    [theme.breakpoints.down('sm')]: {
      fontSize: "1.75rem",
    },
  },

  welcomeSubtitle: {
    fontSize: "1rem",
    color: "#6b7280",
    marginBottom: "32px",
    textAlign: "center",
    fontWeight: 400,
    lineHeight: 1.5,
  },

  form: {
    width: "100%",
  },

  inputField: {
    marginBottom: "24px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f9fafb",
      border: "1px solid #e5e7eb",
      transition: "all 0.2s ease-in-out",
      fontSize: "0.95rem",
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
      fontSize: "0.95rem",
      fontWeight: 500,
      "&.Mui-focused": {
        color: "#3b82f6",
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "16px 14px",
      color: "#1f2937",
      fontSize: "0.95rem",
      "&::placeholder": {
        color: "#9ca3af",
        opacity: 1,
      },
    },
  },

  passwordStrengthBar: {
    marginTop: "-16px",
    marginBottom: "16px",
    height: "3px",
    borderRadius: "2px",
    backgroundColor: "#f3f4f6",
    "& .MuiLinearProgress-bar": {
      borderRadius: "2px",
    },
  },

  passwordStrengthText: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: "4px",
    marginBottom: "16px",
    fontWeight: 500,
  },

  rememberMeContainer: {
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rememberMe: {
    "& .MuiFormControlLabel-label": {
      fontSize: "0.875rem",
      color: "#6b7280",
      fontWeight: 500,
    },
    "& .MuiCheckbox-root": {
      color: "#9ca3af",
      "&.Mui-checked": {
        color: "#3b82f6",
      },
    },
  },

  forgotPassword: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 600,
    transition: "color 0.2s ease-in-out",
    "&:hover": {
      color: "#2563eb",
      textDecoration: "none",
    },
  },

  loginButton: {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#6A0DAD",
    color: "white",
    fontSize: "1rem",
    fontWeight: 600,
    textTransform: "none",
    marginBottom: "24px",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#6A0DAD",
      boxShadow: "0 6px 16px rgba(59, 130, 246, 0.5)",
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0px)",
    },
  },

  divider: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
    "&::before, &::after": {
      content: '""',
      flex: 1,
      height: "1px",
      background: "#e5e7eb",
    },
  },

  dividerText: {
    padding: "0 16px",
    color: "#9ca3af",
    fontSize: "0.875rem",
    fontWeight: 500,
  },

  actionButtons: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    [theme.breakpoints.down('sm')]: {
      flexDirection: "column",
    },
  },

  signupButton: {
    flex: 1,
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: "#6366f1",
    fontSize: "0.95rem",
    fontWeight: 600,
    textTransform: "none",
    border: "2px solid #6366f1",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#6366f1",
      color: "white",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
    },
  },

  supportButton: {
    flex: 1,
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#10b981",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 600,
    textTransform: "none",
    border: "2px solid #10b981",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#059669",
      borderColor: "#059669",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
    },
  },

  sslInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    fontSize: "0.75rem",
    fontWeight: 500,
    marginBottom: "24px",
  },

  lockIcon: {
    fontSize: "1rem",
    marginRight: "6px",
  },

  footer: {
    textAlign: "center",
  },

  // Estilos para o ícone de visibilidade da senha
  visibilityIcon: {
    color: "#9ca3af",
    "&:hover": {
      color: "#6b7280",
    },
  },
}));

const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

const Login = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { colorMode } = useContext(ColorModeContext);
  const { appLogoFavicon, appName, mode } = colorMode;
  const [user, setUser] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [allowSignup, setAllowSignup] = useState(false);
  const { getPublicSetting } = useSettings();
  const { handleLogin } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChangeInput = (name, value) => {
    setUser({ ...user, [name]: value });
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    getPublicSetting("allowSignup")
      .then((data) => {
        setAllowSignup(data === "enabled");
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
  }, []);

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 2) return "#ef4444";
    if (strength <= 4) return "#f59e0b";
    return "#10b981";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 2) return "Senha fraca";
    if (strength > 2 && strength <= 4) return "Senha média";
    return "Senha forte";
  };

  return (
    <>
      <Helmet>
        <title>{appName || "Premium SaaS Platform"}</title>
        <link rel="icon" href={appLogoFavicon || "/default-favicon.ico"} />
      </Helmet>
      
      <CssBaseline />
      
      <div className={classes.root}>
        <svg className={classes.networkCanvas} viewBox="0 0 1000 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.8" />
              <stop offset="100%" stopColor={(theme.palette.secondary && theme.palette.secondary.main) || "#6A0DAD"} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <g stroke="url(#lineGrad)" strokeWidth="2" fill="none">
            <path d="M100 80 L300 150 L500 120 L700 200 L900 160" />
            <path d="M120 300 L260 260 L420 340 L640 280 L860 360" />
            <path d="M80 500 L220 420 L380 460 L560 420 L780 500" />
          </g>
          <g fill={theme.palette.primary.main}>
            <circle cx="100" cy="80" r="4" />
            <circle cx="300" cy="150" r="4" />
            <circle cx="500" cy="120" r="4" />
            <circle cx="700" cy="200" r="4" />
            <circle cx="900" cy="160" r="4" />
            <circle cx="120" cy="300" r="4" />
            <circle cx="260" cy="260" r="4" />
            <circle cx="420" cy="340" r="4" />
            <circle cx="640" cy="280" r="4" />
            <circle cx="860" cy="360" r="4" />
            <circle cx="80" cy="500" r="4" />
            <circle cx="220" cy="420" r="4" />
            <circle cx="380" cy="460" r="4" />
            <circle cx="560" cy="420" r="4" />
            <circle cx="780" cy="500" r="4" />
          </g>
        </svg>
        <Card className={classes.loginCard}>
          <CardContent className={classes.cardContent}>
            {/* Logo */}
            <div className={classes.logoContainer}>
              <img className={classes.logoImg} alt="logo" />
            </div>

            {/* Login Form */}
            <form className={classes.form} noValidate onSubmit={handlSubmit}>
              <TextField
                className={classes.inputField}
                variant="outlined"
                required
                fullWidth
                id="email"
                name="email"
                placeholder="Digite seu e-mail"
                value={user.email}
                onChange={(e) =>
                  handleChangeInput(e.target.name, e.target.value.toLowerCase())
                }
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon style={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                className={classes.inputField}
                variant="outlined"
                required
                fullWidth
                name="password"
                placeholder="Digite sua senha"
                type={showPassword ? "text" : "password"}
                id="password"
                value={user.password}
                onChange={(e) =>
                  handleChangeInput(e.target.name, e.target.value)
                }
                autoComplete="current-password"
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
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password Strength Indicator */}
              {user.password && (
                <>
                  <LinearProgress
                    className={classes.passwordStrengthBar}
                    variant="determinate"
                    value={(passwordStrength / 5) * 100}
                  />
                  <Typography className={classes.passwordStrengthText}>
                    {getPasswordStrengthText(passwordStrength)}
                  </Typography>
                </>
              )}

              {/* Remember Me & Forgot Password */}
              <div className={classes.rememberMeContainer}>
                <FormControlLabel
                  className={classes.rememberMe}
                  control={
                    <Checkbox
                      checked={user.rememberMe}
                      onChange={(e) =>
                        handleChangeInput("rememberMe", e.target.checked)
                      }
                      size="small"
                    />
                  }
                  label="Lembre-se de mim"
                />
                <Link 
                  component={RouterLink} 
                  to="/forgetpsw" 
                  className={classes.forgotPassword}
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className={classes.loginButton}
                startIcon={<LoginIcon />}
              >
                Entrar na plataforma
              </Button>

              {/* Divider */}
              <div className={classes.divider}>
                <span className={classes.dividerText}>ou</span>
              </div>

              {/* Action Buttons */}
              <div className={classes.actionButtons}>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/signup"
                  className={classes.signupButton}
                  startIcon={<AddIcon />}
                >
                  Criar conta
                </Button>
                <Button
                  variant="contained"
                  className={classes.supportButton}
                  onClick={handleRedirect}
                  startIcon={<WhatsAppIcon />}
                >
                  Suporte
                </Button>
              </div>

              {/* SSL Info */}
              <div className={classes.sslInfo}>
                <Lock className={classes.lockIcon} />
                <span>Conexão segura SSL/TLS</span>
              </div>
            </form>

            {/* Footer */}
            <div className={classes.footer}>
              <Copyright />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Login;
