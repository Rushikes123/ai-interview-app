const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// ==============================
// ✅ GENERATE QUESTIONS
// ==============================
exports.generateQuestions = async (resumeText) => {
  try {
    const prompt = `
You are a senior technical interviewer.

Generate EXACTLY 10 interview questions based on the resume.

Rules:
- Questions must be based ONLY on resume
- Focus on technical skills and projects
- Include 1-2 HR questions
- Difficulty: Medium to Hard
- RETURN ONLY ARRAY (no explanation)

Example:
["Q1", "Q2", "Q3"]

Resume:
${resumeText}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    let text = response.choices[0].message.content.trim();

    text = text.replace(/```json|```/g, "").trim();

    let questions;

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        questions = parsed;
      } else if (parsed.questions) {
        questions = parsed.questions;
      } else {
        throw new Error("Invalid format");
      }

    } catch {
      console.log("Fallback parsing");

      questions = text
        .split("\n")
        .filter(q => q.trim())
        .map(q => q.replace(/^\d+[\).\-\s]*/, ""));
    }

    return questions.slice(0, 10);

  } catch (error) {
    console.error("AI Question Error:", error);
    return ["Error generating questions"];
  }
};


// ==============================
// ✅ EVALUATE ANSWER (HUMAN-LIKE)
// ==============================
exports.evaluateAnswer = async (question, answer) => {
  try {

    const prompt = `
You are a senior software engineer conducting a real technical interview.

Question:
${question}

Candidate Answer:
${answer}

Evaluate this exactly like a real interviewer would.

STRICT SCORING RULES (VERY IMPORTANT):
- Be strict. Do NOT be generous.
- Evaluate ONLY what is actually written.

SCORING GUIDE:
- Completely irrelevant, random words, or nonsense → score MUST be 0 or 1
- Very short or vague answer → score 2–3
- Partial understanding → score 4–6
- Good answer with minor gaps → score 6–8
- Excellent, complete answer → score 9–10

IMPORTANT:
- If answer does NOT match question topic → score = 0
- Do NOT assume intent or knowledge
- Do NOT give benefit of doubt

FEEDBACK STYLE:
- Talk like a real interviewer (professional, direct, constructive)
- Mention what is missing (depth, examples, clarity, structure)
- Be specific — not generic
- Keep it 2–3 lines maximum

Return ONLY JSON:

{
  "score": number,
  "feedback": "realistic interviewer-style feedback"
}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    let text = response.choices[0].message.content.trim();

    // 🔥 CLEAN OUTPUT
    text = text
      .replace(/```json|```/g, "")
      .replace(/\n/g, " ")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.log("⚠️ JSON Parse Failed → fallback");

      parsed = {
        score: 3,
        feedback: text || "The answer lacks clarity and does not fully address the question."
      };
    }

    // 🔥 SAFE RETURN
    return {
      score: Number(parsed.score) || 3,
      feedback:
        parsed.feedback ||
        "The answer needs better structure, clarity, and technical depth."
    };

  } catch (error) {
    console.error("AI Evaluation Error:", error);

    return {
      score: 0,
      feedback: "Unable to evaluate the response at the moment. Please try again."
    };
  }
};