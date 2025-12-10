import { useMemo, useState } from "react";

import "../../css/glbinlinepreview.css"

const GlbInlinePreview = ({ modelPreviewUrl, ipfsGateway = "https://ipfs.io/ipfs/" }) => {
  const [hadError, setHadError] = useState(false);

  const resolvedSrc = useMemo(() => {
    if (!modelPreviewUrl) return "/DamagedHelmet.glb";
    if (modelPreviewUrl.startsWith("ipfs://")) {
      return ipfsGateway.replace(/\/+$/, "") + "/" + modelPreviewUrl.slice("ipfs://".length);
    }
    return modelPreviewUrl; // blob: or https:
  }, [modelPreviewUrl, ipfsGateway]);

  const tipText = useMemo(() => {
    if (hadError) return "Failed to load model. Check file format and try again.";
    if (!modelPreviewUrl) return "Drag to rotate • Scroll/pinch to zoom • Using /DamagedHelmet.glb";
    if (modelPreviewUrl.startsWith("blob:")) return "Drag to rotate • Scroll/pinch to zoom • Local preview";
    if (modelPreviewUrl.startsWith("ipfs://")) return "Previewing from IPFS via gateway";
    return "Drag to rotate • Scroll/pinch to zoom";
  }, [modelPreviewUrl, hadError]);

  return (
    <div className="inline-glb-wrap">
      {/* eslint-disable-next-line react/no-unknown-property */}
      <model-viewer
        key={resolvedSrc}
        src={resolvedSrc}
        alt="3D preview"
        camera-controls
        auto-rotate
        auto-rotate-delay="1000"
        exposure="1"
        shadow-intensity="0.6"
        class="inline-glb-viewer"
        onError={() => setHadError(true)}
        onLoad={() => setHadError(false)}
      />
      <p className="inline-glb-tip">{tipText}</p>
    </div>
  );
};

export default GlbInlinePreview;
