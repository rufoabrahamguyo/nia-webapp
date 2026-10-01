import { useEffect, useState } from "react";
import { requestAuth } from "./auth.js";
import copy from "./copy.js";
import AuthPanel from "./components/AuthPanel.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import HelpLine from "./components/HelpLine.jsx";
import Helplines from "./components/Helplines.jsx";
import Home from "./components/Home.jsx";
import Reminder from "./components/Reminder.jsx";
import Screen from "./components/Screen.jsx";

export default function App() {
  const [language, setLanguage] = useState("en");
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "finish") return "google";
    if (params.get("auth_error")) return "login";
    return "home";
  });
  const [anchor, setAnchor] = useState(null);
  const [scrollKey, setScrollKey] = useState(0);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError] = useState(
    () => new URLSearchParams(window.location.search).get("auth_error") || "",
  );
  const text = copy[language];
  const isAuth = view === "login" || view === "signup" || view === "google";

  useEffect(() => {
    if (anchor) {
      document.getElementById(anchor)?.scrollIntoView({ block: "start" });
      return;
    }
    window.scrollTo(0, 0);
  }, [view, anchor, scrollKey]);

  function open(next) {
    if (next === "support-someone") {
      setView("learn");
      setAnchor("guide-title");
      setScrollKey((key) => key + 1);
      return;
    }
    setAnchor(null);
    setView(next);
  }

  function showHelp() {
    setAnchor(null);
    setView("helplines");
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("auth_error") || params.has("google")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    requestAuth("/api/auth/me")
      .then((next) => {
        if (!cancelled) setUser(next);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    try {
      await requestAuth("/api/auth/logout", {});
    } catch {
      // Still leave the page so a failed request does not keep the header signed in.
    }
    setUser(null);
    setView("home");
  }

  return (
    <div lang={language === "sw" ? "sw" : "en"}>
      <Header
        language={language}
        text={text}
        view={view}
        user={user}
        authReady={authReady}
        onLanguage={setLanguage}
        onNavigate={open}
        onHelp={showHelp}
        onLogout={logout}
      />
      <main id="content">
        {isAuth ? (
          <AuthPanel
            key={view}
            mode={view}
            text={text}
            initialErrorCode={view === "login" ? authError : ""}
            onSwitch={() => open(view === "login" ? "signup" : "login")}
            onSuccess={(next) => {
              setUser(next);
              open("home");
            }}
          />
        ) : view === "home" ? (
          <Home text={text} onOpen={open} />
        ) : view === "helplines" ? (
          <Helplines language={language} text={text} />
        ) : (
          <Screen id={view} screen={text.screens[view]} onOpen={open} />
        )}
        {!isAuth && (
          <div className="wrap">
            <HelpLine text={text} onOpen={open} />
          </div>
        )}
        {view === "home" && <Reminder key={language} text={text} />}
      </main>
      {!isAuth && <Footer text={text} onNavigate={open} />}
    </div>
  );
}
