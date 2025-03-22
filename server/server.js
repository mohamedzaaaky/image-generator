const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// خدمة ملفات الواجهة الأمامية

app.use(express.static(path.join(__dirname, "../client")));
// مسار الـ API
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

// لو حد فتح الرابط مباشرة يرجعه لملف index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// تقديم ملفات HTML ثابتة من مجلد public أو اسم المجلد اللي فيه HTML
app.use(express.static(path.join(__dirname, "../client"))); // غيّر المسار حسب مكان ملفات HTML

// إعداد route للـ GET /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html")); // برضه غيّر المسار لو ملفك مش في client
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
