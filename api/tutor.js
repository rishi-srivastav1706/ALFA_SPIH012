import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { questionText, grade, subject, language } = req.body;
  const token = req.headers['x-hf-token'] || process.env.HF_TOKEN;

  const userGrade = grade || "Grade 3";
  const userSubject = subject || "Mathematics";
  const userLang = language || "English";

  if (!token) {
    let fallbackHint = `Here is a helpful tip: Try to break the problem down into smaller parts and recall the core concepts of ${userSubject}!`;
    if (userLang === "Hindi" || userSubject === "Hindi") {
      fallbackHint = `ट्यूटर संकेत: ${userSubject} की बुनियादी अवधारणाओं पर ध्यान केंद्रित करें।`;
    } else if (userLang === "Telugu" || userSubject === "Telugu") {
      fallbackHint = `సలహా: ${userSubject} యొక్క ప్రాథమిక భావనలపై దృష్టి పెట్టండి.`;
    }
    return res.status(200).json({
      hint: fallbackHint
    });
  }

  try {
    const gradeNum = Number(String(userGrade).replace(/\D/g, "")) || 3;
    let mindsetRules = "";
    if (gradeNum >= 1 && gradeNum <= 3) {
      mindsetRules = "Mindset Rules (Grades 1-3): The student is 6-8 years old. Keep the hint extremely simple, short, and use concrete references (like fruits or toys). Do not write complex clues.";
    } else if (gradeNum >= 4 && gradeNum <= 7) {
      mindsetRules = "Mindset Rules (Grades 4-7): The student is 9-12 years old. Provide hints using intermediate vocabulary and simple clues to guide their step-by-step reasoning.";
    } else {
      mindsetRules = "Mindset Rules (Grades 8-10): The student is 13-15 years old. Provide hints using academic terms, reference formulas, and prompt them to think of the theoretical concepts.";
    }

    const prompt = `System: You are EDUTOR, a child-friendly 1:1 tutor for ${userGrade} students in ${userSubject}.
Provide a simple, conceptual hint or visual explanation for the question below.

${mindsetRules}

Provide the hint in the requested tutoring language (${userLang}).
Keep the length under 4 sentences.

User: Question: ${questionText}
Language: ${userLang}
Assistant:`;

    const apiResponse = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 150, return_full_text: false, temperature: 0.5 }
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      throw new Error(`Hugging Face API returned error: ${errText}`);
    }

    const data = await apiResponse.json();
    let text = data[0]?.generated_text || "";

    // Strip the prompt prefix if it was recycled in the response
    if (text.startsWith(prompt)) {
      text = text.substring(prompt.length);
    }
    if (!text.trim()) {
      text = "Try visualizing the problem step-by-step!";
    }
    
    return res.status(200).json({ hint: text.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
