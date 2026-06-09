import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("quiz_attempts").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          database: "not ready",
          hint: "Run supabase db push or apply schema.sql",
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      database: "connected",
      supabase_url: process.env.SUPABASE_URL ? "configured" : "missing",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 503 }
    );
  }
}
