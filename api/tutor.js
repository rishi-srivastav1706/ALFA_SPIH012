import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { questionText, language } = req.body;
  const token = req.headers['x-hf-token'] || process.env.HF_TOKEN;

  if (!token) {
    return res.status(200).json({
      hint: `Tutor Fallback: Focus on the number of shaded parts compared to the total parts. (Target Language: ${language})`
    });
  }

  try {
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are EDUTOR, a child-friendly fractions tutor. Provide a simple, conceptual hint or visual explanation for the question below.
Keep it extremely simple for a Class 3 child (8-9 years old).
Provide the hint in the requested tutoring language (${language || 'English'}).
Keep the length under 3 sentences.
<|eot_id|><|start_header_id|>user<|end_header_id|>
Question: ${questionText}
Language: ${language}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    const apiResponse = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
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
    let text = data[0]?.generated_text || "Try slicing it into equal parts!";
    
    return res.status(200).json({ hint: text.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
