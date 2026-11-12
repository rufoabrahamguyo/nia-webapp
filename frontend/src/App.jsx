import { useEffect, useState } from "react";
import { requestAuth } from "./auth.js";
import copy from "./copy.js";
import { applyPage } from "./pages.js";
import { leaveSite } from "./scroll.js";
import Account from "./components/Account.jsx";
import AppSupport from "./components/AppSupport.jsx";
import AuthPanel from "./components/AuthPanel.jsx";
import ConsentDialog, { clearConsentPending, consentPromptPending, markConsentPending } from "./components/Consent.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import HelpLine from "./components/HelpLine.jsx";
import Helplines from "./components/Helplines.jsx";
import Home from "./components/Home.jsx";
import NiaChat from "./components/NiaChat.jsx";
import ReferralPathways from "./components/ReferralPathways.jsx";
import Reminder from "./components/Reminder.jsx";
import Screen from "./components/Screen.jsx";

export default function App() {
  const [language, setLanguage] = useState("en");
  const [pages, setPages] = useState(null);
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
  const [consentOpen, setConsentOpen] = useState(false);
  const [authError] = useState(
    () => new URLSearchParams(window.location.search).get("auth_error") || "",
  );
  const text = copy[language];
  const isAuth = view === "login" || view === "signup" || view === "google";
  const isAccount = view === "profile" || view === "settings" || (view === "support" && user);
  const screen = applyPage(text.screens[view], pages?.[view]?.[language]);

  useEffect(() => {
    if (anchor) {
      document.getElementById(anchor)?.scrollIntoView({ block: "start" });
      return;
    }
    window.scrollTo(0, 0);
  }, [view, anchor, scrollKey]);

  function open(next, nextAnchor) {
    if (next === "consent") {
      setConsentOpen(true);
      return;
    }
    if (next === "support-someone") {
      setView("learn");
      setAnchor("guide-title");
      setScrollKey((key) => key + 1);
      return;
    }
    setAnchor(nextAnchor || null);
    setView(next);
    setScrollKey((key) => key + 1);
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
    fetch("/api/pages")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setPages(data.pages || {});
      })
      .catch(() => {
        if (!cancelled) setPages(null);
      });
    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    if (!authReady || !user) return;
    if (user.consentSigned) {
      clearConsentPending();
      setConsentOpen(false);
      return;
    }
    if (consentPromptPending()) setConsentOpen(true);
  }, [authReady, user]);

  function closeConsent() {
    clearConsentPending();
    setConsentOpen(false);
  }

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
        onLeave={leaveSite}
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
              if (!next.consentSigned) {
                markConsentPending();
                setConsentOpen(true);
              }
              open("home");
            }}
          />
        ) : view === "home" ? (
          <Home text={text} onOpen={open} />
        ) : view === "helplines" ? (
          <Helplines language={language} text={text} />
        ) : view === "referral" ? (
          <ReferralPathways text={text} />
        ) : view === "support" && !user ? (
          <AppSupport text={text} user={user} language={language} onOpen={open} />
        ) : view === "chat" ? (
          <NiaChat text={text} user={user} language={language} onOpen={open} />
        ) : view === "profile" || view === "settings" || view === "support" ? (
          user && (
            <Account
              key={view}
              mode={view}
              text={text}
              user={user}
              onNavigate={open}
              onUser={setUser}
              onLogout={logout}
            />
          )
        ) : (
          <Screen
            id={view}
            screen={screen}
            text={text}
            user={user}
            language={language}
            onOpen={open}
          />
        )}
        {!isAuth && !isAccount && (
          <div className="wrap">
            <HelpLine text={text} onOpen={open} />
          </div>
        )}
        {view === "home" && <Reminder key={language} text={text} />}
      </main>
      {!isAuth && <Footer text={text} onNavigate={open} />}
      {consentOpen && user && !user.consentSigned ? (
        <ConsentDialog text={text} onClose={closeConsent} onSigned={setUser} />
      ) : null}
    </div>
  );
}
