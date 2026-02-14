import express from "express";

const app = express();

app.get("/api/token", async (req, res) => {
  try {
    const email = process.env.LOGIN_EMAIL;
    const password = process.env.LOGIN_PASSWORD;

    // 1️⃣ LOGIN (سيب redirect افتراضي)
    const loginRes = await fetch(
      "https://astra.app/auth/callback/credentials",
      {
        method: "POST",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Accept": "*/*",
          "Pragma": "no-cache",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body:
          "email=" +
          encodeURIComponent(email) +
          "&password=" +
          encodeURIComponent(password) +
          "&callbackUrl=%2Fexplore"
      }
    );

    // ناخد كل الكوكيز
    const cookies = loginRes.headers.get("set-cookie");

    // 2️⃣ GET SESSION
    const sessionRes = await fetch(
      "https://astra.app/api/session",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "*/*",
          "Pragma": "no-cache",
          "Cookie": cookies || ""
        }
      }
    );

    const source = await sessionRes.text();

    // 🔴 نرجّع الرد كامل عشان نشوفه
    res.json({
      debug: true,
      sessionResponse: source
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Render API running on port " + PORT);
});
