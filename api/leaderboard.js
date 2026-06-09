const { getSupabase } = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("student_name, score, max_score, correct_count, total_questions, created_at")
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");
    return res.status(200).json({ leaderboard: data || [] });
  } catch (err) {
    console.error("leaderboard error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
