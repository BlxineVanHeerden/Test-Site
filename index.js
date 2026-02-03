import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Replace this with your OpenAI API key
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";

app.post("/generate", async (req, res) => {
  const { business } = req.body;

  if (!business) return res.json({ ad: "No business provided." });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Write a short, catchy advertisement for a business called: ${business}`
          }
        ]
      })
    });

    const data = await response.json();
    console.log("OpenAI response:", data);

    const ad = data.choices?.[0]?.message?.content || "No response from AI";
    res.json({ ad });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ ad: "Error generating ad" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
