import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global-css/index.css";
import App from "./App.tsx";
import { AuthProvider } from "./core/auth/auth.provider.tsx";
import { I18nProvider } from "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nProvider>
  </StrictMode>
);
