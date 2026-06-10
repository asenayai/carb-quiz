import { NextResponse } from "next/server";
import { z } from "zod";
import { CLASS_ROOMS, mergeClassLabels } from "@/lib/class-rooms";
import { setSetting } from "@/lib/quiz-settings";
import { getSupabase } from "@/lib/supabase/server";
import { checkAdminPassword } from "@/lib/utils";

const bodySchema = z.object({
  currentClass: z.enum(CLASS_ROOMS).optional(),
});

export async function POST(request: Request) {
  if (!checkAdminPassword(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (parsed.data.currentClass) {
      await setSetting(supabase, "current_class", parsed.data.currentClass);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  if (!checkAdminPassword(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { getQuizConfig } = await import("@/lib/quiz-settings");
    const supabase = getSupabase();
    const config = await getQuizConfig(supabase);

    const { data: classes } = await supabase
      .from("quiz_attempts")
      .select("class_label")
      .eq("quiz_id", "carb-ap");

    const classLabels = mergeClassLabels([
      config.currentClass,
      ...(classes || []).map((r) => r.class_label as string),
    ]);

    return NextResponse.json({ ...config, classLabels });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
