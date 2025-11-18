import { useState } from 'react';

import { FaLock, FaLockOpen } from "react-icons/fa";
import { useTransactionsController } from '../../providers/TransactionsProvider';
import { useGlobalVariables } from '../../providers/GlobalVariablesProvider';
import { useWallet } from '@solana/wallet-adapter-react';

import NftConceptVoting from '../NftConceptVoting/NftConceptVoting';
import { prelaunch } from '../../config/config';
import { getTraitRows } from '../../Utils/renderNftHelper';

import { ipfsToHttp } from '../../Utils/ipfs';
import ModelLightbox from '../ModelLightBox/ModelLightbox';

import "../../css/nftlayout.css"

const PrintNfts = ({
  nfts,
  selectedIndex,
  setSelectedIndex,
  location,
  openModal,
  isAdmin = false,
  setEditData,
  setPaymentTracker,
  nftConceptsLoadingState
}) => {
  const wallet = useWallet();
  const { userNfts, approxSolToUSD } = useGlobalVariables();
  const [reBuying, setReBuying] = useState({}); // Track NFTs that can be rebought

  const { setIsModalOpen, setModalType } = useTransactionsController();

  // Lightbox state
  const [modelOpen, setModelOpen] = useState(false);
  const [modelSrc, setModelSrc] = useState("");
  const [modelTitle, setModelTitle] = useState("");

  const isLocked = nfts[selectedIndex]?.storeInfo?.metadataUri ? true : false;

  const isPurchased = (nft) => userNfts.some((ownedNft) => ownedNft.name === nft.name);
  const buyAgain = (nft) => setReBuying((prev) => ({ ...prev, [nft.description]: true }));

  const calculateRemainingMints = (nft) => {
    const mintLimit = nft.storeInfo.mintLimit;
    if (mintLimit < 0 || !mintLimit) return <div>Remaining: Infinite</div>;
    const nftsRemainingToMint = nft.storeInfo.mintLimit - nft.purchases.totalCreates;
    if (nftsRemainingToMint <= 0) return <div style={{ color: '#C04000' }}>Sold Out!</div>;
    return <div>Remaining: {nftsRemainingToMint}</div>;
  };

  const isBuyDisabled = (nft) => {
    const { mintLimit } = nft.storeInfo;
    return mintLimit !== -1 && mintLimit && mintLimit - nft.purchases.totalCreates <= 0 && location !== 'creator-hub';
  };

  // Loading states
  if (nftConceptsLoadingState === "loading") {
    return (
      <div
        className="d-flex gap-2 align-items-center justify-content-center"
        style={{
          width: "100%",
          color: "#FFFFFF",
          padding: "20px",
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div className="loader"></div>
        <div className="marykate" style={{ fontSize: "1.5rem" }}>Loading NFTs...</div>
      </div>
    );
  }

  if (nftConceptsLoadingState === "empty") {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          width: "100%",
          color: "#FFFFFF",
          padding: "20px",
          height: "100vh",
          textAlign: "center",
        }}
      >
        {prelaunch ? (
          <div>
            <h2 className="marykate" style={{ fontSize: '45px' }}>No NFTs Found!</h2>
          </div>
        ) : (
          <h2 className="marykate" style={{ fontSize: '45px' }}>No NFTs Found!</h2>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        color: "#FFFFFF",
        padding: "20px",
        height: "100vh",
        overflow: "auto",
      }}
    >
      <div className="nft-grid">
        {nfts.map((nft, index) => {
          const rarity = nft.attributes.find(a => a.trait_type === "rarity")?.value || "unknown";
          const type = nft.attributes.find(a => a.trait_type === "type")?.value || "unknown";
          const subType = nft.attributes.find(a => a.trait_type === "subType")?.value || "unknown";
          const division = nft.attributes.find(a => a.trait_type === "division")?.value || null;
          const level = nft.attributes.find(a => a.trait_type === "level")?.value || '1';

          const divisionClassName = `division-${division}`;
          const rarityClass = `nft-box shadow-${rarity.toLowerCase()}`;
          const bannerClass = `banner-standards banner-${rarity.toLowerCase()}`;
          const nftBlockchain = nft.attributes.find(a => a.trait_type === "blockchain")?.value || "solana";
          const nftBlockchainClass = `blockchain-${nftBlockchain}`;

          const traitRows = getTraitRows(nft);
          const isSelected = selectedIndex === index;
          const purchased = isPurchased(nft);

          // Resolve IPFS URIs for image + model
          const imgSrc = ipfsToHttp(nft.image);
          const glbSrc = ipfsToHttp(nft.animation_url);

          return (
            <div key={index} className={`nft-card rarity-${rarity.toLowerCase()}`}>
              {/* IMAGE + TITLE / VIEW 3D AREA */}
              <div
                className="nft-card-media"
                onClick={() => {
                  setSelectedIndex(index);
                  setEditData(nft);
                  setModelSrc(glbSrc);
                  setModelTitle(nft.name);
                  setModelOpen(true);
                }}
                title={nft.name || "Preview"}
              >
                <img
                  src={imgSrc || "/path/to/default-image.png"}
                  alt={nft.name || "NFT"}
                  onError={(e) => {
                    e.currentTarget.src = "/path/to/default-image.png";
                  }}
                />
                <div className="nft-card-media-footer">
                  <div className="nft-card-title">
                    {nft.name || "Unnamed NFT"}
                  </div>
                  <div className="nft-card-view3d">View 3D ↗</div>
                </div>
              </div>

              {/* BODY */}
              <div className="nft-card-body">
                <div className="nft-card-top-row">
                  <span className={`rarity-pill rarity-pill-${rarity.toLowerCase()}`}>
                    {rarity}
                  </span>
                  {(division === "crebel" || division === "elites" || division === "uprising") && (
                    <span className={`division-pill division-${division}`}>
                      {division === "uprising" ? "crebel" : division}
                    </span>
                  )}
                </div>

                <div className="nft-card-meta-row">
                  <span className="price">
                    {nft.storeInfo.price} USDC
                  </span>
                  <span className="price-sol">
                    ~{(nft.storeInfo.price * approxSolToUSD).toFixed(4)} SOL
                  </span>
                </div>

                {location === "creator-hub" && (
                  <div className="nft-card-store-row">
                    {nft.storeInfo.available ? <span>In-store ✅</span> : <span>In-store ❌</span>}
                    <span className="meta-lock">
                      Metadata {nft.storeInfo.metadataUri ? <FaLock /> : <FaLockOpen />}
                    </span>
                  </div>
                )}

                <div className="nft-card-bottom-row">
                  <div className="minted-row">
                    Minted: {nft.purchases.totalCreates}
                    {wallet?.publicKey?.toString() === nft.storeInfo.creator && (
                      <>
                        {" "}
                        | Buys: {nft.purchases.totalBuys}
                      </>
                    )}
                  </div>

                  {location === "marketplace" && (
                    <div className="remaining-row">
                      {calculateRemainingMints(nft)}
                    </div>
                  )}

                  {location === "creator-hub" && (
                    <div className="vote-row">
                      <NftConceptVoting nft={nft} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3D Lightbox */}
      <ModelLightbox
        open={modelOpen}
        onClose={() => setModelOpen(false)}
        modelSrc={modelSrc}
        title={modelTitle}
      >
        {selectedIndex !== null && nfts[selectedIndex] && (() => {
          const nft = nfts[selectedIndex];
          const purchased = isPurchased(nft);

          return (
            <>
              {location === 'creator-hub' && isAdmin && (
                <div
                  className="d-flex align-items-center justify-content-between p-2 mt-3"
                  style={{ backgroundColor: "#1e1e2f", borderRadius: "8px", color: "#ffffff" }}
                >
                  <div style={{ fontSize: "1rem", fontWeight: "500" }}>[ADMIN ONLY]:</div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => { setIsModalOpen(true); setModalType('delete'); }}
                      className='button-style-delete'
                    >
                      DELETE
                    </button>
                    {nft.storeInfo?.metadataUri ? (
                      <button
                        onClick={() => { openModal('SOL'); }}
                        className='button-style-regular'
                      >
                        CREATE NFT
                      </button>
                    ) : (
                      <button
                        onClick={() => { setIsModalOpen(true); setModalType('lock'); }}
                        className='button-style-regular'
                      >
                        LOCK DATA
                      </button>
                    )}
                  </div>
                </div>
              )}

              {location === "marketplace" && (
                <div
                  className="d-flex align-items-center justify-content-between p-2 mt-3"
                  style={{ backgroundColor: "#1e1e2f", borderRadius: "8px", color: "#ffffff" }}
                >
                  {purchased && !reBuying[nft.description] ? (
                    <>
                      <div style={{ fontSize: "1rem", fontWeight: "500" }}>ALREADY OWNED:</div>
                      <button onClick={() => buyAgain(nft)} className='button-style-regular'>
                        BUY AGAIN
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "1rem", fontWeight: "500" }}>BUY WITH:</div>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => { openModal('CARD'); setPaymentTracker('CARD'); }}
                          className='button-style-regular'
                        >
                          Card
                        </button>
                        <button
                          onClick={() => { openModal('SOL'); setPaymentTracker('SOL'); }}
                          className='button-style-regular'
                        >
                          SOL
                        </button>
                        <button
                          disabled={true}
                          onClick={() => { openModal('BABYBOOH'); setPaymentTracker('BABYBOOH'); }}
                          className='button-style-regular-disabled'
                        >
                          BabyBooh
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          );
        })()}
      </ModelLightbox>
    </div>
  );
}

export default PrintNfts;


// {/* <button
//                 className={`${rarityClass} ${isSelected ? "selected" : ""}`}
//                 style={{
//                   marginBottom: "5px",
//                   opacity: purchased ? 0.6 : 1,
//                   filter: purchased ? "grayscale(50%)" : "none",
//                 }}
//                 onClick={() => { setEditData(nft); setSelectedIndex(index); }}
//                 disabled={isBuyDisabled(nft)}
//               >
//                 <div className="d-flex flex-column" style={{ marginBottom: '10px' }}>
//                   <div className="d-flex justify-content-start align-items-center">
//                     {/* You can remove this old 100x100 img block if you want;
//                         the square card above now shows the image nicely. */}
//                     <h3 className="nft-name">{nft.name || "Unnamed NFT"}</h3>
//                   </div>

//                   <div className="d-flex flex-column w-100">
//                     <div className="nft-stats d-flex flex-column align-items-center h-100 w-100">
//                       {(() => {
//                         function chunkArray(arr, size) {
//                           const chunks = [];
//                           for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
//                           return chunks;
//                         }
//                         const allModifiers = traitRows.flat().filter(trait => trait.context === 'modifier');
//                         const allBoosters = traitRows.flat().filter(trait => trait.context !== 'modifier');

//                         const modifierRows = chunkArray(allModifiers, 2);
//                         const boosterRows = chunkArray(allBoosters, 2);

//                         return (
//                           <>
//                             {modifierRows.length > 0 && (
//                               <>
//                                 <h5>Stat Modifiers</h5>
//                                 {modifierRows.map((row, idx) => (
//                                   <div className="d-flex w-100" key={`mod-${idx}`}>
//                                     {row.map((trait, j) => (
//                                       <p key={j} style={{ flex: row.length === 1 ? 1 : j === 0 ? 0.45 : 0.55, textAlign: 'left' }}>
//                                         <strong>{trait.label}:</strong> {trait.value}
//                                       </p>
//                                     ))}
//                                   </div>
//                                 ))}
//                               </>
//                             )}

//                             {boosterRows.length > 0 && (
//                               <>
//                                 <h5>Enhancements</h5>
//                                 {boosterRows.map((row, idx) => (
//                                   <div className="d-flex w-100" key={`boost-${idx}`}>
//                                     {row.map((trait, j) => (
//                                       <p key={j} style={{ flex: 1, textAlign: 'left' }} className="booster-trait">
//                                         <strong>{trait.label}:</strong> {trait.value}
//                                       </p>
//                                     ))}
//                                   </div>
//                                 ))}
//                               </>
//                             )}
//                           </>
//                         );
//                       })()}
//                     </div>
//                   </div>
//                 </div>

//                 <div style={{ borderTop: '1px solid white', padding: '5px 0px' }} />

//                 <div className="d-flex justify-content-between">
//                   <div className="d-flex gap-3">
//                     <div className={nftBlockchainClass}>{nftBlockchain}</div>
//                     <div className={bannerClass}>{type}</div>
//                     <div className={bannerClass}>{subType}</div>
//                     <div className={bannerClass}>Lvl. {level}</div>
//                   </div>
//                   {(division === "crebel" || division === "elites" || division === "uprising") &&
//                     <div className={divisionClassName}>
//                       {division === "uprising" ? "crebel" : division}
//                     </div>
//                   }
//                 </div>
//               </button> */}