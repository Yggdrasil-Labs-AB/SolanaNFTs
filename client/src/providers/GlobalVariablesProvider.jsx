import React, { createContext, useContext, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getCoreNftsClient } from "../services/blockchainServices";
import { fetchAllNftConcepts, getWhitelistAddresses } from "../services/dbServices";
import { discountPrice } from "../config/config";
import { fetchUsdToSolPrice } from "../services/solPricingServices";

// ✅ Create Context (Renamed to `GlobalVariablesContext`)
const GlobalVariablesContext = createContext();

// ✅ Provider Component (Renamed to `GlobalVariablesProvider`)
export const GlobalVariablesProvider = ({ children }) => {
    // Game Currency & Tokens
    const [inGameCurrency, setInGameCurrency] = useState(0);
    const [boohToken, setBoohToken] = useState(0);
    const [approxSolToUSD, setApproxSolToUSD] = useState(1);

    // NFTs & Concepts
    const [userNfts, setUserNfts] = useState([]);
    const [nftConcepts, setNftConcepts] = useState([]);

    // Control Search Bar
    const [searchItem, setSearchItem] = useState('');

    // Solana Wallet
    const wallet = useWallet();

    // ✅ Fetch User NFTs (Runs when wallet changes)
    useEffect(() => {
        const fetchUserNFTs = async () => {
            if (wallet.publicKey) {

                const data = await getCoreNftsClient(wallet.publicKey.toString());
                setUserNfts(data);

            }
        };

        fetchUserNFTs();
    }, [wallet.publicKey]);

    useEffect(() => {

        const fetchSolPricing = async () => {
            try {
                const resp = await fetchUsdToSolPrice();
                // const resp = .006;
                setApproxSolToUSD(resp);
            } catch (e) {
                console.log(e);
                setApproxSolToUSD(.006);
            }
        }

        fetchSolPricing();
    }, []);

    // ✅ Fetch All NFT Concepts (Runs once on mount)
    useEffect(() => {
        const fetchNftConcepts = async () => {
            try {
                const data = await fetchAllNftConcepts();
                setNftConcepts(data || []);
            } catch (error) {
                console.error("Error fetching NFT Concepts:", error);

            }
        };

        fetchNftConcepts();
    }, []);

    // ✅ Manual Refetch Function
    const refetchNftConcepts = async () => {
        try {
            const data = await fetchAllNftConcepts();
            setNftConcepts(data || []);
        } catch (error) {
            console.error("Error refetching NFT Concepts:", error);
        }
    };

    const checkUserDiscount = async (address, price, type) => {
        try {
            const data = await getWhitelistAddresses();

            console.log(data.whitelistAddresses);

            const isWhitelisted = data.whitelistAddresses.some(
                (item) => item.address === address && item.amounts > 0
            );

            if (isWhitelisted) {

                switch (type) {
                    case 'sol':
                        return (price * discountPrice).toFixed(4);
                    case 'usd':
                        return (price * discountPrice).toFixed(2);
                    default:
                        return price;
                }
            } else {
                return price;
            }

        } catch (e) {
            console.error("Failed to check discount status:", e);
            throw new Error(e.message || "Unknown error");
        }
    };


    // ✅ Provider Wrapper
    return (
        <GlobalVariablesContext.Provider
            value={{
                inGameCurrency,
                setInGameCurrency,
                boohToken,
                setBoohToken,
                userNfts,
                nftConcepts,
                refetchNftConcepts,
                searchItem,
                setSearchItem,
                checkUserDiscount,
                approxSolToUSD
            }}
        >
            {children}
        </GlobalVariablesContext.Provider>
    );
};

// ✅ Custom Hook for Consuming Context (Renamed to `useGlobalVariables`)
export const useGlobalVariables = () => {
    return useContext(GlobalVariablesContext);
};
