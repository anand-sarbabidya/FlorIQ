export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand">
          <span className="site-header__mark" aria-hidden="true" />
          <div>
            <p className="site-header__name">FloraGuard</p>
            <p className="site-header__tag">CIS Tech · Auto / Manual Pitch</p>
          </div>
        </div>
        <p className="site-header__line">Grow Calm. Grow Green. Indoors.</p>
      </div>
    </header>
  );
}
