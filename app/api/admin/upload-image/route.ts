import { NextResponse } from "next/server";
import { QUESTIONS } from "@/lib/quiz-data";
import {
  defaultQuestionImages,
  ensureQuizImagesBucket,
  imagePathForQuestion,
  publicImageUrl,
} from "@/lib/quiz-images";
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

    const supabase = getSupabase();
    await ensureQuizImagesBucket(supabase);

    const path = imagePathForQuestion(question, file.type);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("quiz-images")
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type,
        cacheControl: "60",
      });

    if (uploadError) throw uploadError;

    const url = publicImageUrl(supabase, path, String(Date.now()));

    return NextResponse.json({ ok: true, question, url });
  } catch (err) {
    console.error("upload-image:", err);
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
    const { data: files } = await supabase.storage.from("quiz-images").list(
      "carb-ap",
      { search: `q${question}.` }
    );

    const toRemove =
      files
        ?.filter((f) => f.name.startsWith(`q${question}.`))
        .map((f) => `carb-ap/${f.name}`) ?? [];

    if (toRemove.length > 0) {
      await supabase.storage.from("quiz-images").remove(toRemove);
    }

    const defaults = defaultQuestionImages();
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
