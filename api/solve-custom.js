import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { questionText, imageAttached } = req.body;
  const token = req.headers['x-hf-token'] || process.env.HF_TOKEN;

  if (!token) {
    return res.status(200).json({
      answer: "Tutor Fallback: Let's solve this! A fraction has two parts: the numerator (how many parts we have) and the denominator (how many total equal parts make the whole). Can you count the total parts first?"
    });
  }

  try {
    let promptMessage = `Solve this custom fractions homework question step-by-step for a Class 3 school child. Keep it friendly and educational. Question: ${questionText}`;
    if (imageAttached) {
      promptMessage += "\n(Note: An image of the worksheet was uploaded. Break down the visual elements step-by-step.)";
    }

    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are EDUTOR, a child-friendly fractions homework solver and tutor.
Solve the homework question step-by-step.
Use simple, clear formatting with bullet points.
Encourage the child and ensure the math is 100% correct.
Keep it under 4 steps.
<|eot_id|><|start_header_id|>user<|end_header_id|>
${promptMessage}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    const apiResponse = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
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
    let text = data[0]?.generated_text || "Let's count the parts together!";

    return res.status(200).json({ answer: text.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
