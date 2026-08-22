import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grade, subject, difficulty, language } = req.body;
  const token = req.headers['x-hf-token'] || process.env.HF_TOKEN;

  if (!token) {
    return res.status(200).json({
      question_text: `Practice question for ${subject} (Grade ${grade}).`,
      hint: `Recall your basic concepts about ${subject}!`
    });
  }

  try {
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are EDUTOR, an encouraging, child-friendly tutor. Your job is to generate a single practice question for a student in Grade ${grade} for the subject "${subject}".
The difficulty level is ${difficulty} out of 5 (1 is simple recall/vocabulary, 5 is analytical reasoning/problem solving).
The question and hint must be written in the requested language: ${language}.
For language subjects like Hindi or Telugu, ensure both question and hint are written exclusively in that language.
Ensure the response matches this JSON format:
{
  "question_text": "<the practice question text>",
  "hint": "<a child-friendly tip or clue in ${language}>"
}
Do not return any text before or after the JSON block.
<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    const apiResponse = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 300, return_full_text: false, temperature: 0.7 }
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
        throw new Error("Could not parse JSON block from output");
      }
    } catch (e) {
      jsonResult = {
        question_text: `Explain one interesting concept you learned in ${subject}.`,
        hint: `Think about a topic you read recently!`
      };
    }

    return res.status(200).json(jsonResult);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
