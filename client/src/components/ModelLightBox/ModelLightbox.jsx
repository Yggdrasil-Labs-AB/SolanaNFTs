export default function ModelLightbox({ open, onClose, modelSrc, title }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
        display: "grid", placeItems: "center", zIndex: 9999, padding: 12
      }}
    >
      <div
        style={{
          width: "min(1000px, 96vw)",
          background: "#111317",
          color: "#e6e6e6",
          border: "1px solid #2a2d36",
          borderRadius: 16,
          boxShadow: "0 16px 60px rgba(0,0,0,.55)",
          overflow: "hidden"
        }}
      >
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 12px", borderBottom: "1px solid #2a2d36"
        }}>
          <div style={{ fontWeight: 600 }}>{title || "Preview"}</div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#c9c9c9", fontSize: 18, cursor: "pointer" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* eslint-disable-next-line react/no-unknown-property */}
        <model-viewer
          key={modelSrc}
          src={modelSrc}
          alt={title || "3D Model"}
          camera-controls
          auto-rotate
          auto-rotate-delay="1000"
          exposure="1"
          shadow-intensity="0.6"
          style={{
            width: "100%",
            height: "min(70vh, 740px)",
            background: "radial-gradient(1200px 800px at 50% 40%, #1a1d24 0%, #111317 60%, #0d0f13 100%)",
            border: 0
          }}
        />

        <div style={{ opacity: .75, fontSize: 12, padding: "8px 12px 12px", borderTop: "1px solid #2a2d36" }}>
          Drag to rotate • Scroll/pinch to zoom
        </div>
      </div>
    </div>
  );
}
