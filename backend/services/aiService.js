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

STRICT RULES:
- Evaluate ONLY what is actually said (no assumptions)
- If answer is irrelevant, nonsense, or random words → score 0–2
- If answer is very short or incomplete → score 2–4
- If answer shows partial understanding → score 4–6
- If answer is good but missing depth → score 6–8
- If answer is excellent → score 8–10

FEEDBACK STYLE:
- Talk like a real interviewer (professional, direct, constructive)
- Mention what is missing (depth, examples, clarity, structure)
- Be specific — not generic
- Keep it 2–3 lines maximum

GOOD EXAMPLES:

Input: "my name is rushi"
Output:
Score: 0
Feedback: "This response does not address the question. I expected a technical explanation relevant to the problem."

Input: "table chair laptop"
Output:
Score: 1
Feedback: "The answer is not relevant to the question. Please focus on explaining your approach or solution."

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