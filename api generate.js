import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "a9758cb76e35e8f0ef8278e8a1b4c86d1c5fdf4aa3d9c0f1d7764f0f3d1f7cc2",
        input: { prompt },
      }),
    });

    const data = await response.json();

    if (data.output && data.output.length > 0) {
      res.status(200).json({ imageUrl: data.output[0] });
    } else {
      res.status(500).json({ error: "No image generated" });
    }
  } catch (err) {
    console.error("Error generating image:", err);
    res.status(500).json({ error: "Image generation failed" });
  }
}
