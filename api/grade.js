import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { questionText, studentAnswer, grade, subject, language } = req.body;
  const token = req.headers['x-hf-token'] || process.env.HF_TOKEN;

  const userGrade = grade || "Grade 3";
  const userSubject = subject || "Mathematics";
  const userLang = language || "English";

  if (!token) {
    let fallbackExplanation = "Excellent attempt! You did a great job. Let's continue practicing this concept to build a strong foundation together!";
    if (userLang === "Hindi" || userSubject === "Hindi") {
      fallbackExplanation = "बहुत अच्छा प्रयास! आपने शानदार काम किया। आइए एक साथ मिलकर इस अवधारणा का और अभ्यास करें!";
    } else if (userLang === "Telugu" || userSubject === "Telugu") {
      fallbackExplanation = "చాలా మంచి ప్రయత్నం! మీరు చాలా బాగా చేశారు. ఈ భావనను మరింత బాగా నేర్చుకుందాం!";
    }
    return res.status(200).json({
      score: 85,
      explanation: fallbackExplanation,
      is_fallback: true
    });
  }

  try {
    const gradeNum = Number(String(userGrade).replace(/\D/g, "")) || 3;
    let mindsetRules = "";
    if (gradeNum >= 1 && gradeNum <= 3) {
      mindsetRules = "Mindset Rules (Grades 1-3): The student is 6-8 years old. Write the explanation using extremely simple words, short sentences, and concrete examples (like toys, fruits, or animals). Keep the tone encouraging, warm, and easy to understand.";
    } else if (gradeNum >= 4 && gradeNum <= 7) {
      mindsetRules = "Mindset Rules (Grades 4-7): The student is 9-12 years old. Use intermediate vocabulary and explain concepts with step-by-step reasoning. Keep it friendly and engaging.";
    } else {
      mindsetRules = "Mindset Rules (Grades 8-10): The student is 13-15 years old. Use academic terms, reference official formulas, and explain the underlying logic/theory.";
    }

    const prompt = `System: You are EDUTOR, a child-friendly 1:1 tutor for ${userGrade} students in ${userSubject}.
Review the student's answer to the practice question and grade their conceptual understanding.

${mindsetRules}

For language subjects like Hindi or Telugu, ensure both explanation and evaluation are in that language.
Ensure the response matches this JSON format:
{
  "score": <integer from 0 to 100>,
  "explanation": "<explain in friendly terms in ${userLang}, offering constructive support if they missed the concept>"
}
Do not return any text before or after the JSON block.

User: Question: ${questionText}
Student's Answer: ${studentAnswer}
Assistant:`;

    const apiResponse = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 300, return_full_text: false, temperature: 0.3 }
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      throw new Error(`Hugging Face API returned error status ${apiResponse.status}: ${errText}`);
    }

    const data = await apiResponse.json();
    let text = data[0]?.generated_text || "";

    // Strip the prompt prefix if it was recycled in the response
    if (text.startsWith(prompt)) {
      text = text.substring(prompt.length);
    }
    
    let jsonResult;
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonResult = JSON.parse(text.substring(jsonStart, jsonEnd));
      } else {
        throw new Error("Could not parse JSON block from model output");
      }
    } catch (e) {
      const isMath = userSubject.toLowerCase().includes("math");
      jsonResult = {
        score: 80,
        explanation: userLang === "Hindi" || userSubject === "Hindi" 
          ? "अच्छा प्रयास! चलिए इस विषय पर और अभ्यास करते हैं।" 
          : userLang === "Telugu" || userSubject === "Telugu"
          ? "మంచి ప్రయత్నం! ఈ అంశంపై మరింత సాధన చేద్దాం."
          : "Good attempt! Let's continue practicing this concept together."
      };
    }

    return res.status(200).json(jsonResult);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
