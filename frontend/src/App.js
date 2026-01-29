import React, { useState, useEffect, useMemo } from "react";
import api from "./services/api";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { ActiveMenuProvider } from "./context/ActiveMenuContext";
import Favicon from "react-favicon";
import { getBackendUrl } from "./config";
import Routes from "./routes";
import defaultLogoLight from "./assets/logo.png";
import defaultLogoDark from "./assets/logo-black.png";
import defaultLogoFavicon from "./assets/favicon.ico";
import useSettings from "./hooks/useSettings";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  const [locale, setLocale] = useState();
  const appColorLocalStorage = localStorage.getItem("primaryColorLight") || localStorage.getItem("primaryColorDark") || "#065183";
  const appNameLocalStorage = localStorage.getItem("appName") || "";
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredTheme = window.localStorage.getItem("preferredTheme");
  const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");
  const [primaryColorLight, setPrimaryColorLight] = useState(appColorLocalStorage);
  const [primaryColorDark, setPrimaryColorDark] = useState(appColorLocalStorage);
  const [appLogoLight, setAppLogoLight] = useState(defaultLogoLight);
  const [appLogoDark, setAppLogoDark] = useState(defaultLogoDark);
  const [appLogoFavicon, setAppLogoFavicon] = useState(defaultLogoFavicon);
  const [appName, setAppName] = useState(appNameLocalStorage);
  const { getPublicSetting } = useSettings();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          window.localStorage.setItem("preferredTheme", newMode); // Persistindo o tema no localStorage
          return newMode;
        });
      },
      setPrimaryColorLight,
      setPrimaryColorDark,
      setAppLogoLight,
      setAppLogoDark,
      setAppLogoFavicon,
      setAppName,
      appLogoLight,
      appLogoDark,
      appLogoFavicon,
      appName,
      mode,
    }),
    [appLogoLight, appLogoDark, appLogoFavicon, appName, mode]
  );

  const theme = useMemo(
  () =>
    createTheme(
      {
        typography: {
          fontFamily: [
            '"Inter"',
            '"Poppins"',
            '"Roboto"',
            'sans-serif'
          ].join(','),
          h1: { fontSize: '2.125rem', fontWeight: 700, letterSpacing: '-0.01562em' },
          h2: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.00833em' },
          h3: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0em' },
          button: { fontWeight: 600, textTransform: 'none', borderRadius: '12px' },
        },
        overrides: {
          MuiCssBaseline: {
            '@global': {
              body: {
                backgroundColor: mode === 'light' ? '#F4F6F8' : '#0a0e17', // Deep Space Dark
                backgroundImage: mode === 'dark' 
                  ? 'radial-gradient(circle at 50% 0%, #1e1e2f 0%, #0a0e17 80%)' 
                  : 'none',
              },
              '*': {
                scrollbarWidth: 'thin',
                scrollbarColor: mode === 'dark'
                  ? 'rgba(255,255,255,0.22) rgba(0,0,0,0)'
                  : 'rgba(17,24,39,0.28) rgba(0,0,0,0)',
              },
              '*::-webkit-scrollbar': {
                width: 8,
                height: 8,
              },
              '*::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '*::-webkit-scrollbar-thumb': {
                backgroundColor: mode === 'dark'
                  ? 'rgba(255,255,255,0.18)'
                  : 'rgba(17,24,39,0.22)',
                borderRadius: 999,
                border: '2px solid transparent',
                backgroundClip: 'content-box',
              },
              '*::-webkit-scrollbar-thumb:hover': {
                backgroundColor: mode === 'dark'
                  ? 'rgba(255,255,255,0.28)'
                  : 'rgba(17,24,39,0.32)',
              },
            },
          },
          MuiPaper: {
            rounded: {
              borderRadius: '16px',
            },
            elevation1: {
              boxShadow: mode === 'dark' ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 4px 20px 0 rgba(0,0,0,0.05)',
            },
            root: {
              backgroundColor: mode === 'dark' ? 'rgba(30, 30, 47, 0.7)' : '#ffffff',
              backdropFilter: mode === 'dark' ? 'blur(20px)' : 'none',
              border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            }
          },
          MuiButton: {
            root: {
              borderRadius: '12px',
              padding: '10px 24px',
            },
            containedPrimary: {
              background: `linear-gradient(45deg, ${primaryColorLight} 30%, #6a11cb 90%)`,
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              color: 'white',
            }
          }
        },
        palette: {
          type: mode,
          primary: { main: mode === "light" ? primaryColorLight : "#00f2ff" }, // Neon Blue in Dark
          secondary: { main: "#bd00ff" }, // Cyber Purple
          background: {
            default: mode === "light" ? "#F4F6F8" : "#0a0e17",
            paper: mode === "light" ? "#ffffff" : "#1e1e2f",
          },
          textPrimary: mode === "light" ? "#1a1a1a" : "#ffffff",
          borderPrimary: mode === "light" ? primaryColorLight : "rgba(255, 255, 255, 0.1)",
          dark: { main: mode === "light" ? "#333333" : "#F3F3F3" },
          light: { main: mode === "light" ? "#F3F3F3" : "#333333" },
          tabHeaderBackground: mode === "light" ? "#EEE" : "#1e1e2f", // Match paper
          optionsBackground: mode === "light" ? "#fafafa" : "#1e1e2f",
          fancyBackground: mode === "light" ? "#fafafa" : "#0a0e17",
          total: mode === "light" ? "#fff" : "#222",
          messageIcons: mode === "light" ? "grey" : "#F3F3F3",
          inputBackground: mode === "light" ? "#FFFFFF" : "#2d2b42",
          barraSuperior: mode === "light" ? primaryColorLight : "rgba(30, 30, 47, 0.7)", // Glass header
        },
        custom: {
          glass: {
            card: {
              background: mode === "light" ? "rgba(255, 255, 255, 0.85)" : "rgba(17, 24, 39, 0.45)",
              border: mode === "light" ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              boxShadow: mode === "light" ? "0 6px 18px rgba(0,0,0,0.06)" : "0 12px 32px rgba(0,0,0,0.35)",
            },
            chip: {
              background: mode === "light" ? "rgba(255, 255, 255, 0.7)" : "rgba(17, 24, 39, 0.25)",
              border: mode === "light" ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.10)",
              activeBorder: "1px solid rgba(0, 242, 255, 0.35)",
              activeBackground: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
              activeShadow: "0 10px 28px rgba(0,0,0,0.18)",
            },
          },
          gradients: {
            primary: "linear-gradient(90deg, #00f2ff 0%, #bd00ff 100%)",
          },
        },
        scrollbarStyles: {
          scrollbarWidth: "thin",
          scrollbarColor:
            mode === "dark"
              ? "rgba(255,255,255,0.22) transparent"
              : "rgba(17,24,39,0.28) transparent",
          "&::-webkit-scrollbar": { width: 8, height: 8 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor:
              mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(17,24,39,0.22)",
            borderRadius: 999,
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor:
              mode === "dark" ? "rgba(255,255,255,0.28)" : "rgba(17,24,39,0.32)",
          },
        },
        scrollbarStylesSoft: {
          scrollbarWidth: "thin",
          scrollbarColor:
            mode === "dark"
              ? "rgba(255,255,255,0.16) transparent"
              : "rgba(17,24,39,0.18) transparent",
          "&::-webkit-scrollbar": { width: 6, height: 6 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor:
              mode === "dark" ? "rgba(255,255,255,0.14)" : "rgba(17,24,39,0.16)",
            borderRadius: 999,
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor:
              mode === "dark" ? "rgba(255,255,255,0.22)" : "rgba(17,24,39,0.24)",
          },
        },
        scrollbarStylesSoftBig: {
          scrollbarWidth: "thin",
          scrollbarColor:
            mode === "dark"
              ? "rgba(255,255,255,0.18) transparent"
              : "rgba(17,24,39,0.22) transparent",
          "&::-webkit-scrollbar": { width: 10, height: 10 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor:
              mode === "dark" ? "rgba(255,255,255,0.16)" : "rgba(17,24,39,0.18)",
            borderRadius: 999,
            border: "3px solid transparent",
            backgroundClip: "content-box",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor:
              mode === "dark" ? "rgba(255,255,255,0.26)" : "rgba(17,24,39,0.28)",
          },
        },
        mode,
        appLogoLight,
        appLogoDark,
        appLogoFavicon,
        appName,
        calculatedLogoDark: () => {
          if (appLogoDark === defaultLogoDark && appLogoLight !== defaultLogoLight) {
            return appLogoLight;
          }
          return appLogoDark;
        },
        calculatedLogoLight: () => {
          if (appLogoDark !== defaultLogoDark && appLogoLight === defaultLogoLight) {
            return appLogoDark;
          }
          return appLogoLight;
        },
      },
      locale
    ),
  [appLogoLight, appLogoDark, appLogoFavicon, appName, locale, mode, primaryColorDark, primaryColorLight]
);

  useEffect(() => {
    window.localStorage.setItem("preferredTheme", mode);
  }, [mode]);

  useEffect(() => {
    let isMounted = true;
    console.log("|=========== handleSaveSetting ==========|")
    console.log("APP START")
    console.log("|========================================|")
    
    if (process.env.REACT_APP_DISABLE_PUBLIC_SETTINGS === "true") {
      setPrimaryColorLight("#065183");
      setPrimaryColorDark("#065183");
      setAppLogoLight(defaultLogoLight);
      setAppLogoDark(defaultLogoDark);
      setAppLogoFavicon(defaultLogoFavicon);
      setAppName("Empresa Admin - Não Deletar!");
    } else {
      getPublicSetting("primaryColorLight")
        .then((color) => {
          if (isMounted) setPrimaryColorLight(color || "#0000FF");
        })
        .catch((error) => {
          console.log("Error reading setting", error);
        });
      getPublicSetting("primaryColorDark")
        .then((color) => {
          if (isMounted) setPrimaryColorDark(color || "#39ACE7");
        })
        .catch((error) => {
          console.log("Error reading setting", error);
        });
      getPublicSetting("appLogoLight")
        .then((file) => {
          if (isMounted) setAppLogoLight(file ? getBackendUrl() + "/public/" + file : defaultLogoLight);
        })
        .catch((error) => {
          console.log("Error reading setting", error);
        });
      getPublicSetting("appLogoDark")
        .then((file) => {
          if (isMounted) setAppLogoDark(file ? getBackendUrl() + "/public/" + file : defaultLogoDark);
        })
        .catch((error) => {
          console.log("Error reading setting", error);
        });
      getPublicSetting("appLogoFavicon")
        .then((file) => {
          if (isMounted) setAppLogoFavicon(file ? getBackendUrl() + "/public/" + file : defaultLogoFavicon);
        })
        .catch((error) => {
          console.log("Error reading setting", error);
        });
      getPublicSetting("appName")
        .then((name) => {
          if (isMounted) setAppName(name || "Chat-flow");
        })
        .catch((error) => {
          console.log("!==== Erro ao carregar temas: ====!", error);
          if (isMounted) setAppName("chat-flow");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primaryColor", mode === "light" ? primaryColorLight : primaryColorDark);
  }, [primaryColorLight, primaryColorDark, mode]);

  useEffect(() => {
    async function fetchVersionData() {
      try {
        const response = await api.get("/version");
        const { data } = response;
        window.localStorage.setItem("frontendVersion", data.version);
      } catch (error) {
        console.log("Error fetching data", error);
      }
    }
    fetchVersionData();
  }, []);

  return (
    <>
      <Favicon url={appLogoFavicon ? getBackendUrl() + "/public/" + appLogoFavicon : defaultLogoFavicon} />
      <ColorModeContext.Provider value={{ colorMode }}>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <ActiveMenuProvider>
              <ErrorBoundary>
                <Routes />
              </ErrorBoundary>
            </ActiveMenuProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
};

export default App;
