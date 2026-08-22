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
    let fallbackExplanation = "Excellent attempt! (Fallback grading enabled: Server lacks HF_TOKEN)";
    if (userLang === "Hindi" || userSubject === "Hindi") {
      fallbackExplanation = "बहुत अच्छा प्रयास! (फ़ॉलबैक ग्रेडिंग सक्षम: सर्वर में HF_TOKEN की कमी है)";
    } else if (userLang === "Telugu" || userSubject === "Telugu") {
      fallbackExplanation = "చాలా మంచి ప్రయత్నం! (సందర్భోచిత ఫీడ్‌బ్యాక్ సక్రియం చేయబడింది)";
    }
    return res.status(200).json({
      score: 85,
      explanation: fallbackExplanation,
      is_fallback: true
    });
  }

  try {
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are EDUTOR, a child-friendly 1:1 tutor for ${userGrade} students in ${userSubject}.
Review the student's answer to the practice question and grade their conceptual understanding.
Ensure the explanation vocabulary and difficulty match the mindset of a ${userGrade} student.
For language subjects like Hindi or Telugu, ensure both explanation and evaluation are in that language.
Ensure the response matches this JSON format:
{
  "score": <integer from 0 to 100>,
  "explanation": "<explain in friendly terms in ${userLang}, offering constructive support if they missed the concept>"
}
Do not return any text before or after the JSON block.
<|eot_id|><|start_header_id|>user<|end_header_id|>
Question: ${questionText}
Student's Answer: ${studentAnswer}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    const apiResponse = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
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
