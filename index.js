import express from "express";

const app = express();

// =========================
// 1️⃣ LOGIN ENDPOINT
// =========================
app.get("/api/login", async (req, res) => {
  try {
    const EMAIL = process.env.LOGIN_EMAIL;
    const PASS  = process.env.LOGIN_PASSWORD;

    const loginRes = await fetch(
      "https://astra.app/auth/callback/credentials?",
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
          "email=" + encodeURIComponent(EMAIL) +
          "&password=" + encodeURIComponent(PASS) +
          "&callbackUrl=%2Fexplore"
      }
    );

    const body = await loginRes.text();

    // نرجّع نتيجة اللوجين الحقيقية
    res.send(
      JSON.stringify(
        {
          status: loginRes.status,
          body: body
        },
        null,
        2
      )
    );

  } catch (err) {
    res.send(
      JSON.stringify(
        { error: err.message },
        null,
        2
      )
    );
  }
});

// =========================
// 2️⃣ TOKEN ENDPOINT
// =========================
app.get("/api/token", async (req, res) => {
  try {
    const sessionRes = await fetch(
      "https://astra.app/api/session",
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Pragma": "no-cache",
          "Accept": "*/*"
        }
      }
    );

    const body = await sessionRes.text();

    // نرجّع نتيجة التوكن الحقيقية
    res.send(
      JSON.stringify(
        {
          status: sessionRes.status,
          body: body
        },
        null,
        2
      )
    );

  } catch (err) {
    res.send(
      JSON.stringify(
        { error: err.message },
        null,
        2
      )
    );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Render API running on port " + PORT);
});
