import fetch from "node-fetch";

const HUGGING_FACE_API_KEY = process.env.hf_hf_QIbmsQlaVabzTZWZpxairWlwoxWKeEQwGH;

async function generateAdFromHF(business) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/text-generation",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt2",
          inputs: `Write a short, catchy advertisement for a business called: ${business}`,
          parameters: { max_new_tokens: 50 }
        })
      }
    );

    const data = await response.json();
    console.log("Hugging Face response:", data);

    if (data?.error && data.error.includes("loading")) {
      // Model is still loading, wait 2 seconds and retry
      await new Promise(res => setTimeout(res, 2000));
      attempt++;
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    } else {
      return "No response from AI";
    }
  }

  return "Hugging Face model still loading, try again in a few seconds.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ad: "Method not allowed" });

  const { business } = req.body;
  if (!business) return res.json({ ad: "No business provided." });

  try {
    const ad = await generateAdFromHF(business);
    res.status(200).json({ ad });
  } catch (err) {
    console.error("Error generating ad:", err);
    res.status(500).json({ ad: "Error generating ad" });
  }
}

