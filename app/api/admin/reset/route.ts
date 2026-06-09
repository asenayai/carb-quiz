import { NextResponse } from "next/server";
import { z } from "zod";
import { QUIZ_ID } from "@/lib/quiz-data";
import { getSupabase } from "@/lib/supabase/server";
import { checkAdminPassword } from "@/lib/utils";

const bodySchema = z.object({
  confirm: z.literal("RESET"),
  classLabel: z.string().trim().max(48).optional(),
  scope: z.enum(["class", "all"]),
});

export async function POST(request: Request) {
  if (!checkAdminPassword(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Type RESET to confirm" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    let query = supabase.from("quiz_attempts").delete().eq("quiz_id", QUIZ_ID);

    if (parsed.data.scope === "class") {
      if (!parsed.data.classLabel) {
        return NextResponse.json(
          { error: "classLabel required for class reset" },
          { status: 400 }
        );
      }
      query = query.eq("class_label", parsed.data.classLabel);
    }

    const { data, error } = await query.select("id");
    if (error) throw error;

    return NextResponse.json({
      ok: true,
      deleted: data?.length ?? 0,
      scope: parsed.data.scope,
      classLabel: parsed.data.classLabel ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
