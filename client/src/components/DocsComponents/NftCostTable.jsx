import { useState, useEffect } from 'react';

import {
    rarityOptions,
    pricingValues,
    creatorCosts,
    sellingThreshold
} from "../../config/nftConfig";

const NftCostTable = () => {

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <section className="docs-section-overflow d-flex flex-wrap justify-content-between">
            <div>
                <h3 className="docs-subsection-title">NFT Costs & Creator Earnings</h3>
                <p>NFT pricing is influenced by **rarity, talents, and game balance factors**.</p>

                <div className='docs-table-container'>
                    <table className="docs-table">
                        <thead>
                            <tr>
                                <th>{isMobile ? "Rarity" : "Rarity"}</th>
                                <th>{isMobile ? "Price" : "Store Price"}</th>
                                <th>{isMobile ? "Cost" : "Creator Cost"}</th>
                                <th>{isMobile ? "Points" : "Talent Points"}</th>
                                <th>{isMobile ? "Thresh" : "Threshold"}</th>
                                <th>{isMobile ? "Roy." : "Royalties"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rarityOptions.map((rarity) => (
                                <tr key={rarity}>
                                    <td>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}</td>
                                    <td>${pricingValues[rarity].toFixed(2)}</td>
                                    <td>${creatorCosts[rarity].toFixed(2)}</td>
                                    <td>{sellingThreshold[rarity]}</td>
                                    <td>10%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default NftCostTable;