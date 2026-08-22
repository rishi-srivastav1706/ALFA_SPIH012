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
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are EDUTOR, a child-friendly 1:1 tutor for ${userGrade} students in ${userSubject}.
Provide a simple, conceptual hint or visual explanation for the question below.
Ensure the explanation vocabulary and difficulty match the mindset of a ${userGrade} student.
Provide the hint in the requested tutoring language (${userLang}).
Keep the length under 4 sentences.
<|eot_id|><|start_header_id|>user<|end_header_id|>
Question: ${questionText}
Language: ${userLang}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

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
    let text = data[0]?.generated_text || "Try visualizing the problem step-by-step!";
    
    return res.status(200).json({ hint: text.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
