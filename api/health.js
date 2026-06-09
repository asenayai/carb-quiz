const { getSupabase } = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("quiz_attempts")
      .select("id")
      .limit(1);

    if (error) {
      return res.status(503).json({
        ok: false,
        database: "not ready",
        hint: "Run supabase/schema.sql in Supabase SQL Editor",
        error: error.message,
      });
    }

    return res.status(200).json({
      ok: true,
      database: "connected",
      supabase_url: process.env.SUPABASE_URL ? "configured" : "missing",
    });
  } catch (err) {
    return res.status(503).json({
      ok: false,
      error: err.message,
    });
  }
};
