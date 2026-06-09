import { NextResponse } from "next/server";
import { QUIZ_ID, QUESTIONS } from "@/lib/quiz-data";
import {
  defaultQuestionImages,
  getSetting,
  setSetting,
} from "@/lib/quiz-settings";
import { getSupabase } from "@/lib/supabase/server";
import { checkAdminPassword } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request) {
  if (!checkAdminPassword(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const questionRaw = formData.get("question");
    const file = formData.get("file");

    const question = Number(questionRaw);
    if (
      !Number.isInteger(question) ||
      question < 1 ||
      question > QUESTIONS.length
    ) {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Use PNG, JPEG, or WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Max 5 MB" }, { status: 400 });
    }

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    const path = `${QUIZ_ID}/q${question}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = getSupabase();

    const { error: uploadError } = await supabase.storage
      .from("quiz-images")
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("quiz-images").getPublicUrl(path);

    const url = `${publicUrl}?v=${Date.now()}`;
    const existing =
      (await getSetting<Record<string, string>>(
        supabase,
        "question_images"
      )) ?? {};
    const merged = { ...defaultQuestionImages(), ...existing };
    merged[String(question)] = url;
    await setSetting(supabase, "question_images", merged);

    return NextResponse.json({ ok: true, question, url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!checkAdminPassword(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const question = Number(searchParams.get("question"));
    if (
      !Number.isInteger(question) ||
      question < 1 ||
      question > QUESTIONS.length
    ) {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }

    const supabase = getSupabase();
    const existing =
      (await getSetting<Record<string, string>>(
        supabase,
        "question_images"
      )) ?? {};
    const defaults = defaultQuestionImages();
    const merged = { ...defaults, ...existing };
    merged[String(question)] = defaults[String(question)];
    await setSetting(supabase, "question_images", merged);

    return NextResponse.json({
      ok: true,
      question,
      url: defaults[String(question)],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
