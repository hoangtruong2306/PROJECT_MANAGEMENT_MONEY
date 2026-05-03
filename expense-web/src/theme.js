import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#F8FAFC",
      paper: "#ffffff",
    },
    primary: {
      main: "#059669",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
  },
});

export default theme;

