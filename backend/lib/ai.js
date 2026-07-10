const FULL_ASSIGNMENT_PROMPT = `You are an academic writing assistant helping a student understand how to complete an assignment.

Write a complete, well-structured assignment response based on the instructions below. Include:
- Clear introduction, body paragraphs, and conclusion (for essays/reports)
- Proper headings where appropriate
- Citations in APA format where sources are referenced (use plausible academic sources)
- Professional academic tone

Format your response in Markdown. Do not include meta-commentary about being an AI.`;

const DIRECT_ANSWER_PROMPT = `You are a tutoring assistant helping a student understand an assignment.

Provide a direct, concise answer or solution to the assignment below. Include:
- The answer/solution upfront
- Brief step-by-step reasoning for math/science problems
- Code with comments for programming tasks
- Bullet points for multi-part questions

Keep it concise — no essay structure, no filler paragraphs. Format in Markdown.`;

export async function generateContent({ text, mode }) {
  const system = mode === 'direct' ? DIRECT_ANSWER_PROMPT : FULL_ASSIGNMENT_PROMPT;
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (groqKey) {
    const result = await callGroq({ groqKey, system, text });
    if (result) return result;
  }
  if (geminiKey) {
    const result = await callGemini({ geminiKey, system, text });
    if (result) return result;
  }

  return demoResponse(text, mode);
}

async function callGroq({ groqKey, system, text }) {
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
          { role: 'user', content: text },
        ],
        temperature: 0.7,
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

async function callGemini({ geminiKey, system, text }) {
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text }] }],
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

## Answer

Based on your assignment ("${preview}…"):

1. **Key concept** — identify the core question.
2. **Approach** — break into parts and solve each.
3. **Solution** — apply the relevant method or theory.`;
  }

  return `# Assignment Response (Demo Mode)

> Set \`GROQ_API_KEY\` or \`GEMINI_API_KEY\` on Render for real AI output.

## Introduction

This response addresses: "${preview}…"

## Main Body

### Analysis

A structured examination of the topic with supporting evidence and clear argumentation.

## Conclusion

Summary of findings and final position on the assignment question.`;
}
