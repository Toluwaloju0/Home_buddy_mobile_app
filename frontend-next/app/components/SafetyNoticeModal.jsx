'use client';

export const SAFETY_NOTICE = 'Your safety starts with making informed decisions. Please verify before you pay.';

export default function SafetyNoticeModal({
  open,
  onClose,
  onContinue,
  continueLabel = 'Continue',
}) {
  if (!open) return null;

  return (
    <div
      className="search-popout-overlay safety-notice-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="search-popout-dialog safety-notice-dialog" role="dialog" aria-modal="true" aria-labelledby="safety-notice-title">
        <button type="button" className="search-popout-close" onClick={onClose} aria-label="Close safety notice">
          ×
        </button>
        <p className="settings-kicker">Safety notice</p>
        <h2 id="safety-notice-title">Verify before you pay</h2>
        <p>{SAFETY_NOTICE}</p>
        <div className="safety-notice-actions">
          <button type="button" className="search-popout-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="primary-button" onClick={onContinue}>{continueLabel}</button>
        </div>
      </section>
    </div>
  );
}
