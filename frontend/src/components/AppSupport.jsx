import { useId } from "react";
import ReportForm from "./ReportForm.jsx";

export default function AppSupport({ text, user, onOpen }) {
  const copy = text.support;
  const titleId = useId();

  return (
    <article className="page page-support">
      <section className="page-band">
        <div className="report-dialog report-sheet">
          <ReportForm
            copy={copy}
            user={user}
            titleId={titleId}
            onSignIn={() => onOpen("login")}
            onConsent={() => onOpen("consent")}
          />
        </div>
      </section>
    </article>
  );
}
