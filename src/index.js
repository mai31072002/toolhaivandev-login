import React from "react";
import ReactDOM from "react-dom";
import "./i18n";
import App from "./app/app";
import reportWebVitals from "./reportWebVitals";
import AuthConfig from "./app/main/auth/auth.config";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import ThemeProvider from "./app/layout/home-theme-provider";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
if (AuthConfig.guestPath.indexOf(window.location.pathname) === -1) {
  ReactDOM.render(
    <GoogleReCaptchaProvider reCaptchaKey="6Ley_DogAAAAANNMXPuIvNtaPzFJK6a5-a19wgrF">
      <React.StrictMode>
        <ThemeProvider>
          <App path={window.location.pathname} />
        </ThemeProvider>
      </React.StrictMode>
    </GoogleReCaptchaProvider>,
    document.getElementById("root")
  );
  // }
} else {
  ReactDOM.render(
    <GoogleReCaptchaProvider reCaptchaKey="6Ley_DogAAAAANNMXPuIvNtaPzFJK6a5-a19wgrF">
      <App path={window.location.pathname} />
    </GoogleReCaptchaProvider>,
    document.getElementById("root")
  );
}
App.displayName = "App";

reportWebVitals();
