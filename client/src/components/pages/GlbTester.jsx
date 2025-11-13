import { useMemo, useState } from "react";
// Make sure this side-effect import exists somewhere once in your app:

const GlbTest = ({ modelPreviewUrl, ipfsGateway = "https://ipfs.io/ipfs/" }) => {
    const [hadError, setHadError] = useState(false);

    // Resolve src: prefer preview URL; support ipfs://; else fallback demo file
    const resolvedSrc = useMemo(() => {
        if (!modelPreviewUrl) return "/DamagedHelmet.glb";
        if (modelPreviewUrl.startsWith("ipfs://")) {
            return ipfsGateway.replace(/\/+$/, "") + "/" + modelPreviewUrl.slice("ipfs://".length);
        }
        return modelPreviewUrl; // blob: or https:
    }, [modelPreviewUrl, ipfsGateway]);

    const tipText = useMemo(() => {
        if (hadError) return "Failed to load model. Check file format and try again.";
        if (!modelPreviewUrl) return "Drag to rotate • Scroll/pinch to zoom • Using /public/DamagedHelmet.glb";
        if (modelPreviewUrl.startsWith("blob:")) return "Drag to rotate • Scroll/pinch to zoom • Local preview (not uploaded)";
        if (modelPreviewUrl.startsWith("ipfs://")) return `Previewing from IPFS via gateway`;
        return "Drag to rotate • Scroll/pinch to zoom";
    }, [modelPreviewUrl, hadError]);

    return (
        <div style={styles.wrap}>
            <div style={styles.frame}>
                {/* eslint-disable-next-line react/no-unknown-property */}
                <model-viewer
                    key={resolvedSrc}                 // force re-init when src changes
                    src={resolvedSrc}
                    alt="GLB preview"
                    camera-controls
                    auto-rotate
                    auto-rotate-delay="1000"
                    exposure="1"
                    shadow-intensity="0.6"
                    style={styles.viewer}
                    onError={() => setHadError(true)}
                    onLoad={() => setHadError(false)}
                />
            </div>
            <p style={styles.tip}>{tipText}</p>
        </div>
    );
};

const styles = {
    wrap: {
        minHeight: '60dvh',
        margin: 0,
        background: '#101114',
        color: '#e6e6e6',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
    },
    frame: {
        width: 'min(1000px, 92vw)',
        height: 'min(40vh, 720px)',
        background: '#14161b',
        borderRadius: '14px',
        boxShadow: '0 10px 40px rgba(0,0,0,.4)',
        overflow: 'hidden',
    },
    viewer: {
        width: '100%',
        height: '100%',
        background: 'radial-gradient(1200px 800px at 50% 40%, #1a1d24 0%, #111317 60%, #0d0f13 100%)',
        border: 0,
    },
    tip: {
        opacity: 0.8,
        fontSize: 14,
        margin: '12px 0 0',
    },
};

export default GlbTest;
