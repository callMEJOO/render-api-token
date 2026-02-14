import express from "express";

const app = express();

/**
 * GET /api/token
 * Render يقلد المتصفح 100%
 */
app.get("/api/token", async (req, res) => {
  try {
    const email = process.env.LOGIN_EMAIL;
    const password = process.env.LOGIN_PASSWORD;

    if (!email || !password) {
      return res.status(500).json({ error: "ENV_NOT_SET" });
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
          "&callbackUrl=%2Fexplore"
      }
    );

    // ===== 2️⃣ جمع الكوكيز =====
    const rawCookies = loginRes.headers.getSetCookie?.() || [];
    const cookieHeader = rawCookies
      .map(c => c.split(";")[0])
      .join("; ");

    if (!cookieHeader) {
      return res.status(500).json({ error: "NO_COOKIES" });
    }

    // ===== 3️⃣ GET SESSION =====
    const sessionRes = await fetch(
      "https://astra.app/api/session",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "*/*",
          "Pragma": "no-cache",
          "Cookie": cookieHeader
        }
      }
    );

    const source = await sessionRes.text();

    // ===== 4️⃣ PARSE appToken =====
    const match = source.match(/appToken":"([^"]+)"/);

    if (!match) {
      // لو لسه null نبعته كامل للتشخيص
      return res.status(500).json({
        error: "TOKEN_NOT_FOUND",
        sessionResponse: source
      });
    }

    res.json({
      appToken: match[1]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Render API running on port " + PORT);
});
