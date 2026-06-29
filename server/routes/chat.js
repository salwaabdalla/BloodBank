const express  = require('express');
const router   = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are a helpful assistant for a Blood Bank Management System staff member.
Answer questions about donors, inventory, blood requests, patients, camps, and donations using the tools provided.
Be concise and use specific numbers when available.
You cannot create, edit, or delete records — if asked to do so, politely explain that is not supported through the chat interface yet.`;

// Each tool maps 1-to-1 to a read-only DB query.
// No raw SQL is ever constructed from user input — inputs go only to known queries.
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_dashboard_stats',
      description: 'Get high-level counts: total donors, total donations, pending blood requests, non-expired inventory units in stock, total patients, total camps.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_inventory_by_blood_type',
      description: 'Get non-expired blood inventory units grouped by blood type, with stock status (CRITICAL < 5 units, LOW < 20 units, OK otherwise). Use this for any stock or inventory question.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pending_requests',
      description: 'Get all pending blood requests with hospital name, patient name, blood type, units needed, and urgency. Sorted by urgency (CRITICAL first).',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_donors',
      description: 'Get the 20 most recently registered donors with their name, blood type, and eligibility status.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_camps',
      description: 'Get upcoming blood donation camps (on or after today) with camp name, location, date, target donor count, and organising bank.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_donations',
      description: 'Get the 20 most recent donation records: donor name, blood type, units, date, status, and bank.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_patients',
      description: 'Get the 20 most recently admitted patients with name, hospital, blood type, and admission date.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];

// Execute one tool call using existing DB connection pool.
// Only SELECT statements here — the chatbot has no write path.
async function executeTool(name) {
  const conn = await getConnection();
  try {
    switch (name) {

      case 'get_dashboard_stats': {
        const r = await conn.execute(
          `SELECT
             (SELECT COUNT(*) FROM donor)                                            AS total_donors,
             (SELECT COUNT(*) FROM donation)                                         AS total_donations,
             (SELECT COUNT(*) FROM blood_request WHERE UPPER(status) = 'PENDING')   AS pending_requests,
             (SELECT NVL(SUM(units), 0) FROM blood_inventory WHERE expiry_date > SYSDATE) AS units_in_stock,
             (SELECT COUNT(*) FROM patient)                                          AS total_patients,
             (SELECT COUNT(*) FROM camp)                                             AS total_camps
           FROM dual`,
          [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return r.rows[0];
      }

      case 'get_inventory_by_blood_type': {
        // LEFT JOIN so blood types with zero non-expired units still appear
        const r = await conn.execute(
          `SELECT bt.blood_group,
                  NVL(SUM(bi.units), 0) AS units,
                  CASE
                    WHEN NVL(SUM(bi.units), 0) < 5  THEN 'CRITICAL'
                    WHEN NVL(SUM(bi.units), 0) < 20 THEN 'LOW'
                    ELSE 'OK'
                  END AS stock_status
             FROM blood_type bt
             LEFT JOIN blood_inventory bi
               ON bi.blood_type_id = bt.blood_type_id
               AND bi.expiry_date > SYSDATE
            GROUP BY bt.blood_group
            ORDER BY bt.blood_group`,
          [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return r.rows;
      }

      case 'get_pending_requests': {
        const r = await conn.execute(
          `SELECT br.request_id,
                  h.hospital_name,
                  bt.blood_group,
                  p.first_name || ' ' || p.last_name AS patient_name,
                  br.units, br.urgency,
                  TO_CHAR(br.request_date, 'DD-Mon-YYYY') AS request_date
             FROM blood_request br
             JOIN hospital   h  ON br.hospital_id  = h.hospital_id
             JOIN blood_type bt ON br.blood_type_id = bt.blood_type_id
             JOIN patient    p  ON br.patient_id    = p.patient_id
            WHERE UPPER(br.status) = 'PENDING'
            ORDER BY
              CASE UPPER(br.urgency)
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH'     THEN 2
                WHEN 'MEDIUM'   THEN 3
                ELSE 4
              END,
              br.request_date DESC`,
          [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return r.rows;
      }

      case 'get_recent_donors': {
        const r = await conn.execute(
          `SELECT d.donor_id,
                  d.first_name || ' ' || d.last_name AS name,
                  bt.blood_group,
                  CASE d.is_eligible WHEN 'Y' THEN 'Eligible' ELSE 'Not eligible' END AS eligibility
             FROM donor d
             JOIN blood_type bt ON d.blood_type_id = bt.blood_type_id
            ORDER BY d.donor_id DESC
            FETCH FIRST 20 ROWS ONLY`,
          [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return r.rows;
      }

      case 'get_upcoming_camps': {
        const r = await conn.execute(
          `SELECT c.camp_id, c.camp_name, c.location,
                  TO_CHAR(c.camp_date, 'YYYY-MM-DD') AS camp_date,
                  c.target_donors, c.status, bb.bank_name
             FROM camp c
             JOIN blood_bank bb ON c.bank_id = bb.bank_id
            WHERE c.camp_date >= TRUNC(SYSDATE)
            ORDER BY c.camp_date ASC`,
          [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return r.rows;
      }

      case 'get_recent_donations': {
        const r = await conn.execute(
          `SELECT dn.donation_id,
                  d.first_name || ' ' || d.last_name AS donor_name,
                  bt.blood_group, dn.units,
                  TO_CHAR(dn.donation_date, 'YYYY-MM-DD') AS donation_date,
                  dn.status, bb.bank_name
             FROM donation dn
             JOIN donor      d  ON dn.donor_id     = d.donor_id
             JOIN blood_type bt ON dn.blood_type_id = bt.blood_type_id
             JOIN blood_bank bb ON dn.bank_id       = bb.bank_id
            ORDER BY dn.donation_date DESC
            FETCH FIRST 20 ROWS ONLY`,
          [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return r.rows;
      }

      case 'get_patients': {
        const r = await conn.execute(
          `SELECT p.patient_id,
                  p.first_name || ' ' || p.last_name AS name,
                  bt.blood_group, h.hospital_name,
                  TO_CHAR(p.admission_date, 'DD-Mon-YYYY') AS admission_date
             FROM patient p
             JOIN hospital   h  ON p.hospital_id  = h.hospital_id
             JOIN blood_type bt ON p.blood_type_id = bt.blood_type_id
            ORDER BY p.patient_id DESC
            FETCH FIRST 20 ROWS ONLY`,
          [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return r.rows;
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } finally {
    await conn.close();
  }
}

// POST /api/chat
// Accepts { message: string }, returns { reply: string } or { error: string }
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GROQ_API_KEY is not configured. Add it to server/.env and restart the server.',
      });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: message.trim() },
    ];

    const MAX_ROUNDS = 5; // safety cap on tool-call loops

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const groqResp = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          model:       MODEL,
          messages,
          tools:       TOOLS,
          tool_choice: 'auto',
          max_tokens:  1024,
          temperature: 0.3,
        }),
      });

      if (!groqResp.ok) {
        const errBody = await groqResp.json().catch(() => ({}));
        const detail  = errBody?.error?.message || `HTTP ${groqResp.status}`;
        console.error('Groq API error:', detail);
        return res.status(502).json({ error: `AI service error: ${detail}` });
      }

      const completion = await groqResp.json();
      const choice = completion.choices?.[0];
      if (!choice) {
        return res.status(502).json({ error: 'Unexpected empty response from AI service.' });
      }

      if (choice.finish_reason === 'tool_calls') {
        // Add the assistant turn (which contains the tool_calls list) to history
        messages.push(choice.message);

        // Execute each requested tool and append results
        for (const tc of choice.message.tool_calls) {
          let toolResult;
          try {
            toolResult = await executeTool(tc.function.name);
          } catch (dbErr) {
            console.error(`Tool ${tc.function.name} DB error:`, dbErr.message);
            toolResult = { error: 'Database query failed', detail: dbErr.message };
          }
          messages.push({
            role:         'tool',
            tool_call_id: tc.id,
            content:      JSON.stringify(toolResult),
          });
        }
        // Loop back — send tool results to the model for a final answer
        continue;
      }

      // Model returned a final natural-language answer
      return res.json({ reply: choice.message.content ?? '' });
    }

    return res.json({ reply: 'I could not resolve your question after several steps. Please try rephrasing.' });

  } catch (err) {
    console.error('Chat route unexpected error:', err);
    return res.status(500).json({ error: 'An unexpected server error occurred. Please try again.' });
  }
});

module.exports = router;
