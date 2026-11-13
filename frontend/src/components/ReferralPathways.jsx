import VideoFrame from "./VideoFrame.jsx";

export default function ReferralPathways({ text }) {
  return (
    <article className="page page-referral">
      <header className="page-hero">
        <div className="page-hero-copy">
          <h1 id="referral-title">{text.referralTitle}</h1>
          <p className="lede">{text.referralLine}</p>
        </div>
      </header>

      <div className="page-band">
        <div className="learn-split">
          <div className="page-band-intro">
            <h2 id="referral-video-title">{text.referralLearn}</h2>
          </div>
          <div className="help-video-wrap">
            <VideoFrame
              className="pathway-video"
              src="/videos/referral-pathway.mp4"
              poster="/images/referral-poster.png"
              label={text.referralLearn}
              playLabel={text.referralVideoPlay}
              fallback={text.referralVideoFallback}
            />
          </div>
        </div>

        <section className="pathway-split" aria-labelledby="referral-chart-title">
          <img
            className="referral-chart"
            src="/images/referral-pathway.png?v=3"
            alt={text.referralChartAlt}
          />
          <div className="pathway-copy">
            <h2 id="referral-chart-title">{text.referralChartTitle}</h2>
            <p>{text.referralChartLine}</p>
            <ul className="guide-list">
              {text.referralChartPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </article>
  );
}
