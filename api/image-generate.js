import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    // 1️⃣ Start async prediction
    const start = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "db21e45b0c4f48d9ad7f78a4a9fbc9e5f0bfb598f9c3c12345abcde67890ffff", // Replace with latest Replicate SD model version
        input: { prompt },
      }),
    });

    const startData = await start.json();

    if (!startData.urls || !startData.urls.get) {
      return res.status(500).json({ error: "Failed to start image generation" });
    }

    // 2️⃣ Poll for completion
    let output = null;
    const predictionUrl = startData.urls.get;

    for (let i = 0; i < 30; i++) { // poll max 30 times (~60s)
      const statusRes = await fetch(predictionUrl, {
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_KEY}`
        }
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

    if (output) {
      return res.status(200).json({ imageUrl: output });
    } else {
      return res.status(500).json({ error: "Image generation timed out" });
    }

  } catch (err) {
    console.error("Error generating image:", err);
    return res.status(500).json({ error: "Image generation failed" });
  }
}console.log("Starting image generation for prompt:", prompt);
console.log("Using API key:", !!process.env.REPLICATE_API_KEY);
console.log("Using model version:", version);

