import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useGlobalVariables } from '../../providers/GlobalVariablesProvider';

import SolConnection from '../Connection/SolConnection';

import BoohLogo from '../../assets/BoohLogo.svg';

import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchBabyBooh } from '../../services/gameServices';
import { getTokenBalance } from '../../services/blockchainServices';

import { GiHamburgerMenu } from "react-icons/gi";
import { motion } from 'framer-motion'

import { IS_MAINNET } from '../../config/config';

import '../../css/mobile-Navbar.css'

import { useTransactionsController } from '../../providers/TransactionsProvider';

import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

const Navbar = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const wallet = useWallet();
    const { connection } = useConnection();

    const { inGameCurrency, setInGameCurrency, boohToken, setBoohToken } = useGlobalVariables();
    const { setPage } = useTransactionsController();

    const [isMobileNavbar, setIsMobileNavbar] = useState(false);
    const [isHubDropdownOpen, setIsHubDropdownOpen] = useState(false);

    const [showCreatorLinksMobile, setShowCreatorLinksMobile] = useState(false);

    useEffect(() => {

        const callAsync = async () => {
            if (wallet.publicKey) {

                if (import.meta.env.MODE !== "production") return;

                const babyBooh = await fetchBabyBooh(wallet.publicKey.toString());

                if (babyBooh > -1) {
                    setInGameCurrency(babyBooh);
                }

                const fetchedBoohToken = await getTokenBalance(wallet.publicKey.toString(), connection);

                if (fetchedBoohToken >= 0 && IS_MAINNET === true) {
                    setBoohToken(fetchedBoohToken);
                }
            }
        }

        callAsync();

    }, [wallet.publicKey]);

    const handlePageChange = (action) => {
        const isOnDashboard = location.pathname === "/dashboard";

        if (isOnDashboard) {
            setPage(action);
        } else {
            navigate(`/dashboard?action=${action}`);
        }
    };

    return (
        <nav className="store-navbar-main">
            {/*  */}
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-3 align-items-center">
                    <div>
                        <Link className="d-flex align-items-center gap-1 header-fonts" to="/" style={{ fontSize: '1.4rem', color: 'white' }}>
                            <img
                                src={BoohLogo} // Replace with your logo
                                alt="Marketplace Logo"
                                style={{ width: '30px', height: '30px' }}
                            />
                            Booh Brawlers
                        </Link>
                    </div>

                    {/* Desktop Navbar */}
                    <div className="disable-on-mobile" style={{ borderRight: '2px solid white', height: '40px' }}></div>
                    <div className='d-flex gap-4 store-nav marykate disable-on-mobile'>
                        <Link to='https://t.me/BoohBrawlBot/BoohBrawlers' target='_blank'>Play Game</Link>
                        {/* <div style={{ borderRight: '2px solid #fff', margin: '10px 0px' }}></div> */}
                        <Link to='/marketplace'>Marketplace</Link>
                        {/* <div style={{ borderRight: '2px solid #fff', margin: '10px 0px' }}></div> */}
                        {/* Dropdown Wrapper */}
                        <div
                            className="dropdown-container"
                            onMouseEnter={() => setIsHubDropdownOpen(true)}
                            onMouseLeave={() => setIsHubDropdownOpen(false)}
                        >
                            <Link to="#" className="dropdown-trigger">
                                Creator Hub
                            </Link>

                            {/* Keep menu in the DOM, just toggle the 'open' class */}
                            <div className={`dropdown-menu ${isHubDropdownOpen ? "open" : ""}`}>
                                <button onClick={() => handlePageChange("create")}>Create Concept</button>
                                <button onClick={() => handlePageChange("update")}>Edit Concept</button>
                                <Link to="/character-submit">Subm. Character</Link>
                            </div>
                        </div>
                        {/* <div style={{ borderRight: '2px solid #fff', margin: '10px 0px' }}></div> */}
                        <Link to='https://boohworld.io' target='_blank'>Token</Link>
                        {/* <div style={{ borderRight: '2px solid #fff', margin: '10px 0px' }}></div> */}
                        <Link to='https://discord.gg/WkWcNFEA' target='_blank'>Discord</Link>
                        <Link to='/docs'>Docs</Link>
                    </div>
                </div>

                {/* Desktop Navbar */}
                <div className="d-flex gap-5 disable-on-mobile">
                    <div className="d-flex flex-column marykate" style={{ fontSize: '0.9rem' }}>
                        <p className="m-0">Baby Booh: {inGameCurrency}</p>
                        <p className="m-0">Booh Token: {boohToken}</p>
                    </div>
                    <div>
                        <SolConnection />
                    </div>
                </div>

                {/* Mobile Navbar */}
                <div className='d-flex gap-2 enable-on-mobile'>
                    <div>
                        {isMobileNavbar ? (
                            <button
                                className="close-nav-modal-button"
                                onClick={() => { setIsMobileNavbar(!isMobileNavbar), setShowCreatorLinksMobile(false) }}>
                                &times;
                            </button>
                        ) : (
                            <button
                                className="button-style-regular"
                                onClick={() => { setIsMobileNavbar(!isMobileNavbar) }}>
                                <GiHamburgerMenu />
                            </button>
                        )}
                    </div>
                </div>

                {isMobileNavbar && (
                    <motion.div
                        className="nav-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => {
                            // Prevent closing if clicking inside the modal
                            if (e.target.classList.contains("nav-modal-overlay")) {
                                setIsMobileNavbar(false);
                                setShowCreatorLinksMobile(false);
                            }
                        }}
                    >
                        <motion.div
                            className="nav-modal-tx"
                            initial={{ x: "100%" }} // Start off-screen to the right
                            animate={isMobileNavbar ? { x: 0 } : { x: "100%" }} // Slide in/out based on state
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className="modal-content d-flex flex-column justify-content-between">
                                {/* Navigation Links */}
                                <div className="d-flex flex-column marykate" style={{ padding: '20px' }}>
                                    <Link to="https://t.me/BoohBrawlBot/BoohBrawlers" target="_blank">Play Game</Link>
                                    <Link to="/marketplace">Marketplace</Link>
                                    {/* 🔹 Creator Hub Link (Click to Toggle Sub-Links) */}
                                    <button
                                        className="creator-hub-toggle"
                                        onClick={() => setShowCreatorLinksMobile(!showCreatorLinksMobile)}
                                    >
                                        Creator Hub
                                    </button>

                                    {/* 🔹 Conditionally Show Sub-Links */}
                                    {showCreatorLinksMobile && (
                                        <div className="creator-hub-sub-links">
                                            <button onClick={() => { handlePageChange("create"), setIsMobileNavbar(false), setShowCreatorLinksMobile(false) }}><MdOutlineKeyboardDoubleArrowRight /> Create Concept</button>
                                            <button onClick={() => { handlePageChange("update"), setIsMobileNavbar(false), setShowCreatorLinksMobile(false) }}><MdOutlineKeyboardDoubleArrowRight /> Edit Concept</button>
                                            <Link to="/character-submit"><MdOutlineKeyboardDoubleArrowRight /> Subm. Character</Link>
                                        </div>
                                    )}
                                    <Link to="https://boohworld.io" target="_blank">Token</Link>
                                    <Link to="https://discord.gg/WkWcNFEA" target="_blank">Discord</Link>
                                    <Link to="/docs">Docs & Rules</Link>
                                </div>
                                <div className="mobile-nav-login">
                                    <div className="d-flex gap-5 justify-content-between align-items-center h-100" style={{ padding: '0px 20px' }}>
                                        <div className="d-flex flex-column marykate" style={{ fontSize: '0.9rem' }}>
                                            <p className="m-0">Baby Booh: {inGameCurrency}</p>
                                            <p className="m-0">Booh Token: {boohToken}</p>
                                        </div>
                                        <div>
                                            <SolConnection />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </nav >
    )
}

export default Navbar;

