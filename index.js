import express from "express";

const app = express();
const sleep = ms => new Promise(r => setTimeout(r, ms));

app.get("/api/token", async (req, res) => {
  try {
    const email = process.env.LOGIN_EMAIL;
    const password = process.env.LOGIN_PASSWORD;

    if (!email || !password) {
      return res.send(
        `{"appToken":"ERROR","status":"env_not_set"}`
      );
    }

    // ===== REQUEST 1: LOGIN (FORM) =====
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

    // جمع الكوكيز
    const rawCookies = loginRes.headers.getSetCookie?.() || [];
    const cookieHeader = rawCookies
      .map(c => c.split(";")[0])
      .join("; ");

    if (!cookieHeader) {
      return res.send(
        `{"appToken":"ERROR","status":"login_failed"}`
      );
    }

    // ⏳ DELAY
    await sleep(1500);

    // ===== REQUEST 2: SESSION (JSON) =====
    const sessionRes = await fetch(
      "https://astra.app/api/session",
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Pragma": "no-cache",
          "Cookie": cookieHeader
        }
      }
    );

    const source = await sessionRes.text();

    // ===== PARSE appToken =====
    const match = source.match(/appToken":"([^"]+)"/);

    if (!match) {
      return res.send(
        `{"appToken":"ERROR","status":"token_not_found"}`
      );
    }

    const token = match[1];

    // ===== RESPONSE متوافق مع PARSE =====
    res.send(
      `{"appToken":"${token}","status":"ok"}`
    );

  } catch (err) {
    res.send(
      `{"appToken":"ERROR","status":"internal_error"}`
    );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Render API running on port " + PORT);
});
