import { NextRequest, NextResponse } from "next/server";
import type { AbhaAuthRequest, AbhaAuthResponse } from "../../../../types/abdm";
import { createServerClient } from "@/lib/supabase/server";

async function lookupPatientRecord(abhaOrMobile?: string) {
  if (!abhaOrMobile) return null;
  try {
    const supabase = createServerClient();
    if (!supabase) return null;
    const clean = abhaOrMobile.trim();
    const cleanDigits = clean.replace(/\D/g, "");
    const formatted = cleanDigits.length === 14
      ? `${cleanDigits.slice(0, 2)}-${cleanDigits.slice(2, 6)}-${cleanDigits.slice(6, 10)}-${cleanDigits.slice(10, 14)}`
      : clean;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`abha_id.eq."${formatted}",abha_id.eq."${clean}",phone.eq."${clean}"`)
      .limit(1)
      .maybeSingle();

    return data
      ? {
          ...data,
          name: data.full_name,
        }
      : null;
  } catch {
    return null;
  }
}

interface AbhaRequestBody extends AbhaAuthRequest {
  phase?: string;
  transactionId?: string;
  mobile?: string;
  fullName?: string;
  gender?: string;
  yearOfBirth?: number;
}

// ---------------------------------------------------------------------------
// ABDM NDHM Sandbox API configuration
// Real endpoints: https://abhasandbox.abdm.gov.in/  (sandbox)
// Real production: https://abdm.gov.in/
// ---------------------------------------------------------------------------
const ABDM_BASE_URL = process.env.ABDM_BASE_URL ?? "https://abhasandbox.abdm.gov.in";
const CLIENT_ID = process.env.ABDM_CLIENT_ID;
const CLIENT_SECRET = process.env.ABDM_CLIENT_SECRET;
const HAS_CREDENTIALS = Boolean(CLIENT_ID && CLIENT_SECRET);

// ---------------------------------------------------------------------------
// In-memory OTP store (use Redis/DB in production)
// Keys: aadhaar:${aadhaarNumber}, mobile:${mobile}
// Values: { otp: string; expiresAt: number; txnId: string }
// ---------------------------------------------------------------------------
interface OtpEntry {
  otp: string;
  expiresAt: number; // Unix ms
  txnId: string;
}

const otpStore = new Map<string, OtpEntry>();

function cleanExpiredOtps() {
  const now = Date.now();
  for (const [key, val] of Array.from(otpStore.entries())) {
    if (val.expiresAt < now) otpStore.delete(key);
  }
}

function generateTxnId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

function generateAbhaNumber(): string {
  // Generate a valid-format ABHA number: XX-XXXX-XXXX-XXXX
  const r = () => Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `91-${r()}-${r()}-${r()}`;
}

function generateAbhaAddress(): string {
  // ABHA address: prefix@abha
  const prefixes = ["patient", "user", "citizen", "care", "health"];
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffix}@abha`;
}

// ---------------------------------------------------------------------------
// ABDM auth flow helpers (real API calls when credentials present)
// ---------------------------------------------------------------------------

async function fetchAbdmToken(): Promise<string | null> {
  if (!HAS_CREDENTIALS) return null;
  try {
    const res = await fetch(`${ABDM_BASE_URL}/v2/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token ?? data.accessToken ?? null;
  } catch {
    return null;
  }
}

