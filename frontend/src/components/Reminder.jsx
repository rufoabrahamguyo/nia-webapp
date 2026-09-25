import { useEffect, useState } from "react";

export default function Reminder({ text }) {
  const slides = text.reminders;
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [index, slides.length]);

  return (
    <section className="reminder" aria-labelledby="reminder-title">
      <div className="reminder-copy" key={slide.body}>
        <h2 id="reminder-title">{slide.title}</h2>
        <p aria-live="polite">{slide.body}</p>
        <div className="reminder-dots" role="group" aria-label={text.reminderDots}>
          {slides.map((item, itemIndex) => (
            <button
              key={item.body}
              type="button"
              className={itemIndex === index ? "is-active" : undefined}
              aria-current={itemIndex === index ? "true" : undefined}
              aria-label={`${itemIndex + 1} / ${slides.length}`}
              onClick={() => setIndex(itemIndex)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
