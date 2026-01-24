import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Container,
  Grid,
  Box,
  Card,
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery,
  IconButton
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SpeedIcon from '@material-ui/icons/Speed';
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SecurityIcon from '@material-ui/icons/Security';
import MenuIcon from '@material-ui/icons/Menu';

import heroPreview from '../../assets/smartphone.jpeg'; 
import DashboardMock from '../../components/DashboardMock';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  appBar: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 3),
  },
  logo: {
    height: 120,
    cursor: 'pointer',
    maxWidth: '90%',
    objectFit: 'contain',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  navLinks: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      gap: theme.spacing(4),
    },
  },
  navLink: {
    textTransform: 'none',
    color: '#4b5563',
    fontWeight: 500,
    fontSize: '1rem',
    '&:hover': {
      color: '#2563eb',
      backgroundColor: 'transparent',
    },
  },
  loginButton: {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: '8px',
    padding: '8px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#1d4ed8',
    },
  },
  heroSection: {
    padding: theme.spacing(12, 0),
    textAlign: 'center',
    background: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)',
  },
  heroTitle: {
    fontWeight: 800,
    color: '#111827',
    marginBottom: theme.spacing(3),
    fontSize: '3rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.25rem',
    },
  },
  heroSubtitle: {
    color: '#6b7280',
    fontSize: '1.25rem',
    maxWidth: '800px',
    margin: '0 auto',
    marginBottom: theme.spacing(5),
    lineHeight: 1.6,
  },
  ctaButton: {
    textTransform: 'none',
    fontSize: '1.125rem',
    fontWeight: 600,
    padding: '12px 32px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06)',
    '&:hover': {
      backgroundColor: '#1d4ed8',
      boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2), 0 4px 6px -2px rgba(37, 99, 235, 0.1)',
    },
  },
  featuresSection: {
    padding: theme.spacing(10, 0),
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontWeight: 700,
    color: '#111827',
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  sectionSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: theme.spacing(8),
    maxWidth: '600px',
    margin: '0 auto 64px auto',
  },
  testimonialsSection: {
    padding: theme.spacing(10, 0),
    backgroundColor: '#ffffff',
  },
  testimonialCard: {
    height: '100%',
    borderRadius: '16px',
    padding: theme.spacing(4),
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  testimonialQuote: {
    color: '#111827',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    lineHeight: 1.5,
  },
  testimonialAuthor: {
    color: '#6b7280',
    fontWeight: 500,
  },
  featureCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing(4),
    borderRadius: '16px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    boxShadow: 'none',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      borderColor: '#bfdbfe',
    },
  },
  stepAnimated1: {
    animation: '$fadeUp 0.6s ease-out',
    animationDelay: '0.1s',
    animationFillMode: 'backwards'
  },
  stepAnimated2: {
    animation: '$fadeUp 0.6s ease-out',
    animationDelay: '0.25s',
    animationFillMode: 'backwards'
  },
  stepAnimated3: {
    animation: '$fadeUp 0.6s ease-out',
    animationDelay: '0.4s',
    animationFillMode: 'backwards'
  },
  '@keyframes fadeUp': {
    '0%': { opacity: 0, transform: 'translateY(8px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' }
  },
  featureIconBox: {
    width: 64,
    height: 64,
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
    color: '#2563eb',
  },
  featureTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: '#1f2937',
  },
  featureText: {
    color: '#6b7280',
    lineHeight: 1.5,
  },
  pricingSection: {
    padding: theme.spacing(10, 0),
    backgroundColor: '#f9fafb',
  },
  ctaSection: {
    padding: theme.spacing(10, 0),
    background: 'linear-gradient(135deg,#eff6ff 0%, #ffffff 100%)',
  },
  heroMock: {
    marginTop: theme.spacing(6),
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 20px rgba(0,0,0,0.06)',
    overflow: 'hidden'
  },
  heroVisuals: {
    marginTop: theme.spacing(6),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'stretch'
  },
  smartphoneImg: {
    width: '100%',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 20px rgba(0,0,0,0.06)',
    objectFit: 'cover',
    marginBottom: theme.spacing(2)
  },
  heroMockHeader: {
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  heroMockDot: {
    width: 10,
    height: 10,
    borderRadius: '9999px',
    backgroundColor: '#d1d5db'
  },
  ctaContainer: {
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    padding: theme.spacing(6),
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(4),
  },
  ctaText: {
    color: '#111827',
    fontWeight: 700,
  },
  ctaSubText: {
    color: '#6b7280',
    marginTop: theme.spacing(1),
  },
  pricingCard: {
    height: '100%',
    borderRadius: '16px',
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
    border: '1px solid #e5e7eb',
    position: 'relative',
    overflow: 'visible',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  },
  pricingCardPopular: {
    border: '2px solid #2563eb',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.1), 0 4px 6px -2px rgba(37, 99, 235, 0.05)',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  planName: {
    fontWeight: 600,
    color: '#4b5563',
    marginBottom: theme.spacing(2),
    textTransform: 'uppercase',
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
  },
  planPrice: {
    fontWeight: 800,
    color: '#111827',
    marginBottom: theme.spacing(1),
  },
  planPeriod: {
    color: '#6b7280',
    fontWeight: 400,
    fontSize: '1rem',
  },
  planFeatures: {
    margin: theme.spacing(4, 0),
    flexGrow: 1,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    color: '#4b5563',
  },
  checkIcon: {
    color: '#2563eb',
    marginRight: theme.spacing(1.5),
    fontSize: '1.25rem',
  },
  planButton: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
  },
  footer: {
    backgroundColor: '#111827',
    color: '#f3f4f6',
    padding: theme.spacing(8, 0),
  },
  footerLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    marginBottom: theme.spacing(1),
    display: 'block',
    '&:hover': {
      color: '#ffffff',
    },
  },
}));

const LandingPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const logoSrc = theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark();

  const handleLogin = () => {
    history.push('/login');
  };

  const handleSignup = () => {
    history.push('/signup');
  };

  const plans = [
    {
      name: 'Start',
      price: '199,90',
      features: [
        '5 Usuários',
        '2 Conexões de WhatsApp',
        '5 Filas de Atendimento',
        'Chat Interno',
        'Agendamento de Mensagens',
        'Campanhas',
        'Kanban',
        'Integração OpenAI (IA)',
      ],
      highlight: false,
    },
    {
      name: 'Growth',
      price: '499,90',
      features: [
        '15 Usuários',
        '5 Conexões de WhatsApp',
        '15 Filas de Atendimento',
        'Tudo do plano Start',
        'Integração API Externa',
        'Integrações Oficiais',
        'Suporte Prioritário',
      ],
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: '999,90',
      features: [
        '50 Usuários',
        '20 Conexões de WhatsApp',
        '50 Filas de Atendimento',
        'Tudo do plano Growth',
        'Gerente de Contas',
        'Treinamento Dedicado',
        'Setup Personalizado',
      ],
      highlight: false,
    },
  ];

  return (
    <div className={classes.root}>
      {/* Navbar */}
      <AppBar position="sticky" className={classes.appBar} elevation={0}>
        <Container maxWidth="lg">
          <Toolbar className={classes.toolbar} disableGutters>
            <img src={logoSrc} alt="AIPENSA Logo" className={classes.logo} onClick={() => window.scrollTo(0, 0)} />
            
            <div className={classes.navLinks}>
              <Button className={classes.navLink} onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}>
                Como funciona
              </Button>
              <Button className={classes.navLink} onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                Funcionalidades
              </Button>
              <Button className={classes.navLink} onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>
                Planos
              </Button>
              <Button className={classes.navLink} onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
                Contato
              </Button>
            </div>

            <div>
              <Button color="primary" className={classes.navLink} style={{ marginRight: 8 }} onClick={handleLogin}>
                Entrar
              </Button>
              <Button 
                variant="contained" 
                className={classes.loginButton}
                onClick={handleSignup}
              >
                Começar Agora
              </Button>
            </div>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box className={classes.heroSection}>
        <Container maxWidth="md">
          <Typography variant="h1" className={classes.heroTitle}>
            A Revolução do Atendimento com <span style={{ color: '#2563eb' }}>Inteligência Artificial</span>
          </Typography>
          <Typography variant="h2" className={classes.heroSubtitle}>
            Centralize seu WhatsApp, automatize conversas com IA e escale suas vendas. 
            A plataforma completa para empresas que pensam no futuro.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            className={classes.ctaButton}
            onClick={handleSignup}
          >
            Teste Grátis Agora
          </Button>
          <Box className={classes.heroVisuals}>
            <img src={heroPreview} alt="Smartphone preview" className={classes.smartphoneImg} />
            <Box className={classes.heroMock}>
              <div className={classes.heroMockHeader}>
                <div className={classes.heroMockDot} />
                <div className={classes.heroMockDot} />
                <div className={classes.heroMockDot} />
              </div>
              <DashboardMock />
            </Box>
          </Box>
        </Container>
      </Box>

      <Box id="how" className={classes.featuresSection}>
        <Container maxWidth="lg">
          <Typography variant="h3" className={classes.sectionTitle}>
            Como funciona
          </Typography>
          <Typography variant="body1" className={classes.sectionSubtitle}>
            Três passos simples para começar
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className={`${classes.featureCard} ${classes.stepAnimated1}`}>
                <Box className={classes.featureIconBox}>
                  <QrCodeScannerIcon style={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" className={classes.featureTitle}>
                  Conecte o WhatsApp
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Gere o QR Code em Conexões e leia com seu WhatsApp.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={`${classes.featureCard} ${classes.stepAnimated2}`}>
                <Box className={classes.featureIconBox}>
                  <PsychologyIcon style={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" className={classes.featureTitle}>
                  Ative a IA
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Crie seu agente no menu Prompts e vincule ao WhatsApp.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={`${classes.featureCard} ${classes.stepAnimated3}`}>
                <Box className={classes.featureIconBox}>
                  <TrendingUpIcon style={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" className={classes.featureTitle}>
                  Escale as vendas
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Use campanhas, agendamentos e fluxos para automatizar.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" className={classes.featuresSection}>
        <Container maxWidth="lg">
          <Typography variant="h3" className={classes.sectionTitle}>
            Tudo o que você precisa em um só lugar
          </Typography>
          <Typography variant="body1" className={classes.sectionSubtitle}>
            Ferramentas poderosas para transformar seu relacionamento com clientes
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className={classes.featureCard}>
                <Box className={classes.featureIconBox}>
                  <WhatsAppIcon style={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" className={classes.featureTitle}>
                  Múltiplos WhatsApps
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Conecte vários números e centralize todo o atendimento da sua equipe em uma única tela organizada.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={classes.featureCard}>
                <Box className={classes.featureIconBox}>
                  <SmartToyIcon style={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" className={classes.featureTitle}>
                  Inteligência Artificial
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Integração nativa com ChatGPT, Gemini e DireitaI para respostas automáticas inteligentes e humanizadas.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={classes.featureCard}>
                <Box className={classes.featureIconBox}>
                  <SpeedIcon style={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" className={classes.featureTitle}>
                  Automação de Vendas
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Crie fluxos de conversa, agende mensagens e organize leads com um Kanban intuitivo e eficaz.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box className={classes.testimonialsSection}>
        <Container maxWidth="lg">
          <Typography variant="h3" className={classes.sectionTitle}>
            Quem usa, recomenda
          </Typography>
          <Typography variant="body1" className={classes.sectionSubtitle}>
            Resultados reais de negócios que adotaram atendimento inteligente
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className={classes.testimonialCard}>
                <Typography variant="body1" className={classes.testimonialQuote}>
                  “A centralização dos atendimentos e a automação nos deram escala. Hoje vendemos mais com menos esforço.”
                </Typography>
                <Typography variant="body2" className={classes.testimonialAuthor}>
                  Maria Silva, E‑Commerce
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={classes.testimonialCard}>
                <Typography variant="body1" className={classes.testimonialQuote}>
                  “A IA responde rápido e com contexto. O time foca no que importa e o cliente é atendido mais rápido.”
                </Typography>
                <Typography variant="body2" className={classes.testimonialAuthor}>
                  João Pereira, Serviços
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={classes.testimonialCard}>
                <Typography variant="body1" className={classes.testimonialQuote}>
                  “Integrações simples e métricas claras. Conseguimos enxergar gargalos e melhorar nosso funil.”
                </Typography>
                <Typography variant="body2" className={classes.testimonialAuthor}>
                  Ana Costa, Educação
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" className={classes.pricingSection}>
        <Container maxWidth="lg">
          <Typography variant="h3" className={classes.sectionTitle}>
            Planos desenhados para o seu crescimento
          </Typography>
          <Typography variant="body1" className={classes.sectionSubtitle}>
            Escolha a opção ideal para o momento da sua empresa
          </Typography>

          <Grid container spacing={4} alignItems="flex-end">
            {plans.map((plan) => (
              <Grid item key={plan.name} xs={12} md={4}>
                <Card className={`${classes.pricingCard} ${plan.highlight ? classes.pricingCardPopular : ''}`}>
                  {plan.highlight && (
                    <div className={classes.popularBadge}>
                      Mais Escolhido
                    </div>
                  )}
                  <CardContent style={{ flexGrow: 1 }}>
                    <Typography component="h3" className={classes.planName}>
                      {plan.name}
                    </Typography>
                    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '24px' }}>
                      <Typography component="h2" variant="h3" className={classes.planPrice}>
                        R$ {plan.price}
                      </Typography>
                      <Typography variant="h6" className={classes.planPeriod}>
                        /mês
                      </Typography>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {plan.features.map((line) => (
                        <li key={line} className={classes.featureItem}>
                          <CheckCircleIcon className={classes.checkIcon} />
                          <Typography variant="body2" style={{ fontSize: '0.95rem' }}>
                            {line}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth 
                      variant={plan.highlight ? "contained" : "outlined"} 
                      color="primary"
                      className={classes.planButton}
                      onClick={handleSignup}
                    >
                      Assinar Agora
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ */}
      <Box className={classes.featuresSection}>
        <Container maxWidth="lg">
          <Typography variant="h3" className={classes.sectionTitle}>
            Perguntas Frequentes
          </Typography>
          <Typography variant="body1" className={classes.sectionSubtitle}>
            Dúvidas comuns sobre implantação, suporte e recursos
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card className={classes.featureCard}>
                <Typography variant="h6" className={classes.featureTitle}>
                  Como faço a conexão do WhatsApp?
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Pelo menu Conexões, gere o QR Code e leia com o seu WhatsApp. Em minutos você estará atendendo centralizado.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className={classes.featureCard}>
                <Typography variant="h6" className={classes.featureTitle}>
                  A IA funciona com qualquer plano?
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Sim. Todos os planos têm suporte a IA com modelos otimizados. Basta ativar o agente no menu Prompts.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className={classes.featureCard}>
                <Typography variant="h6" className={classes.featureTitle}>
                  Posso integrar com ferramentas externas?
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Temos APIs e integrações oficiais. No plano Growth+ você habilita integrações externas rapidamente.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className={classes.featureCard}>
                <Typography variant="h6" className={classes.featureTitle}>
                  Como é o suporte?
                </Typography>
                <Typography variant="body2" className={classes.featureText}>
                  Suporte prioritário nos planos superiores e central de ajuda com material atualizado para todos.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className={classes.ctaSection}>
        <Container maxWidth="lg">
          <Box className={classes.ctaContainer}>
            <Box>
              <Typography variant="h5" className={classes.ctaText}>
                Pronto para escalar seu atendimento?
              </Typography>
              <Typography variant="body1" className={classes.ctaSubText}>
                Comece agora e tenha múltiplos WhatsApps, IA e automações em poucos minutos.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              className={classes.planButton}
              onClick={handleSignup}
            >
              Começar Agora
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box id="contact" className={classes.footer}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <img src={logoSrc} alt="AIPENSA" style={{ height: 96, marginBottom: 16, filter: 'brightness(0) invert(1)', objectFit: 'contain', maxWidth: '100%' }} />
              <Typography variant="body2" style={{ color: '#9ca3af' }}>
                Transformando a comunicação empresarial com tecnologia de ponta e inteligência artificial.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" style={{ color: '#ffffff', marginBottom: 16, fontSize: '1rem' }}>
                Produto
              </Typography>
              <a href="#features" className={classes.footerLink}>Funcionalidades</a>
              <a href="#pricing" className={classes.footerLink}>Planos</a>
              <a href="#" className={classes.footerLink}>Integrações</a>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" style={{ color: '#ffffff', marginBottom: 16, fontSize: '1rem' }}>
                Suporte
              </Typography>
              <a href="/help" className={classes.footerLink}>Central de Ajuda</a>
              <a href="/docs" className={classes.footerLink}>API Docs</a>
              <a href="/status" className={classes.footerLink}>Status</a>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" style={{ color: '#ffffff', marginBottom: 16, fontSize: '1rem' }}>
                Contato
              </Typography>
              <Typography variant="body2" style={{ color: '#9ca3af', marginBottom: 8 }}>
                Email: contato@aipensa.com
              </Typography>
              <Typography variant="body2" style={{ color: '#9ca3af' }}>
                WhatsApp: +55 (11) 91249-9850
              </Typography>
              <a href="/privacy" className={classes.footerLink}>Política de Privacidade</a>
              <a href="/terms" className={classes.footerLink}>Termos de Uso</a>
              <a href="/lgpd" className={classes.footerLink}>LGPD</a>
            </Grid>
          </Grid>
          <Box mt={8} pt={4} borderTop="1px solid #374151" textAlign="center">
            <Typography variant="body2" style={{ color: '#6b7280' }}>
              © {new Date().getFullYear()} AIPENSA. Todos os direitos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </div>
  );
};

export default LandingPage;
