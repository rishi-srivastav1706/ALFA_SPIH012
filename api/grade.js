import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { questionText, studentAnswer } = req.body;
  const token = req.headers['x-hf-token'] || process.env.HF_TOKEN;

  if (!token) {
    return res.status(200).json({
      score: 85,
      explanation: "Excellent attempt! (Fallback grading enabled: Server lacks HF_TOKEN)",
      is_fallback: true
    });
  }

  try {
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are EDUTOR, a child-friendly fractions teacher. Review the student's answer to the fraction question and grade their conceptual understanding.
Ensure the response matches this JSON format:
{
  "score": <integer from 0 to 100>,
  "explanation": "<explain in friendly terms in the student's language style, offering support if they missed the concept>"
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
      // Fallback parser if JSON parse fails
      const hasCorrectKeyword = studentAnswer.toLowerCase().includes("half") || studentAnswer.includes("1/2") || studentAnswer.includes("equal");
      jsonResult = {
        score: hasCorrectKeyword ? 90 : 70,
        explanation: "Good attempt! Let's think: a fraction represents equal pieces of a whole. Let's practice drawing them!"
      };
    }

    return res.status(200).json(jsonResult);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
