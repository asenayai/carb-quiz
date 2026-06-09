const { getSupabase } = require("./_lib/supabase");

const QUIZ_ID = "carb-ap";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const student_name = String(body.student_name || "").trim().slice(0, 40);
    const student_id = body.student_id
      ? String(body.student_id).trim().slice(0, 20)
      : null;
    const score = Number(body.score);
    const max_score = Number(body.max_score);
    const correct_count = Number(body.correct_count);
    const total_questions = Number(body.total_questions);
    const duration_sec = Number(body.duration_sec) || null;
    const answers = body.answers;
    const quiz_id = String(body.quiz_id || QUIZ_ID).slice(0, 32);

    if (!student_name) {
      return res.status(400).json({ error: "student_name is required" });
    }
    if (!Number.isFinite(score) || !Number.isFinite(max_score)) {
      return res.status(400).json({ error: "Invalid score" });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "answers must be a non-empty array" });
    }

    const supabase = getSupabase();

    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id,
        student_name,
        student_id,
        score,
        max_score,
        correct_count,
        total_questions,
        duration_sec,
        answers,
      })
      .select("id, created_at")
      .single();

    if (attemptError) throw attemptError;

    const detailRows = answers.map((a) => ({
      attempt_id: attempt.id,
      question_num: Number(a.question),
      picked_index: a.picked === null ? null : Number(a.picked),
      correct_index: Number(a.correct),
      is_correct: Boolean(a.is_correct),
      points: Number(a.points) || 0,
      time_left_sec: Number(a.time_left) || 0,
      choice_text: a.choice_text || null,
    }));

    const { error: detailsError } = await supabase
      .from("quiz_answer_details")
      .insert(detailRows);

    if (detailsError) {
      console.error("answer details insert failed:", detailsError);
    }

    return res.status(200).json({
      ok: true,
      id: attempt.id,
      created_at: attempt.created_at,
      details_saved: !detailsError,
    });
  } catch (err) {
    console.error("submit error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
