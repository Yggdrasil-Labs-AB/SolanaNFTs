import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';

import { useWallet } from '@solana/wallet-adapter-react';
import SolConnection from '../Connection/SolConnection';

import { shortenAddress } from '../../Utils/generalUtils';

import '../../css/whitelist.css';
import { getWhitelistAddresses, submitWhitelistAddress } from '../../services/dbServices';
import TxModal from '../txModal/TxModal';

const Whitelist = () => {

    const wallet = useWallet();

    const isMobile = window.innerWidth < 768;

    const [response, setResponse] = useState(''); //Tracks Whitelist submissions
    const [remainingSpots, setRemainingSpots] = useState('') //Remaing whitelist spots left
    const [email, setEmail] = useState('');
    const [x, setX] = useState('');

    useEffect(() => {
        const fetchValue = async () => {
            try {
                const data = await getWhitelistAddresses();

                // Sum all 'amounts' values
                const totalClaimed = data.whitelistAddresses.reduce(
                    (sum, entry) => sum + (entry.amounts || 0),
                    0
                );

                const MAX_SPOTS = 100;
                const remaining = MAX_SPOTS - totalClaimed;

                setRemainingSpots(remaining >= 0 ? remaining : 0);
            } catch (err) {
                console.error("Failed to fetch whitelist data:", err);
            }
        };

        fetchValue();
    }, []);

    const displayString = () => {
        if (isMobile) {
            return (shortenAddress(wallet.publicKey.toString()));
        } else {
            return (wallet.publicKey.toString());
        }
    }

    const addToWhitelist = async () => {
        const data = await submitWhitelistAddress(wallet.publicKey.toString(), email, x);

        if (data.error) {
            setResponse(data.error)
        } else {
            setResponse("Wallet Added!");

            setTimeout(() => {
                window.location.href = "https://nft.boohworld.io/marketplace";
            }, 3000); // 3 seconds

        }
    }

    return (
        <>
            <Navbar />
            <div style={{ width: '100vw', height: '100vh', color: 'white' }}>
                <div className="d-flex justify-content-center align-items-center" style={{ width: '100%', height: '100%' }}>
                    <div >
                        <h1 className="marykate d-flex justify-content-center m-0">NFT WHITELIST</h1>
                        {/* <h2 className="marykate d-flex justify-content-center">[ Pre-Alpha ]</h2> */}
                        <h4 className="marykate d-flex justify-content-center">Remaing Spots: {remainingSpots}</h4>
                        {wallet.publicKey ? (
                            <div className='d-flex flex-column align-items-center justify-content-center gap-4'>
                                <div className="address-box-whitelist">
                                    {displayString()}
                                </div>
                                <div style={{ width: '350px' }}>
                                    <label
                                        htmlFor="userInput"
                                        style={{
                                            display: "block",
                                            marginBottom: "0.5rem",
                                            color: "#fff", // label text color
                                            fontWeight: 600
                                        }}
                                    >
                                        Enter your email: [not required]
                                    </label>
                                    <input
                                        id="userInput"
                                        type="text"
                                        placeholder="example@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{
                                            padding: "0.5rem",
                                            width: "100%",
                                            maxWidth: "300px",
                                            marginBottom: "0.1rem",
                                            backgroundColor: "#111", // black input background
                                            color: "#fff",           // white typed text
                                            border: "1px solid #444", // subtle border
                                            borderRadius: "4px",
                                        }}
                                    />
                                </div>
                                <div style={{ width: '350px' }}>
                                    <label
                                        htmlFor="userInput"
                                        style={{
                                            display: "block",
                                            marginBottom: "0.5rem",
                                            color: "#fff", // label text color
                                            fontWeight: 600,
                                        }}
                                    >
                                        Enter your X (Twitter): [not required]
                                    </label>
                                    <input
                                        id="userInput"
                                        type="text"
                                        placeholder="@yourHandle"
                                        value={x}
                                        onChange={(e) => setX(e.target.value)}
                                        style={{
                                            padding: "0.5rem",
                                            width: "100%",
                                            maxWidth: "300px",
                                            marginBottom: "1rem",
                                            backgroundColor: "#111", // black input background
                                            color: "#fff",           // white typed text
                                            border: "1px solid #444", // subtle border
                                            borderRadius: "4px",
                                        }}
                                    />
                                </div>
                                {response ?
                                    (
                                        <h4>{response}</h4>
                                    ) : (
                                        <button onClick={addToWhitelist} className='button-style-regular'>Submit</button>
                                    )}
                            </div>
                        ) : (
                            <div className='d-flex flex-column align-items-center justify-content-center gap-4'>
                                <h4>Connect Wallet & Submit address</h4>
                                <SolConnection />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <TxModal />
        </>
    )
}

export default Whitelist;