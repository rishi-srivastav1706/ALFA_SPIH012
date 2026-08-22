import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { questionText, imageAttached, grade, subject, language } = req.body;
  const token = req.headers['x-hf-token'] || process.env.HF_TOKEN;

  const userGrade = grade || "Grade 3";
  const userSubject = subject || "Mathematics";
  const userLang = language || "English";

  if (!token) {
    let fallbackSolve = `Let's work through this problem step-by-step together! Focus on the core principles of ${userSubject}.`;
    if (userLang === "Hindi" || userSubject === "Hindi") {
      fallbackSolve = `ट्यूटर सॉल्वर: चलिए इसे हल करते हैं! ${userSubject} के बुनियादी नियमों पर ध्यान दें।`;
    } else if (userLang === "Telugu" || userSubject === "Telugu") {
      fallbackSolve = `సొల్యూషన్: దీనిని సులభంగా సాధిద్దాం! ${userSubject} యొక్క ప్రాథమిక సూత్రాలపై దృష్టి పెట్టండి.`;
    }
    return res.status(200).json({
      answer: fallbackSolve
    });
  }

  try {
    let promptMessage = `Solve this custom homework question step-by-step for a ${userGrade} student in the subject of "${userSubject}". 
Keep it friendly, age-appropriate, and educational.
Write the solution in ${userLang}.
Question: ${questionText}`;
    if (imageAttached) {
      promptMessage += "\n(Note: An image of the worksheet was uploaded. Break down the visual elements step-by-step.)";
    }

    const prompt = `System: You are EDUTOR, a child-friendly homework solver and tutor.
Solve the homework question step-by-step.
Ensure the explanation vocabulary and difficulty match the mindset of a ${userGrade} student.
Use simple, clear formatting with bullet points.
Encourage the student and ensure the content is 100% correct.
For language subjects like Hindi or Telugu, write exclusively in that language.
Keep the answer friendly and under 5 steps.

User: ${promptMessage}
Assistant:`;

    const apiResponse = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 350, return_full_text: false, temperature: 0.4 }
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
      text = "Let's work through this problem step-by-step together!";
    }

    return res.status(200).json({ answer: text.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
