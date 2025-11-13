import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
});

export const uploadMetadata = async (metadata, name) => {
    try {
        const { _id, _v, ...offChainMetadata } = metadata; // Extract database _id & _v from off-chain data
        const upload = await pinata.upload.json(offChainMetadata, {metadata: { name } });

        if (!upload.IpfsHash) {
            throw new Error("Metadata upload failed: Missing IPFS hash from Pinata");
        }

        const metadataUriBase = import.meta.env.VITE_METADATA_URI || null;

        if (!metadataUriBase) {
            throw new Error("VITE_METADATA_URI is not defined");
        }

        const metadataUri = `${metadataUriBase}${upload.IpfsHash}`;
        return metadataUri;
    } catch (e) {
        console.error(`Failed Transaction: ${e.message}`);
        throw e; // Propagate the error
    }
};

/** Upload an image File/Blob to IPFS and return { ipfsUri, cid, gatewayUrl } */
export async function uploadIconIPFS(imageFile, name = "image.png") {
    if (!imageFile) throw new Error("No image provided");

    const res = await pinata.upload.file(imageFile, { metadata: { name } });
    if (!res?.IpfsHash) throw new Error("Pinata upload failed: missing IpfsHash");

    const cid = res.IpfsHash;
    const ipfsUri = `ipfs://${cid}`;
    const gatewayBase =
        (import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud").replace(/\/+$/, "");
    const gatewayUrl = `${gatewayBase}/ipfs/${cid}`;

    // Return the same shape your app likely expects (Cloudinary returned .secure_url etc.)
    return { ipfsUri, cid, gatewayUrl };
}

/** Upload a .glb File/Blob to IPFS and return { ipfsUri, cid, gatewayUrl } */
export async function uploadModelIPFS(modelFile, name = "model.glb") {
  if (!modelFile) throw new Error("No model file provided");

  // optional guard
  const ok =
    (modelFile.type && modelFile.type === "model/gltf-binary") ||
    (modelFile.name && modelFile.name.toLowerCase().endsWith(".glb"));
  if (!ok) throw new Error("Please provide a .glb (model/gltf-binary) file.");

  const res = await pinata.upload.file(modelFile, { metadata: { name } });
  if (!res?.IpfsHash) throw new Error("Pinata upload failed: missing IpfsHash");

  const cid = res.IpfsHash;
  const modelIpfsUri = `ipfs://${cid}`;
  const gatewayBase =
    (import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud").replace(/\/+$/, "");
  const gatewayUrl = `${gatewayBase}/ipfs/${cid}`;

  return { modelIpfsUri, cid, gatewayUrl };
}
