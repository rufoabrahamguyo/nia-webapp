import { useEffect, useState } from "react";
import copy from "./copy.js";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import HelpLine from "./components/HelpLine.jsx";
import Helplines from "./components/Helplines.jsx";
import Home from "./components/Home.jsx";
import Reminder from "./components/Reminder.jsx";
import Screen from "./components/Screen.jsx";

export default function App() {
  const [language, setLanguage] = useState("en");
  const [view, setView] = useState("home");
  const [anchor, setAnchor] = useState(null);
  const [scrollKey, setScrollKey] = useState(0);
  const text = copy[language];

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

  return (
    <div lang={language === "sw" ? "sw" : "en"}>
      <Header
        language={language}
        text={text}
        view={view}
        onLanguage={setLanguage}
        onNavigate={open}
        onHelp={showHelp}
      />
      <main id="content">
        {view === "home" ? (
          <Home text={text} onOpen={open} />
        ) : view === "helplines" ? (
          <Helplines language={language} text={text} />
        ) : (
          <Screen id={view} screen={text.screens[view]} onOpen={open} />
        )}
        <div className="wrap">
          <HelpLine text={text} onOpen={open} />
        </div>
        {view === "home" && <Reminder key={language} text={text} />}
      </main>
      <Footer text={text} onNavigate={open} />
    </div>
  );
}
