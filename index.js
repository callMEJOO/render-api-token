import express from "express";

const app = express();

/**
 * GET /api/token
 * Render يعمل في الباك:
 * POST /auth/callback/credentials
 * GET  /api/session
 * ويرجع appToken
 */
app.get("/api/token", async (req, res) => {
  try {
    const email = process.env.LOGIN_EMAIL;
    const password = process.env.LOGIN_PASSWORD;

    if (!email || !password) {
      return res.status(500).json({ error: "ENV_NOT_SET" });
    }

    // ===== 1) LOGIN =====
    const loginResponse = await fetch(
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

    const cookies = loginResponse.headers.get("set-cookie");
    if (!cookies) {
      return res.status(500).json({ error: "LOGIN_FAILED" });
    }

    // ===== 2) GET SESSION =====
    const sessionResponse = await fetch(
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

    const source = await sessionResponse.text();

    // ===== 3) PARSE appToken =====
    const match = source.match(/appToken":"([^"]+)"/);

    if (!match) {
      return res.status(500).json({ error: "TOKEN_NOT_FOUND" });
    }

    // ===== 4) RETURN TOKEN =====
    res.json({
      appToken: match[1]
    });

  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Render API running on port " + PORT);
});
