export const IS_MAINNET = import.meta.env.MODE === 'production';
export const IS_PRODUCTION = import.meta.env.MODE === 'production';

const DEVNET_COLLECTION_ADDRESS = 'AQWGjfgwj8fuQsQFrfN58JzVxWG6dAosU33e35amUcPo';
const MAINNET_COLLECTION_ADDRESS = 'Esr1cTMpbNRNVHvMrGWMMpCEosH2L1dJU3pXyWmLNZoW';

export const COLLECTION_ADDRESS = IS_MAINNET ? MAINNET_COLLECTION_ADDRESS : DEVNET_COLLECTION_ADDRESS;

export const URI_SERVER = IS_PRODUCTION ? import.meta.env.VITE_G_SERVER : 'http://localhost:8080';
export const URI_FRONTEND = IS_PRODUCTION ? 'https://nft.boohworld.io' : 'http://localhost:5173';

export const prelaunch = true;

//20% discount for whitelist members
export const discountPrice = 0.8;


