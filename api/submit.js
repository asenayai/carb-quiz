const { getSupabase } = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const student_name = String(body.student_name || "").trim().slice(0, 40);
    const score = Number(body.score);
    const max_score = Number(body.max_score);
    const correct_count = Number(body.correct_count);
    const total_questions = Number(body.total_questions);
    const answers = body.answers;

    if (!student_name) {
      return res.status(400).json({ error: "student_name is required" });
    }
    if (!Number.isFinite(score) || !Number.isFinite(max_score)) {
      return res.status(400).json({ error: "Invalid score" });
    }
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "answers must be an array" });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert({
        student_name,
        score,
        max_score,
        correct_count,
        total_questions,
        answers,
      })
      .select("id, created_at")
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, id: data.id, created_at: data.created_at });
  } catch (err) {
    console.error("submit error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
