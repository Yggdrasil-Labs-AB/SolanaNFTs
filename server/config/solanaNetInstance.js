const {Connection} = require('@solana/web3.js');

// Determine which node to connect to
const solanaNode = process.env.IS_MAINNET === 'true'
  ? process.env.SOLANA_NODE  // e.g., 'https://api.mainnet-beta.solana.com'
  : 'https://api.devnet.solana.com';

// Use that node in the Connection constructor
const connection = new Connection(solanaNode, 'confirmed');

module.exports = { connection }