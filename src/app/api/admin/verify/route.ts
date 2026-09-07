import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret } = body ?? {};

    if (!secret) {
      return NextResponse.json({ error: "Missing secret" }, { status: 400 });
    }

    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      // No secret configured — deny for safety
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }

    if (secret !== adminSecret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
