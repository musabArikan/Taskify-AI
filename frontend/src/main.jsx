import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import config from "devextreme/core/config";

config({
  licenseKey: import.meta.env.VITE_DEVEXTREME_LICENSE_KEY,
});

createRoot(document.getElementById("root")).render(<App />);
