import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f6f7fb",
      paper: "#ffffff",
    },
    primary: {
      main: "#6c5ce7", // tím nhẹ giống ảnh
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    fontSize: 14,
  },
});

export default theme;
