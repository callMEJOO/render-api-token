import express from "express";
import fetch from "node-fetch";

const app = express();

/**
 * GET /api/token
 * Render يعمل login + session ويرجع appToken
 */
app.get("/api/token", async (req, res) => {
  try {
    const email = process.env.LOGIN_EMAIL;
    const password = process.env.LOGIN_PASSWORD;

    // 1️⃣ POST credentials
    const loginRes = await fetch(
      "https://astra.app/auth/callback/credentials",
      {
        method: "POST",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "*/*",
          "Pragma": "no-cache",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&callbackUrl=%2Fexplore`,
        redirect: "manual"
      }
    );

    // ناخد cookies من الرد
    const cookies = loginRes.headers.get("set-cookie");

    if (!cookies) {
      return res.status(500).json({ error: "login failed" });
    }

    // 2️⃣ GET session
    const sessionRes = await fetch(
      "https://astra.app/api/session",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "*/*",
          "Pragma": "no-cache",
          "Cookie": cookies
        }
      }
    );

    const text = await sessionRes.text();

    // 3️⃣ Parse appToken
    const match = text.match(/appToken":"([^"]+)"/);

    if (!match) {
      return res.status(500).json({ error: "token not found" });
    }

    // 4️⃣ رجّع التوكن
    res.json({
      appToken: match[1]
    });

  } catch (err) {
    res.status(500).json({ error: "internal error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Render proxy running on port " + PORT);
});
