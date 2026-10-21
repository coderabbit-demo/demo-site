/** Mounts the feature tour in the application shell. */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { App } from "./App";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Application root is missing.");
createRoot(container).render(
  <StrictMode>
    <App />
    <Analytics mode={import.meta.env.PROD ? "production" : "development"} />
  </StrictMode>,
);
