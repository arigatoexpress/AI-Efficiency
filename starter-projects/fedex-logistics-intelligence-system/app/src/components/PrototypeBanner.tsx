export default function PrototypeBanner() {
  return (
    <div className="banner" role="banner" aria-label="Prototype notice">
      <span className="banner-icon" aria-hidden="true">🛡️</span>
      <div>
        <strong>Prototype only.</strong> This dashboard uses public and synthetic demo data.
        Human review is required before any operational decision.
        It is not an official FedEx production system.
      </div>
    </div>
  )
}
