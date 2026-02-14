import express from "express";

const app = express();

// flag بسيط للربط
let DID_LOGIN = false;

/**
 * =========================
 * 1️⃣ REQUEST LOGIN (الأصلي)
 * =========================
 */
app.get("/api/original-login", async (req, res) => {
  try {
    await fetch(
      "https://astra.app/auth/callback/credentials",
      {
        method: "POST",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Pragma": "no-cache",
          "Accept": "*/*",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body:
          "email=" + encodeURIComponent(process.env.LOGIN_EMAIL) +
          "&password=" + encodeURIComponent(process.env.LOGIN_PASSWORD) +
          "&callbackUrl=%2Fexplore"
      }
    );

    DID_LOGIN = true;

    res.send(`{"login":"ok"}`);
  } catch (err) {
    res.send(`{"login":"error"}`);
  }
});

/**
 * =========================
 * 2️⃣ REQUEST SESSION / TOKEN (الأصلي)
 * =========================
 */
app.get("/api/original-token", async (req, res) => {
  if (!DID_LOGIN) {
    return res.send(
      `{"appToken":"ERROR","status":"login_not_called"}`
    );
  }

  try {
    const sessionRes = await fetch(
      "https://astra.app/api/session",
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Pragma": "no-cache",
          "Accept": "*/*",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const source = await sessionRes.text();

    // ===== PARSE زي ما عندك =====
    const match = source.match(/appToken":"([^"]+)",/);

    if (!match) {
      return res.send(
        `{"appToken":"ERROR","raw":${JSON.stringify(source)}}`
      );
    }

    res.send(
      `{"appToken":"${match[1]}","status":"ok"}`
    );

  } catch (err) {
    res.send(
      `{"appToken":"ERROR","status":"exception"}`
    );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Render API running on port " + PORT);
});
