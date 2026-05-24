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

  if (!secret) return { ok: false, reason: "Missing webhook secret" };
  if (!signatureHeader) return { ok: false, reason: "Missing signature header" };

  const data = parseTicketTailorSignatureHeader(signatureHeader);
  if (!data) return { ok: false, reason: "Invalid signature header" };

  const { timestamp, signature } = data;

  const now = Math.floor(Date.now() / 1000); // converts to utc seconds
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "Invalid timestamp" };
  if (Math.abs(now - ts) > toleranceSeconds) return { ok: false, reason: "Signature timestamp too old/new" };

  const signedPayload = `${timestamp}${rawBody}`;

  const expected = crypto //idk chat told me this is how to create and encode the secret
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  try {
    const recieved  = Buffer.from(expected, "utf8");
    const sign = Buffer.from(signature, "utf8");
    if (recieved.length !== sign.length) return { ok: false, reason: "Signature length mismatch" };

    const match = crypto.timingSafeEqual(recieved, sign);
    return match ? { ok: true } : { ok: false, reason: "Signature mismatch" };
  } catch {
    return { ok: false, reason: "Signature comparison failed" };
  }
}
