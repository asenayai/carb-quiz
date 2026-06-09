const { getSupabase } = require("./_lib/supabase");

function checkAdmin(req) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const provided =
    req.headers["x-admin-password"] || req.query.password || "";
  return provided === password;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!checkAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const quiz_id = String(req.query.quiz_id || "carb-ap");
    const supabase = getSupabase();

    const { data: questionStats, error: statsError } = await supabase
      .from("quiz_question_stats")
      .select("*")
      .eq("quiz_id", quiz_id)
      .order("question_num", { ascending: true });

    if (statsError) throw statsError;

    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("student_name, score, max_score, correct_count, created_at")
      .eq("quiz_id", quiz_id);

    if (attemptsError) throw attemptsError;

    const rows = attempts || [];
    const summary = {
      quiz_id,
      total_attempts: rows.length,
      unique_students: new Set(rows.map((r) => r.student_name)).size,
      avg_score: rows.length
        ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)
        : 0,
      avg_pct: rows.length
        ? Math.round(
            rows.reduce((s, r) => s + (r.score / r.max_score) * 100, 0) / rows.length
          )
        : 0,
    };

    return res.status(200).json({
      summary,
      question_stats: questionStats || [],
    });
  } catch (err) {
    console.error("analytics error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
