const getPriorityFee = async () => {
  try {
    const raw = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "qn_estimatePriorityFees",
      params: {
        last_n_blocks: 100,
        account: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        api_version: 2,
      },
    });

    const response = await fetch(process.env.SOLANA_NODE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw,
    });

    // Check HTTP status first
    if (!response.ok) {
      const text = await response.text();
      console.error(
        `Priority fee RPC error: HTTP ${response.status} - ${text}`
      );
      return 3_500_000; // let caller fall back
    }

    const result = await response.json();

    if (!result || !result.result || !result.result.per_compute_unit) {
      console.error("Unexpected priority fee response:", result);
      return 3_500_000;
    }

    console.log(result);

    return result.result.per_compute_unit.medium;
  } catch (error) {
    console.error("Error in getPriorityFee:", error);
    return perComputeUnit = 3_500_000;
  }
};

module.exports = { getPriorityFee };