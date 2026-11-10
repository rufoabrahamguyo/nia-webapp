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
        <div className="referral-media">
          <section aria-labelledby="referral-video-title">
            <h2 id="referral-video-title">{text.referralVideoTitle}</h2>
            <video
              className="referral-video"
              controls
              playsInline
              preload="metadata"
              poster="/images/referral-poster.png"
              src="/videos/referral-pathway.mp4"
            >
              {text.referralVideoFallback}
            </video>
          </section>

          <section aria-labelledby="referral-chart-title">
            <h2 id="referral-chart-title">{text.referralChartTitle}</h2>
            <img
              className="referral-chart"
              src="/images/referral-pathway.png?v=2"
              alt={text.referralChartAlt}
            />
          </section>
        </div>
      </div>
    </article>
  );
}
