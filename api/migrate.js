const fs = require("fs");
const path = require("path");

function checkAdmin(req) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const provided =
    req.headers["x-admin-password"] || req.query.password || "";
  return provided === password;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!checkAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(400).json({
      error: "DATABASE_URL not set",
      hint: "Add Supabase connection string to Vercel env, or run supabase/schema.sql manually",
    });
  }

  try {
    const { Client } = require("pg");
    const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");

    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    await client.query(sql);
    await client.end();

    return res.status(200).json({ ok: true, message: "Schema applied successfully" });
  } catch (err) {
    console.error("migrate error:", err);
    return res.status(500).json({ error: err.message || "Migration failed" });
  }
};
