export default function Footer({ text }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>
          <span className="footer-name">Nia</span>
          {text.footer}
        </p>
      </div>
    </footer>
  );
}
