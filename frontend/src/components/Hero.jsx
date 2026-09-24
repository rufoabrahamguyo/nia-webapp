import { scrollToSection } from "../scroll.js";

export default function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-heading">
      <div className="wrap">
      <p className="eyebrow">Survivor-centred support · Kenya</p>
      <h1 id="hero-heading">Understand your options. Decide in your own time.</h1>
      <p className="lede">
        Nia is for adults who have faced sexual harassment where speaking up is hard — because of a
        lecturer or supervisor, because of work, or because other people want the matter kept quiet.
        You can learn, see your rights, keep a private record, and reach verified support. You decide
        what happens next.
      </p>
      <div className="hero-actions">
        <button type="button" className="button button-primary" onClick={() => scrollToSection("rights")}>
          Know your rights
        </button>
        <button type="button" className="button button-secondary" onClick={() => scrollToSection("support")}>
          Find support
        </button>
      </div>
      <p className="notice">
        Nia is not the police, a hospital, or an emergency service. If you are in immediate danger,
        call <a href="tel:999">999</a> or <a href="tel:112">112</a>.
      </p>
      </div>
    </section>
  );
}
