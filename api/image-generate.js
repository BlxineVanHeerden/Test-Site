import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    // Start async prediction on Replicate
    const start = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "db21e45b0c4f48d9ad7f78a4a9fbc9e5f0bfb598f9c3c12345abcde67890ffff", // latest Stable Diffusion version
        input: { prompt },
      }),
    });

    const startData = await start.json();
    if (!startData.urls?.get) return res.status(500).json({ error: "Failed to start generation" });

    // Poll until done
    let output = null;
    const predictionUrl = startData.urls.get;

    for (let i = 0; i < 30; i++) {
      const statusRes = await fetch(predictionUrl, {
        headers: { "Authorization": `Token ${process.env.REPLICATE_API_KEY}` }
      });
      const statusData = await statusRes.json();

      if (statusData.status === "succeeded") {
        output = statusData.output[0];
        break;
      } else if (statusData.status === "failed") {
        return res.status(500).json({ error: "Image generation failed" });
      }

      await new Promise(r => setTimeout(r, 2000)); // wait 2 seconds
    }

    if (!output) return res.status(500).json({ error: "Image generation timed out" });
    return res.status(200).json({ imageUrl: output });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Image generation failed" });
  }
}
