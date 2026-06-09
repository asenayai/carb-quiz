#!/usr/bin/env python3
"""Apply supabase/schema.sql using DATABASE_URL (one-time setup).

Usage:
  export DATABASE_URL='postgresql://postgres.ungdcpmarivrrhhmvdbb:[PASSWORD]@...pooler.supabase.com:6543/postgres'
  python3 scripts/apply-schema.py
"""
import os
import sys

def main():
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("Set DATABASE_URL first (Supabase → Settings → Database → Connection string → URI)")
        sys.exit(1)

    schema_path = os.path.join(os.path.dirname(__file__), "..", "supabase", "schema.sql")
    with open(schema_path, encoding="utf-8") as f:
        sql = f.read()

    import psycopg2
    conn = psycopg2.connect(url, sslmode="require")
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(sql)
    cur.close()
    conn.close()
    print("Schema applied successfully.")

if __name__ == "__main__":
    main()
