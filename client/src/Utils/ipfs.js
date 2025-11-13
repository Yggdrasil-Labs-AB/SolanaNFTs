export function ipfsToHttp(ipfsUri, gatewayBase) {
  if (!ipfsUri) return "";
  if (/^https?:\/\//i.test(ipfsUri)) return ipfsUri;
  const base =
    (gatewayBase || import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud")
      .replace(/\/+$/, "");
  return `https://${base}/ipfs/${ipfsUri.replace(/^ipfs:\/\//i, "")}`;
}