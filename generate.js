import fetch from "node-fetch";

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ad: "Method not allowed" });
  }

  const { business } = req.body;
  if (!business) return res.json({ ad: "No business provided." });

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/text-generation",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt2",  // reliable free model
          inputs: `Write a short, catchy advertisement for a business called: ${business}`,
          parameters: { max_new_tokens: 50 }
        })
      }
    );

    const data = await response.json();
    console.log("Hugging Face response:", data);

    // data is an array of objects with generated_text
    let ad = "No response from AI";
    if (Array.isArray(data) && data[0]?.generated_text) ad = data[0].generated_text;

    res.status(200).json({ ad });
  } catch (err) {
    console.error("Hugging Face fetch error:", err);
    res.status(500).json({ ad: "Error generating ad" });
  }
}
