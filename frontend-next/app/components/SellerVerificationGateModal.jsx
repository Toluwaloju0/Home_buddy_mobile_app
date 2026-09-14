'use client';

export default function SellerVerificationGateModal({
  open,
  onClose,
  onNotifyAdmin,
  notifyStatus = null,
}) {
  if (!open) return null;

  return (
    <div
      className="search-popout-overlay seller-verification-gate-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="searchbar-popout-dialog seller-verification-gate-dialog" role="dialog" aria-modal="true">
        <button className="search-popout-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="seller-verification-gate-content">
          <p className="settings-kicker">Seller verification</p>
          <h2>Approval is still pending</h2>
          <p>
            Please wait for admin approval of your verification details before listing a property or service.
          </p>
          {notifyStatus && (
            <div className={`buyer-feedback buyer-feedback--${notifyStatus.type}`} role="status">
              {notifyStatus.text}
            </div>
          )}
          <button type="button" className="seller-verification-delay-button" onClick={onNotifyAdmin}>
            Notify admin
          </button>
        </div>
      </div>
    </div>
  );
}
