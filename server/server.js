const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ راوت توليد الصور
app.post("/generate", async (req, res) => {
  const { prompt, model, width, height } = req.body;
  const API_KEY = process.env.API_KEY;

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: prompt,
        parameters: { width, height },
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "x-use-cache": "false",
        },
        responseType: "arraybuffer",
      }
    );

    res.set("Content-Type", "image/png");
    res.send(response.data);
  } catch (err) {
    console.error((err.response && err.response.data) || err.message);
    res.status(500).json({ error: "Image generation failed." });
  }
});

// ✅ راوت صفحة البداية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// ✅ ملفات ثابتة - خليه آخر حاجة بعد كل الراوتات
app.use(express.static(path.join(__dirname, "../client")));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
