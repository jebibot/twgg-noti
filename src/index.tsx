import React from "react";
import ReactDOM from "react-dom";
import { store } from "react-notifications-component";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import App from "./App";
import { setMessageListener } from "./api/Firebase";
import "./index.css";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://f7b5c1ae56e048da86112bbc85010703@o75632.ingest.sentry.io/5782638",
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root"),
  () => {
    setMessageListener((payload) => {
      store.addNotification({
        title: payload.notification.title,
        message: payload.notification.body,
        type: payload.notification.title === "오류" ? "danger" : "info",
        insert: "top",
        container: "top-right",
        dismiss: {
          duration: 5000,
        },
      });
    });
  }
);
