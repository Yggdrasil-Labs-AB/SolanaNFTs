import {
    publicKey,
    sol,
} from "@metaplex-foundation/umi";
import {
    transferSol,
} from "@metaplex-foundation/mpl-toolbox";
import { base64 } from "@metaplex-foundation/umi/serializers";

export const computeTxUnits = async (umi, tx) => {

    const baseTransaction = await transferSol(umi, {
        destination: publicKey("ALRz3jGqhwDW2erRcMxBuPDsu3kFoDb251M9snHHW3Xe"),
        amount: sol(0.01),
    }).setLatestBlockhash(umi);

    const transaction = baseTransaction.build(umi)

    // Default values if estimation fails
    const DEFAULT_COMPUTE_UNITS = 800_000; // Standard safe value
    const BUFFER_FACTOR = 1.1; // Add 10% safety margin

    // Simulate the transaction to get actual compute units needed
    const response = await fetch(umi.rpc.getEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "simulateTransaction",
            params: [
                base64.deserialize(
                    umi.transactions.serialize(tx)
                )[0],
                {
                    encoding: "base64",
                    replaceRecentBlockhash: true,
                    sigVerify: false,
                },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to simulate transaction: ${response.status}`);
    }

    const data = await response.json();

    const unitsConsumed = data.result?.value?.unitsConsumed;

    const calculatedUnits = !unitsConsumed
        ? DEFAULT_COMPUTE_UNITS
        : Math.ceil(unitsConsumed * BUFFER_FACTOR);

    return calculatedUnits;
}

export const getPriorityFee = async (umi, wallet) => {

    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "qn_estimatePriorityFees",
            "params": {
                "last_n_blocks": 100,
                "account": "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
                "api_version": 2
            }
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        const response = await fetch(
            import.meta.env.VITE_SOLANA_NODE,
            requestOptions
        );

        const result = await response.json();

        return result.result.per_compute_unit.medium;
    } catch (error) {
        console.error("Error:", error);
    }
}

