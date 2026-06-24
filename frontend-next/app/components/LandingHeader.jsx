export default function LandingHeader() {
  return (
    <header className="topbar">
      <div className="brand-lockup" aria-label="Home Buddy Connect Limited">
        <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
        <div>
          <div className="brand-name">Home Buddy Connect Limited</div>
          <div className="brand-tagline">Verified housing platform</div>
        </div>
      </div>

      <div className="auth-action-group" aria-label="Account actions">
        <a className="join-button" href="/signup">
          Join
        </a>
        <a className="join-button join-button--secondary" href="/login">
          Sign in
        </a>
      </div>
    </header>
  );
}
