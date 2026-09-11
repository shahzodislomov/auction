import { createTheme, type Shadows } from "@mui/material/styles";

export const champagneTokens = {
  colors: {
    navy950: "#04122B",
    navy900: "#081B3D",
    navy800: "#0C2A56",
    champagne500: "#D8B58C",
    champagne600: "#C9A16F",
    goldText: "#775025",
    canvas: "#F8F6F2",
    surface: "#FFFFFF",
    surfaceMuted: "#F0ECE6",
    textPrimary: "#081B3D",
    textSecondary: "#526077",
    border: "#D7D2CA",
    focusRing: "#8A5C1F",
    success: "#176B4D",
    successSurface: "#E8F4EE",
    warning: "#8A5C1F",
    warningSurface: "#FBF1DF",
    info: "#235789",
    infoSurface: "#E8F0F8",
    danger: "#B42318",
    dangerSurface: "#FBEAE8",
  },
  typography: {
    product: 'var(--font-manrope), "Segoe UI", sans-serif',
    display: 'var(--font-unbounded), var(--font-manrope), "Segoe UI", sans-serif',
    supporting: "0.875rem",
    body: "1rem",
    lead: "1.125rem",
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  radius: { small: 4, medium: 8, large: 12, pill: 999 },
  shadow: {
    sticky: "0 8px 24px rgb(4 18 43 / 10%)",
    overlay: "0 24px 64px rgb(4 18 43 / 18%)",
  },
  motion: {
    fast: 160,
    standard: 200,
    slow: 240,
    easing: "cubic-bezier(0.2, 0, 0, 1)",
  },
} as const;

declare module "@mui/material/styles" {
  interface Theme {
    champagne: typeof champagneTokens;
  }

  interface ThemeOptions {
    champagne?: typeof champagneTokens;
  }
}

const { colors, typography, radius, shadow, motion } = champagneTokens;

const champagneShadows = [
  "none",
  shadow.sticky,
  shadow.overlay,
  ...Array.from({ length: 22 }, () => shadow.overlay),
] as Shadows;

export const champagneTheme = createTheme({
  champagne: champagneTokens,
  palette: {
    mode: "light",
    primary: {
      main: colors.navy900,
      dark: colors.navy950,
      light: colors.navy800,
      contrastText: colors.surface,
    },
    secondary: {
      main: colors.champagne500,
      dark: colors.champagne600,
      contrastText: colors.navy900,
    },
    success: { main: colors.success },
    warning: { main: colors.warning },
    info: { main: colors.info },
    error: { main: colors.danger },
    background: {
      default: colors.canvas,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.border,
  },
  spacing: 4,
  shape: { borderRadius: radius.medium },
  shadows: champagneShadows,
  typography: {
    fontFamily: typography.product,
    fontSize: 16,
    h1: {
      fontFamily: typography.display,
      fontWeight: 600,
      letterSpacing: "-0.025em",
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: typography.display,
      fontWeight: 600,
      letterSpacing: "-0.025em",
      lineHeight: 1.2,
    },
    body1: { fontSize: typography.body, lineHeight: 1.6 },
    body2: { fontSize: typography.supporting, lineHeight: 1.55 },
    button: {
      fontFamily: typography.product,
      fontWeight: 700,
      textTransform: "none",
    },
  },
  transitions: {
    duration: {
      shortest: motion.fast,
      shorter: motion.fast,
      short: motion.standard,
      standard: motion.standard,
      complex: motion.slow,
      enteringScreen: motion.slow,
      leavingScreen: motion.standard,
    },
    easing: {
      easeInOut: motion.easing,
      easeOut: motion.easing,
      easeIn: motion.easing,
      sharp: motion.easing,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.canvas,
          color: colors.textPrimary,
        },
        "*:focus-visible": {
          outline: `3px solid ${colors.focusRing}`,
          outlineOffset: 2,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.medium,
          minHeight: 44,
          paddingInline: 20,
          transitionDuration: `${motion.fast}ms`,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderColor: colors.border,
        },
      },
    },
  },
});
