const FULL_ASSIGNMENT_PROMPT = `You complete student assignments. Your job is to WRITE THE FINISHED WORK — not to teach, coach, or list steps for the student to follow.

Rules:
- Produce a complete, ready-to-use assignment response that answers the prompt fully.
- For essays/reports: write a full introduction, body, and conclusion with proper headings where useful.
- For problem sets / short questions: write the actual answers (worked solutions with final results).
- For code tasks: write working code with brief comments.
- Use a professional academic tone. Include APA-style citations with plausible academic sources when appropriate.
- Format in Markdown.
- Do NOT write study guides, outlines-only, "steps to follow", "how you should approach this", tips, or meta commentary.
- Do NOT say you are an AI or refuse to complete the work.
- Start directly with the assignment content.`;

const DIRECT_ANSWER_PROMPT = `You answer student questions directly. Your job is to GIVE THE ANSWER — not a tutorial or a list of steps to try.

Rules:
- Lead with the final answer / solution.
- Then give brief supporting reasoning, worked math, or short explanations only as needed.
- For multi-part questions: answer each part clearly.
- For code: give the working solution.
- Keep it concise. No essay structure unless the question asks for one.
- Format in Markdown.
- Do NOT give vague advice, "key concepts to identify", "break it into parts", study tips, or instructions for the student to complete themselves.
- Do NOT say you are an AI.
- Start directly with the answer.`;

function userMessage(text, mode) {
  if (mode === 'direct') {
    return `Answer this assignment completely. Give the actual answer, not steps for me to follow.\n\n---\n${text}\n---`;
  }
  return `Complete this assignment. Write the full finished response, not an outline or steps for me to follow.\n\n---\n${text}\n---`;
}

export async function generateContent({ text, mode }) {
  const system = mode === 'direct' ? DIRECT_ANSWER_PROMPT : FULL_ASSIGNMENT_PROMPT;
  const user = userMessage(text, mode);
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (groqKey) {
    const result = await callGroq({ groqKey, system, user });
    if (result) return result;
  }
  if (geminiKey) {
    const result = await callGemini({ geminiKey, system, user });
    if (result) return result;
  }

  return demoResponse(text, mode);
}

async function callGroq({ groqKey, system, user }) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.5,
        max_tokens: 4000,
      }),
    });
    if (!res.ok) {
      console.warn('Groq error:', await res.text());
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('Groq request failed:', err.message);
    return null;
  }
}

async function callGemini({ geminiKey, system, user }) {
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
      }),
    });
    if (!res.ok) {
      console.warn('Gemini error:', await res.text());
      return null;
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn('Gemini request failed:', err.message);
    return null;
  }
}

function demoResponse(text, mode) {
  const preview = text.slice(0, 120).replace(/\n/g, ' ');
  if (mode === 'direct') {
    return `# Direct Answer (Demo Mode)

> Set \`GROQ_API_KEY\` or \`GEMINI_API_KEY\` on Render for real AI output.

**Answer:** Statistics is the science of collecting, organizing, analyzing, and interpreting data to make decisions or draw conclusions.

*(Demo stub for: "${preview}…")*`;
  }

  return `# Assignment Response (Demo Mode)

> Set \`GROQ_API_KEY\` or \`GEMINI_API_KEY\` on Render for real AI output.

## Introduction

Statistics is the branch of mathematics concerned with collecting, summarizing, and analyzing data so that informed conclusions can be drawn.

## Main Body

Statistics covers descriptive methods (tables, charts, averages) and inferential methods (samples used to estimate population characteristics). It underpins research, business decisions, and public policy.

## Conclusion

In short, statistics turns raw data into usable knowledge.

*(Demo stub for: "${preview}…")*`;
}
