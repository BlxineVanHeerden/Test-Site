const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const start = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "f4e5b2fa5f8a4c0eaaee0f9d9c9d6f1d2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p",
        input: { prompt, width: 512, height: 512 },
      }),
    });

    const startData = await start.json();
    if (!startData.urls?.get) return res.status(500).json({ error: "Failed to start generation" });

    let output = null;
    const predictionUrl = startData.urls.get;

    for (let i = 0; i < 10; i++) {
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

      await new Promise(r => setTimeout(r, 2000));
    }

    if (!output) return res.status(500).json({ error: "Image generation timed out" });
    return res.status(200).json({ imageUrl: output });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Image generation failed" });
  }
};
