const getPriorityFee = async () => {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "getRecentPrioritizationFees",
    params: [
      {
        accountKeys: [
          "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", // or your program / JUP / whatever is hot
        ],
      },
    ],
  });

  const res = await fetch(process.env.SOLANA_NODE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Priority fee RPC error ${res.status}: ${text}`);
  }

  const json = await res.json();

  const fees = json.result;
  if (!Array.isArray(fees) || fees.length === 0) {
    throw new Error("No recent prioritization fees available");
  }

  // Take, say, the 75th percentile to be “fast but not insane”
  const sorted = fees
    .map((f) => f.prioritizationFee)
    .filter((n) => typeof n === "number" && n > 0)
    .sort((a, b) => a - b);

  if (!sorted.length) {
    throw new Error("No valid prioritization fees in response");
  }

  const idx = Math.floor(sorted.length * 0.75); // 75th percentile
  return sorted[idx];
};

module.exports = { getPriorityFee };