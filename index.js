import express from "express";

const app = express();
const sleep = ms => new Promise(r => setTimeout(r, ms));

// نخزن الكوكيز بين الريكوستين
let SAVED_COOKIES = "";

/**
 * 1️⃣ LOGIN (داخلي)
 */
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

    const rawCookies = loginRes.headers.getSetCookie?.() || [];
    SAVED_COOKIES = rawCookies.map(c => c.split(";")[0]).join("; ");

    if (!SAVED_COOKIES) {
      return res.send(`{"status":"login_failed"}`);
    }

    res.send(`{"status":"login_ok"}`);
  } catch {
    res.send(`{"status":"login_error"}`);
  }
});

/**
 * 2️⃣ SESSION / TOKEN
 */
app.get("/api/token", async (req, res) => {
  try {
    if (!SAVED_COOKIES) {
      return res.send(
        `{"appToken":"ERROR","status":"not_logged_in"}`
      );
    }

    // Delay طبيعي
    await sleep(1500);

    const sessionRes = await fetch(
      "https://astra.app/api/session",
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Pragma": "no-cache",
          "Accept": "*/*",
          "Cookie": SAVED_COOKIES
        }
      }
    );

    const source = await sessionRes.text();

    const match = source.match(/appToken":"([^"]+)",/);

    if (!match) {
      return res.send(
        `{"appToken":"ERROR","status":"token_not_found"}`
      );
    }

    res.send(
      `{"appToken":"${match[1]}","status":"ok"}`
    );

  } catch {
    res.send(
      `{"appToken":"ERROR","status":"session_error"}`
    );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Render API running on port " + PORT);
});
