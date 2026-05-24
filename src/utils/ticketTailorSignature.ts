import crypto from "crypto";

type ParsedSig = { timestamp: string; signature: string };

//helper to send parsed data to main function
function parseTicketTailorSignatureHeader(headerVal: string): ParsedSig | null {
  const parts = headerVal.split(",").map(s => s.trim());

  const timestamp = parts.find(p => p.startsWith("t="));
  const whsignature = parts.find(p => p.startsWith("v1="));

  if (!timestamp || !whsignature) return null;

  return {
    timestamp: timestamp.slice(2), //cuts out the t=
    signature: whsignature.slice(3), //cutsout the v1=
  };
} 

//main function to verify webhook signature aligns with expected signature and is within time limit
export function verifyTicketTailorSignature(opts: {
  rawBody: string;
  signatureHeader: string | undefined;
  secret: string | undefined;
  toleranceSeconds?: number;
}): { ok: true } | { ok: false; reason: string } {
  const time_limit = 300; //time limit in seconds for valid request

  const { rawBody, signatureHeader, secret } = opts;
  const toleranceSeconds = opts.toleranceSeconds ?? time_limit;

  console.log("[TT-SIG] verify start", {
    hasSecret: !!secret,
    secretLength: secret?.length ?? 0,
    secretPrefix: secret ? secret.slice(0, 4) : null,
    hasSignatureHeader: !!signatureHeader,
    signatureHeaderRaw: signatureHeader ?? null,
    rawBodyType: typeof rawBody,
    rawBodyLength: rawBody?.length ?? 0,
    toleranceSeconds,
  });

  if (!secret) return { ok: false, reason: "Missing webhook secret" };
  if (!signatureHeader) return { ok: false, reason: "Missing signature header" };

  const data = parseTicketTailorSignatureHeader(signatureHeader);
  if (!data) {
    console.log("[TT-SIG] failed to parse signature header", { signatureHeader });
    return { ok: false, reason: "Invalid signature header" };
  }

  const { timestamp, signature } = data;
  console.log("[TT-SIG] parsed header", {
    timestamp,
    signatureLength: signature.length,
    signaturePrefix: signature.slice(0, 8),
  });

  const now = Math.floor(Date.now() / 1000); // converts to utc seconds
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    console.log("[TT-SIG] timestamp not finite", { timestamp });
    return { ok: false, reason: "Invalid timestamp" };
  }
  const drift = now - ts;
  console.log("[TT-SIG] timestamp check", { now, ts, driftSeconds: drift, toleranceSeconds });
  if (Math.abs(drift) > toleranceSeconds) return { ok: false, reason: "Signature timestamp too old/new" };

  const signedPayload = `${timestamp}${rawBody}`;

  const expected = crypto //idk chat told me this is how to create and encode the secret
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  console.log("[TT-SIG] hmac computed", {
    signedPayloadLength: signedPayload.length,
    expectedLength: expected.length,
    expectedPrefix: expected.slice(0, 8),
    receivedPrefix: signature.slice(0, 8),
    lengthsMatch: expected.length === signature.length,
  });

  try {
    const recieved  = Buffer.from(expected, "utf8");
    const sign = Buffer.from(signature, "utf8");
    if (recieved.length !== sign.length) return { ok: false, reason: "Signature length mismatch" };

    const match = crypto.timingSafeEqual(recieved, sign);
    console.log("[TT-SIG] comparison result", { match });
    return match ? { ok: true } : { ok: false, reason: "Signature mismatch" };
  } catch (err) {
    console.log("[TT-SIG] comparison threw", { err });
    return { ok: false, reason: "Signature comparison failed" };
  }
}
