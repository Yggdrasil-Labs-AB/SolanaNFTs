import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getNonce, verifyUser } from "../services/loginService";

const STORAGE_KEY = "booh_auth";

const WalletAdminContext = createContext(null);

export const WalletAdminProvider = ({ children }) => {
  const wallet = useWallet();
  const [userRole, setUserRole] = useState(null);     // "admin" | "member" | null
  const [authToken, setAuthToken] = useState(null);   // JWT from backend
  const [loadingRole, setLoadingRole] = useState(false);

  // Sync auth state when wallet changes (no signing here)
  useEffect(() => {
    if (!wallet.connected || !wallet.publicKey) {
      setUserRole(null);
      setAuthToken(null);
      return;
    }

    const publicKey = wallet.publicKey.toBase58();

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.publicKey === publicKey && parsed.token && parsed.role) {
          setUserRole(parsed.role);
          setAuthToken(parsed.token);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to read saved auth:", e);
    }

    setUserRole(null);
    setAuthToken(null);
  }, [wallet.connected, wallet.publicKey]);

  const loginWithWallet = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      console.warn("Wallet not connected");
      return { success: false };
    }

    if (!wallet.signMessage) {
      console.warn("Wallet does not support signMessage; defaulting to member.");
      setUserRole("member");
      setAuthToken(null);
      return { success: true, role: "member", token: null };
    }

    setLoadingRole(true);

    const publicKey = wallet.publicKey.toBase58();

    try {
      const nonceRes = await getNonce(publicKey);
      const message = nonceRes.message;

      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await wallet.signMessage(encodedMessage);

      const signatureBase64 = btoa(
        String.fromCharCode(...new Uint8Array(signatureBytes))
      );

      const verifyRes = await verifyUser(publicKey, signatureBase64);

      if (verifyRes && verifyRes.success) {
        const { role, token } = verifyRes;

        setUserRole(role);
        setAuthToken(token);

        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ publicKey, role, token })
          );
        } catch (e) {
          console.warn("Failed to save auth:", e);
        }

        // 🔥 return the fresh token + role immediately
        return { success: true, role, token };
      } else {
        setUserRole("member");
        setAuthToken(null);
        return { success: false };
      }
    } catch (err) {
      console.error("Wallet auth error:", err);
      setUserRole("member");
      setAuthToken(null);
      return { success: false };
    } finally {
      setLoadingRole(false);
    }
  };


  const logout = () => {
    setUserRole(null);
    setAuthToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear auth:", e);
    }
  };

  return (
    <WalletAdminContext.Provider
      value={{
        wallet,
        userRole,
        authToken,
        loadingRole,
        loginWithWallet,
        logout,
      }}
    >
      {children}
    </WalletAdminContext.Provider>
  );
};

export const useWalletAdmin = () => {
  const ctx = useContext(WalletAdminContext);
  if (!ctx) {
    throw new Error("useWalletAdmin must be used within WalletAdminProvider");
  }
  return ctx;
};
