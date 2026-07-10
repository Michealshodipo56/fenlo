import { query } from './db.js';

function rowToSubmission(row) {
  return {
    id: row.id,
    title: row.title,
    input: row.input_text,
    output: row.output_text,
    mode: row.mode,
    fileName: row.file_name,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
  };
}

export async function createSubmission({ id, userId, title, input, output, mode, fileName }) {
  const { rows } = await query(
    `INSERT INTO submissions (id, user_id, title, input_text, output_text, mode, file_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, userId, title, input, output, mode, fileName || null],
  );
  return rowToSubmission(rows[0]);
}

export async function listSubmissions(userId, limit = 50) {
  const { rows } = await query(
    `SELECT * FROM submissions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit],
  );
  return rows.map(rowToSubmission);
}

export async function getSubmission(userId, id) {
  const { rows } = await query(
    `SELECT * FROM submissions WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rows.length ? rowToSubmission(rows[0]) : null;
}

export async function updateSubmissionOutput(userId, id, output) {
  const { rows } = await query(
    `UPDATE submissions SET output_text = $3
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId, output],
  );
  return rows.length ? rowToSubmission(rows[0]) : null;
}

export function truncateTitle(text, max = 60) {
  const line = String(text).split('\n')[0];
  return line.length > max ? line.slice(0, max) + '…' : line;
}
