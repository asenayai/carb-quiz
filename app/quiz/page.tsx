import { QuizRunner } from "@/components/QuizRunner";
import {
  defaultQuestionImages,
  getQuestionImageMap,
} from "@/lib/quiz-images";
import { getSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  let questionImages = defaultQuestionImages();
  try {
    const supabase = getSupabase();
    questionImages = await getQuestionImageMap(supabase);
  } catch {
    // fall back to bundled defaults
  }

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <QuizRunner initialImages={questionImages} />
    </main>
  );
}
