const {
    Connection,
    PublicKey,
    VersionedTransaction,
    TransactionMessage,
    Keypair,
} = require('@solana/web3.js');

const {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountIdempotentInstruction,
    createTransferCheckedInstruction,
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID_2022,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    // If your mint is legacy, you'd use TOKEN_PROGRAM_ID instead.
} = require('@solana/spl-token');

const bs58 = require('bs58');
const { validateGameWalletAddress, validateGameAccountAmount, validateGameIdUtils, DeductInGameBabyBooh } = require('../utils/gameHelpers');

// UI "1.23" -> bigint in base units
function uiToAmount(raw, decimals) {
    const [whole, frac = ''] = raw.split('.');
    const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
    return BigInt(whole || '0') * (10n ** BigInt(decimals)) + BigInt(fracPadded || '0');
}

exports.buildAndSendSyncTX = async (req, res) => {

    const connection = new Connection(process.env.SOLANA_NODE, 'confirmed');

    const BOOH_MINT = new PublicKey(process.env.BOOH_MINT);
    const BOOH_DECIMALS = parseInt(process.env.BOOH_DECIMALS || '9', 10);

    // CommonJS: use bs58.decode
    const TREASURY_OWNER = Keypair.fromSecretKey(
        bs58.default.decode(process.env.TREASURY_OWNER_SECRET.trim())
    );

    try {
        const { pubKey, amount } = req.body;
        if (!pubKey || !amount) {
            return res.status(400).json({ error: 'Missing users pubKey or amount' });
        }

        const user = new PublicKey(pubKey);
        const amountRaw = uiToAmount(amount, BOOH_DECIMALS);

        const TOKEN_PROG_ID = TOKEN_PROGRAM_ID;

        // Derive ATAs with the SAME program ids everywhere
        const treasuryAta = await getAssociatedTokenAddress(
            BOOH_MINT,
            TREASURY_OWNER.publicKey,
            false,
            TOKEN_PROG_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const userAta = await getAssociatedTokenAddress(
            BOOH_MINT,
            user,
            false,
            TOKEN_PROG_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const ixs = [];

        // Ensure user ATA (payer=user)
        ixs.push(
            createAssociatedTokenAccountIdempotentInstruction(
                user,
                userAta,
                user,
                BOOH_MINT,
                TOKEN_PROG_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );

        // Transfer from treasury to user
        ixs.push(
            createTransferCheckedInstruction(
                treasuryAta,
                BOOH_MINT,
                userAta,
                TREASURY_OWNER.publicKey,
                amountRaw,              // bigint — no Number()
                BOOH_DECIMALS,
                [],                     // no multisig signers
                TOKEN_PROG_ID
            )
        );

        const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash('confirmed');

        const msg = new TransactionMessage({
            payerKey: user,
            recentBlockhash: blockhash,
            instructions: ixs,
        }).compileToV0Message();

        const vtx = new VersionedTransaction(msg);

        const base64Tx = Buffer.from(vtx.serialize()).toString('base64');

        return res.status(200).json({
            success: true,
            base64Tx,
            blockhash,
            lastValidBlockHeight,
        });
    } catch (err) {
        console.error('Error building partial TX:', err);
        return res.status(500).json({ error: err.message });
    }
};

exports.checkAndSubmitSignedTX = async (req, res) => {

    try {
        const { pubKey, amount, base64UserSignedTx, blockhash, lastValidBlockHeight, playerId } = req.body;
        
        if (!pubKey || !amount || !base64UserSignedTx || !blockhash || !lastValidBlockHeight) {
            return res.status(400).json({ error: 'Missing signed tx or blockhash/lastValidBlockHeight' });
        }

        const connection = new Connection(process.env.SOLANA_NODE, 'confirmed');
        const TREASURY_OWNER = Keypair.fromSecretKey(
            bs58.default.decode(process.env.TREASURY_OWNER_SECRET.trim())
        );

        const playerContent = await validateGameIdUtils(playerId); //Returns BabyBooh

        if(!playerContent)
            return res.status(400).json({error: "No matching player account found."})

        const inGameWallet = playerContent[1]?.value?.WalletAddress
        const isWalletVerified = await validateGameWalletAddress(pubKey, inGameWallet);

        if(!isWalletVerified)
            return res.status(400).json({ error: "Synced Wallet does not match in-game wallet"});

        const inGameBabyBooh = playerContent[1]?.value?.BabyBoohCoin;
        const isAmountVerified = await validateGameAccountAmount(amount, inGameBabyBooh);

        if(!isAmountVerified)
            return res.status(400).json({ error: "Not enough in game balance."});

        // Optional: ensure blockhash still valid
        const current = await connection.getBlockHeight('confirmed');
        if (current > lastValidBlockHeight) {
            return res.status(410).json({ error: 'Blockhash expired, rebuild required' });
        }

        // Deserialize the user-signed transaction
        const vtx = VersionedTransaction.deserialize(Buffer.from(base64UserSignedTx, 'base64'));

        // Add treasury signature
        vtx.sign([TREASURY_OWNER]);

        // Send
        const sig = await connection.sendRawTransaction(vtx.serialize(), { skipPreflight: false });

        const newAmount = playerContent[1]?.value?.BabyBoohCoin - amount;
        await DeductInGameBabyBooh(playerId, newAmount, playerContent[1]);

        // Confirm using strategy (recommended)
        await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');

        return res.status(200).json({ success: true, signature: sig, newAmount });
    } catch (err) {
        console.error('finalizeAndSend error:', err);
        return res.status(500).json({ error: err.message });
    }
}
