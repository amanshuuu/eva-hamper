import { json, error, handleOptions, requireAdmin } from '../_utils.js';

// Cron-triggered: exports D1 database to SQL and stores in R2
export async function onRequest(context) {
  const { request, env } = context;

  // Allow cron trigger (unauthenticated) or manual admin trigger
  const isCron = request.headers.get('Authorization') === '';
  if (!isCron) {
    const admin = await requireAdmin(request, env);
    if (!admin) return error('Unauthorized', 401);
  }

  try {
    // Export all tables to SQL
    const tables = ['products', 'categories', 'orders', 'customers', 'reviews',
                    'newsletter', 'contact_messages', 'settings', 'audit_logs',
                    'analytics_daily'];
    let sql = `-- EVA HAMPERS BACKUP - ${new Date().toISOString()}\n\n`;

    for (const table of tables) {
      const { results } = await env.DB.prepare(`SELECT * FROM ${table}`).all();
      if (results.length === 0) continue;

      // Get column names
      const { results: colInfo } = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
      const colNames = colInfo.map((c) => c.name);
      const quoted = colNames.map((c) => `"${c}"`).join(', ');

      for (const row of results) {
        const values = colNames.map((c) => {
          const v = row[c];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return String(v);
          return `'${String(v).replace(/'/g, "''")}'`;
        }).join(', ');
        sql += `INSERT INTO "${table}" (${quoted}) VALUES (${values});\n`;
      }
      sql += '\n';
    }

    // Store in R2 with date-stamped key
    const dateStr = new Date().toISOString().split('T')[0];
    const key = `backups/eva-hampers-${dateStr}.sql`;
    await env.R2.put(key, sql, {
      customMetadata: { generatedAt: new Date().toISOString() },
    });

    // Keep last 30 backups, delete older ones
    const listed = await env.R2.list({ prefix: 'backups/' });
    if (listed.objects.length > 30) {
      const sorted = listed.objects.sort((a, b) => b.uploaded.toISOString().localeCompare(a.uploaded.toISOString()));
      for (const old of sorted.slice(30)) {
        await env.R2.delete(old.key);
      }
    }

    return json({ ok: true, key, size: sql.length, tables: tables.length });
  } catch (e) {
    return error(e.message, 500);
  }
}
