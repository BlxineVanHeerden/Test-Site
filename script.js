async function generateAdImage() {
  const prompt = document.getElementById("prompt").value.trim();
  const status = document.getElementById("status");
  const resultImage = document.getElementById("resultImage");

  if (!prompt) {
    alert("Please enter a prompt describing your ad!");
    return;
  }

  status.innerText = "Generating image... ⏳";
  resultImage.src = "";

  try {
    const res = await fetch("/api/image-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if (data.imageUrl) {
      resultImage.src = data.imageUrl;
      status.innerText = "Image generated! 🎉";
    } else {
      status.innerText = "Failed to generate image 😢";
      console.error(data);
    }
  } catch (err) {
    status.innerText = "Error generating image 😢";
    console.error(err);
  }
}
