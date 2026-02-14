import express from "express";

const app = express();

/**
 * GET /api/token
 * Render يعمل:
 * 1- POST credentials
 * 2- GET session
 * 3- يرجع appToken
 */
app.get("/api/token", async (req, res) => {
  try {
    const email = process.env.LOGIN_EMAIL;
    const password = process.env.LOGIN_PASSWORD;

    if (!email || !password) {
      return res.status(500).json({ error: "env not set" });
    }

    // ===== 1️⃣ LOGIN =====
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
          "&callbackUrl=%2Fexplore",
        redirect: "manual"
      }
    );

    const cookies = loginRes.headers.get("set-cookie");
    if (!cookies) {
      return res.status(500).json({ error: "login failed" });
    }

    // ===== 2️⃣ GET SESSION =====
    const sessionRes = await fetch(
      "https://astra.app/api/session",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Accept": "*/*",
          "Pragma": "no-cache",
          "Cookie": cookies
        }
      }
    );

    const source = await sessionRes.text();

    // ===== 3️⃣ PARSE appToken =====
    const match = source.match(/appToken":"([^"]+)"/);
    if (!match) {
      return res.status(500).json({ error: "token not found" });
    }

    res.json({
      appToken: match[1]
    });
  } catch (err) {
    res.status(500).json({ error: "internal error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Render API running on port " + PORT);
});
