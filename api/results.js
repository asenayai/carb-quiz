const { getSupabase } = require("./_lib/supabase");

function checkAdmin(req) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const provided =
    req.headers["x-admin-password"] ||
    req.query.password ||
    "";
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
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    const rows = data || [];
    const summary = {
      total_attempts: rows.length,
      avg_score: rows.length
        ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)
        : 0,
      avg_pct: rows.length
        ? Math.round(
            rows.reduce((s, r) => s + (r.score / r.max_score) * 100, 0) / rows.length
          )
        : 0,
    };

    return res.status(200).json({ summary, attempts: rows });
  } catch (err) {
    console.error("results error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