async function sendAadhaarOtpToAbdm(aadhaarNumber: string, txnId: string): Promise<boolean> {
  const token = await fetchAbdmToken();
  if (!token) return false;
  try {
    const res = await fetch(`${ABDM_BASE_URL}/v2/auth/aadhaar/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Txn-Id": txnId,
      },
      body: JSON.stringify({ aadhaar: aadhaarNumber }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendMobileOtpToAbdm(mobile: string, txnId: string): Promise<boolean> {
  const token = await fetchAbdmToken();
  if (!token) return false;
  try {
    const res = await fetch(`${ABDM_BASE_URL}/v2/auth/mobile/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Txn-Id": txnId,
      },
      body: JSON.stringify({ mobile }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function verifyAadhaarOtpOnAbdm(
  txnId: string,
  otp: string
): Promise<{ success: boolean; name?: string; gender?: string; yearOfBirth?: number; mobile?: string }> {
  const token = await fetchAbdmToken();
  if (!token) return { success: false };
  try {
    const res = await fetch(`${ABDM_BASE_URL}/v2/auth/aadhaar/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Txn-Id": txnId,
      },
      body: JSON.stringify({ txnId, otp }),
    });
    if (!res.ok) return { success: false };
    const data = await res.json();
    return {
      success: true,
      name: data.name,
      gender: data.gender,
      yearOfBirth: data.yearOfBirth ?? data.yob,
      mobile: data.mobile,
    };
  } catch {
    return { success: false };
  }
}

async function verifyMobileOtpOnAbdm(
  txnId: string,
  otp: string
): Promise<{ success: boolean; abhaId?: string; abhaAddress?: string }> {
  const token = await fetchAbdmToken();
  if (!token) return { success: false };
  try {
    const res = await fetch(`${ABDM_BASE_URL}/v2/auth/mobile/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Txn-Id": txnId,
      },
      body: JSON.stringify({ txnId, otp }),
    });
    if (!res.ok) return { success: false };
    const data = await res.json();
    return {
      success: true,
      abhaId: data.abhaNumber,
      abhaAddress: data.abhaAddress,
    };
  } catch {
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/abha
// Actions (phase):
//   "request_otp"  – send OTP to Aadhaar or mobile
//   "verify_otp"   – verify OTP; on success returns ABHA profile / token
//   "create_abha"  – generate new ABHA number (stub when no ABDM creds)
//   "link_abha"    – link existing ABHA to session
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  cleanExpiredOtps();

  let body: AbhaRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<{ success: false; error: string }>(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { phase = "verify_otp" as string, authMethod, abhaNumber, abhaAddress, otp, transactionId } = body;

  // ---------- PHASE: request_otp ----------
  if (phase === "request_otp") {
    const txnId = generateTxnId();

    if (authMethod === "aadhaar_otp") {
      if (!abhaNumber || abhaNumber.replace(/\D/g, "").length !== 12) {
        return NextResponse.json<{ success: false; error: "Aadhaar must be 12 digits" }>(
          { success: false, error: "Aadhaar must be 12 digits" },
          { status: 400 }
        );
      }

      if (HAS_CREDENTIALS) {
        const sent = await sendAadhaarOtpToAbdm(abhaNumber, txnId);
        if (!sent) {
          return NextResponse.json<{ success: false; error: "Failed to send OTP via ABDM" }>(
            { success: false, error: "Failed to send OTP via ABDM" },
            { status: 502 }
          );
        }
      } else {
        // Sandbox simulation: always succeed with mock OTP
        const mockOtp = "123456";
        otpStore.set(`aadhaar:${abhaNumber}`, {
          otp: mockOtp,
          expiresAt: Date.now() + 10 * 60 * 1000,
          txnId,
        });
      }

      return NextResponse.json<{ success: true; transactionId: string; message: string; mockOtp?: string }>(
        {
          success: true,
          transactionId: txnId,
          message: "OTP sent to registered mobile linked with Aadhaar",
          ...(process.env.NODE_ENV === "development" ? { mockOtp: "123456" } : {}),
        }
      );
    }

    if (authMethod === "mobile_otp") {
      if (!body.mobile || body.mobile.replace(/\D/g, "").length !== 10) {
        return NextResponse.json<{ success: false; error: "Mobile must be 10 digits" }>(
          { success: false, error: "Mobile must be 10 digits" },
          { status: 400 }
        );
      }

      if (HAS_CREDENTIALS) {
        const sent = await sendMobileOtpToAbdm(body.mobile, txnId);
        if (!sent) {
          return NextResponse.json<{ success: false; error: "Failed to send OTP via ABDM" }>(
            { success: false, error: "Failed to send OTP via ABDM" },
            { status: 502 }
          );
        }
      } else {
        const mockOtp = "123456";
        otpStore.set(`mobile:${body.mobile}`, {
          otp: mockOtp,
          expiresAt: Date.now() + 10 * 60 * 1000,
          txnId,
        });
      }

      return NextResponse.json<{ success: true; transactionId: string; message: string; mockOtp?: string }>(
        {
          success: true,
          transactionId: txnId,
          message: "OTP sent to mobile number",
          ...(process.env.NODE_ENV === "development" ? { mockOtp: "123456" } : {}),
        }
      );
    }

    return NextResponse.json<{ success: false; error: string }>(
      { success: false, error: "Unsupported auth method. Use aadhaar_otp or mobile_otp" },
      { status: 400 }
    );
  }

  // ---------- PHASE: verify_otp ----------
  if (phase === "verify_otp") {
    if (!transactionId) {
      return NextResponse.json<{ success: false; error: "Transaction ID required for OTP verification" }>(
        { success: false, error: "Transaction ID required for OTP verification" },
        { status: 400 }
      );
    }
    if (!otp || otp.length < 4) {
      return NextResponse.json<{ success: false; error: "OTP must be at least 4 digits" }>(
        { success: false, error: "OTP must be at least 4 digits" },
        { status: 400 }
      );
    }

    // Determine key to check (we stored it keyed by what was used in request_otp)
    // In real flow the txnId maps to the auth method. For stub, verify against store.
    const storedEntry = Array.from(otpStore.values()).find((e) => e.txnId === transactionId);

    if (HAS_CREDENTIALS) {
      // Use real ABDM verification
      let result: { success: boolean; abhaId?: string; abhaAddress?: string; name?: string; gender?: string; yearOfBirth?: number; mobile?: string };
      if (authMethod === "aadhaar_otp") {
        result = await verifyAadhaarOtpOnAbdm(transactionId, otp);
      } else {
        result = await verifyMobileOtpOnAbdm(transactionId, otp);
      }

      if (!result.success) {
        return NextResponse.json<{ success: false; error: string }>(
          { success: false, error: "OTP verification failed" },
          { status: 401 }
        );
      }

      const response: AbhaAuthResponse = {
        success: true,
        abhaId: result.abhaId ?? generateAbhaNumber(),
        abhaAddress: result.abhaAddress ?? generateAbhaAddress(),
        fullName: result.name ?? "ABHA User",
        gender: result.gender ?? "Not specified",
        yearOfBirth: result.yearOfBirth ?? 1990,
        mobile: result.mobile ?? "XXXXXXXXXX",
        token: `abdm-token-${transactionId}-${Date.now()}`,
      };
      return NextResponse.json(response);
    }

    // Stub mode: verify against in-memory store
    if (storedEntry) {
      if (Date.now() > storedEntry.expiresAt) {
        return NextResponse.json<{ success: false; error: "OTP expired. Please request a new one." }>(
          { success: false, error: "OTP expired. Please request a new one." },
          { status: 401 }
        );
      }
      if (otp !== storedEntry.otp) {
        return NextResponse.json<{ success: false; error: "Incorrect OTP. Please try again." }>(
          { success: false, error: "Incorrect OTP. Please try again." },
          { status: 401 }
        );
      }
      otpStore.delete(Array.from(otpStore.entries()).find(([, v]) => v.txnId === transactionId)?.[0] ?? "");

      const existingPatient = await lookupPatientRecord(abhaNumber || body.mobile);
      const response: AbhaAuthResponse = {
        success: true,
        abhaId: existingPatient?.abha_id || abhaNumber || generateAbhaNumber(),
        abhaAddress: existingPatient?.abha_address || generateAbhaAddress(),
        fullName: existingPatient?.name || body.fullName || "ABHA Patient",
        gender: existingPatient?.gender || body.gender || "Not specified",
        yearOfBirth: existingPatient?.age ? (new Date().getFullYear() - existingPatient.age) : (body.yearOfBirth || 1990),
        mobile: existingPatient?.phone || body.mobile || "XXXXXXXXXX",
        token: `abdm-token-${transactionId}-${Date.now()}`,
      };
      return NextResponse.json(response);
    }

    // No stored OTP (e.g. re-verification without prior request) — accept in dev with magic OTP
    if (otp === "123456" || otp === "1234") {
      const existingPatient = await lookupPatientRecord(abhaNumber || body.mobile);
      const response: AbhaAuthResponse = {
        success: true,
        abhaId: existingPatient?.abha_id || abhaNumber || generateAbhaNumber(),
        abhaAddress: existingPatient?.abha_address || abhaAddress || generateAbhaAddress(),
        fullName: existingPatient?.name || body.fullName || "ABHA Patient",
        gender: existingPatient?.gender || body.gender || "Not specified",
        yearOfBirth: existingPatient?.age ? (new Date().getFullYear() - existingPatient.age) : (body.yearOfBirth || 1990),
        mobile: existingPatient?.phone || body.mobile || "XXXXXXXXXX",
        token: `abdm-token-${transactionId ?? "no-txn"}-${Date.now()}`,
      };
      return NextResponse.json(response);
    }

    return NextResponse.json<{ success: false; error: "Invalid or expired OTP" }>(
      { success: false, error: "Invalid or expired OTP" },
      { status: 401 }
    );
  }

  // ---------- PHASE: create_abha ----------
  if (phase === "create_abha") {
    if (!HAS_CREDENTIALS) {
      // Stub: generate a pseudo-ABHA number
      const newAbha = generateAbhaNumber();
      const response: AbhaAuthResponse = {
        success: true,
        abhaId: newAbha,
        abhaAddress: generateAbhaAddress(),
        fullName: body.fullName ?? "New ABHA User",
        gender: body.gender ?? "Not specified",
        yearOfBirth: body.yearOfBirth ?? 1990,
        mobile: body.mobile ?? "XXXXXXXXXX",
        token: `stub-abdm-token-${Date.now()}`,
      };
      return NextResponse.json(response);
    }

    // Real ABDM: trigger profile creation
    return NextResponse.json<{ success: false; error: string }>(
      { success: false, error: "ABDM profile creation requires government portal onboarding" },
      { status: 501 }
    );
  }

  // ---------- PHASE: link_abha ----------
  if (phase === "link_abha") {
    if (!abhaNumber && !abhaAddress) {
      return NextResponse.json<{ success: false; error: string }>(
        { success: false, error: "ABHA number or address required to link" },
        { status: 400 }
      );
    }

    const normalized = abhaNumber?.replace(/[-\s]/g, "") ?? "";
    if (normalized && normalized.length !== 14) {
      return NextResponse.json<{ success: false; error: string }>(
        { success: false, error: "ABHA Number must be 14 digits" },
        { status: 400 }
      );
    }

    // Link ABHA
    const existingPatient = await lookupPatientRecord(abhaNumber || body.mobile);
    const response: AbhaAuthResponse = {
      success: true,
      abhaId: existingPatient?.abha_id || abhaNumber || "91-0000-0000-0001",
      abhaAddress: existingPatient?.abha_address || abhaAddress || "user@abha",
      fullName: existingPatient?.name || body.fullName || "ABHA Patient",
      gender: existingPatient?.gender || body.gender || "Not specified",
      yearOfBirth: existingPatient?.age ? (new Date().getFullYear() - existingPatient.age) : (body.yearOfBirth || 1990),
      mobile: existingPatient?.phone || body.mobile || "XXXXXXXXXX",
      token: `link-token-${Date.now()}`,
    };
    return NextResponse.json(response);
  }

  const unknownPhaseMsg = `Unknown phase '${phase}'. Use: request_otp, verify_otp, create_abha, link_abha`;
  return NextResponse.json<{ success: false; error: string }>(
    { success: false, error: unknownPhaseMsg },
    { status: 400 }
  );
}
