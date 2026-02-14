import express from "express";

const app = express();
const sleep = ms => new Promise(r => setTimeout(r, ms));

app.get("/api/token", async (req, res) => {
  try {
    const EMAIL = process.env.LOGIN_EMAIL;
    const PASS  = process.env.LOGIN_PASSWORD;

    // ===== REQUEST 1 (LOGIN) =====
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

    // ناخد الكوكيز زي ما هي
    const rawCookies = loginRes.headers.getSetCookie?.() || [];
    const cookies = rawCookies.map(c => c.split(";")[0]).join("; ");

    // ===== DELAY (عشان السيشن) =====
    await sleep(1500);

    // ===== REQUEST 2 (SESSION) =====
    const sessionRes = await fetch(
      "https://astra.app/api/session",
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Pragma": "no-cache",
          "Accept": "*/*",
          "Cookie": cookies
        }
      }
    );

    const source = await sessionRes.text();

    // ===== PARSE appToken =====
    const match = source.match(/appToken":"([^"]+)",/);

    if (!match) {
      return res.send(
        `{"appToken":"ERROR","raw":${JSON.stringify(source)}}`
      );
    }

    // ===== RESPONSE متوافق مع PARSE =====
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
