import fetch from "node-fetch";

export default async function handler(req, res) {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version: "a9758cb76e35e8f0ef8278e8a1b4c86d1c5fdf4aa3d9c0f1d7764f0f3d1f7cc2", // Stable Diffusion model
        input: { prompt }
      }),
    });

    const data = await response.json();
    const imageUrl = data.output?.[0];
    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image generation failed" });
  }
}
