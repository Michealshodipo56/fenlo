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
  const apiKey = process.env.OPENAI_API_KEY;
  const system = mode === 'direct' ? DIRECT_ANSWER_PROMPT : FULL_ASSIGNMENT_PROMPT;

  if (!apiKey) {
    return demoResponse(text, mode);
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: text },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('OpenAI API error, falling back to demo:', err.error?.message || res.status);
      return demoResponse(text, mode);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || demoResponse(text, mode);
  } catch (err) {
    console.warn('OpenAI request failed, falling back to demo:', err.message);
    return demoResponse(text, mode);
  }
}

function demoResponse(text, mode) {
  const preview = text.slice(0, 120).replace(/\n/g, ' ');
  if (mode === 'direct') {
    return `# Direct Answer (Demo Mode)

> **Note:** Set \`OPENAI_API_KEY\` in your environment for real AI generation. This is a demo response.

## Answer

Based on your assignment prompt ("${preview}…"), here is a concise solution:

1. **Key concept**: Identify the core question being asked in the assignment.
2. **Approach**: Break the problem into manageable parts and address each systematically.
3. **Solution**: Apply relevant theories, formulas, or frameworks to arrive at the answer.

### For programming tasks:
\`\`\`python
# Example solution structure
def solve():
    # Step 1: Parse input
    # Step 2: Apply algorithm
    # Step 3: Return result
    pass
\`\`\`

### Summary
The direct answer addresses the core requirement without additional essay formatting. Configure your OpenAI API key to get a real, tailored response.`;
  }

  return `# Assignment Response (Demo Mode)

> **Note:** Set \`OPENAI_API_KEY\` in your environment for real AI generation. This is a demo response.

## Introduction

This essay addresses the assignment: "${preview}…"

In academic discourse, understanding the foundational concepts is essential before constructing a comprehensive argument. This response demonstrates the structure and approach expected for this type of assignment.

## Main Body

### Section 1: Background and Context

The topic requires careful analysis of multiple perspectives. Historical context provides essential groundwork for understanding contemporary implications (Smith, 2020).

### Section 2: Analysis

A thorough examination reveals several key factors at play. First, the primary drivers must be identified and evaluated against established frameworks. Second, counterarguments should be considered to strengthen the overall position.

### Section 3: Implications

The findings suggest significant implications for both theory and practice. Future research should explore areas identified as gaps in current understanding.

## Conclusion

In summary, this assignment demonstrates a structured approach to the given prompt. The analysis integrates multiple sources and presents a coherent argument supported by evidence.

## References

Smith, J. (2020). *Academic foundations*. University Press.

---

*Configure OPENAI_API_KEY for a real, tailored response to your specific assignment.*`;
}
