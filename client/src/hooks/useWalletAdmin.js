import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { checkIfAdmin } from "../services/dbServices";

export const useWalletAdmin = () => {
    const wallet = useWallet();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!wallet.connected) {
                console.log("Wallet disconnected");
                setUserRole(null);
                return;
            }

            const isAdmin = await checkIfAdmin(wallet.publicKey?.toBase58());
            setUserRole(isAdmin ? "admin" : "member");
        };

        checkAdminStatus();
    }, [wallet.connected, wallet.publicKey]);

    return { wallet, userRole };
};